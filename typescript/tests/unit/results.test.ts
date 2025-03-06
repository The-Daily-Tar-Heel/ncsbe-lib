import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-mock';
import { mockElectionData } from '../../lib/__mocks__/collector';

describe('NCSBE - Election Results', () => {
    let ncsbe: NCSBE;

    beforeAll(() => {
        ncsbe = getNCSBEInstance();
    });

    test('should get county results for a given contest', () => {
        const results = ncsbe.getCountyResults('US_PRESIDENT', 'Orange');
        expect(results).not.toBeNull();
        expect(results?.county).toEqual('Orange');

        const expectedResults = mockElectionData
            .find((c) => c.contestName === 'US_PRESIDENT')
            ?.counties.find((county) => county.county === 'Orange');

        expect(results).toEqual(expectedResults);
    });

    test('should get all candidate results across all contests', () => {
        const results = ncsbe.getAllCandidateResults('Alex');
        expect(results).not.toBeNull();
        expect(results.length).toEqual(2);

        expect(results[0].candidate).toEqual('Alex');
        expect(results[0].party).toEqual('DEM');
        expect(results[0].votes).toEqual(1000);

        expect(results[1].candidate).toEqual('Alex');
        expect(results[1].party).toEqual('DEM');
        expect(results[1].votes).toEqual(15000);
    });

    test('should get accurate candidate vote total for a given contest', () => {
        const results = ncsbe.getCandidateVoteTotal('US_SENATE', 'Felix');
        expect(results).toEqual(18000);
    });

    test('should return mapping of candidate to vote total for a given contest', () => {
        const voteTotals = ncsbe.getContestVoteTotals('US_PRESIDENT');
        expect(voteTotals).not.toBeNull();
        expect(voteTotals['John']).toEqual(100050);
        expect(voteTotals['Mark']).toEqual(100000);
        expect(voteTotals['Alex']).toEqual(1000);
    });

    test('should get the total votes for a contest', () => {
        const totalVotes = ncsbe.getTotalVotesForContest('US_SENATE');
        expect(totalVotes).toEqual(33000);
    });

    test('should get the percentage of the vote a candidate has in a particular contest', () => {
        const votePercentage = ncsbe.getCandidateVotePercentage(
            'US_PRESIDENT',
            'John',
        );
        expect(votePercentage).toEqual((100050 / 201050) * 100);
    });

    test('should get the correct winner for a contest', () => {
        const contestWinnerSenate = ncsbe.getContestWinner('US_SENATE');
        const contestWinnerPresident = ncsbe.getContestWinner('US_PRESIDENT');

        expect(contestWinnerSenate?.candidate).toEqual('Felix');
        expect(contestWinnerPresident?.candidate).toEqual('John');
    });

    test('should get the closest race', () => {
        const closestRace = ncsbe.getClosestRace();
        expect(closestRace).not.toBeNull();

        const expectedRace = mockElectionData.find(
            (c) => c.contestName === 'US_PRESIDENT',
        );

        expect(closestRace).toEqual(expectedRace);
    });
});
