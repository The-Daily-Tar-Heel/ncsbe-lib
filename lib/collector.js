const axios = require('axios');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const { Transform } = require('stream');
const { Readable } = require('stream');

class Collector {
    constructor(url) {
        this.url = url;
    }

    normalizeContestName(contestName) {
        return contestName.replace(/[()]/g, '').replace(/\s+/g, '_');
    }

    async collect() {
        try {
            const zipData = await this.fetchData(this.url);
            const tsvData = this.extractTSVFiles(zipData);
            const parsedData = await this.parseTSVData(tsvData);
            return this.format(parsedData);
        } catch (error) {
            throw error;
        }
    }

    async fetchData(url) {
        try {
            console.log(url);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return response.data;
        } catch (error) {
            console.error("Error fetching data: ", error);
            throw error;
        }
    }

    extractTSVFiles(zipData) {
        const zip = new AdmZip(zipData);
        const entries = zip.getEntries();
        return entries
            .filter(entry => entry.entryName.endsWith('.txt'))
            // .map(entry => entry.getData().toString('utf8').split('\n').slice(0, 4000))
            .map(entry => entry.getData().toString('utf8'))
            .join('\n');
    }

    transformRow(row) {
        return {
            county: row['County'],
            electionDate: row['Election Date'],
            precinct: row['Precinct'],
            contestGroupId: +row['Contest Group ID'],
            contestType: row['Contest Type'],
            contestName: this.normalizeContestName(row['Contest Name']),
            choice: row['Choice'],
            choiceParty: row['Choice Party'],
            voteFor: +row['Vote For'],
            electionDay: +row['Election Day'],
            earlyVoting: +row['Early Voting'],
            absenteeByMail: +row['Absentee by Mail'],
            provisional: +row['Provisional'],
            totalVotes: +row['Total Votes'],
            realPrecinct: row['Real Precinct'] === 'Y'
        };
    }

    async parseTSVData(tsvData) {
        const rows = [];
        const stream = Readable.from(tsvData);

        return new Promise((resolve, reject) => {
            stream
                .pipe(csv({ separator: '\t' }))
                .pipe(new Transform({
                    objectMode: true,
                    transform: (row, _, callback) => {
                        rows.push(this.transformRow(row));
                        callback();
                    }
                }))
                .on('finish', () => resolve(rows))
                .on('error', (error) => reject(error));
        });
    }

    format(parsedData) {
        const data = {};

        parsedData.forEach(row => {
            const { contestName, county, precinct, choice, choiceParty, totalVotes, contestType } = row;

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

        const result = Object.keys(data).map(contestName => {
            const counties = Object.keys(data[contestName]).map(countyName => {
                const precincts = Object.keys(data[contestName][countyName]).map(precinctName => {
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

        return result;
    }

    /* Example Output:
    [
      {
        contestName: 'NC-AUDITOR-REP',
        counties: [
          {
            county: 'Orange County',
            precincts: [
              {
                precinct: 'Precinct 1',
                candidates: [
                  { candidate: 'John Doe', party: 'Democrat', votes: 150 },
                  { candidate: 'Jane Smith', party: 'Republican', votes: 130 }
                ]
              },
              ...
            ]
          },
          ...
        ]
      },
      ...
    ]
    */
}

module.exports = { Collector };
