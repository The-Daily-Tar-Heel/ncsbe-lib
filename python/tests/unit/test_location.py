def test_list_counties(mock_ncsbe_instance):
    counties = mock_ncsbe_instance.list_counties("US_PRESIDENT")
    assert counties is not None
    assert len(counties) == 1
    assert counties[0] == "Orange"

def test_list_precincts(mock_ncsbe_instance):
    precincts = mock_ncsbe_instance.list_precincts("US_SENATE", "Wake")
    assert precincts is not None
    assert len(precincts) == 1
    assert precincts[0] == "2"

def test_get_counties(mock_ncsbe_instance, mock_election_data):
    counties = mock_ncsbe_instance.get_counties("US_PRESIDENT")
    assert counties is not None
    assert counties[0].county == "Orange"

    expected_counties = next((c.counties for c in mock_election_data if c.contest_name == "US_PRESIDENT"), [])
    assert counties == expected_counties

    empty_counties = mock_ncsbe_instance.get_counties("NC_GOVERNOR")
    assert len(empty_counties) == 0

def test_get_precincts(mock_ncsbe_instance, mock_election_data):
    precincts = mock_ncsbe_instance.get_precincts("US_PRESIDENT")
    assert precincts is not None
    assert precincts[0].precinct == "1"

    expected_precincts = list(next(
        (county.precincts for c in mock_election_data if c.contest_name == "US_PRESIDENT"
         for county in c.counties if county.county == "Orange"),
        ()
    ))
    assert precincts == expected_precincts

    empty_precincts = mock_ncsbe_instance.get_precincts("NC_GOVERNOR")
    assert len(empty_precincts) == 0
