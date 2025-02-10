# NCSBE Election Data Library

NCSBE Lib is a JavaScript library created by the Daily Tar Heel engineering team for working with North Carolina State Board of Elections (NCSBE) historical election data. The NCSBE provides live election results by updating a TSV file every five minutes, accessible via periodic GET requests. This library streamlines the process of fetching, extracting, and parsing election data, turning it into a more useful and easy to work with structure.

## Features
- Retrieve election data for a specific date.
- List available contests (races).
- List counties where voting occurred for a given contest.
- List precincts within a county for a specific contest.
- Retrieve candidate information and vote totals.
- Refresh election data periodically to get the latest updates.
- Filter election results by candidate, county, or precinct.

## Installation
Ensure you have TypeScript installed in your project. You can install the necessary dependencies using:
```sh
npm install
```

## Usage
### Importing and Initializing
```ts
import { NCSBE } from 'ncsbe-lib'

const ncsbe = new NCSBE('2024-11-05');
await ncsbe.initialize();
```
### Refresh Data
```ts
// Replace dataSet with the entirety of the newly fetched TSV file.
await ncsbe.refresh()

// Update dataSet with the last 4000 entries (TSV file rows) of election data from NCSBE (more efficient).
await ncsbe.refresh(4000)
```
For more details on refresh and the optional `lineLimit` parameter, see the documentation in [docs/ncsbe.md](docs/ncsbe.md).

# Additional Documentation
For a complete API reference, including details on functions such as retrieving candidate information, filtering data, and fetching vote totals, see the [Full Documentation](docs/ncsbe.md) in docs/ncsbe.md.
