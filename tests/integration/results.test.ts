// import { NCSBE } from '../../lib/ncsbe';
// import { getNCSBEInstance } from '../setup-real';

// describe('NCSBE - Election Results', () => {
// let ncsbe: NCSBE;

// beforeAll(() => {
//     ncsbe = getNCSBEInstance();
// });

// Moved this here, because it's more of an integration test. Need to change the strings to reflect real Collector data.
// test('should get the percentage of the vote a candidate has in a particular contest', () => {
//     const votePercentage = ncsbe.getCandidateVotePercentage('US_PRESIDENT', 'John');
//     const totalVotes = ncsbe.getTotalVotesForContest('US_PRESIDENT');
//     expect(totalVotes).toEqual(201050)

//     const candidateVoteTotal = ncsbe.getCandidateVoteTotal('US_PRESIDENT', 'John');
//     expect(candidateVoteTotal).toEqual(100050);

//     expect(votePercentage).toEqual((candidateVoteTotal / totalVotes) * 100);
// });
// });
