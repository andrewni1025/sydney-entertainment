import json,time,urllib.request
env={}
for l in open(".env.local"):
  if "=" in l:
    k,v=l.strip().split("=",1);env[k]=v
DK=env.get("DOUBANINFO_API_KEY","")
movies=json.load(open("src/data/top-movies.json"))
missing=[m for m in movies if m.get("imdbId") and m.get("douban") is None]
print(f"Total:{len(movies)} Have:{sum(1 for m in movies if m.get(chr(100)+chr(111)+chr(117)+chr(98)+chr(97)+chr(110)))} Missing:{len(missing)}")
filled=failed=0
for i,m in enumerate(missing):
  iid=m["imdbId"]
  try:
    url=f"https://doubaninfo.com/api/v1_douban.php?url={iid}&key={DK}"
    with urllib.request.urlopen(url,timeout=8) as resp:
      data=json.loads(resp.read())
      raw=data.get("rating")
      score=None
      if data.get("douban_score"):score=float(data["douban_score"])
      elif isinstance(raw,(int,float)):score=float(raw)
      elif isinstance(raw,dict) and raw.get("average"):score=float(raw["average"])
      if score and score>0:
        m["douban"]=round(score*10);m["doubanOriginal"]=score;filled+=1
        print(f"[{i+1}/{len(missing)}] {m[chr(116)+chr(105)+chr(116)+chr(108)+chr(101)]}... {score}")
      else:failed+=1;print(f"[{i+1}/{len(missing)}] {m[chr(116)+chr(105)+chr(116)+chr(108)+chr(101)]}... x")
  except Exception as e:failed+=1;print(f"[{i+1}/{len(missing)}] {m[chr(116)+chr(105)+chr(116)+chr(108)+chr(101)]}... err")
  if (i+1)%50==0:json.dump(movies,open("src/data/top-movies.json","w"),indent=2);print("Saved")
  time.sleep(0.4)
json.dump(movies,open("src/data/top-movies.json","w"),indent=2)
all3=sum(1 for m in movies if m.get("imdb") and m.get("rottenTomatoes") and m.get("douban"))
print(f"Done filled:{filled} failed:{failed} all3:{all3}")
