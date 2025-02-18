import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-mock';
import { mockElectionData } from '../../lib/__mocks__/collector';

describe('NCSBE - General listing and existence queries', () => {
    let ncsbe: NCSBE;

    beforeAll(() => {
        ncsbe = getNCSBEInstance();
    });

    test('should get dataset', () => {
        const dataset = ncsbe.getDataset();

        expect(dataset).not.toBeNull();
        expect(dataset).toEqual(mockElectionData);
    });

    test('should list contests', () => {
        const contests = ncsbe.listContests();

        expect(contests).not.toBeNull();
        expect(contests).toContain('US_SENATE');
        expect(contests).toContain('US_PRESIDENT');
    });

    test('should list candidates for a given contest', () => {
        const candidates = ncsbe.listCandidates('US_SENATE');

        expect(candidates).not.toBeNull();
        expect(candidates).toContain('Alex');
        expect(candidates).toContain('Felix');
    });

    test('should return true if dataset has a contest', () => {
        const hasPresident = ncsbe.hasContest('US_PRESIDENT');
        expect(hasPresident).toEqual(true);

        const hasGovernor = ncsbe.hasContest('NC_GOVERNOR');
        expect(hasGovernor).toEqual(false);
    });

    test('should return true if a candidate exists in the dataset', () => {
        const hasPresident = ncsbe.hasCandidate('Felix');
        expect(hasPresident).toEqual(true);

        const hasGovernor = ncsbe.hasCandidate('Joseph');
        expect(hasGovernor).toEqual(false);
    });
});
