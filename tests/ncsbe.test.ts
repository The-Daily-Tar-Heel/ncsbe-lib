import { NCSBE } from '../lib/ncsbe';

jest.mock('../lib/collector');

describe('NCSBE', () => {
    let ncsbe: NCSBE;

    beforeEach(async () => {
        ncsbe = new NCSBE('2024-11-05');
        await ncsbe.initialize();
    });

    test('should list all contests', () => {
        expect(ncsbe.listContests()).toEqual(['US_PRESIDENT', 'US_SENATE']);
    });
});
