import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-real';

describe('NCSBE - Initalization with real Collector data', () => {
    let ncsbe: NCSBE;

    beforeAll(() => {
        ncsbe = getNCSBEInstance();
    }, 8000);

    test('should initialize correctly', () => {
        expect(ncsbe.getDataset()).not.toBeNull();
    });

    test('should throw error if date is invalid', async () => {
        const invalidNCSBE = new NCSBE(
            'random invalid string not in date format',
        );
        await expect(invalidNCSBE.initialize()).rejects.toThrow();
    });

    test('should list all contests', () => {
        expect(ncsbe.listContests()).toContain(
            'NC_COMMISSIONER_OF_AGRICULTURE',
        );
    });
});
