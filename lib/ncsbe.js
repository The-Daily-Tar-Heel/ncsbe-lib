const { Collector } = require("./collector");

class NCSBE {
    constructor(electionDate) {
        // format date as YYYY-MM-DD
        // INITIALIZATION
        this.electionDate = electionDate;
        this.url = NCSBE._makeBaseUrl(electionDate);
        this.dataSet = null;
    }

    static _makeBaseUrl(date) {
        return `https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/${date.replace(/-/g, "_")}/results_pct_${date.replace(/-/g, "")}.zip`;

    }

    async collect() {
        const collector = new Collector(this.url);
        return await collector.collect();
    }

    async initialize() {
        this.dataSet = await this.collect();
    }

    listContests() {
        return this.dataSet.map(row => row.contestName).filter((value, index, self) => self.indexOf(value) === index);
    }

    listCounties(contest) {
        return this.dataSet.filter(row => row.contestName === contest).map(row => row.county).filter((value, index, self) => self.indexOf(value) === index);
    }

    listPrecincts(contest, county) {
        return this.dataSet.filter(row => row.contestName === contest && row.county === county).map(row => row.precinct).filter((value, index, self) => self.indexOf(value) === index);
    }

    // TODO: in current data model candidates are hidden under contest > county > precinct
    // need to change data model in collector.js to make this easier
    listCandidates(contest) {

    }
}

module.exports = { NCSBE };