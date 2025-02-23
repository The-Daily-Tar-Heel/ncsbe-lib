import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-mock';
import { mockElectionData } from '../../lib/__mocks__/collector';

describe('NCSBE - Contest and Candidate Details', () => {
    let ncsbe: NCSBE;

    beforeAll(() => {
        ncsbe = getNCSBEInstance();
    });

    test('should get the contest data for a given contest name', () => {
        const contestData = ncsbe.getContest('US_PRESIDENT');
        expect(contestData).not.toBeNull();

        const expectedContestData = mockElectionData.find(
            (c) => c.contestName === 'US_PRESIDENT',
        );
        expect(contestData).toEqual(expectedContestData);

        const nullContestData = ncsbe.getContest('NC_GOVERNOR');
        expect(nullContestData).toBeNull();
    });

    test('should get candidate data object for a given contest and candidate name, otherwise null', () => {
        const candidateInfo = ncsbe.getCandidateInfo('US_SENATE', 'Felix');
        expect(candidateInfo).not.toBeNull();
        expect(candidateInfo?.candidate).toEqual('Felix');
        expect(candidateInfo?.party).toEqual('REP');
        expect(candidateInfo?.votes).toEqual(18000);

        const nullCandidateInfo = ncsbe.getCandidateInfo(
            'NC_GOVERNOR',
            'Joseph',
        );
        expect(nullCandidateInfo).toBeNull();
    });

    test('should get all candidate data objects for a given contest', () => {
        const candidates = ncsbe.getCandidates('US_PRESIDENT');
        expect(candidates).not.toBeNull();

        const expectedCandidates = mockElectionData.find(
            (c) => c.contestName === 'US_PRESIDENT',
        )?.candidates;
        expect(candidates).toEqual(expectedCandidates);

        const emptyCandidates = ncsbe.getCandidates('NC_GOVERNOR');
        expect(emptyCandidates.length).toEqual(0);
    });

    test('should return all contest data objects of all contests a candidate is running in', () => {
        const contests = ncsbe.getContestsByCandidate('Alex');
        expect(contests).not.toBeNull();

        const expectedContests = mockElectionData.filter((c) =>
            c.candidates.find((candidate) => candidate.candidate === 'Alex'),
        );
        expect(contests).toEqual(expectedContests);

        const emptyContests = ncsbe.getContestsByCandidate('Joseph');
        expect(emptyContests.length).toEqual(0);
    });
});
