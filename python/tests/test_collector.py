from ncsbe_lib.collector import Collector

collector = Collector('https://s3.amazonaws.com/dl.ncsbe.gov/ENRS/2024_11_05/results_pct_20241105.zip')

print(collector._url)
print(collector._normalize_contest_name("US PRESIDENT"))

data = collector._fetchData(collector._url)
print(collector._extract_tsv_files(data))