def test_get_dataset(mock_ncsbe_instance, mock_election_data):
    dataset = mock_ncsbe_instance.get_dataset()
    assert dataset is not None
    assert dataset == mock_election_data

def test_list_contests(mock_ncsbe_instance):
    contests = mock_ncsbe_instance.list_contests()
    assert contests is not None
    assert "US_SENATE" in contests
    assert "US_PRESIDENT" in contests

def test_list_candidates(mock_ncsbe_instance):
    candidates = mock_ncsbe_instance.list_candidates("US_SENATE")
    assert candidates is not None
    assert "Alex" in candidates
    assert "Felix" in candidates

def test_has_contest(mock_ncsbe_instance):
    assert mock_ncsbe_instance.has_contest("US_PRESIDENT") is True
    assert mock_ncsbe_instance.has_contest("NC_GOVERNOR") is False

def test_has_candidate(mock_ncsbe_instance):
    assert mock_ncsbe_instance.has_candidate("Felix") is True
    assert mock_ncsbe_instance.has_candidate("Joseph") is False
