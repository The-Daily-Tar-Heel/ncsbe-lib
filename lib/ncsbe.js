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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NCSBE = void 0;
const collector_1 = require("./collector");
class NCSBE {
    constructor(electionDate) {
        this.electionDate = electionDate;
        this.url = NCSBE.makeBaseUrl(electionDate);
        this.dataSet = null;
    }
    static makeBaseUrl(date) {
        return `https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/${date.replace(/-/g, "_")}/results_pct_${date.replace(/-/g, "")}.zip`;
    }
    collect() {
        return __awaiter(this, void 0, void 0, function* () {
            const collector = new collector_1.Collector(this.url);
            return yield collector.collect();
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dataSet = yield this.collect();
        });
    }
    listContests() {
        return this.dataSet ? this.dataSet.map(row => row.contestName).filter((value, index, self) => self.indexOf(value) === index) : [];
    }
    listCounties(contest) {
        return this.dataSet ? this.dataSet.filter(row => row.contestName === contest).flatMap(row => row.counties.map(county => county.county)).filter((value, index, self) => self.indexOf(value) === index) : [];
    }
    listPrecincts(contest, county) {
        return this.dataSet ? this.dataSet.filter(row => row.contestName === contest).flatMap(row => row.counties.filter(c => c.county === county).flatMap(c => c.precincts.map(p => p.precinct))).filter((value, index, self) => self.indexOf(value) === index) : [];
    }
    listCandidates(contest) {
        // TODO: in current data model candidates are hidden under contest > county > precinct
        // need to change data model in collector.ts to make this easier
    }
}
exports.NCSBE = NCSBE;
