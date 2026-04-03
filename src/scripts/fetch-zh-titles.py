import json, os, sys, time, urllib.request, urllib.error

BATCH_SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 50

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
skipped = 0
for i, m in enumerate(movies):
    if m.get('titleZh'):
        skipped += 1
        continue  # already has it
    
    if added >= BATCH_SIZE:
        break
    
    mid = m['id']
    url = f'https://api.themoviedb.org/3/movie/{mid}?api_key={TMDB_KEY}&language=zh-CN'
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read())
            zh_title = data.get('title', '')
            if zh_title and zh_title != m['title']:
                m['titleZh'] = zh_title
                added += 1
                if added <= 20:
                    print(f'  {m["title"]} -> {zh_title}')
    except KeyboardInterrupt:
        print(f'\nInterrupted at {added} added, saving...')
        break
    except Exception as e:
        errors += 1
        if errors <= 5:
            print(f'  Error {mid}: {e}')
    
    # Rate limit: ~2 per second
    if added % 2 == 0:
        time.sleep(1)
    
    if added > 0 and added % 10 == 0:
        print(f'  added={added}')
        # Save incrementally every 10
        json.dump(movies, open(base + 'top-movies.json', 'w'), indent=2, ensure_ascii=False)

print(f'Done: added={added}, errors={errors}, skipped={skipped}')

json.dump(movies, open(base + 'top-movies.json', 'w'), indent=2, ensure_ascii=False)
print('Saved!')
