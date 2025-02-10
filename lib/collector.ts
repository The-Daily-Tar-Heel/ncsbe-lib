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

    /**
     * Creates a new Collector instance.
     * @param {string} url - The URL of the ZIP file containing election data.
     */
    constructor(url: string) {
        this.url = url;
    }

    private normalizeContestName(contestName: string): string {
        return contestName.replace(/[()]/g, '').replace(/\s+/g, '_');
    }

    /**
     * Collects and processes election data from the provided ZIP file URL.
     * @returns {Promise<ContestDatap[]>} A structured representation of the election results.
     * @throws Will throw an error if fetching, extraction, or parsing fails.
     */
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

    /**
     * Fetches a ZIP file from the provided URL, returning its raw binary data as a Buffer.
     * @param {string} url - The URL to fetch the ZIP file from.
     * @returns {Promise<Buffer>} The raw binary data of the ZIP file.
     * @throws Will throw an error if the request fails.
     */
    private async fetchData(url: string): Promise<Buffer> {
        try {
            console.log(url);
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching data: ', error);
            throw error;
        }
    }

    /**
     * Extracts TSV files from the provided ZIP data.
     * @param {Buffer} zipData - The binary ZIP file data.
     * @returns {string} The extracted TSV content as a string.
     */
    private extractTSVFiles(zipData: Buffer): string {
        const zip = new AdmZip(zipData);
        const entries = zip.getEntries();
        return entries
            .filter((entry) => entry.entryName.endsWith('.txt'))
            .map((entry) => entry.getData().toString('utf8'))
            .join('\n');
    }

    /**
     * Transforms a row of the TSV file into a structured `ParsedRow` object.
     * @param {Record<string, string>} row - A raw TSV row with string values.
     * @returns {ParsedRow} An structured `ParsedRow` object.
     */
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
            realPrecinct: row['Real Precinct'] === 'Y',
        };
    }

    /**
     * Parses TSV data into an array of structured election result objects.
     * @param {string} tsvData - The TSV file content as a string.
     * @returns {Promise<ParsedRow[]>} An array of structured election result objects.
     */
    private async parseTSVData(tsvData: string): Promise<ParsedRow[]> {
        const rows: ParsedRow[] = [];
        const stream = Readable.from(tsvData);

        return new Promise((resolve, reject) => {
            stream
                .pipe(csv({ separator: '\t' }))
                .pipe(
                    new Transform({
                        objectMode: true,
                        transform: (
                            row: Record<string, string>,
                            _,
                            callback,
                        ) => {
                            rows.push(this.transformRow(row));
                            callback();
                        },
                    }),
                )
                .on('finish', () => resolve(rows))
                .on('error', (error: any) => reject(error));
        });
    }

    /**
     * Formats parsed election data into a structured hierarchy.
     * 
     * **Expected Output (ContestData[]):**
     * ```json
     * [
     *   {
     *     "contestName": "US_Senate",
     *     "counties": [
     *       {
     *         "county": "Orange",
     *         "precincts": [
     *           {
     *             "precinct": "01-01",
     *             "candidates": [
     *               {
     *                 "candidate": "John Doe",
     *                 "party": "DEM",
     *                 "votes": 1710
     *               },
     *               {
     *                 "candidate": "Jane Smith",
     *                 "party": "REP",
     *                 "votes": 1585
     *               }
     *             ]
     *           }
     *         ]
     *       }
     *     ]
     *   }
     * ]
     * ```
     * 
     * @param {ParsedRow[]} parsedData - The parsed election results.
     * @returns {ContestData[]} - The formatted election data structured by contest, county, and precinct.
     */
    private format(parsedData: ParsedRow[]): ContestData[] {
        const data: Record<
            string, // Contest name ("US Senate")
            Record<
                string, // County name ("Orange")
                Record<
                    string, // Precinct name ("01-01")
                    CandidateData[] // Array of candidate vote results
                >
            >
        > = {};

        parsedData.forEach((row) => {
            const {
                contestName,
                county,
                precinct,
                choice,
                choiceParty,
                totalVotes,
            } = row;

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
                votes: totalVotes,
            });
        });

        return Object.keys(data).map((contestName) => {
            const counties: CountyData[] = Object.keys(data[contestName]).map(
                (countyName) => {
                    const precincts: PrecinctData[] = Object.keys(
                        data[contestName][countyName],
                    ).map((precinctName) => {
                        return {
                            precinct: precinctName,
                            candidates:
                                data[contestName][countyName][precinctName],
                        };
                    });

                    return {
                        county: countyName,
                        precincts,
                    };
                },
            );

            return {
                contestName,
                counties,
            };
        });
    }
}

export { Collector };
