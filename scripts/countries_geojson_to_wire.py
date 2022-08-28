import json

path = "./data/countries.geojson"

types = [
    "Country",
    "Dependency",
    "Disputed",
    "Geo core",
    "Geo subunit",
    "Geo unit",
    "Indeterminate",
    "Lease",
    "Overlay",
    "Sovereign country",
    "Sovereignty",
]

country_properties = {
    'NAME_EN': 'name',
    'CONTINENT': 'continent',
    'MAPCOLOR13': 'colorIdx',
    'TYPE': 'type',
}

with open(path, 'r') as fh:
    data = json.load(fh)


name = data['name']
features = data['features']
rows = []
prop_type = country_properties

for feature in features:
    geom = feature['geometry']
    coords = [poly[0] for poly in geom['coordinates']]
    props = feature['properties']
    properties = [
        props[p] if p != 'TYPE' else types.index(props[p])
        for p in prop_type
    ]

    rows.append(properties + [coords])

res = {
    "name": name,
    "columns": list(prop_type.values()) + ['coordinates'],
    "rows": rows,
}

with open(f'src/data/{name}.json', 'w') as fh:
    json.dump(res, fh)
