import json

path = "./data/cities.geojson"

city_properties = {
    'NAME': 'name',
    'ADM0CAP': 'capital',
    'ADM0NAME': 'country',
    'ADM1NAME': 'region',
}

geometry = {
    'Point': lambda point: point,
}


with open(path, 'r') as fh:
    data = json.load(fh)


name = data['name']
features = data['features']
rows = []
geom_type = None
prop_type = city_properties

for feature in features:
    geom = feature['geometry']
    if geom_type is None:
        geom_type = geom['type']
    coords = geometry[geom_type](geom['coordinates'])
    props = feature['properties']
    properties = [props[p] for p in prop_type]

    rows.append(properties + coords)

res = {
    "name": name,
    "type": geom_type,
    "columns": list(prop_type.values()) + ['coordinates'],
    "rows": rows,
}

with open(f'src/data/{name}.json', 'w') as fh:
    json.dump(res, fh, indent=2)
