import json, unicodedata, re

colors = [0x67001F, 0xB2182B, 0xD6604D, 0xF4A582, 0xFDDBC7, 0xF7F7F7, 0xD1E5F0, 0x92C5DE, 0x4393C3, 0x2166AC, 0x053061]

cities = [
['paris',12089098,11354897,0.7],
['lyon',2118132,1947120,0.9],
['marseille',1715096,1599717,0.8],
['toulouse',1202889,1021530,1.8],
['lille',1150530,1131194,0.2],
['bordeaux',1105257,1000666,1.1],
['nice',1005230,936774,0.8],
['nantes',854807,777121,1.1],
['strasbourg',757609,715720,0.6],
['grenoble',664832,631416,0.6],
['rennes',654478,577405,1.4],
['rouen',649291,633924,0.3],
['toulon',607050,566519,0.8],
['douai',544143,551547,-0.2],
['montpellier',536592,474999,1.4],
['avignon',507626,464994,1],
['saint-etienne',506655,501919,0.1],
['tours',473226,443847,0.7],
['clermont-ferrand',459250,435176,0.6],
['nancy',434202,425682,0.2],
['orleans',415471,395417,0.6],
['caen',396959,378086,0.5],
['angers',392940,372529,0.6],
['metz',389603,379840,0.3],
['dijon',371798,358181,0.4],
['valenciennes',366781,366445,0],
['bethune',365513,359970,0.2],
['le mans',338404,321203,0.6],
['reims',313818,310715,0.1],
['brest',311735,304838,0.2],
]


def remove_diacritic(input):
    return unicodedata.normalize('NFKD', input).encode('ASCII', 'ignore')

def migration():
    ans = []
    summarized_ans = {}
    links_per_dep = {}

    with open('data/gov/BTT_FM_MRE_2008/BTT_FM_MRE_2008.txt', 'r') as f:
        f.next()
        for l in f:
            [from_code, from_label, to_code, to_label, n] = l.split(';')
            from_label = remove_diacritic(unicode(from_label.strip('" '), 'ISO-8859-1')).lower()
            to_label = remove_diacritic(unicode(to_label.strip('" '), 'ISO-8859-1')).lower()
            n = long(n.replace(',', ''))

            ans.append([from_code, from_label, to_code, to_label, n])

            #deps
            dep_from_code = from_code[:2]
            dep_to_code = to_code[:2]
            if dep_from_code != dep_to_code:
                #out links
                dep = summarized_ans.get(dep_from_code, [0, 0])
                dep[0] += n
                summarized_ans[dep_from_code] = dep
                #in links
                dep = summarized_ans.get(dep_to_code, [0, 0])
                dep[1] += n
                summarized_ans[dep_to_code] = dep

                #create links by department code
                #out links
                dep = links_per_dep.get(dep_from_code, {})
                link_to = dep.get(dep_to_code, 0)
                link_to += n
                dep[dep_to_code] = link_to
                links_per_dep[dep_from_code] = dep
                #in links
                dep = links_per_dep.get(dep_to_code, {})
                link_to = dep.get(dep_from_code, 0)
                link_to -= n
                dep[dep_from_code] = link_to
                links_per_dep[dep_to_code] = dep


            #communes
            #out
            commune = summarized_ans.get(from_code, [0, 0])
            commune[0] += n
            summarized_ans[from_code] = commune
            #in
            commune = summarized_ans.get(to_code, [0, 0])
            commune[1] += n
            summarized_ans[to_code] = commune

    with open('data/json/links.json', 'w') as f:
        f.write(json.dumps(ans))

    with open('data/json/flux.json', 'w') as f:
        f.write(json.dumps(summarized_ans))

    with open('data/json/dep-links.json', 'w') as f:
        f.write(json.dumps(links_per_dep))


def group_population():
    group = {}
    with open('data/gov/BTT_TD_POP1A_2009/BTT_TD_POP1A_2009.txt', 'r') as f:
        f.next()
        for l in f:
            [NIVEAU, CODGEO, REG, DEP, EPCI, C_AGEPYR10, C_SEXE, NB] = l.split(';')
            #if NIVEAU != 'COM': continue
            #key = ';'.join([CODGEO, REG, DEP, EPCI]
            key = CODGEO
            acum = group.get(key, 0)
            NB = long(NB.replace(',', ''))
            acum += NB
            group[key] = acum

    with open('data/json/population.json', 'w') as f:
        f.write(json.dumps(group))

def cities_france():
    num_regex = re.compile('^\s*[0-9]+\s*')
    city_names = [city[0].lower() for city in cities]
    cities_latlon = {}
    with open('data/GeoLiteCity-Location.csv') as f:
        for l in f:
            [loc_id, country, region, city, postal, latitude, longitude, metro, area] = l.split(',')
            if country.strip('" ') == 'FR':# and num_regex.match(region.strip('" ')):
                city = remove_diacritic(unicode(city.strip('" '), 'ISO-8859-1')).lower()
                if city in city_names:
                    index = city_names.index(city)
                    proper_name = cities[index][0]
                    coords = cities_latlon.get(proper_name, [])
                    coords.append([latitude, longitude, cities[index][1]])
                    cities_latlon[city] = coords

    with open('data/json/villes.json', 'w') as f:
        f.write(json.dumps(cities_latlon, indent=2))

if __name__ == '__main__':
    #group_population()
    migration()
    #cities_france()
