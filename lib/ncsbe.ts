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

    async refresh(): Promise<void> {
        this.dataSet = await this.collect();
    }

    private getContestData(contest: string): ContestData | null {
        return this.dataSet
            ? this.dataSet.find((row) => row.contestName === contest) || null
            : null;
    }

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

    listCandidates(contest: string): string[] {
        const contestData = this.getContestData(contest);
        return contestData
            ? [...new Set(contestData.candidates.map((c) => c.candidate))]
            : [];
    }

    getContest(contest: string): ContestData | null {
        return this.getContestData(contest);
    }

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

    getCountyResults(contest: string, county: string): CountyData | null {
        const contestData = this.getContestData(contest);
        return contestData
            ? contestData.counties.find((c) => c.county === county) || null
            : null;
    }

    getAllCandidateResults(candidateName: string): CandidateData[] {
        if (!this.dataSet) return [];
        return this.dataSet
            .flatMap((contest) => contest.candidates)
            .filter((c) => c.candidate === candidateName);
    }

    getCandidateVoteTotal(contest: string, candidateName: string): number {
        const contestData = this.getContestData(contest);
        if (!contestData) return 0;
        return contestData.counties
            .flatMap((c) => c.precincts)
            .flatMap((p) => p.candidates)
            .filter((c) => c.candidate === candidateName)
            .reduce((sum, c) => sum + c.votes, 0);
    }

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

    getCandidates(contest: string): CandidateData[] {
        const contestData = this.getContest(contest);
        return contestData ? contestData.candidates : [];
    }

    getCounties(contest: string): CountyData[] {
        const contestData = this.getContest(contest);
        return contestData ? contestData.counties : [];
    }

    getPrecincts(contest: string): PrecinctData[] {
        const contestData = this.getContest(contest);
        return contestData
            ? contestData.counties.flatMap((c) => c.precincts)
            : [];
    }
}

export { NCSBE };
