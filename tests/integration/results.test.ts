import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-real';

describe('NCSBE - Election Results', () => {
    let ncsbe: NCSBE;

    beforeAll(() => {
        ncsbe = getNCSBEInstance();
    });

    test('should get the percentage of the vote a candidate has in a particular contest', () => {
        const votePercentage = ncsbe.getCandidateVotePercentage(
            'US_PRESIDENT',
            'Kamala D. Harris',
        );
        const totalVotes = ncsbe.getTotalVotesForContest('US_PRESIDENT');
        expect(totalVotes).toEqual(5699141);

        const candidateVoteTotal = ncsbe.getCandidateVoteTotal(
            'US_PRESIDENT',
            'Kamala D. Harris',
        );
        expect(candidateVoteTotal).toEqual(2715375);

        expect(votePercentage).toEqual((candidateVoteTotal / totalVotes) * 100);
    });
});
