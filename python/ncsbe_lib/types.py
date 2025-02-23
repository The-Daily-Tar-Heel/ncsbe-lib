from dataclasses import dataclass

# Frozen makes each dataclass immutable, ensuring it has the ability to be a dict key or set member. 
@dataclass(frozen=True)
class CandidateData:
    """
    Represents a candidate and their vote count.
    """
    # Candidate's name.
    candidate: str

    # Candidate's political party.
    party: str

    # Number of votes received.
    votes: int

@dataclass(frozen=True)
class PrecinctData:
    """
    Represents a precinct and the candidates who received votes there. Holds CandidateData.
    """
    # Precinct identifier.
    precinct: str

    # List of candidates who received votes in this precinct.
    candidates: list[CandidateData]

@dataclass(frozen=True)
class CountyData:
    """
    Represents a county and its election results by precinct. Holds PrecinctData -> CandidateData.
    """
    # County name (e.g., "Orange", "Wake").
    county: str

    # List of precincts within the county.
    precincts: list[PrecinctData]

@dataclass(frozen=True)
class ContestData:
    """
    Represents an election contest (race) and its results across counties. Top of the hierarchy that holds CountyData -> PrecinctData -> CandidateData.
    """
    # The name of the contest (e.g., "US Senate").
    contest_name: str

    # List of counties where voting took place for this contest.
    counties: list[CountyData]

    # List of candidates that have received votes for the contest.
    candidates: list[CandidateData]

@dataclass(frozen=True)
class ParsedRow:
    """
    Represents a single row of parsed election data from the TSV file.
    """
    # County name (e.g., "Wake", "Mecklenburg").
    county: str

    # Election date in YYYY-MM-DD format.
    election_date: str

    # Precinct identifier within the county.
    precinct: str

    # Unique ID for the contest group (race).
    contest_group_id: int

    # Type of contest (e.g., "F", "S", "C", "L", "M").
    contest_type: str

    # Name of the contest (e.g., "US Senate").
    contest_name: str

    # Name of the candidate.
    choice: str

    # Political party of the candidate (e.g., "DEM", "REP").
    choice_party: str

    # Number of votes the candidate could receive (e.g., 1 for single-choice races).
    vote_for: int

    # Votes cast on election day.
    election_day: int

    # Votes cast during early voting.
    early_voting: int

    # Votes cast via absentee by mail.
    absentee_by_mail: int

    # Votes cast provisionally (pending verification).
    provisional: int

    # Total votes received by the candidate in this precinct.
    total_votes: int

    # Whether the precinct is real (True) or aggregated (False).
    real_precinct: bool
