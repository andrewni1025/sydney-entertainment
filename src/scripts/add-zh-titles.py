import csv, json

# Build Chinese title lookup from Douban CSVs
titles = {}
base = '/Users/andrewni/SydneyEntertainment/sydney-entertainment/src/data/'
for fn in ['douban_all_movies.csv', 'douban_top250_movies.csv', 'douban_high_rating.csv',
           'douban_western_movies.csv', 'douban_japanese_movies.csv', 'douban_hongkong_movies.csv',
           'douban_chinese_movies.csv']:
    try:
        with open(base + fn, 'r') as f:
            for row in csv.DictReader(f):
                t = row.get('title', '').strip()
                cn = row.get('chinese_title', '').strip()
                if t and cn and t != cn:
                    titles[t.lower()] = cn
    except Exception as e:
        print(f'Skipped {fn}: {e}')

print(f'Chinese title mappings found: {len(titles)}')

# Load movies and add titleZh
movies = json.load(open(base + 'top-movies.json'))
matched = 0
for m in movies:
    t = m['title'].lower()
    cn = titles.get(t)
    if cn:
        m['titleZh'] = cn
        matched += 1

print(f'Matched: {matched}/{len(movies)}')

# Show some examples
for m in movies[:50]:
    if 'titleZh' in m:
        print(f'  {m["title"]} -> {m["titleZh"]}')

# Save
json.dump(movies, open(base + 'top-movies.json', 'w'), indent=2, ensure_ascii=False)
print('Saved!')
