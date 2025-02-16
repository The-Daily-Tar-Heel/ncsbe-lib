import { NCSBE } from '../lib/ncsbe';
import { getNCSBEInstance } from './setup';

describe('NCSBE - Initalization', () => {
    let ncsbe: NCSBE;

    beforeAll(async () => {
        ncsbe = getNCSBEInstance();
    });

    test('should initialize correctly', () => {
        expect(ncsbe.getDataset()).not.toBeNull();
    });

    test('should list all contests', () => {
        expect(ncsbe.listContests()).toEqual(['US_PRESIDENT', 'US_SENATE']);
    });
});
