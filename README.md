# NCSBE Election Data Library

NCSBE Lib is a JavaScript library created by the Daily Tar Heel engineering team for working with North Carolina State Board of Elections (NCSBE) historical election data. The NCSBE provides live election results by updating a TSV file every five minutes, accessible via periodic GET requests. This library streamlines the process of fetching, extracting, and parsing election data, turning it into a more useful and easy to work with structure.

## How It Works
Since the NCSBE re-uploads the entire dataset as a fresh snapshot every 5 minutes, this library is designed to replace the full dataset upon each refresh.
Users can utilize this library in one of two ways:

- **Basic Usage (No Database):** Simply call refresh() every five minutes to update the dataset. The in-memory dataset will always reflect the latest results, so functions like listContests() and getCandidates() will automatically reflect new data.
- **Advanced Usage (With a Database):** If you plan to store election data in your own database, you should detect changes before updating records to avoid redundant processing. We recommend hashing each record and only updating entries when their hash has changed.


## Features
- Retrieve election data for a specific date.
- List available contests (races).
- List counties where voting occurred for a given contest.
- List precincts within a county for a specific contest.
- Retrieve candidate information and vote totals.
- Refresh election data periodically to get the latest updates.
- Filter election results by candidate, county, or precinct.

## Installation
Ensure you have TypeScript installed in your project. You can install the node module using:
```sh
npm install ncsbe-lib
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
```
"Refreshing" will replace the **entire** `dataSet`. The NCSBE continuously re-uploads the ZIP file as a full snapshot rather than an incremental update. Because of this, **you** will need to detect changes in the data to avoid unnecessary updates if storing this information in a database.

We recommend **hashing** each record and only updating entries when their hash has changed. This ensures that unchanged records are not unnecessarily reprocessed, reducing database load and preventing redundant updates.

# Additional Documentation
For a complete API reference, including details on functions such as retrieving candidate information, filtering data, and fetching vote totals, see the [Full Documentation](docs/ncsbe.md) in docs/ncsbe.md.
