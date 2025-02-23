import { NCSBE } from '../../lib/ncsbe';
import { getNCSBEInstance } from '../setup-mock';
import { mockElectionData } from '../../lib/__mocks__/collector';

describe('NCSBE - Location tests', () => {
    let ncsbe: NCSBE;

    beforeAll(() => {
        ncsbe = getNCSBEInstance();
    });

    test('should list all counties for a given contest', () => {
        const counties = ncsbe.listCounties('US_PRESIDENT');

        expect(counties).not.toBeNull();
        expect(counties.length).toEqual(1);
        expect(counties[0]).toEqual('Orange');
    });

    test('should list all precincts for a given contest and county', () => {
        const precincts = ncsbe.listPrecincts('US_SENATE', 'Wake');

        expect(precincts).not.toBeNull();
        expect(precincts.length).toEqual(1);
        expect(precincts[0]).toEqual('2');
    });

    test('should retrieve all county data objects for a given contest', () => {
        const counties = ncsbe.getCounties('US_PRESIDENT');
        expect(counties).not.toBeNull();
        expect(counties[0].county).toEqual('Orange');

        const expectedCounties = mockElectionData.find(
            (c) => c.contestName === 'US_PRESIDENT',
        )?.counties;
        expect(counties).toEqual(expectedCounties);

        const emptyCounties = ncsbe.getCounties('NC_GOVERNOR');
        expect(emptyCounties.length).toEqual(0);
    });

    test('should retrieve all precinct data objects for a given contest', () => {
        const precincts = ncsbe.getPrecincts('US_PRESIDENT');
        expect(precincts).not.toBeNull();
        expect(precincts[0].precinct).toEqual('1');

        const expectedPrecincts = mockElectionData
            .find((c) => c.contestName === 'US_PRESIDENT')
            ?.counties.find((county) => county.county === 'Orange')?.precincts;
        expect(precincts).toEqual(expectedPrecincts);

        const emptyPrecincts = ncsbe.getPrecincts('NC_GOVERNOR');
        expect(emptyPrecincts.length).toEqual(0);
    });
});
