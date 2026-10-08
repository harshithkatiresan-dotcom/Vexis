import json, re
p = "data/question_bank.json"
s = open(p, encoding="utf-8-sig").read()

out, in_str, esc = [], False, False
for ch in s:
    if in_str:
        if esc:
            out.append(ch); esc = False
        elif ch == "\\":
            out.append(ch); esc = True
        elif ch == '"':
            out.append(ch); in_str = False
        elif ord(ch) < 32:
            out.append(" ")          # control char inside a string -> space
        else:
            out.append(ch)
    else:
        if ch == '"':
            in_str = True
        out.append(ch)

fixed = re.sub(r" {2,}", " ", "".join(out)) if False else "".join(out)
d = json.loads(fixed)
open(p, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False))
print("fixed | skills:", len(d), "| questions:", sum(len(v) for v in d.values()))
