import json,time,urllib.request
env={}
for l in open(".env.local"):
    if "=" in l:
        k,v=l.strip().split("=",1)
        env[k]=v
DK=env.get("DOUBANINFO_API_KEY","")
movies=json.load(open("src/data/top-movies.json"))
missing=[m for m in movies if m.get("imdbId") and m.get("douban") is None]
print("Total:",len(movies),"Missing:",len(missing))
filled=failed=0
for i,m in enumerate(missing):
    iid=m["imdbId"]
    try:
        url="https://doubaninfo.com/api/v1_douban.php?url="+iid+"&key="+DK
        req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req,timeout=8) as resp:
            data=json.loads(resp.read())
            raw=data.get("rating")
            score=None
            if data.get("douban_score"): score=float(data["douban_score"])
            elif isinstance(raw,(int,float)): score=float(raw)
            elif isinstance(raw,dict) and raw.get("average"): score=float(raw["average"])
            if score and score>0:
                m["douban"]=round(score*10);m["doubanOriginal"]=score;filled+=1
                print("["+str(i+1)+"/"+str(len(missing))+"] "+m["title"]+"... "+str(score))
            else: failed+=1;print("["+str(i+1)+"] x")
    except: failed+=1;print("["+str(i+1)+"] err")
    if (i+1)%50==0: json.dump(movies,open("src/data/top-movies.json","w"),indent=2);print("SAVED")
    time.sleep(0.5)
json.dump(movies,open("src/data/top-movies.json","w"),indent=2)
all3=sum(1 for m in movies if m.get("imdb") and m.get("rottenTomatoes") and m.get("douban"))
print("Done filled:",filled,"failed:",failed,"all3:",all3)
