import axios from 'axios';
import AdmZip from 'adm-zip';
import csv from 'csv-parser';
import { Transform, Readable } from 'stream';
import { CandidateData, PrecinctData, CountyData, ContestData, ParsedRow } from './types';

/**
 * The `Collector` class is responsible for fetching, parsing, and formatting election data
 * from the North Carolina State Board of Elections (NCSBE).
 *
 * This class:
 * - Downloads election data from a provided URL (ZIP file).
 * - Extracts the TSV (tab-separated values) file inside the ZIP.
 * - Parses the TSV file into structured election data.
 * - Formats the parsed data into a hierarchical structure for easy analysis.
 *
 * Example usage:
 * ```ts
 * const collector = new Collector("https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/2024_11_05/results_pct_20241105.zip"); // 2024 election
 * const results = await collector.collect();
 * console.log(results);
 * ```
 */
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
     * @param {number} lineLimit - Optional parameter that allows the user to specify how many lines of the TSV they want to collector to retrieve.
     * @returns {Promise<ContestDatap[]>} A structured representation of the election results.
     * @throws Will throw an error if fetching, extraction, or parsing fails.
     */
    async collect(lineLimit?: number): Promise<ContestData[]> {
        try {
            const zipData = await this.fetchData(this.url);
            const tsvData = this.extractTSVFiles(zipData, lineLimit);
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
     * @param {number} [lineLimit] - (Optional) The number of lines to retrieve from the election dataset.
     * If provided, only the most recently updated `lineLimit` lines of the TSV file is returned, greatly
     * reducing the input of `parseTSVData`. If omitted, the full TSV file is returned.
     * @returns {string} The extracted TSV content as a string.
     */
    private extractTSVFiles(zipData: Buffer, lineLimit?: number): string {
        const zip = new AdmZip(zipData);
        const entries = zip.getEntries();
        return entries
            .filter((entry) => entry.entryName.endsWith('.txt'))
            .map((entry) => {
                let content = entry.getData().toString('utf8');
                return lineLimit ? content.split('\n').slice(0, lineLimit) : content;
            })
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
     *     "candidates": [
     *       {
     *         "candidate": "John Doe",
     *         "party": "DEM",
     *         "votes": 3710
     *       },
     *       {
     *         "candidate": "Jane Smith",
     *         "party": "REP",
     *         "votes": 3585
     *       }
     *     ],
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
     *           },
     *           {
     *             "precinct": "01-02",
     *             "candidates": [
     *               {
     *                 "candidate": "John Doe",
     *                 "party": "DEM",
     *                 "votes": 2000
     *               },
     *               {
     *                 "candidate": "Jane Smith",
     *                 "party": "REP",
     *                 "votes": 2000
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
            string,
            {
                counties: Record<string, Record<string, CandidateData[]>>;
                candidates: Record<string, CandidateData>;
            }
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
                data[contestName] = {
                    counties: {},
                    candidates: {},
                };
            }

            if (!data[contestName].counties[county]) {
                data[contestName].counties[county] = {};
            }

            if (!data[contestName].counties[county][precinct]) {
                data[contestName].counties[county][precinct] = [];
            }

            data[contestName].counties[county][precinct].push({
                candidate: choice,
                party: choiceParty,
                votes: totalVotes,
            });

            if (!data[contestName].candidates[choice]) {
                data[contestName].candidates[choice] = {
                    candidate: choice,
                    party: choiceParty,
                    votes: 0,
                };
            }
            data[contestName].candidates[choice].votes += totalVotes;
        });

        return Object.keys(data).map((contestName) => {
            const counties: CountyData[] = Object.keys(
                data[contestName].counties,
            ).map((countyName) => {
                const precincts: PrecinctData[] = Object.keys(
                    data[contestName].counties[countyName],
                ).map((precinctName) => ({
                    precinct: precinctName,
                    candidates:
                        data[contestName].counties[countyName][precinctName],
                }));

                return {
                    county: countyName,
                    precincts,
                };
            });

            const candidates = Object.values(data[contestName].candidates);

            return {
                contestName,
                candidates,
                counties,
            };
        });
    }
}

export { Collector };
