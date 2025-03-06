def test_get_contest(mock_ncsbe_instance, mock_election_data):
    contest_data = mock_ncsbe_instance.get_contest("US_PRESIDENT")
    assert contest_data is not None

    expected_contest_data = next((c for c in mock_election_data if c.contest_name == "US_PRESIDENT"), None)
    assert contest_data == expected_contest_data

    null_contest_data = mock_ncsbe_instance.get_contest("NC_GOVERNOR")
    assert null_contest_data is None

def test_get_candidate_info(mock_ncsbe_instance):
    candidate_info = mock_ncsbe_instance.get_candidate_info("US_SENATE", "Felix")
    assert candidate_info is not None
    assert candidate_info.candidate == "Felix"
    assert candidate_info.party == "REP"
    assert candidate_info.votes == 18000

    null_candidate_info = mock_ncsbe_instance.get_candidate_info("NC_GOVERNOR", "Joseph")
    assert null_candidate_info is None

def test_get_candidates(mock_ncsbe_instance, mock_election_data):
    candidates = mock_ncsbe_instance.get_candidates("US_PRESIDENT")
    assert candidates is not None

    expected_candidates = next((c.candidates for c in mock_election_data if c.contest_name == "US_PRESIDENT"), [])
    assert candidates == expected_candidates

    empty_candidates = mock_ncsbe_instance.get_candidates("NC_GOVERNOR")
    assert len(empty_candidates) == 0

def test_get_contests_by_candidate(mock_ncsbe_instance, mock_election_data):
    contests = mock_ncsbe_instance.get_contests_by_candidate("Alex")
    assert contests is not None

    expected_contests = [c for c in mock_election_data if any(candidate.candidate == "Alex" for candidate in c.candidates)]
    assert contests == expected_contests

    empty_contests = mock_ncsbe_instance.get_contests_by_candidate("Joseph")
    assert len(empty_contests) == 0
