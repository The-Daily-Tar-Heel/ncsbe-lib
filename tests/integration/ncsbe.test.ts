import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-real';

describe('NCSBE - Initalization with real Collector data', () => {
    let ncsbe: NCSBE;

    beforeAll(async () => {
        ncsbe = getNCSBEInstance();
    });

    test('should initialize correctly', () => {
        expect(ncsbe.getDataset()).not.toBeNull();
    });

    test('should list all contests', () => {
        expect(ncsbe.listContests()).toContain(
            'NC_COMMISSIONER_OF_AGRICULTURE',
        );
    });
});
