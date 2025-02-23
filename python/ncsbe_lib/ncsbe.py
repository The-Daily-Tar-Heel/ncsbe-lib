from .collector import Collector
from .types import CandidateData, PrecinctData, CountyData, ContestData
from typing import Optional

class NCSBE:
    """
    The `NCSBE` class provides an interface for fetching and querying election data
    from the North Carolina State Board of Elections (NCSBE). It uses the `Collector`
    class to retrieve, parse, and format election data.

    This class allows users to:
    - Retrieve election data for a specific date.
    - List available contests (races).
    - List counties where voting occurred for a given contest.
    - List precincts within a county for a specific contest.

    Example usage:
    ```python
    election_data = NCSBE("2024-11-05")
    election_data.initialize()
    contests = election_data.list_contests()
    ```
    """

    def __init__(self, election_date: str):
        """
        Creates a new instance of `NCSBE` for a given election date.
        param election_date: The date of the election in YYYY-MM-DD format.
        """
        self._election_date = election_date
        self._url = self._make_base_url(election_date)
        self._dataset = Optional[list]

    @staticmethod
    def _make_base_url(date: str) -> str:
        return f'https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/{date.replace('-', '_')}/results_pct_{date.replace('-', '')}.zip'
    

    def collect(self) -> list:
        """Collects and processes election data from the provided URL."""
        collector = Collector(self._url)
        return collector.collect()


    def initialize(self) -> None:
        """Initializes the election dataset by fetching and storing the results in memory."""
        self._dataset = self.collect()


    def refresh(self) -> None:
        """Refreshes the election dataset by re-fetching and replacing `data_set`."""
        self._dataset = self.collect()


    def get_dataset(self) -> Optional[list]:
        """Retrieves the entire election dataset."""
        return self._dataset


    def list_contests(self) -> list[str]:
        """Retrieves a list of all contests (races) available in the dataset."""
        contest_names = set(contest.contest_name for contest in self._dataset)
        return list(contest_names) if contest_names else []


    def list_counties(self, contest: str) -> list[str]:
        """Lists all counties where voting took place for a specific contest."""
        pass


    def list_precincts(self, contest: str, county: str) -> list[str]:
        """Lists all precincts in a given county for a specific contest."""
        pass


    def list_candidates(self, contest: str) -> list[str]:
        """Retrieves a list of candidates in a given contest."""
        pass


    def get_contest(self, contest: str):
        """Retrieves contest data for a specific contest name."""
        pass


    def get_candidate_info(self, contest: str, candidate_name: str):
        """Retrieves detailed information about a specific candidate in a contest."""
        pass


    def get_county_results(self, contest: str, county: str):
        """Retrieves results for all precincts in a county for a given contest."""
        pass


    def get_all_candidate_results(self, candidate_name: str):
        """Retrieves all election results for a specific candidate across all contests."""
        pass


    def get_candidate_vote_total(self, contest: str, candidate_name: str) -> int:
        """Retrieves the total vote count for a specific candidate in a contest."""
        pass


    def get_contest_vote_totals(self, contest: str) -> dict:
        """Retrieves a dictionary mapping candidates to their total votes in a contest."""
        pass
    

    def get_total_votes_for_contest(self, contest: str) -> int:
        """Retrieves the total number of votes for a given contest."""
        pass


    def get_candidate_vote_percentage(self, contest: str, candidate_name: str) -> float:
        """Retrieve a candidate's percentage of total votes in a contest."""
        pass


    def get_contest_winner(self, contest: str):
        """Retrieves the data of the candidate who currently has the most votes in a given contest."""
        pass


    def get_closest_race(self):
        """Finds the contest with the smallest margin between the top two candidates."""
        pass


    def get_candidates(self, contest: str):
        """Retrieves all candidates in a given contest."""
        pass


    def get_counties(self, contest: str):
        """Retrieves all counties in a given contest."""
        pass


    def get_precincts(self, contest: str):
        """Retrieves all precincts in a given contest."""
        pass


    def get_contests_by_candidate(self, candidate_name: str):
        """Retrieves all contests that a given candidate is a part of."""
        pass


    def has_contest(self, contest: str) -> bool:
        """Checks whether a given contest exists in the dataset."""
        pass


    def has_candidate(self, candidate_name: str) -> bool:
        """Checks whether a given candidate exists in the dataset."""
        pass