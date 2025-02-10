import { Collector } from './collector';
import { ContestData } from './types';

/**
 * The `NCSBE` class provides an interface for fetching and querying election data 
 * from the North Carolina State Board of Elections (NCSBE). It uses the `Collector` 
 * class to retrieve, parse, and format election data.
 * 
 * This class allows users to:
 * - Retrieve election data for a specific date.
 * - List available contests (races).
 * - List counties where voting occurred for a given contest.
 * - List precincts within a county for a specific contest.
 * 
 * Example usage:
 * ```typescript
 * const electionData = new NCSBE("2024-11-05");
 * await electionData.initialize();
 * const contests = electionData.listContests();
 * ```
 */
class NCSBE {
    /** Election date in YYYY-MM-DD format. */
    private electionDate: string;

    /** URL to fetch the election data ZIP file. */
    private url: string;

    /** Cached dataset after calling `initialize()`. */
    private dataSet: ContestData[] | null;

    /**
     * Creates a new instance of `NCSBE` for a given election date.
     * @param {string} electionDate - The date of the election in YYYY-MM-DD format.
     */
    constructor(electionDate: string) {
        this.electionDate = electionDate;
        this.url = NCSBE.makeBaseUrl(electionDate);
        this.dataSet = null;
    }

    private static makeBaseUrl(date: string): string {
        return `https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/${date.replace(/-/g, '_')}/results_pct_${date.replace(/-/g, '')}.zip`;
    }

    async collect(): Promise<ContestData[]> {
        const collector = new Collector(this.url);
        return await collector.collect();
    }

    /**
     * Initializes the election dataset by fetching and storing the results in memory.
     * This method **must** be called before using `listContests()`, `listCounties()`, etc.
     * @returns {Promise<void>} - Resolves when the dataset is loaded.
     */
    async initialize(): Promise<void> {
        this.dataSet = await this.collect();
    }

    /**
     * Lists all available contests (races) in the dataset.
     * @returns {string[]} - An array of contest names.
     * @throws Will return an empty array if `initialize()` has not been called.
     */
    listContests(): string[] {
        return this.dataSet
            ? this.dataSet
                  .map((row) => row.contestName)
                  .filter((value, index, self) => self.indexOf(value) === index)
            : [];
    }

    /**
     * Lists all counties where voting took place for a specific contest.
     * @param {string} contest - The contest name (e.g., "US Senate").
     * @returns {string[]} - An array of county names.
     * @throws Will return an empty array if `initialize()` has not been called.
     */
    listCounties(contest: string): string[] {
        return this.dataSet
            ? this.dataSet
                  .filter((row) => row.contestName === contest)
                  .flatMap((row) => row.counties.map((county) => county.county))
                  .filter((value, index, self) => self.indexOf(value) === index)
            : [];
    }

    /**
     * Lists all precincts in a given county for a specific contest.
     * @param {string} contest - The contest name (e.g., "US Senate").
     * @param {string} county - The county name (e.g., "Wake").
     * @returns {string[]} - An array of precinct names.
     * @throws Will return an empty array if `initialize()` has not been called.
     */
    listPrecincts(contest: string, county: string): string[] {
        return this.dataSet
            ? this.dataSet
                  .filter((row) => row.contestName === contest)
                  .flatMap((row) =>
                      row.counties
                          .filter((c) => c.county === county)
                          .flatMap((c) => c.precincts.map((p) => p.precinct)),
                  )
                  .filter((value, index, self) => self.indexOf(value) === index)
            : [];
    }

    /**
     * Lists all candidates for a given contest.
     * **TODO:** Candidates are currently nested under contest > county > precinct.
     * The data model in `collector.ts` should be refactored to make this easier.
     * @param {string} contest - The contest name (e.g., "US Senate").
     */
    listCandidates(contest: string): void {
        // TODO: in current data model candidates are hidden under contest > county > precinct
        // need to change data model in collector.ts to make this easier
    }
}

export { NCSBE };
