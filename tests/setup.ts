import { NCSBE } from '../lib/ncsbe';
import { mockElectionData } from '../lib/__mocks__/collector';

jest.mock('../lib/collector', () => ({
    Collector: jest.fn().mockImplementation(() => ({
        collect: jest.fn().mockResolvedValue(mockElectionData),
    })),
}));

/* 
    Use a global instance of NCSBE. This is better because dataset is read-only,
    so tests won't interfere with each other and we don't need to pay the cost
    of reinitialization for each suite or test. 
*/
let ncsbeInstance: NCSBE;

beforeAll(async () => {
    ncsbeInstance = new NCSBE('2024-11-05');
    await ncsbeInstance.initialize();
});

export function getNCSBEInstance() {
    return ncsbeInstance;
}
