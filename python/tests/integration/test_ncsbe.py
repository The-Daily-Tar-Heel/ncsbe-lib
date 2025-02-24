from ncsbe_lib.ncsbe import NCSBE
from pprint import pprint

ncsbe = NCSBE('2024-11-05')
ncsbe.initialize()

pprint(ncsbe.has_candidate('Kamala D. Harris'))