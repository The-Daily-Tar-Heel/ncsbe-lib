import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = path.join(__dirname, 'test-package');

try {
    // Run 'npm run build' in root directory of project
    console.log('🛠️  Building the package...');
    execSync('npm run build', { stdio: 'inherit' });

    // Run `npm pack` and extract the resulting file's name
    console.log('📦 Packing the package...');
    const packageFile = execSync('npm pack', { encoding: 'utf-8' })
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.endsWith('.tgz'))[0];
    console.log(`✅ Package created: ${packageFile}`);

    // Create a new folder called 'test-package' to store new Node.js folder and test file.
    console.log(`📂 Creating test directory: ${TEST_DIR}...`);
    if (fs.existsSync(TEST_DIR)) {
        fs.rmSync(TEST_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DIR);

    // Initialize a Node.js project in the test-package folder
    console.log('📜 Initializing new package.json...');
    execSync('npm init -y', { cwd: TEST_DIR, stdio: 'inherit' });

    // Set the type of the Node.js project to be "module"
    console.log('📝 Setting package type to module...');
    const packageJsonPath = path.join(TEST_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.type = 'module';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Install the local package
    console.log('📥 Installing packed package...');
    execSync(`npm install ../../${packageFile}`, {
        cwd: TEST_DIR,
        stdio: 'inherit',
    });

    // Create a test.js file that imports the library and runs some tests on it
    console.log('📝 Creating test.js file...');
    fs.writeFileSync(
        path.join(TEST_DIR, 'test.js'),
        `
        import { NCSBE } from "ncsbe-lib";

        async function runTests() {

            console.log(" ");
            console.log("---------------------");
            console.log(" ");

            console.log("Running NCSBE Tests...");

            console.log(" ");
            console.log("---------------------");
            console.log(" ");


            const ncsbe = new NCSBE("2024-11-05");            

            console.log("Fetching election data...");
            await ncsbe.initialize();
            console.log("Data initialized.");

            console.log(" ");
            console.log("---------------------");
            console.log(" ");


            console.log("Fetch first 3 entries of entire dataset:");
            console.log(ncsbe.getDataset().slice(0, 3));

            console.log(" ");
            console.log("---------------------");
            console.log(" ");

            const contests = ncsbe.listContests().slice(0, 5);
            console.log("First 5 Contests:", contests);

            console.log(" ");
            console.log("---------------------");
            console.log(" ");

            const testContest = contests[4];
            console.log("Testing contest:", testContest);

            console.log(" ");
            console.log("---------------------");
            console.log(" ");

            const counties = ncsbe.listCounties(testContest);
            console.log("Counties participating:", counties);

            console.log(" ");
            console.log("---------------------");
            console.log(" ");


            if (counties.length > 0) {
                const testCounty = counties[0];
                console.log("Testing county:", testCounty);

                const precincts = ncsbe.listPrecincts(testContest, testCounty);
                console.log("Precincts in", testCounty, ":", precincts);
            }

            const candidates = ncsbe.listCandidates(testContest);
            console.log("Candidates in", testContest, ":", candidates);

            console.log(" ");
            console.log("---------------------");
            console.log(" ");

            if (candidates.length > 0) {
                const testCandidate = candidates[8];
                console.log("Testing candidate:", testCandidate);

                console.log(" ");
                console.log("---------------------");
                console.log(" ");

                const voteTotal = ncsbe.getCandidateVoteTotal(testContest, testCandidate);
                console.log(testCandidate + "Total Votes:", voteTotal);

                console.log(" ");
                console.log("---------------------");
                console.log(" ");

                const votePercentage = ncsbe.getCandidateVotePercentage(testContest, testCandidate);
                console.log(testCandidate + "Vote Percentage:", votePercentage.toFixed(2) + "%");

                console.log(" ");
                console.log("---------------------");
                console.log(" ");

                const candidateContests = ncsbe.getContestsByCandidate(testCandidate);
                console.log("Contests for", testCandidate, ":", candidateContests.map(c => c.contestName));

                console.log(" ");
                console.log("---------------------");
                console.log(" ");

                const candidateInfo = ncsbe.getCandidateInfo(testContest, testCandidate);
                console.log("Candidate Info for", testCandidate, ":", candidateInfo);

                console.log(" ");
                console.log("---------------------");
                console.log(" ");
            }

            const winner = ncsbe.getContestWinner(testContest);
            console.log("Winner of", testContest, ":", winner);

            console.log(" ");
            console.log("---------------------");
            console.log(" ");

            console.log("All tests completed successfully.");
        }

        runTests().catch(error => console.error("Test failed:", error));
        `,
    );

    console.log('🚀 Running test.js...');
    execSync('node test.js', { cwd: TEST_DIR, stdio: 'inherit' });

    // Remove all files related to this test
    console.log('🧹 Cleaning up...');
    fs.rmSync(TEST_DIR, { recursive: true });
    fs.unlinkSync(packageFile);

    console.log('✅ Test completed successfully!');
} catch (error) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
}
