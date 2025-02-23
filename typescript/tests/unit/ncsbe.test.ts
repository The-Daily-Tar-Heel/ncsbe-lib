import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-mock';

describe('NCSBE - Initalization with mock data', () => {
    let ncsbe: NCSBE;

    beforeAll(() => {
        ncsbe = getNCSBEInstance();
    });

    test('should initialize correctly', () => {
        expect(ncsbe.getDataset()).not.toBeNull();
    });

    test('should list all contests', () => {
        expect(ncsbe.listContests()).toEqual(['US_PRESIDENT', 'US_SENATE']);
    });

    test('dataset should be the same after refresh with no changes', async () => {
        const prevDataset = ncsbe.getDataset();
        await ncsbe.refresh();
        const newDataset = ncsbe.getDataset();
        expect(newDataset).toEqual(prevDataset);
    });
});
