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

    listContests(): string[] {
        return this.dataSet
            ? this.dataSet
                  .map((row) => row.contestName)
                  .filter((value, index, self) => self.indexOf(value) === index)
            : [];
    }

    listCounties(contest: string): string[] {
        return this.dataSet
            ? this.dataSet
                  .filter((row) => row.contestName === contest)
                  .flatMap((row) => row.counties.map((county) => county.county))
                  .filter((value, index, self) => self.indexOf(value) === index)
            : [];
    }

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

    listCandidates(contest: string): void {
        // TODO: in current data model candidates are hidden under contest > county > precinct
        // need to change data model in collector.ts to make this easier
    }
}

export { NCSBE };
