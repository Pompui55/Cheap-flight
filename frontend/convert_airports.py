import csv
import json

airports = []
seen_codes = set()

with open('airports.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        iata = row.get('iata_code', '').strip()
        airport_type = row.get('type', '')
        
        # Garder uniquement les aéroports avec code IATA et de type commercial
        if iata and len(iata) == 3 and iata not in seen_codes:
            if airport_type in ['large_airport', 'medium_airport']:
                city = row.get('municipality', '') or row.get('name', '')
                country = row.get('iso_country', '')
                
                # Traduire les codes pays en noms
                country_names = {
                    'FR': 'France', 'US': 'USA', 'GB': 'Royaume-Uni', 'DE': 'Allemagne',
                    'ES': 'Espagne', 'IT': 'Italie', 'PT': 'Portugal', 'NL': 'Pays-Bas',
                    'BE': 'Belgique', 'CH': 'Suisse', 'AT': 'Autriche', 'GR': 'Grèce',
                    'TR': 'Turquie', 'MA': 'Maroc', 'TN': 'Tunisie', 'DZ': 'Algérie',
                    'EG': 'Égypte', 'TH': 'Thaïlande', 'VN': 'Vietnam', 'ID': 'Indonésie',
                    'MY': 'Malaisie', 'SG': 'Singapour', 'PH': 'Philippines', 'JP': 'Japon',
                    'KR': 'Corée du Sud', 'CN': 'Chine', 'HK': 'Hong Kong', 'TW': 'Taïwan',
                    'IN': 'Inde', 'AE': 'Émirats', 'SA': 'Arabie Saoudite', 'QA': 'Qatar',
                    'AU': 'Australie', 'NZ': 'Nouvelle-Zélande', 'CA': 'Canada', 'MX': 'Mexique',
                    'BR': 'Brésil', 'AR': 'Argentine', 'CL': 'Chili', 'CO': 'Colombie',
                    'PE': 'Pérou', 'ZA': 'Afrique du Sud', 'KE': 'Kenya', 'SN': 'Sénégal',
                    'PL': 'Pologne', 'CZ': 'Tchéquie', 'HU': 'Hongrie', 'RO': 'Roumanie',
                    'HR': 'Croatie', 'RS': 'Serbie', 'BG': 'Bulgarie', 'NO': 'Norvège',
                    'SE': 'Suède', 'DK': 'Danemark', 'FI': 'Finlande', 'IE': 'Irlande',
                    'RU': 'Russie', 'UA': 'Ukraine', 'IL': 'Israël', 'LB': 'Liban',
                    'JO': 'Jordanie', 'KH': 'Cambodge', 'LA': 'Laos', 'MM': 'Myanmar',
                    'NP': 'Népal', 'LK': 'Sri Lanka', 'MV': 'Maldives', 'PK': 'Pakistan',
                    'BD': 'Bangladesh', 'KZ': 'Kazakhstan', 'UZ': 'Ouzbékistan',
                    'GE': 'Géorgie', 'AM': 'Arménie', 'AZ': 'Azerbaïdjan',
                    'CY': 'Chypre', 'MT': 'Malte', 'IS': 'Islande', 'LU': 'Luxembourg',
                    'MU': 'Île Maurice', 'SC': 'Seychelles', 'RE': 'La Réunion',
                    'GP': 'Guadeloupe', 'MQ': 'Martinique', 'GF': 'Guyane', 'NC': 'Nouvelle-Calédonie',
                    'PF': 'Polynésie', 'CU': 'Cuba', 'DO': 'Rép. Dominicaine', 'JM': 'Jamaïque',
                    'CI': 'Côte d\'Ivoire', 'GH': 'Ghana', 'NG': 'Nigeria', 'CM': 'Cameroun',
                    'ET': 'Éthiopie', 'TZ': 'Tanzanie', 'UG': 'Ouganda', 'RW': 'Rwanda',
                }
                
                country_name = country_names.get(country, country)
                
                if city and country_name:
                    airports.append({
                        'code': iata,
                        'city': city[:30],  # Limiter la longueur
                        'country': country_name
                    })
                    seen_codes.add(iata)

# Trier par pays puis par ville
airports.sort(key=lambda x: (x['country'], x['city']))

print(f"Total: {len(airports)} aéroports")

# Générer le code TypeScript
with open('airports_data.ts', 'w', encoding='utf-8') as f:
    f.write('// Base de données complète des aéroports - OurAirports\n')
    f.write('// Généré automatiquement\n\n')
    f.write('export const AIRPORTS_DATABASE = [\n')
    for apt in airports:
        f.write(f'  {{ code: "{apt["code"]}", city: "{apt["city"]}", country: "{apt["country"]}" }},\n')
    f.write('];\n')

print("Fichier airports_data.ts créé !")
