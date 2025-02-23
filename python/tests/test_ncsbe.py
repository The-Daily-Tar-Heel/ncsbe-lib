from ncsbe_lib.ncsbe import NCSBE

ncsbe = NCSBE('2024-11-05')
ncsbe.initialize()
print(ncsbe.list_contests())