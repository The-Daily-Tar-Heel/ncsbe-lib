from ncsbe_lib.ncsbe import NCSBE

ncsbe = NCSBE('2024-11-05')
ncsbe.initialize()
# print(ncsbe.list_contests())

print(ncsbe.get_candidate_info('US_PRESIDENT', 'Kamala D. Harris'))
print(ncsbe.get_all_candidate_results('Kamala D. Harris'))
# print(ncsbe._get_contest_data('US_PRESIDENT'))