import axios from 'axios';
import AdmZip from 'adm-zip';
import csv from 'csv-parser';
import { Transform, Readable } from 'stream';

interface ParsedRow {
    county: string;
    electionDate: string;
    precinct: string;
    contestGroupId: number;
    contestType: string;
    contestName: string;
    choice: string;
    choiceParty: string;
    voteFor: number;
    electionDay: number;
    earlyVoting: number;
    absenteeByMail: number;
    provisional: number;
    totalVotes: number;
    realPrecinct: boolean;
}

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

class Collector {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    private normalizeContestName(contestName: string): string {
        return contestName.replace(/[()]/g, '').replace(/\s+/g, '_');
    }

    async collect(): Promise<ContestData[]> {
        try {
            const zipData = await this.fetchData(this.url);
            const tsvData = this.extractTSVFiles(zipData);
            const parsedData = await this.parseTSVData(tsvData);
            return this.format(parsedData);
        } catch (error) {
            throw error;
        }
    }

    private async fetchData(url: string): Promise<Buffer> {
        try {
            console.log(url);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return response.data;
        } catch (error) {
            console.error("Error fetching data: ", error);
            throw error;
        }
    }

    private extractTSVFiles(zipData: Buffer): string {
        const zip = new AdmZip(zipData);
        const entries = zip.getEntries();
        return entries
            .filter(entry => entry.entryName.endsWith('.txt'))
            .map(entry => entry.getData().toString('utf8'))
            .join('\n');
    }

    private transformRow(row: Record<string, string>): ParsedRow {
        return {
            county: row['County'],
            electionDate: row['Election Date'],
            precinct: row['Precinct'],
            contestGroupId: Number(row['Contest Group ID']),
            contestType: row['Contest Type'],
            contestName: this.normalizeContestName(row['Contest Name']),
            choice: row['Choice'],
            choiceParty: row['Choice Party'],
            voteFor: Number(row['Vote For']),
            electionDay: Number(row['Election Day']),
            earlyVoting: Number(row['Early Voting']),
            absenteeByMail: Number(row['Absentee by Mail']),
            provisional: Number(row['Provisional']),
            totalVotes: Number(row['Total Votes']),
            realPrecinct: row['Real Precinct'] === 'Y'
        };
    }

    private async parseTSVData(tsvData: string): Promise<ParsedRow[]> {
        const rows: ParsedRow[] = [];
        const stream = Readable.from(tsvData);

        return new Promise((resolve, reject) => {
            stream
                .pipe(csv({ separator: '\t' }))
                .pipe(new Transform({
                    objectMode: true,
                    transform: (row: Record<string, string>, _, callback) => {
                        rows.push(this.transformRow(row));
                        callback();
                    }
                }))
                .on('finish', () => resolve(rows))
                .on('error', (error: any) => reject(error));
        });
    }

    private format(parsedData: ParsedRow[]): ContestData[] {
        const data: Record<string, Record<string, Record<string, CandidateData[]>>> = {};

        parsedData.forEach(row => {
            const { contestName, county, precinct, choice, choiceParty, totalVotes } = row;

            if (!data[contestName]) {
                data[contestName] = {};
            }

            if (!data[contestName][county]) {
                data[contestName][county] = {};
            }

            if (!data[contestName][county][precinct]) {
                data[contestName][county][precinct] = [];
            }

            data[contestName][county][precinct].push({
                candidate: choice,
                party: choiceParty,
                votes: totalVotes
            });
        });

        return Object.keys(data).map(contestName => {
            const counties: CountyData[] = Object.keys(data[contestName]).map(countyName => {
                const precincts: PrecinctData[] = Object.keys(data[contestName][countyName]).map(precinctName => {
                    return {
                        precinct: precinctName,
                        candidates: data[contestName][countyName][precinctName]
                    };
                });

                return {
                    county: countyName,
                    precincts
                };
            });

            return {
                contestName,
                counties
            };
        });
    }
}

export { Collector };
