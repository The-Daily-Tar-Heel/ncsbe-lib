from .collector import Collector
from .types import CandidateData, PrecinctData, CountyData, ContestData
from typing import Optional
from collections import defaultdict

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
        self._dataset = Optional[list[ContestData]]

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


    def _get_contest_data(self, contest: str) -> Optional[ContestData]:
        for c in self._dataset:
            if c.contest_name == contest:
                return c
        return None


    def get_dataset(self) -> Optional[list[ContestData]]:
        """Retrieves the entire election dataset."""
        return self._dataset


    def list_contests(self) -> list[str]:
        """Retrieves a list of all contests (races) available in the dataset."""
        contest_names = set(contest.contest_name for contest in self._dataset)
        return list(contest_names) if contest_names else []


    def list_counties(self, contest: str) -> list[str]:
        """Lists all counties where voting took place for a specific contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data: return []

        return list({ county for county in contest_data.counties })


    def list_precincts(self, contest: str, county: str) -> list[str]:
        """Lists all precincts in a given county for a specific contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data: return []

        for c in contest_data.counties:
            if c.county == county:
                return list({ precinct.precinct for precinct in c.precincts })
                
        return []

    def list_candidates(self, contest: str) -> list[str]:
        """Retrieves a list of candidates in a given contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data: return []

        return list({ candidate.candidate for candidate in contest_data.candidates })


    def get_contest(self, contest: str) -> Optional[ContestData]:
        """Retrieves contest data for a specific contest name."""
        return self._get_contest_data(contest)


    def get_candidate_info(self, contest: str, candidate_name: str) -> Optional[CandidateData]:
        """Retrieves detailed information about a specific candidate in a contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data: return None

        for candidate in contest_data.candidates:
            if candidate.candidate == candidate_name:
                return candidate

        return None


    def get_county_results(self, contest: str, county: str) -> Optional[CountyData]:
        """Retrieves results for all precincts in a county for a given contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data: return None

        for c in contest_data.counties:
            if c.county == county:
                return c
            
        return None


    def get_all_candidate_results(self, candidate_name: str) -> list[CandidateData]:
        """Retrieves all election results for a specific candidate across all contests."""
        dataset = self.get_dataset()
        if not dataset: return []

        res = []
        for contest in dataset:
            if any(candidate.candidate == candidate_name for candidate in contest.candidates):
                candidate_info = self.get_candidate_info(contest.contest_name, candidate_name)
                if candidate_info:
                    res.append(candidate_info)
            
        return res


    def get_candidate_vote_total(self, contest: str, candidate_name: str) -> int:
        """Retrieves the total vote count for a specific candidate in a contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data: return 0

        for candidate in contest_data.candidates:
            if candidate.candidate == candidate_name:
                return candidate.votes

        return 0


    def get_contest_vote_totals(self, contest: str) -> dict[str, int]:
        """Retrieves a dictionary mapping candidates to their total votes in a contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data: return {}
        
        res: dict[str, int] = {}
        for candidate in set(contest_data.candidates):
            res[candidate.candidate] = self.get_candidate_vote_total(contest, candidate.candidate)
        
        return res


    def get_total_votes_for_contest(self, contest: str) -> int:
        """Retrieves the total number of votes for a given contest."""
        vote_totals = self.get_contest_vote_totals(contest)
        return sum(vote_totals.values())


    def get_candidate_vote_percentage(self, contest: str, candidate_name: str) -> float:
        """Retrieve a candidate's percentage of total votes in a contest."""
        vote_totals = self.get_contest_vote_totals(contest)
        if candidate_name not in vote_totals: return 0

        total_votes = self.get_total_votes_for_contest(contest)

        return (vote_totals[candidate_name] / total_votes) * 100 if total_votes > 0 else 0


    def get_contest_winner(self, contest: str) -> Optional[CandidateData]:
        """Retrieves the data of the candidate who currently has the most votes in a given contest."""
        contest_data = self._get_contest_data(contest)
        if not contest_data or len(contest_data.candidates) == 0: return None

        vote_totals = self.get_contest_vote_totals(contest)
        if len(vote_totals.items()) == 0: return None

        winnerName = sorted(vote_totals.items(), key=lambda item: item[1], reverse=True)[0][0]

        return self.get_candidate_info(contest, winnerName) if winnerName else None


    def get_closest_race(self) -> Optional[ContestData]:
        """Finds the contest with the smallest margin between the top two candidates."""
        dataset = self.get_dataset()
        if not dataset: return None

        closest_contest: ContestData = None
        smallest_margin = float('inf')

        for contest in dataset:
            vote_totals = self.get_contest_vote_totals(contest.contest_name)
            sorted_totals = sorted(vote_totals.items(), key=lambda item: item[1], reverse=True)

            if len(sorted_totals) >= 2:
                margin = sorted_totals[0][1] - sorted_totals[1][1]
                if margin < smallest_margin:
                    smallest_margin = margin
                    closest_contest = contest

        return closest_contest


    def get_candidates(self, contest: str) -> list[CandidateData]:
        """Retrieves all candidates in a given contest."""
        contest_data = self.get_contest(contest)
        return contest_data if contest_data else []


    def get_counties(self, contest: str) -> list[CountyData]:
        """Retrieves all counties in a given contest."""
        contest_data = self.get_contest(contest)
        return contest_data.counties if contest_data else []


    def get_precincts(self, contest: str) -> list[PrecinctData]:
        """Retrieves all precincts in a given contest."""
        contest_data = self.get_contest(contest)
        if not contest_data: return []

        precincts = []
        for county in contest_data.counties:
            precincts.extend(county.precincts)

        return precincts


    def get_contests_by_candidate(self, candidate_name: str) -> list[ContestData]:
        """Retrieves all contests that a given candidate is a part of."""
        dataset = self.get_dataset()
        if not dataset: return []

        contest_data = []
        for contest in dataset:
            if any(candidate.candidate == candidate_name for candidate in contest.candidates):
                contest_data.append(contest)
        
        return contest_data


    def has_contest(self, contest: str) -> bool:
        """Checks whether a given contest exists in the dataset."""
        dataset = self.get_dataset()
        if not dataset: return False

        return any(c.contest_name == contest for c in dataset)


    def has_candidate(self, candidate_name: str) -> bool:
        """Checks whether a given candidate exists in the dataset."""
        dataset = self.get_dataset()
        if not dataset: return False

        for contest in dataset:
            if any(candidate.candidate == candidate_name for candidate in contest.candidates):
                return True
        
        return False