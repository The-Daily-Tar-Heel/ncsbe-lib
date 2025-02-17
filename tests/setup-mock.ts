import { NCSBE } from '../lib/ncsbe';
import { mockElectionData } from '../lib/__mocks__/collector';

jest.mock('../lib/collector', () => ({
    Collector: jest.fn().mockImplementation(() => ({
        collect: jest.fn().mockResolvedValue(mockElectionData),
    })),
}));

/*
 * Global NCSBE instance for testing.
 *
 * Since the dataset is read-only, test cases won't interfere with each other.
 * This also avoids the overhead of reinitializing the instance for each test suite.
 */
let ncsbeInstance: NCSBE;

beforeAll(async () => {
    ncsbeInstance = new NCSBE('2024-11-05');
    await ncsbeInstance.initialize();
});

export function getNCSBEInstance() {
    return ncsbeInstance;
}
