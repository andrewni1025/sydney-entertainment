import json, os, time, urllib.request, urllib.error

TMDB_KEY = os.environ.get('TMDB_API_KEY', '')
if not TMDB_KEY:
    # Try .env.local
    env_path = '/Users/andrewni/SydneyEntertainment/sydney-entertainment/.env.local'
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith('TMDB_API_KEY='):
                    TMDB_KEY = line.split('=', 1)[1].strip().strip('"').strip("'")

if not TMDB_KEY:
    print('ERROR: No TMDB_API_KEY found')
    exit(1)

print(f'TMDB key: {TMDB_KEY[:8]}...')

base = '/Users/andrewni/SydneyEntertainment/sydney-entertainment/src/data/'
movies = json.load(open(base + 'top-movies.json'))

# Fetch Chinese titles from TMDB
added = 0
errors = 0
for i, m in enumerate(movies):
    if m.get('titleZh'):
        continue  # already has it
    
    mid = m['id']
    url = f'https://api.themoviedb.org/3/movie/{mid}?api_key={TMDB_KEY}&language=zh-CN'
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            zh_title = data.get('title', '')
            if zh_title and zh_title != m['title']:
                m['titleZh'] = zh_title
                added += 1
                if added <= 20:
                    print(f'  {m["title"]} -> {zh_title}')
    except Exception as e:
        errors += 1
        if errors <= 5:
            print(f'  Error {mid}: {e}')
    
    # Rate limit: ~3 per second
    if (i + 1) % 3 == 0:
        time.sleep(1)
    
    if (i + 1) % 50 == 0:
        print(f'  Progress: {i+1}/{len(movies)}, added={added}')
        # Save incrementally
        json.dump(movies, open(base + 'top-movies.json', 'w'), indent=2, ensure_ascii=False)

print(f'Done: added={added}, errors={errors}')

json.dump(movies, open(base + 'top-movies.json', 'w'), indent=2, ensure_ascii=False)
print('Saved!')
