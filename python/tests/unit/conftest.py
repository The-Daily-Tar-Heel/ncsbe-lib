import pytest
from ncsbe_lib.ncsbe import NCSBE
from unittest.mock import patch
from ncsbe_lib.types import ContestData, CandidateData, CountyData, PrecinctData

@pytest.fixture(scope="session")
def mock_election_data():
    return (
        ContestData(
            contest_name = "US_PRESIDENT",
            counties = (
                CountyData(
                    county = "Orange",
                    precincts = (
                        PrecinctData(
                            precinct = "1",
                            candidates = (
                                CandidateData(
                                    candidate = "John",
                                    party = "DEM",
                                    votes = 100050
                                ),
                                CandidateData(
                                    candidate = "Mark",
                                    party = "REP",
                                    votes = 100000
                                ),
                                CandidateData(
                                    candidate = "Alex",
                                    party = "DEM",
                                    votes = 1000
                                ),
                            ),
                        ),
                    ),
                ),
            ),
            candidates = (
                CandidateData(
                    candidate = "John",
                    party = "DEM",
                    votes = 100050
                ),
                CandidateData(
                    candidate = "Mark",
                    party = "REP",
                    votes = 100000
                ),
                CandidateData(
                    candidate = "Alex",
                    party = "DEM",
                    votes = 1000
                ),
            ),
        ),
        ContestData(
            contest_name = "US_SENATE",
            counties = (
                CountyData(
                    county = "Wake",
                    precincts = (
                        PrecinctData(
                            precinct = "2",
                            candidates = (
                                CandidateData(
                                    candidate = "Alex",
                                    party = "DEM",
                                    votes = 15000
                                ),
                                CandidateData(
                                    candidate = "Felix",
                                    party = "REP",
                                    votes = 18000
                                ),
                            ),
                        ),
                    ),
                ),
            ),
            candidates = (
                CandidateData(
                    candidate = "Alex",
                    party = "DEM",
                    votes = 15000
                ),
                CandidateData(
                    candidate = "Felix",
                    party = "REP",
                    votes = 18000
                ),
            ),
        ),
    )

@pytest.fixture(scope="session")
def mock_ncsbe_instance(mock_election_data):
    with patch.object(NCSBE, "collect", return_value=mock_election_data):
        ncsbe = NCSBE('2024-11-05')
        ncsbe.initialize()
        return ncsbe
