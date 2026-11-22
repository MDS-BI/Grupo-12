from pathlib import Path
import re
from collections import Counter

base = Path('specs/001-crm-module')
spec = (base/'spec.md').read_text(encoding='utf-8')
tasks = (base/'tasks.md').read_text(encoding='utf-8')
frs = sorted(set(re.findall(r'\bFR-\d{3}\b', spec)))
scs = sorted(set(re.findall(r'\bSC-\d{3}\b', spec)))
missing_fr = [f for f in frs if f not in tasks]
missing_sc = [s for s in scs if s not in tasks]
print('FR', len(frs), 'SC', len(scs))
print('missing_fr', missing_fr)
print('missing_sc', missing_sc)
for n in ['spec.md','plan.md','tasks.md']:
    t = (base/n).read_text(encoding='utf-8')
    print(n, re.findall(r'\bTODO\b|\bTKTK\b|\?\?\?|<placeholder>|\[NEEDS CLARIFICATION\]', t, re.I))
defs = re.findall(r'^- \[[ x]\] (T\d{3})\b', tasks, re.M)
dups = [k for k,v in Counter(defs).items() if v>1]
print('dups', dups, 'total', len(defs))
