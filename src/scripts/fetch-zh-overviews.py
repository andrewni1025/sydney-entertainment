import json, os, sys, time, urllib.request

BATCH_SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 100

TMDB_KEY = ''
env_path = '/Users/andrewni/SydneyEntertainment/sydney-entertainment/.env.local'
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.startswith('TMDB_API_KEY='):
                TMDB_KEY = line.split('=', 1)[1].strip().strip('"').strip("'")

if not TMDB_KEY:
    print('ERROR: No TMDB_API_KEY found')
    exit(1)

base = '/Users/andrewni/SydneyEntertainment/sydney-entertainment/src/data/'
movies = json.load(open(base + 'top-movies.json'))

added = 0
errors = 0
for m in movies:
    if m.get('overviewZh'):
        continue
    if added >= BATCH_SIZE:
        break

    url = f'https://api.themoviedb.org/3/movie/{m["id"]}?api_key={TMDB_KEY}&language=zh-CN'
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read())
            zh_overview = data.get('overview', '')
            if zh_overview and zh_overview != m.get('overview', ''):
                m['overviewZh'] = zh_overview
                added += 1
    except KeyboardInterrupt:
        print(f'Interrupted at {added}, saving...')
        break
    except:
        errors += 1

    if added % 2 == 0:
        time.sleep(1)
    if added > 0 and added % 10 == 0:
        print(f'  added={added}')
        json.dump(movies, open(base + 'top-movies.json', 'w'), indent=2, ensure_ascii=False)

json.dump(movies, open(base + 'top-movies.json', 'w'), indent=2, ensure_ascii=False)
print(f'Done: added={added}, errors={errors}')
