import { Collector } from './collector';
import { CandidateData, PrecinctData, CountyData, ContestData } from './types';

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

    async collect(lineLimit?: number): Promise<ContestData[]> {
        const collector = new Collector(this.url);
        return await collector.collect(lineLimit);
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
     * Refreshes the election dataset by re-fetching and storing the latest results in memory.
     * This function allows users to specify an optional `lineLimit` parameter to control how many lines
     * of data are retrieved from the latest election dataset.
     * 
     * @param {number} [lineLimit] - (Optional) The number of lines to retrieve from the election dataset.
     * If provided, only the first `lineLimit` lines of the TSV file is processed, reducing memory usage
     * and improving performance. If omitted, the full dataset is retrieved.
     * 
     * @returns {Promise<void>} Resolves when the dataset has been refreshed.
     * 
     * ### Use Case for `lineLimit`
     * - If you only need the latest updated portion of the dataset and want to minimize memory usage,
     *   you can set `lineLimit` to a reasonable value (e.g., `4000`).
     * - If omitted, `refresh()` will load the full dataset, which may be necessary for comprehensive queries.
     * 
     * @example
     * ```ts
     * // Refresh with a limit of 4000 lines
     * await electionData.refresh(4000);
     * console.log(electionData.listContests()); // List contests again, but only from the first 4000 lines
     * 
     * // Refresh again with the full dataset
     * await electionData.refresh();
     * ```
     * 
     */
    async refresh(lineLimit?: number): Promise<void> {
        this.dataSet = await this.collect(lineLimit);
    }

    /**
     * Retrieves contest data for a specific contest name.
     * @param {string} contest - The contest name.
     * @returns {ContestData | null} The contest data or null if not found.
     */
    private getContestData(contest: string): ContestData | null {
        return this.dataSet
            ? this.dataSet.find((row) => row.contestName === contest) || null
            : null;
    }

    /**
     * Retrieves a list of all contests (races) available in the dataset.
     * @returns {string[]} An array of contest names.
     */
    listContests(): string[] {
        return this.dataSet
            ? [...new Set(this.dataSet.map((row) => row.contestName))]
            : [];
    }

    /**
     * Lists all counties where voting took place for a specific contest.
     * @param {string} contest - The contest name (e.g., "US Senate").
     * @returns {string[]} - An array of county names.
     * @throws Will return an empty array if `initialize()` has not been called.
     */
    listCounties(contest: string): string[] {
        const contestData = this.getContestData(contest);
        return contestData
            ? [...new Set(contestData.counties.map((c) => c.county))]
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
        const contestData = this.getContestData(contest);
        if (!contestData) return [];
        const countyData = contestData.counties.find(
            (c) => c.county === county,
        );
        return countyData ? countyData.precincts.map((p) => p.precinct) : [];
    }

    /**
     * Retrieves a list of candidates in a given contest.
     * @param {string} contest - The contest name.
     * @returns {string[]} An array of candidate names.
     */
    listCandidates(contest: string): string[] {
        const contestData = this.getContestData(contest);
        return contestData
            ? [...new Set(contestData.candidates.map((c) => c.candidate))]
            : [];
    }

    /**
     * Retrieves a contest object by its name.
     * @param {string} contest - The contest name.
     * @returns {ContestData | null} The contest data or null if not found.
     */
    getContest(contest: string): ContestData | null {
        return this.getContestData(contest);
    }

    /**
     * Retrieves detailed information about a specific candidate in a contest.
     * @param {string} contest - The contest name.
     * @param {string} candidateName - The candidate's name.
     * @returns {CandidateData | null} The candidate's data or null if not found.
     */
    getCandidateInfo(
        contest: string,
        candidateName: string,
    ): CandidateData | null {
        const contestData = this.getContestData(contest);
        return contestData
            ? contestData.candidates.find(
                  (c) => c.candidate === candidateName,
              ) || null
            : null;
    }

    /**
     * Retrieves results for all precincts in a county for a given contest.
     * @param {string} contest - The contest name.
     * @param {string} county - The county name.
     * @returns {CountyData | null} The county's election results or null if not found.
     */
    getCountyResults(contest: string, county: string): CountyData | null {
        const contestData = this.getContestData(contest);
        return contestData
            ? contestData.counties.find((c) => c.county === county) || null
            : null;
    }

    /**
     * Retrieves all election results for a specific candidate across all contests.
     * @param {string} candidateName - The candidate's name.
     * @returns {CandidateData[]} An array of the candidate's results in different contests.
     */
    getAllCandidateResults(candidateName: string): CandidateData[] {
        if (!this.dataSet) return [];
        return this.dataSet
            .flatMap((contest) => contest.candidates)
            .filter((c) => c.candidate === candidateName);
    }

    /**
     * Retrieves the total vote count for a specific candidate in a contest.
     * @param {string} contest - The contest name.
     * @param {string} candidateName - The candidate's name.
     * @returns {number} The total vote count for the candidate.
     */
    getCandidateVoteTotal(contest: string, candidateName: string): number {
        const contestData = this.getContestData(contest);
        if (!contestData) return 0;
        return contestData.counties
            .flatMap((c) => c.precincts)
            .flatMap((p) => p.candidates)
            .filter((c) => c.candidate === candidateName)
            .reduce((sum, c) => sum + c.votes, 0);
    }

    /**
     * Retrieves a dictionary mapping candidates to their total votes in a contest.
     * @param {string} contest - The contest name.
     * @returns {Record<string, number>} A record mapping candidate names to total vote counts.
     */
    getContestVoteTotals(contest: string): Record<string, number> {
        const contestData = this.getContestData(contest);
        if (!contestData) return {};
        return contestData.candidates.reduce(
            (acc, candidate) => {
                acc[candidate.candidate] = this.getCandidateVoteTotal(
                    contest,
                    candidate.candidate,
                );
                return acc;
            },
            {} as Record<string, number>,
        );
    }

    /**
     * Retrieves all candidates in a given contest.
     * @param {string} contest - The contest name.
     * @returns {CandidateData[]} An array of candidate data objects.
     */
    getCandidates(contest: string): CandidateData[] {
        const contestData = this.getContest(contest);
        return contestData ? contestData.candidates : [];
    }

    /**
     * Retrieves all counties in a given contest.
     * @param {string} contest - The contest name.
     * @returns {CountyData[]} An array of count data objects.
     */
    getCounties(contest: string): CountyData[] {
        const contestData = this.getContest(contest);
        return contestData ? contestData.counties : [];
    }

    /**
     * Retrieves all precincts in a given contest.
     * @param {string} contest - The contest name.
     * @returns {PrecinctData[]} An array of precinct data objects.
     */
    getPrecincts(contest: string): PrecinctData[] {
        const contestData = this.getContest(contest);
        return contestData
            ? contestData.counties.flatMap((c) => c.precincts)
            : [];
    }
}

export { NCSBE };
