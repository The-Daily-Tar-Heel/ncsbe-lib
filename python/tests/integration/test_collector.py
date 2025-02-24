from ncsbe_lib.collector import Collector

collector = Collector('https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/2024_11_05/results_pct_20241105.zip')

election_data = collector.collect()

for contest in election_data:
    print(f"Contest: {contest.contest_name}")
    for county in contest.counties:
        print(f"  County: {county.county}")
        for precinct in county.precincts:
            print(f"    Precinct: {precinct.precinct}")
            for candidate in precinct.candidates:
                print(f"      {candidate.candidate} ({candidate.party}): {candidate.votes} votes")
