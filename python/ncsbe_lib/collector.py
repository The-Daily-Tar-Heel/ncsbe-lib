import requests
import zipfile
import csv
import re
import logging
from io import BytesIO, StringIO
from .types import CandidateData, ContestData, CountyData, ParsedRow, PrecinctData

class Collector:
    """
    The `Collector` class is responsible for fetching, parsing, and formatting election data
    from the North Carolina State Board of Elections (NCSBE).
    
    This class:
    - Downloads election data from a provided URL (ZIP file).
    - Extracts the TSV (tab-separated values) file inside the ZIP.
    - Parses the TSV file into structured election data.
    - Formats the parsed data into a hierarchical structure for easy analysis.

    Example usage:
    ```python
    collector = Collector("https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/2024_11_05/results_pct_20241105.zip") # 2024 election
    results = collector.collect()
    print(results)
    ```
    """
    
    def __init__(self, url: str):
        self._url = url

    def _normalize_contest_name(self, contest_name: str) -> str:
        return re.sub(r'[^a-zA-Z0-9]+', '_', contest_name.strip())
    
    
    def collect(self) -> list[ContestData]:
        """
        Collects and processes election data from the provided ZIP file URL.
        return a structured representation of the election results.
        """
        try:
            zip_buffer = self._fetchData(self._url)
            tsv_data = self._extract_tsv_files(zip_buffer)
            parsed_data = self._parse_tsv_data(tsv_data)
            return self._format(parsed_data)
        except Exception as e:
            logging.error(f"Error: {e}")


    def _fetchData(self, url: str) -> BytesIO:
        """Fetches a ZIP file from the provided URL, returning its raw binary data as bytes."""
        try:
            print(url)
            response = requests.get(url, timeout=20)
            response.raise_for_status()

            content_type = response.headers.get("Content-Type", "")
            if content_type != "application/x-zip-compressed":
                logging.warning(f"Unexpected content type: {content_type}")
                return None

            logging.info("Data fetched successfully.")
            return BytesIO(response.content)
        
        except requests.exceptions.Timeout:
            logging.error(f"Request timed out while fetching {url}")
        except requests.exceptions.RequestException as e:
            logging.error(f"Request failed: {e}")

        return None
    

    def _extract_tsv_files(self, zip_buffer: BytesIO) -> str:
        """Extracts TSV files from the provided ZIP data and returns the extracted content as a string."""
        with zipfile.ZipFile(zip_buffer, 'r') as zf:
            tsv_files = [f for f in zf.namelist() if f.endswith('.txt')]

            if not tsv_files:
                raise ValueError(f'No TSV files found in ZIP.')

            return "\n".join(zf.open(f).read().decode('utf-8') for f in tsv_files)
        

    def _transform_row(self, row: dict[str, str]) -> ParsedRow:
        """Transforms a row of the TSV file into a structured dictionary."""
        return ParsedRow(
            county = row['County'],
            election_date = row['Election Date'],
            precinct = row['Precinct'],
            contest_group_id = int(row['Contest Group ID']),
            contest_type = row['Contest Type'],
            contest_name = self._normalize_contest_name(row['Contest Name']),
            choice = row['Choice'],
            choice_party = row['Choice Party'],
            vote_for = int(row['Vote For']),
            election_day = int(row['Election Day']),
            early_voting = int(row['Early Voting']),
            absentee_by_mail = int(row['Absentee by Mail']),
            provisional = int(row['Provisional']),
            total_votes = int(row['Total Votes']),
            real_precinct = row['Real Precinct'] == 'Y'
        )
    

    def _parse_tsv_data(self, tsv_data: str) -> list[ParsedRow]:
        """Parses TSV data into a list of structured election result dictionaries."""
        rows: list[ParsedRow] = []
        reader = csv.DictReader(StringIO(tsv_data), delimiter='\t')

        for row in reader:
            parsed_row = self._transform_row(row)
            rows.append(parsed_row)

        return rows
    

    def _format(self, parsed_data: list[ParsedRow]) -> list[ContestData]:
        """Formats parsed election data into a structured hierarchy."""
        data: dict[str, dict] = {}

        for row in parsed_data:
            contest_name = row.contest_name
            county = row.county
            precinct = row.precinct
            choice = row.choice
            choice_party = row.choice_party
            total_votes = row.total_votes

            if contest_name not in data:
                data[contest_name] = {
                    'counties': {},
                    'candidates': {}
                }

            if county not in data[contest_name]['counties']:
                data[contest_name]['counties'][county] = {}
            
            if precinct not in data[contest_name]['counties'][county]:
                data[contest_name]['counties'][county][precinct] = []

            data[contest_name]['counties'][county][precinct].append({
                'candidate': choice,
                'party': choice_party,
                'votes': total_votes
            })

            if choice not in data[contest_name]['candidates']:
                data[contest_name]['candidates'][choice] = {
                    'candidate': choice,
                    'party': choice_party,
                    'votes': 0
                }
            data[contest_name]['candidates'][choice]['votes'] += total_votes

        contest_list_data: list[ContestData] = []
        for contest_name, contest in data.items():
            counties_list: list[CountyData] = []
            for county_name, precincts in contest['counties'].items():
                precinct_data_list: list[PrecinctData] = []
                for precinct_name, candidates in precincts.items():
                    precinct_candidates: list[CandidateData] = [
                        CandidateData(
                            candidate = cand['candidate'],
                            party = cand['party'],
                            votes = cand['votes']
                        )
                        for cand in candidates
                    ]

                    precinct_data_list.append(
                        PrecinctData(
                            precinct=precinct_name,
                            candidates = precinct_candidates
                        )
                    )
                
                counties_list.append(
                    CountyData(
                        county = county_name,
                        precincts = precinct_data_list
                    )
                )

            candidates_list: list[CandidateData] = [
                CandidateData(
                    candidate=cand['candidate'],
                    party=cand['party'],
                    votes=cand['votes']
                )
                for cand in contest['candidates'].values()
            ]
            
            contest_list_data.append(
                ContestData(
                    contest_name = contest_name,
                    counties = counties_list,
                    candidates = candidates_list
                )
            )

        return contest_list_data