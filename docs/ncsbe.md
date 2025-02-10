# `NCSBE`

`NCSBE` is the primary class for working with NCSBE data. You can construct a new instance of the NCSBE class with a date string for the election date you are working with. The date string must be of the form `YYYY-MM-DD`.

```ts
const ncsbe = new NCSBE('2024-11-05');
await ncsbe.initialize(); // initialize with the dataset
const contests = ncsbe.listContests();
```