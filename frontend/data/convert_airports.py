import csv

airports = []
seen_codes = set()

country_names = {
    'AD': 'Andorre', 'AE': 'Emirats', 'AF': 'Afghanistan', 'AG': 'Antigua', 'AI': 'Anguilla',
    'AL': 'Albanie', 'AM': 'Armenie', 'AO': 'Angola', 'AR': 'Argentine', 'AS': 'Samoa US',
    'AT': 'Autriche', 'AU': 'Australie', 'AW': 'Aruba', 'AZ': 'Azerbaidjan', 'BA': 'Bosnie',
    'BB': 'Barbade', 'BD': 'Bangladesh', 'BE': 'Belgique', 'BF': 'Burkina Faso', 'BG': 'Bulgarie',
    'BH': 'Bahrein', 'BI': 'Burundi', 'BJ': 'Benin', 'BM': 'Bermudes', 'BN': 'Brunei',
    'BO': 'Bolivie', 'BR': 'Bresil', 'BS': 'Bahamas', 'BT': 'Bhoutan', 'BW': 'Botswana',
    'BY': 'Bielorussie', 'BZ': 'Belize', 'CA': 'Canada', 'CD': 'RD Congo', 'CF': 'Centrafrique',
    'CG': 'Congo', 'CH': 'Suisse', 'CI': 'Cote d Ivoire', 'CK': 'Iles Cook', 'CL': 'Chili',
    'CM': 'Cameroun', 'CN': 'Chine', 'CO': 'Colombie', 'CR': 'Costa Rica', 'CU': 'Cuba',
    'CV': 'Cap-Vert', 'CW': 'Curacao', 'CY': 'Chypre', 'CZ': 'Tchequie', 'DE': 'Allemagne',
    'DJ': 'Djibouti', 'DK': 'Danemark', 'DM': 'Dominique', 'DO': 'Rep. Dominicaine', 'DZ': 'Algerie',
    'EC': 'Equateur', 'EE': 'Estonie', 'EG': 'Egypte', 'ER': 'Erythree', 'ES': 'Espagne',
    'ET': 'Ethiopie', 'FI': 'Finlande', 'FJ': 'Fidji', 'FK': 'Falklands', 'FM': 'Micronesie',
    'FO': 'Feroe', 'FR': 'France', 'GA': 'Gabon', 'GB': 'Royaume-Uni', 'GD': 'Grenade',
    'GE': 'Georgie', 'GF': 'Guyane FR', 'GH': 'Ghana', 'GI': 'Gibraltar', 'GL': 'Groenland',
    'GM': 'Gambie', 'GN': 'Guinee', 'GP': 'Guadeloupe', 'GQ': 'Guinee Equat.', 'GR': 'Grece',
    'GT': 'Guatemala', 'GU': 'Guam', 'GW': 'Guinee-Bissau', 'GY': 'Guyana', 'HK': 'Hong Kong',
    'HN': 'Honduras', 'HR': 'Croatie', 'HT': 'Haiti', 'HU': 'Hongrie', 'ID': 'Indonesie',
    'IE': 'Irlande', 'IL': 'Israel', 'IN': 'Inde', 'IQ': 'Irak', 'IR': 'Iran',
    'IS': 'Islande', 'IT': 'Italie', 'JM': 'Jamaique', 'JO': 'Jordanie', 'JP': 'Japon',
    'KE': 'Kenya', 'KG': 'Kirghizistan', 'KH': 'Cambodge', 'KI': 'Kiribati', 'KM': 'Comores',
    'KN': 'Saint-Kitts', 'KP': 'Coree du Nord', 'KR': 'Coree du Sud', 'KW': 'Koweit', 'KY': 'Caimans',
    'KZ': 'Kazakhstan', 'LA': 'Laos', 'LB': 'Liban', 'LC': 'Sainte-Lucie', 'LI': 'Liechtenstein',
    'LK': 'Sri Lanka', 'LR': 'Liberia', 'LS': 'Lesotho', 'LT': 'Lituanie', 'LU': 'Luxembourg',
    'LV': 'Lettonie', 'LY': 'Libye', 'MA': 'Maroc', 'MC': 'Monaco', 'MD': 'Moldavie',
    'ME': 'Montenegro', 'MG': 'Madagascar', 'MH': 'Marshall', 'MK': 'Macedoine', 'ML': 'Mali',
    'MM': 'Myanmar', 'MN': 'Mongolie', 'MO': 'Macao', 'MP': 'Mariannes', 'MQ': 'Martinique',
    'MR': 'Mauritanie', 'MS': 'Montserrat', 'MT': 'Malte', 'MU': 'Maurice', 'MV': 'Maldives',
    'MW': 'Malawi', 'MX': 'Mexique', 'MY': 'Malaisie', 'MZ': 'Mozambique', 'NA': 'Namibie',
    'NC': 'Nouvelle-Caledonie', 'NE': 'Niger', 'NF': 'Norfolk', 'NG': 'Nigeria', 'NI': 'Nicaragua',
    'NL': 'Pays-Bas', 'NO': 'Norvege', 'NP': 'Nepal', 'NR': 'Nauru', 'NU': 'Niue',
    'NZ': 'Nouvelle-Zelande', 'OM': 'Oman', 'PA': 'Panama', 'PE': 'Perou', 'PF': 'Polynesie FR',
    'PG': 'Papouasie', 'PH': 'Philippines', 'PK': 'Pakistan', 'PL': 'Pologne', 'PM': 'St-Pierre',
    'PR': 'Porto Rico', 'PS': 'Palestine', 'PT': 'Portugal', 'PW': 'Palaos', 'PY': 'Paraguay',
    'QA': 'Qatar', 'RE': 'Reunion', 'RO': 'Roumanie', 'RS': 'Serbie', 'RU': 'Russie',
    'RW': 'Rwanda', 'SA': 'Arabie Saoudite', 'SB': 'Salomon', 'SC': 'Seychelles', 'SD': 'Soudan',
    'SE': 'Suede', 'SG': 'Singapour', 'SI': 'Slovenie', 'SK': 'Slovaquie', 'SL': 'Sierra Leone',
    'SM': 'Saint-Marin', 'SN': 'Senegal', 'SO': 'Somalie', 'SR': 'Suriname', 'SS': 'Soudan du Sud',
    'ST': 'Sao Tome', 'SV': 'Salvador', 'SX': 'Sint Maarten', 'SY': 'Syrie', 'SZ': 'Eswatini',
    'TC': 'Turks-Caicos', 'TD': 'Tchad', 'TG': 'Togo', 'TH': 'Thailande', 'TJ': 'Tadjikistan',
    'TL': 'Timor-Leste', 'TM': 'Turkmenistan', 'TN': 'Tunisie', 'TO': 'Tonga', 'TR': 'Turquie',
    'TT': 'Trinite', 'TV': 'Tuvalu', 'TW': 'Taiwan', 'TZ': 'Tanzanie', 'UA': 'Ukraine',
    'UG': 'Ouganda', 'US': 'USA', 'UY': 'Uruguay', 'UZ': 'Ouzbekistan', 'VA': 'Vatican',
    'VC': 'St-Vincent', 'VE': 'Venezuela', 'VG': 'Iles Vierges UK', 'VI': 'Iles Vierges US',
    'VN': 'Vietnam', 'VU': 'Vanuatu', 'WF': 'Wallis', 'WS': 'Samoa', 'XK': 'Kosovo',
    'YE': 'Yemen', 'YT': 'Mayotte', 'ZA': 'Afrique du Sud', 'ZM': 'Zambie', 'ZW': 'Zimbabwe',
}

with open('airports.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        iata = row.get('iata_code', '').strip()
        airport_type = row.get('type', '')
        
        if iata and len(iata) == 3 and iata not in seen_codes:
            if airport_type in ['large_airport', 'medium_airport']:
                city = row.get('municipality', '') or row.get('name', '')
                country = row.get('iso_country', '')
                country_name = country_names.get(country, country)
                city_clean = city.replace('"', '').replace("'", " ")[:25]
                
                if city_clean and country_name:
                    airports.append({
                        'code': iata,
                        'city': city_clean,
                        'country': country_name
                    })
                    seen_codes.add(iata)

airports.sort(key=lambda x: (x['country'], x['city']))
print(f"Total: {len(airports)} aeroports")

with open('airports_data.txt', 'w', encoding='utf-8') as f:
    for apt in airports:
        f.write(f'  {{ code: "{apt["code"]}", city: "{apt["city"]}", country: "{apt["country"]}" }},\n')

print("Fichier airports_data.txt cree!")
