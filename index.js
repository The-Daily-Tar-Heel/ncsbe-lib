const { NCSBE } = require("./lib/ncsbe");

async function main() {
    const ncsbe = new NCSBE("2024-11-05");
    await ncsbe.initialize();
    console.log(ncsbe.dataSet);
    const contests = ncsbe.listContests();
    console.log(contests[0]);
    console.log(ncsbe.listCandidates(contests[0]));
}

main();