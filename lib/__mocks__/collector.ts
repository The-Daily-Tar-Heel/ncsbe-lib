import { ContestData } from '../types';

export class Collector {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    async collect(): Promise<ContestData[]> {
        return [
            {
                contestName: 'US_PRESIDENT',
                counties: [
                    {
                        county: 'Orange',
                        precincts: [
                            {
                                precinct: '1',
                                candidates: [
                                    {
                                        candidate: 'John Doe',
                                        party: 'DEM',
                                        votes: 100000,
                                    },
                                    {
                                        candidate: 'Mark',
                                        party: 'REP',
                                        votes: 100000,
                                    },
                                ],
                            },
                        ],
                    },
                ],
                candidates: [
                    {
                        candidate: 'John',
                        party: 'DEM',
                        votes: 100050,
                    },
                    {
                        candidate: 'Mark',
                        party: 'REP',
                        votes: 100000,
                    },
                ],
            },
            {
                contestName: 'US_SENATE',
                counties: [
                    {
                        county: 'Wake',
                        precincts: [
                            {
                                precinct: '2',
                                candidates: [
                                    {
                                        candidate: 'Alex',
                                        party: 'DEM',
                                        votes: 15000,
                                    },
                                    {
                                        candidate: 'Felix',
                                        party: 'REP',
                                        votes: 18000,
                                    },
                                ],
                            },
                        ],
                    },
                ],
                candidates: [
                    {
                        candidate: 'Alex',
                        party: 'DEM',
                        votes: 15000,
                    },
                    {
                        candidate: 'Felix',
                        party: 'REP',
                        votes: 18000,
                    },
                ],
            },
        ];
    }
}
