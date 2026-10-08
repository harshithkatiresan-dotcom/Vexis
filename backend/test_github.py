import httpx

USER = "harshithkatiresan-dotcom"

r = httpx.get(
    "https://api.github.com/users/" + USER + "/repos",
    params={"per_page": 100},
    headers={"User-Agent": "vexis"},
    timeout=8,
)
print("status:", r.status_code)
data = r.json()
if r.status_code != 200:
    print(data)
else:
    print("repos:", len(data), "| non-fork:", len([x for x in data if not x.get("fork")]))
    for x in data[:10]:
        print("-", x["name"], "| lang:", x.get("language"), "| desc:", x.get("description"),
              "| topics:", x.get("topics"), "| FORK" if x.get("fork") else "")