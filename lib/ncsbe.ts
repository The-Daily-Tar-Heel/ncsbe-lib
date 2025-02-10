import { Collector } from './collector';

interface CandidateData {
    candidate: string;
    party: string;
    votes: number;
}

interface PrecinctData {
    precinct: string;
    candidates: CandidateData[];
}

interface CountyData {
    county: string;
    precincts: PrecinctData[];
}

interface ContestData {
    candidates: CandidateData[];
    contestName: string;
    counties: CountyData[];
}

class NCSBE {
    private electionDate: string;
    private url: string;
    private dataSet: ContestData[] | null;

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

    listCounties(contest: string): string[] {
        const contestData = this.getContestData(contest);
        return contestData
            ? [...new Set(contestData.counties.map((c) => c.county))]
            : [];
    }

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
