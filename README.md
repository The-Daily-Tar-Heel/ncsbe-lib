# NCSBE Election Data Library

[![License][license-image]][license-url]
![NPM Last Update](https://img.shields.io/npm/last-update/ncsbe-lib)

#### NPM
[![npm version][npm-image]][npm-url]
![NPM Type Definitions](https://img.shields.io/npm/types/ncsbe-lib)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/ncsbe-lib)
[![npm downloads](https://img.shields.io/npm/dw/ncsbe-lib.svg)][npm-url]

#### PyPI
[![PyPI - Version](https://img.shields.io/pypi/v/ncsbe-lib)][pypi-url]
[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/ncsbe-lib)][pypi-url]
![PyPI - Format](https://img.shields.io/pypi/format/ncsbe-lib)

#### 📊 Coverage
![Lines](https://github.com/The-Daily-Tar-Heel/ncsbe-lib/blob/main/typescript/badges/badge-lines.svg)
![Functions](https://github.com/The-Daily-Tar-Heel/ncsbe-lib/blob/main/typescript/badges/badge-functions.svg)
![Statements](https://github.com/The-Daily-Tar-Heel/ncsbe-lib/blob/main/typescript/badges/badge-statements.svg)
![Branches](https://github.com/The-Daily-Tar-Heel/ncsbe-lib/blob/main/typescript/badges/badge-branches.svg)

[npm-url]: https://www.npmjs.com/package/ncsbe-lib
[npm-image]: https://img.shields.io/npm/v/ncsbe-lib.svg
[pypi-url]: https://pypi.org/project/ncsbe-lib/
[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

## What it is

NCSBE Lib is a JavaScript library created by the Daily Tar Heel engineering team for working with North Carolina State Board of Elections (NCSBE) historical election data. The NCSBE provides live election results by updating a TSV file every five minutes, accessible via periodic GET requests. This library streamlines the process of fetching, extracting, and parsing election data, turning it into a more useful and easy to work with structure.


## How It Works

Since the NCSBE re-uploads the entire dataset as a fresh snapshot every 5 minutes, this library is designed to replace the full dataset upon each refresh.
Users can utilize this library in one of two ways:

- **Basic Usage (No Database):** Simply call `refresh()` every five minutes to update the dataset. The in-memory dataset will always reflect the latest results, so functions like `listContests()` and `getCandidates()` will automatically reflect new data.
- **Advanced Usage (With a Database):** If you plan to store election data in your own database, you should detect changes before updating records to avoid redundant processing. We recommend hashing each record and only updating entries when their hash has changed.

🔗 **[How we approached "Advanced Usage"](#optimizing-database-updates-with-hashing)**

## Features

- Retrieve election data for a specific date.
- List available contests (races).
- List counties where voting occurred for a given contest.
- List precincts within a county for a specific contest.
- Retrieve candidate information and vote totals.
- Refresh election data periodically to get the latest updates.
- Filter election results by candidate, county, or precinct.

## Installation

### JavaScript (Node)

```sh
npm install ncsbe-lib
```

### Python

```sh
pip install ncsbe-lib
```

## Usage

### Importing and Initializing

### JavaScript (Node/TypeScript)

```ts
import { NCSBE } from 'ncsbe-lib';

const ncsbe = new NCSBE('2024-11-05');
await ncsbe.initialize();
```

### Python

```py
from ncsbe_lib import NCSBE

ncsbe = NCSBE('2024-11-05')
ncsbe.initialize()
```

> Note: The Python package makes use of the `requests` library which is **synchronous** in Python. The JavaScript package makes use of `axios`, so initialization and refreshing are **async**, but all other methods are synchroonous.

### Refresh Data

### JS

```ts
// Replace dataSet with the entirety of the newly fetched TSV file.
await ncsbe.refresh();
```

### Python
```py
# Replace dataSet with the entirety of the newly fetched TSV file.
ncsbe.refresh()
```

"Refreshing" will replace the **entire** `dataSet`. The NCSBE continuously re-uploads the ZIP file as a full snapshot rather than an incremental update. Because of this, **you** will need to detect changes in the data to avoid unnecessary updates if storing this information in a database.

We recommend **hashing** each record and only updating entries when their hash has changed. This ensures that unchanged records are not unnecessarily reprocessed, reducing database load and preventing redundant updates.

## Optimizing Database Updates With Hashing

In fact, we ran into this very problem before making this library and solved it via hashing. In our Firestore database, we stored each contest name as the key of the root collection, then stored all of the county and candidate data in fields/subcollections of the primary collection. When we "refreshed" (replaced the old file/dataset with the new one), we looped through every contest, hashed all of the data it held. If the hash differed, we updated that contest and if not, we skip the entire contest. This way, we only update contests in our database that actually saw changes which greatly improved space and efficiency.

Below is some pseudocode similar to our approach. We wrote our own `hashService`, but you can implement this however you want, the logic follows just the same.

```js
await ncsbe.refresh();
const allData = ncsbe.dataSet;

for (const contest of allData) {
    // Compute the hash for the current contest data. We used Node's built-in crypto module.
    const currentHash = hashService.computeHash(contest);

    // Get the previous hash from our database, stored in its own collection, keyed by name of the contest.
    const previousHash = await hashService.getPreviousHash(contestName);

    // Did anything change? If not, skip this contest.
    if (currentHash === previousHash) {
        logger.info(
            `No changes detected for contest '${contest.contestName}'.`,
        );
        continue;
    }

    //...rest of the function handling updating database
}
```

# Additional Documentation

For a complete API reference, including details on functions such as retrieving candidate information, filtering data, and fetching vote totals, see the [Full Documentation](docs/ncsbe.md) in docs/ncsbe.md.
