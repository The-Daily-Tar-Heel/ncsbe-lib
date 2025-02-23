# `NCSBE`

`NCSBE` is the primary class for working with NCSBE data, providing an interface for retrieving, parsing, and querying election results data from the North Carolina State Board of Elections (NCSBE). It internally uses the Collector class (not shown in this README) to download and extract TSV data from the NCSBE dataset ZIP files.

# Table of Contents

1. [Usage](#usage)
    - [Creating an NCSBE instance](#creating-an-ncsbe-instance)
2. [Data Fetching and Updating](#data-fetching-and-updating)
    - [`initialize()`](#initialize)
    - [`refresh()`](#refresh)
3. [Query Functions](#query-functions)

    <details>
    <summary>Expand Query Functions</summary>

    - **General Queries**
        - [`getDataset()`](#getdataset)
        - [`listContests()`](#listcontests)
        - [`listCandidates(contest)`](#listcandidatescontest)
    - **Existence Queries**
        - [`hasContest()`](#hascontest)
        - [`hasCandidate()`](#hascandidate)
    - **Location-Based Queries**
        - [`listCounties(contest)`](#listcountiescontest)
        - [`listPrecincts(contest, county)`](#listprecinctscontest-county)
    - **Contest & Candidate Details**
        - [`getContest(contest)`](#getcontestcontest)
        - [`getCandidateInfo(contest, candidateName)`](#getcandidateinfocontest-candidatename)
        - [`getCandidates(contest)`](#getcandidatescontest)
    - **Results Queries**
        - [`getCountyResults(contest, county)`](#getcountyresultscontest-county)
        - [`getAllCandidateResults(candidateName)`](#getallcandidateresultscandidatename)
        - [`getCandidateVoteTotal(contest, candidateName)`](#getcandidatevotetotalcontest-candidatename)
        - [`getContestVoteTotals(contest)`](#getcontestvotetotalscontest)
        - [`getTotalVotesForContest(contest)`](#gettotalvotesforcontest)
        - [`getCandidateVotePercentage(contest, candidateName)`](#getcandidatevotepercentagecontest-candidatename)
        - [`getContestWinner(contest)`](#getcontestwinnercontest)
        - [`getClosestRace()`](#getclosestrace)
    - **Geographic Breakdown**
        - [`getCounties(contest)`](#getcountiescontest)
        - [`getPrecincts(contest)`](#getprecinctscontest)
    - **Other Queries**
        - [`getContestsByCandidate(candidateName)`](#getcontestsbycandidatecandidatename)

    </details>

4. [Notes](#notes)
5. [Example Workflow](#example-workflow)

## Usage

### Creating an NCSBE instance

```ts
import { NCSBE } from 'ncsbe';

const ncsbe = new NCSBE('2024-11-05');
```

- '2024-11-05': The date of the election in 'YYYY-MM-DD' format.

## Data Fetching and Updating

### `initialize()`

```ts
await ncsbe.initialize();
```

- Fetches the election dataset for the given date and stores it in memory.
- Must be called before using other query functions.

### `refresh()`

```ts
await ncsbe.refresh();
```

- Fetches the latest dataset and **completely replaces** the in-memory data.
- Recommended to run every 5 minutes for live election tracking.

## Query Functions

Below is a reference of the main query functions provided by NCSBE. Each method assumes `initialize()` has already been called.

### `getDataset()`

**Description**  
Retrieves the entire election dataset.

**Signature**

```ts
getDataset(): ContestData[];
```

**Returns**

- `ContestData[]`: An array of `ContestData` objects.

**Example**:

```ts
const dataSet = ncsbe.getDataset();
console.log(dataSet[0]);
/* Example output:
{
    contestName: 'NC_LIEUTENANT_GOVERNOR',
    candidates: [ [Object], [Object], [Object], [Object] ],
    counties: [
        [Object], [Object], [Object], ...
    ]
}
*/
```

[🔼 Back to Top](#table-of-contents)

---

### `listContests()`

**Description**  
Retrieves an array of all available contest (race) names in the dataset.

**Signature**

```ts
listContests(): string[];
```

**Returns**

- `string[]`: An array of contest names.

**Example**:

```ts
const contests = ncsbe.listContests();
console.log(contests);
// Example output: [ 'US_SENATE', 'US_PRESIDENT', ... ]
```

[🔼 Back to Top](#table-of-contents)

---

### `listCounties(contest)`

**Description**  
Lists all counties in which votes were cast for a specified contest.

**Signature**

```ts
listCounties(contest: string): string[];
```

**Parameters**

- `contest: string` — The name of the contest (e.g., "US_SENATE").

**Returns**

- `string[]`: Array of county names that have results for this contest.

**Example**:

```ts
const counties = ncsbe.listCounties('US_SENATE');
console.log(counties);
// Example output: [ 'Wake', 'Mecklenburg', 'Durham', ... ]
```

[🔼 Back to Top](#table-of-contents)

---

### `listPrecincts(contest, county)`

**Description**
Lists all precincts in a given county for a specific contest.

**Signature**

```ts
listPrecincts(contest: string, county: string): string[];
```

**Parameters**

- `contest: string` — The name of the contest (e.g., "US_SENATE").
- `county: string` — The name of the county (e.g., "Wake").

**Returns**

- `string[]`: An array of precinct names.

**Example**:

```ts
const precincts = ncsbe.listPrecincts('US_SENATE', 'Wake');
console.log(precincts);
// Example output: [ 'Precinct 01-01', 'Precinct 01-02', ... ]
```

[🔼 Back to Top](#table-of-contents)

---

### `listCandidates(contest)`

**Description**  
Retrieves a list of all candidate names running in a specific contest.

**Signature**

```ts
listCandidates(contest: string): string[];
```

**Parameters**

- `contest: string` — The name of the contest (e.g., "US_SENATE").

**Returns**

- `string[]`: An array of candidate names.

**Example**:

```ts
const candidates = ncsbe.listCandidates('US_SENATE');
console.log(candidates);
// Example output: [ 'Candidate A', 'Candidate B', 'Candidate C', ... ]
```

[🔼 Back to Top](#table-of-contents)

---

### `hasContest(contest)`

**Description**  
Checks whether a given contest exists in the dataset.

**Signature**

```ts
hasContest(contest: string): boolean;
```

**Parameters**

- `contest: string` — The name of the contest (e.g., "US_SENATE").

**Returns**

- `boolean`: True if the contest exists, false otherwise.

**Example**:

```ts
const presidentExists = ncsbe.hasContest('US_PRESIDENT');
console.log(presidentExists);
// Example output: true
```

[🔼 Back to Top](#table-of-contents)

---

### `hasCandidate(candidate)`

**Description**  
Checks whether a given candidate exists in the dataset.

**Signature**

```ts
hasCandidate(candidate: string): boolean;
```

**Parameters**

- `candidate: string` — The name of the candidate (e.g., "John Doe").

**Returns**

- `boolean`: True if the candidate exists, false otherwise.

**Example**:

```ts
const joeExists = ncsbe.hasContest('John Doe');
console.log(joeExists);
// Example output: false
```

[🔼 Back to Top](#table-of-contents)

---

### `getContest(contest)`

**Description**
Retrieves the entire `ContestData` object for a given contest, which includes candidate data, counties, and precinct information.

**Signature**

```ts
getContest(contest: string): ContestData | null;
```

**Parameters**

- `contest: string` — The name of the contest.

**Returns**

- `ContestData | null`:
    - `ContestData` if the contest exists, otherwise `null`.

**Example**:

```ts
const contestData = ncsbe.getContest('US_SENATE');
if (contestData) {
    console.log(contestData.counties.length);
    console.log(conteestData.candidates.length);
}
```

[🔼 Back to Top](#table-of-contents)

---

### `getCandidateInfo(contest, candidateName)`

**Description**  
Retrieves detailed information about a single candidate in a given contest.

**Signature**

```ts
getCandidateInfo(contest: string, candidateName: string): CandidateData | null;
```

**Parameters**

- `contest: string` — The contest name.
- `candidateName: string` — The candidate’s name.

**Returns**

- `CandidateData | null`:
    - `CandidateData` if found, otherwise `null`.

**Example**:

```ts
const candidateInfo = ncsbe.getCandidateInfo('US_SENATE', 'Candidate A');
if (candidateInfo) {
    console.log(candidateInfo.party);
    console.log(candidateInfo.votes);
}
```

[🔼 Back to Top](#table-of-contents)

---

### `getCountyResults(contest, county)`

**Description**  
Retrieves voting results for **all precincts** within a specific county for the given contest.

**Signature**

```ts
getCountyResults(contest: string, county: string): CountyData | null;
```

**Parameters**

- `contest: string` — The contest name.
- `county: string` — The county name.

**Returns**

- `CountyData | null`:
    - `CountyData` if found, otherwise `null`.

**Example**:

```ts
const countyResults = ncsbe.getCountyResults('US_SENATE', 'Wake');
if (countyResults) {
    console.log(countyResults.precincts.length);
    console.log(countyResults.precincts.candidates.length);
}
```

[🔼 Back to Top](#table-of-contents)

---

### `getAllCandidateResults(candidateName)`

**Description**  
Retrieves **all election results** for a specified candidate **across all contests** in the dataset.

**Signature**

```ts
getAllCandidateResults(candidateName: string): CandidateData[];
```

**Parameters**

- `candidateName: string` — The candidate’s name.

**Returns**

- `CandidateData[]`:
    - An array of `CandidateData` objects for every contest that this candidate appears in.

**Example**:

```ts
const candidateResults = ncsbe.getAllCandidateResults('Candidate A');
console.log(candidateResults);
// Logs an array of CandidateData for each contest in which Candidate A is running
```

[🔼 Back to Top](#table-of-contents)

---

### `getCandidateVoteTotal(contest, candidateName)`

**Description**  
Computes the **total** number of votes for a given candidate in a specific contest (all counties and precincts combined).

**Signature**

```ts
getCandidateVoteTotal(contest: string, candidateName: string): number;
```

**Parameters**

- `contest: string` — The name of the contest.
- `candidateName: string` — The candidate’s name.

**Returns**

- `number`: The total vote count for the specified candidate in the contest.

**Example**:

```ts
const totalVotes = ncsbe.getCandidateVoteTotal('US_SENATE', 'Candidate A');
console.log(totalVotes);
// Example output: 123456
```

[🔼 Back to Top](#table-of-contents)

---

### `getContestVoteTotals(contest)`

**Description**  
Returns a mapping of **all candidates** in a contest to their total vote counts.

**Signature**

```ts
getContestVoteTotals(contest: string): Record<string, number>;
```

**Parameters**

- `contest: string` — The name of the contest.

**Returns**

- `Record<string, number>`:
    - An object where each key is a candidate name and each value is their total number of votes in the contest.

**Example**:

```ts
const voteTotals = ncsbe.getContestVoteTotals('US_SENATE');
console.log(voteTotals);
// Example output: { 'Candidate A': 123456, 'Candidate B': 234567, ... }
```

[🔼 Back to Top](#table-of-contents)

---

### `getTotalVotesForContest(contest)`

**Description**  
Retrieves the total number of votes for a given contest.

**Signature**

```ts
getTotalVotesForContest(contest: string): number;
```

**Parameters**

- `contest: string` — The name of the contest.

**Returns**

- `number`: The total number of votes for a given contest.

**Example**:

```ts
const totalVotes = ncsbe.getTotalVotesForContest('US_PRESIDENT');
console.log(totalVotes);
// Example output: 139381
```

[🔼 Back to Top](#table-of-contents)

---

### `getCandidateVotePercentage(contest, candidateName)`

**Description**  
Retrieves a candidate's percentage of total votes for a given contest.

**Signature**

```ts
getCandidateVotePercentage(contest: string, candidateName: string): number;
```

**Parameters**

- `contest: string` — The name of the contest.
- `candidateName: string` - The name of the candidate.

**Returns**

- `number`:
    - A decimal value representing the percentage of the vote a candidate holds.

**Example**:

```ts
const votePercentage = ncsbe.getCandidateVotePercentage(
    'US_SENATE',
    'John Doe',
);
console.log(votePercentage);
// Expected output: 20.3
```

[🔼 Back to Top](#table-of-contents)

---

### `getContestWinner(contest)`

**Description**  
Retrieves the data of the candidate who currently has the most votes in a given contest. This method can be used to see who is leading a contest, or who has won the contests after the final updates to the dataset.

> Note: This method does not account for the case of a tie.

**Signature**

```ts
getContestWinner(contest: string): CandidateData;
```

**Parameters**

- `contest: string` — The name of the contest.

**Returns**

- `CandidateData`:
    - A `CandidateData` object holding the information for a candidate who is currently winning the given contest

**Example**:

```ts
const currentLeader = ncsbe.getContestWinner('US_SENATE');
console.log(currentLeader);
// Expected output: { candidate: 'John Doe', party: 'DEM', votes: 13000 }
```

[🔼 Back to Top](#table-of-contents)

---

### `getClosestRace()`

**Description**  
Finds the contest with the smallest margin between the top two candidates.

> Note: If there is a tie, this method will return it.

**Signature**

```ts
getClosest(): ContestData;
```

**Returns**

- `ContestData`:
    - A `ContestData` object holding the information for the contest that has the smallest margin between the top two candidates

**Example**:

```ts
const closestRace = ncsbe.getClosestRace();
console.log(closestRace.contestName);
// Expected output: 'US_PRESIDENT'
```

[🔼 Back to Top](#table-of-contents)

---

### `getCandidates(contest)`

**Description**  
Retrieves **all candidate data objects** for a specific contest.

**Signature**

```ts
getCandidates(contest: string): CandidateData[];
```

**Parameters**

- `contest: string` — The name of the contest.

**Returns**

- `CandidateData[]`:
    - Array of candidate data objects for this contest.

**Example**:

```ts
    const candidatesData = ncsbe.getCandidates('US_SENATE');
    candidatesData.forEach(cd => {
      console.log(\`\${cd.candidate}: \${cd.votes}\`);
    });
```

[🔼 Back to Top](#table-of-contents)

---

### `getCounties(contest)`

**Description**  
Retrieves **all county data objects** for a specific contest.

**Signature**

```ts
getCounties(contest: string): CountyData[];
```

**Parameters**

- `contest: string` — The name of the contest.

**Returns**

- `CountyData[]`:
    - An array of county data objects.

**Example**:

```ts
const countiesData = ncsbe.getCounties('US_SENATE');
console.log(countiesData[0]);
// logs the first county data object with precincts, votes, etc.
```

[🔼 Back to Top](#table-of-contents)

---

### `getPrecincts(contest)`

**Description**  
Retrieves **all precinct data objects** across **all counties** for a specific contest.

**Signature**

```ts
getPrecincts(contest: string): PrecinctData[];
```

**Parameters**

- `contest: string` — The name of the contest.

**Returns**

- `PrecinctData[]`:
    - An array of precinct-level data objects, each containing vote tallies by candidate.

**Example**:

```ts
const precinctsData = ncsbe.getPrecincts('US_SENATE');
console.log(precinctsData.length);
// For each precinct, you can see which candidates got how many votes
```

[🔼 Back to Top](#table-of-contents)

---

### `getContestsByCandidate(candidateName)`

**Description**  
Retrieves all contests that a given candidate is a part of.

**Signature**

```ts
getContestsByCandidate(candidateName: string): ContestData[];
```

**Parameters**

- `candidateName: string` - The name of the candidate.

**Returns**

- `ContestData[]`:
    - An array of `ContestData` objects that a candidate was found in.

**Example**:

```ts
const contestsForJohn = ncsbe.getContestsByCandidate('US_SENATE', 'John Doe');
console.log(contestsForJohn.length);
```

[🔼 Back to Top](#table-of-contents)

## Notes

1. **Data Freshness**: The NCSBE website updates election results periodically on election day and afterwards. Use `refresh()` to keep data synchronized.
2. **Null Returns**: Many methods will return `null` or an empty array if the requested contest, county, or candidate does not exist in the dataset.
3. **Date Formatting**: Ensure you pass the date as `YYYY-MM-DD`. Internally, the class will construct the URL to the NCSBE data file.

[🔼 Back to Top](#table-of-contents)

### Example Workflow

```ts
// 1. Instantiate with the election date
const ncsbe = new NCSBE('2024-11-05');

// 2. Initialize (fetch data)
await ncsbe.initialize();

// 3. List all contests
const contests = ncsbe.listContests();
console.log(contests);

// 4. For a specific contest, get total votes for Candidate A
const candidateATotal = ncsbe.getCandidateVoteTotal('US_SENATE', 'Candidate A');
console.log(\`Candidate A total votes: \${candidateATotal}\`);

// 5. Refresh data periodically for live updates
setInterval(async () => {
  await ncsbe.refresh();
  console.log('Data refreshed!');
}, 300000); // every 5 minutes
```

[🔼 Back to Top](#table-of-contents)
