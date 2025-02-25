def test_get_county_results(mock_ncsbe_instance, mock_election_data):
    results = mock_ncsbe_instance.get_county_results("US_PRESIDENT", "Orange")
    assert results is not None
    assert results.county == "Orange"

    expected_results = next(
        (county for c in mock_election_data if c.contest_name == "US_PRESIDENT"
         for county in c.counties if county.county == "Orange"),
        None
    )
    assert results == expected_results

def test_get_all_candidate_results(mock_ncsbe_instance):
    results = mock_ncsbe_instance.get_all_candidate_results("Alex")
    assert results is not None
    assert len(results) == 2

    assert results[0].candidate == "Alex"
    assert results[0].party == "DEM"
    assert results[0].votes == 1000

    assert results[1].candidate == "Alex"
    assert results[1].party == "DEM"
    assert results[1].votes == 15000

def test_get_candidate_vote_total(mock_ncsbe_instance):
    results = mock_ncsbe_instance.get_candidate_vote_total("US_SENATE", "Felix")
    assert results == 18000

def test_get_contest_vote_totals(mock_ncsbe_instance):
    vote_totals = mock_ncsbe_instance.get_contest_vote_totals("US_PRESIDENT")
    assert vote_totals is not None
    assert vote_totals["John"] == 100050
    assert vote_totals["Mark"] == 100000
    assert vote_totals["Alex"] == 1000

def test_get_total_votes_for_contest(mock_ncsbe_instance):
    total_votes = mock_ncsbe_instance.get_total_votes_for_contest("US_SENATE")
    assert total_votes == 33000

def test_get_candidate_vote_percentage(mock_ncsbe_instance):
    vote_percentage = mock_ncsbe_instance.get_candidate_vote_percentage("US_PRESIDENT", "John")
    assert vote_percentage == (100050 / 201050) * 100

def test_get_contest_winner(mock_ncsbe_instance):
    contest_winner_senate = mock_ncsbe_instance.get_contest_winner("US_SENATE")
    contest_winner_president = mock_ncsbe_instance.get_contest_winner("US_PRESIDENT")

    assert contest_winner_senate is not None
    assert contest_winner_senate.candidate == "Felix"

    assert contest_winner_president is not None
    assert contest_winner_president.candidate == "John"

def test_get_closest_race(mock_ncsbe_instance, mock_election_data):
    closest_race = mock_ncsbe_instance.get_closest_race()
    assert closest_race is not None

    expected_race = next(
        (c for c in mock_election_data if c.contest_name == "US_PRESIDENT"),
        None
    )
    assert closest_race == expected_race
