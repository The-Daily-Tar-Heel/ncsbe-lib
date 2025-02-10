"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collector = void 0;
const axios_1 = __importDefault(require("axios"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
class Collector {
    constructor(url) {
        this.url = url;
    }
    normalizeContestName(contestName) {
        return contestName.replace(/[()]/g, '').replace(/\s+/g, '_');
    }
    collect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const zipData = yield this.fetchData(this.url);
                const tsvData = this.extractTSVFiles(zipData);
                const parsedData = yield this.parseTSVData(tsvData);
                return this.format(parsedData);
            }
            catch (error) {
                throw error;
            }
        });
    }
    fetchData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(url);
                const response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
                return response.data;
            }
            catch (error) {
                console.error("Error fetching data: ", error);
                throw error;
            }
        });
    }
    extractTSVFiles(zipData) {
        const zip = new adm_zip_1.default(zipData);
        const entries = zip.getEntries();
        return entries
            .filter(entry => entry.entryName.endsWith('.txt'))
            .map(entry => entry.getData().toString('utf8'))
            .join('\n');
    }
    transformRow(row) {
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
    parseTSVData(tsvData) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = [];
            const stream = stream_1.Readable.from(tsvData);
            return new Promise((resolve, reject) => {
                stream
                    .pipe((0, csv_parser_1.default)({ separator: '\t' }))
                    .pipe(new stream_1.Transform({
                    objectMode: true,
                    transform: (row, _, callback) => {
                        rows.push(this.transformRow(row));
                        callback();
                    }
                }))
                    .on('finish', () => resolve(rows))
                    .on('error', (error) => reject(error));
            });
        });
    }
    format(parsedData) {
        const data = {};
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
    }
}
exports.Collector = Collector;
