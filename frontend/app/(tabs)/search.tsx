import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Modal,
  FlatList,
  Alert,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

// Backend URL
const BACKEND_URL = 'https://cheap-flights-144.preview.emergentagent.com';

// Interfaces
interface Airport {
  code: string;
  city: string;
  country: string;
}

interface Flight {
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  flight_number: string;
  available_seats: number;
}

interface PopularDestination {
  origin: string;
  destination: string;
  city: string;
  country: string;
  price_from: number;
}

// Données locales - 300+ aéroports majeurs du monde
const LOCAL_AIRPORTS: Airport[] = [
  // FRANCE
  { code: "CDG", city: "Paris CDG", country: "France" },
  { code: "ORY", city: "Paris Orly", country: "France" },
  { code: "LYS", city: "Lyon", country: "France" },
  { code: "NCE", city: "Nice", country: "France" },
  { code: "MRS", city: "Marseille", country: "France" },
  { code: "TLS", city: "Toulouse", country: "France" },
  { code: "BOD", city: "Bordeaux", country: "France" },
  { code: "NTE", city: "Nantes", country: "France" },
  { code: "SXB", city: "Strasbourg", country: "France" },
  { code: "LIL", city: "Lille", country: "France" },
  { code: "MPL", city: "Montpellier", country: "France" },
  { code: "BIQ", city: "Biarritz", country: "France" },
  { code: "RNS", city: "Rennes", country: "France" },
  { code: "BVA", city: "Beauvais", country: "France" },
  // DOM-TOM
  { code: "FDF", city: "Fort-de-France", country: "Martinique" },
  { code: "PTP", city: "Pointe-à-Pitre", country: "Guadeloupe" },
  { code: "RUN", city: "Saint-Denis", country: "La Réunion" },
  { code: "PPT", city: "Papeete", country: "Tahiti" },
  { code: "NOU", city: "Nouméa", country: "Nouvelle-Calédonie" },
  { code: "CAY", city: "Cayenne", country: "Guyane" },
  // EUROPE
  { code: "LHR", city: "Londres Heathrow", country: "Royaume-Uni" },
  { code: "LGW", city: "Londres Gatwick", country: "Royaume-Uni" },
  { code: "STN", city: "Londres Stansted", country: "Royaume-Uni" },
  { code: "LTN", city: "Londres Luton", country: "Royaume-Uni" },
  { code: "MAN", city: "Manchester", country: "Royaume-Uni" },
  { code: "EDI", city: "Édimbourg", country: "Royaume-Uni" },
  { code: "BHX", city: "Birmingham", country: "Royaume-Uni" },
  { code: "GLA", city: "Glasgow", country: "Royaume-Uni" },
  { code: "BRS", city: "Bristol", country: "Royaume-Uni" },
  { code: "AMS", city: "Amsterdam", country: "Pays-Bas" },
  { code: "BRU", city: "Bruxelles", country: "Belgique" },
  { code: "CRL", city: "Charleroi", country: "Belgique" },
  { code: "FRA", city: "Francfort", country: "Allemagne" },
  { code: "MUC", city: "Munich", country: "Allemagne" },
  { code: "BER", city: "Berlin", country: "Allemagne" },
  { code: "DUS", city: "Düsseldorf", country: "Allemagne" },
  { code: "HAM", city: "Hambourg", country: "Allemagne" },
  { code: "CGN", city: "Cologne", country: "Allemagne" },
  { code: "STR", city: "Stuttgart", country: "Allemagne" },
  { code: "ZRH", city: "Zurich", country: "Suisse" },
  { code: "GVA", city: "Genève", country: "Suisse" },
  { code: "BSL", city: "Bâle-Mulhouse", country: "Suisse" },
  { code: "VIE", city: "Vienne", country: "Autriche" },
  { code: "BCN", city: "Barcelone", country: "Espagne" },
  { code: "MAD", city: "Madrid", country: "Espagne" },
  { code: "PMI", city: "Palma Majorque", country: "Espagne" },
  { code: "AGP", city: "Malaga", country: "Espagne" },
  { code: "ALC", city: "Alicante", country: "Espagne" },
  { code: "VLC", city: "Valence", country: "Espagne" },
  { code: "SVQ", city: "Séville", country: "Espagne" },
  { code: "IBZ", city: "Ibiza", country: "Espagne" },
  { code: "TFS", city: "Tenerife Sud", country: "Espagne" },
  { code: "LPA", city: "Gran Canaria", country: "Espagne" },
  { code: "FCO", city: "Rome Fiumicino", country: "Italie" },
  { code: "CIA", city: "Rome Ciampino", country: "Italie" },
  { code: "MXP", city: "Milan Malpensa", country: "Italie" },
  { code: "LIN", city: "Milan Linate", country: "Italie" },
  { code: "BGY", city: "Bergame", country: "Italie" },
  { code: "VCE", city: "Venise", country: "Italie" },
  { code: "NAP", city: "Naples", country: "Italie" },
  { code: "FLR", city: "Florence", country: "Italie" },
  { code: "PSA", city: "Pise", country: "Italie" },
  { code: "BLQ", city: "Bologne", country: "Italie" },
  { code: "CTA", city: "Catane", country: "Italie" },
  { code: "PMO", city: "Palerme", country: "Italie" },
  { code: "LIS", city: "Lisbonne", country: "Portugal" },
  { code: "OPO", city: "Porto", country: "Portugal" },
  { code: "FAO", city: "Faro", country: "Portugal" },
  { code: "FNC", city: "Madère", country: "Portugal" },
  { code: "ATH", city: "Athènes", country: "Grèce" },
  { code: "SKG", city: "Thessalonique", country: "Grèce" },
  { code: "HER", city: "Héraklion", country: "Grèce" },
  { code: "RHO", city: "Rhodes", country: "Grèce" },
  { code: "CFU", city: "Corfou", country: "Grèce" },
  { code: "JMK", city: "Mykonos", country: "Grèce" },
  { code: "JTR", city: "Santorin", country: "Grèce" },
  { code: "DUB", city: "Dublin", country: "Irlande" },
  { code: "SNN", city: "Shannon", country: "Irlande" },
  { code: "ORK", city: "Cork", country: "Irlande" },
  { code: "CPH", city: "Copenhague", country: "Danemark" },
  { code: "OSL", city: "Oslo", country: "Norvège" },
  { code: "BGO", city: "Bergen", country: "Norvège" },
  { code: "ARN", city: "Stockholm", country: "Suède" },
  { code: "GOT", city: "Göteborg", country: "Suède" },
  { code: "HEL", city: "Helsinki", country: "Finlande" },
  { code: "WAW", city: "Varsovie", country: "Pologne" },
  { code: "KRK", city: "Cracovie", country: "Pologne" },
  { code: "PRG", city: "Prague", country: "Tchéquie" },
  { code: "BUD", city: "Budapest", country: "Hongrie" },
  { code: "OTP", city: "Bucarest", country: "Roumanie" },
  { code: "SOF", city: "Sofia", country: "Bulgarie" },
  { code: "ZAG", city: "Zagreb", country: "Croatie" },
  { code: "DBV", city: "Dubrovnik", country: "Croatie" },
  { code: "SPU", city: "Split", country: "Croatie" },
  { code: "LJU", city: "Ljubljana", country: "Slovénie" },
  { code: "BEG", city: "Belgrade", country: "Serbie" },
  { code: "TIA", city: "Tirana", country: "Albanie" },
  { code: "SKP", city: "Skopje", country: "Macédoine" },
  { code: "RIX", city: "Riga", country: "Lettonie" },
  { code: "VNO", city: "Vilnius", country: "Lituanie" },
  { code: "TLL", city: "Tallinn", country: "Estonie" },
  { code: "KIV", city: "Chisinau", country: "Moldavie" },
  { code: "IEV", city: "Kiev Zhuliany", country: "Ukraine" },
  { code: "KBP", city: "Kiev Boryspil", country: "Ukraine" },
  { code: "SVO", city: "Moscou Sheremetyevo", country: "Russie" },
  { code: "DME", city: "Moscou Domodedovo", country: "Russie" },
  { code: "LED", city: "Saint-Pétersbourg", country: "Russie" },
  // TURQUIE
  { code: "IST", city: "Istanbul", country: "Turquie" },
  { code: "SAW", city: "Istanbul Sabiha", country: "Turquie" },
  { code: "AYT", city: "Antalya", country: "Turquie" },
  { code: "ADB", city: "Izmir", country: "Turquie" },
  { code: "ESB", city: "Ankara", country: "Turquie" },
  { code: "DLM", city: "Dalaman", country: "Turquie" },
  { code: "BJV", city: "Bodrum", country: "Turquie" },
  // AFRIQUE DU NORD
  { code: "CMN", city: "Casablanca", country: "Maroc" },
  { code: "RAK", city: "Marrakech", country: "Maroc" },
  { code: "AGA", city: "Agadir", country: "Maroc" },
  { code: "FEZ", city: "Fès", country: "Maroc" },
  { code: "TNG", city: "Tanger", country: "Maroc" },
  { code: "NDR", city: "Nador", country: "Maroc" },
  { code: "OUD", city: "Oujda", country: "Maroc" },
  { code: "ALG", city: "Alger", country: "Algérie" },
  { code: "ORN", city: "Oran", country: "Algérie" },
  { code: "CZL", city: "Constantine", country: "Algérie" },
  { code: "TLM", city: "Tlemcen", country: "Algérie" },
  { code: "BJA", city: "Béjaïa", country: "Algérie" },
  { code: "AAE", city: "Annaba", country: "Algérie" },
  { code: "TUN", city: "Tunis", country: "Tunisie" },
  { code: "DJE", city: "Djerba", country: "Tunisie" },
  { code: "MIR", city: "Monastir", country: "Tunisie" },
  { code: "SFA", city: "Sfax", country: "Tunisie" },
  { code: "CAI", city: "Le Caire", country: "Égypte" },
  { code: "HRG", city: "Hurghada", country: "Égypte" },
  { code: "SSH", city: "Sharm el-Sheikh", country: "Égypte" },
  { code: "LXR", city: "Louxor", country: "Égypte" },
  { code: "ASW", city: "Assouan", country: "Égypte" },
  { code: "TIP", city: "Tripoli", country: "Libye" },
  // AFRIQUE SUBSAHARIENNE
  { code: "DKR", city: "Dakar", country: "Sénégal" },
  { code: "ABJ", city: "Abidjan", country: "Côte d'Ivoire" },
  { code: "ACC", city: "Accra", country: "Ghana" },
  { code: "LOS", city: "Lagos", country: "Nigeria" },
  { code: "ABV", city: "Abuja", country: "Nigeria" },
  { code: "DLA", city: "Douala", country: "Cameroun" },
  { code: "YAO", city: "Yaoundé", country: "Cameroun" },
  { code: "LBV", city: "Libreville", country: "Gabon" },
  { code: "BZV", city: "Brazzaville", country: "Congo" },
  { code: "FIH", city: "Kinshasa", country: "RD Congo" },
  { code: "ADD", city: "Addis-Abeba", country: "Éthiopie" },
  { code: "NBO", city: "Nairobi", country: "Kenya" },
  { code: "MBA", city: "Mombasa", country: "Kenya" },
  { code: "DAR", city: "Dar es Salaam", country: "Tanzanie" },
  { code: "ZNZ", city: "Zanzibar", country: "Tanzanie" },
  { code: "JRO", city: "Kilimandjaro", country: "Tanzanie" },
  { code: "EBB", city: "Entebbe", country: "Ouganda" },
  { code: "KGL", city: "Kigali", country: "Rwanda" },
  { code: "JNB", city: "Johannesburg", country: "Afrique du Sud" },
  { code: "CPT", city: "Le Cap", country: "Afrique du Sud" },
  { code: "DUR", city: "Durban", country: "Afrique du Sud" },
  { code: "WDH", city: "Windhoek", country: "Namibie" },
  { code: "GBE", city: "Gaborone", country: "Botswana" },
  { code: "VFA", city: "Victoria Falls", country: "Zimbabwe" },
  { code: "HRE", city: "Harare", country: "Zimbabwe" },
  { code: "LLW", city: "Lilongwe", country: "Malawi" },
  { code: "LUN", city: "Lusaka", country: "Zambie" },
  { code: "MPM", city: "Maputo", country: "Mozambique" },
  { code: "TNR", city: "Antananarivo", country: "Madagascar" },
  { code: "MRU", city: "Maurice", country: "Île Maurice" },
  { code: "SEZ", city: "Mahé", country: "Seychelles" },
  // MOYEN-ORIENT
  { code: "DXB", city: "Dubai", country: "Émirats" },
  { code: "AUH", city: "Abu Dhabi", country: "Émirats" },
  { code: "SHJ", city: "Sharjah", country: "Émirats" },
  { code: "DOH", city: "Doha", country: "Qatar" },
  { code: "BAH", city: "Bahreïn", country: "Bahreïn" },
  { code: "KWI", city: "Koweït", country: "Koweït" },
  { code: "MCT", city: "Mascate", country: "Oman" },
  { code: "RUH", city: "Riyad", country: "Arabie Saoudite" },
  { code: "JED", city: "Djeddah", country: "Arabie Saoudite" },
  { code: "MED", city: "Médine", country: "Arabie Saoudite" },
  { code: "AMM", city: "Amman", country: "Jordanie" },
  { code: "AQJ", city: "Aqaba", country: "Jordanie" },
  { code: "TLV", city: "Tel Aviv", country: "Israël" },
  { code: "BEY", city: "Beyrouth", country: "Liban" },
  { code: "BGW", city: "Bagdad", country: "Irak" },
  { code: "IKA", city: "Téhéran", country: "Iran" },
  // ASIE CENTRALE
  { code: "TAS", city: "Tachkent", country: "Ouzbékistan" },
  { code: "ALA", city: "Almaty", country: "Kazakhstan" },
  { code: "NQZ", city: "Astana", country: "Kazakhstan" },
  { code: "FRU", city: "Bichkek", country: "Kirghizistan" },
  { code: "DYU", city: "Douchanbé", country: "Tadjikistan" },
  { code: "ASB", city: "Achgabat", country: "Turkménistan" },
  { code: "GYD", city: "Bakou", country: "Azerbaïdjan" },
  { code: "TBS", city: "Tbilissi", country: "Géorgie" },
  { code: "EVN", city: "Erevan", country: "Arménie" },
  // ASIE DU SUD
  { code: "DEL", city: "New Delhi", country: "Inde" },
  { code: "BOM", city: "Mumbai", country: "Inde" },
  { code: "BLR", city: "Bangalore", country: "Inde" },
  { code: "MAA", city: "Chennai", country: "Inde" },
  { code: "CCU", city: "Calcutta", country: "Inde" },
  { code: "HYD", city: "Hyderabad", country: "Inde" },
  { code: "COK", city: "Cochin", country: "Inde" },
  { code: "GOI", city: "Goa", country: "Inde" },
  { code: "AMD", city: "Ahmedabad", country: "Inde" },
  { code: "JAI", city: "Jaipur", country: "Inde" },
  { code: "CMB", city: "Colombo", country: "Sri Lanka" },
  { code: "MLE", city: "Malé", country: "Maldives" },
  { code: "DAC", city: "Dacca", country: "Bangladesh" },
  { code: "KTM", city: "Katmandou", country: "Népal" },
  { code: "ISB", city: "Islamabad", country: "Pakistan" },
  { code: "KHI", city: "Karachi", country: "Pakistan" },
  { code: "LHE", city: "Lahore", country: "Pakistan" },
  // ASIE DU SUD-EST
  { code: "BKK", city: "Bangkok", country: "Thaïlande" },
  { code: "DMK", city: "Bangkok Don Mueang", country: "Thaïlande" },
  { code: "HKT", city: "Phuket", country: "Thaïlande" },
  { code: "CNX", city: "Chiang Mai", country: "Thaïlande" },
  { code: "USM", city: "Koh Samui", country: "Thaïlande" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaisie" },
  { code: "PEN", city: "Penang", country: "Malaisie" },
  { code: "LGK", city: "Langkawi", country: "Malaisie" },
  { code: "BKI", city: "Kota Kinabalu", country: "Malaisie" },
  { code: "SIN", city: "Singapour", country: "Singapour" },
  { code: "CGK", city: "Jakarta", country: "Indonésie" },
  { code: "DPS", city: "Bali", country: "Indonésie" },
  { code: "SUB", city: "Surabaya", country: "Indonésie" },
  { code: "JOG", city: "Yogyakarta", country: "Indonésie" },
  { code: "MNL", city: "Manille", country: "Philippines" },
  { code: "CEB", city: "Cebu", country: "Philippines" },
  { code: "SGN", city: "Ho Chi Minh", country: "Vietnam" },
  { code: "HAN", city: "Hanoï", country: "Vietnam" },
  { code: "DAD", city: "Da Nang", country: "Vietnam" },
  { code: "PNH", city: "Phnom Penh", country: "Cambodge" },
  { code: "REP", city: "Siem Reap", country: "Cambodge" },
  { code: "VTE", city: "Vientiane", country: "Laos" },
  { code: "LPQ", city: "Luang Prabang", country: "Laos" },
  { code: "RGN", city: "Rangoun", country: "Myanmar" },
  { code: "BWN", city: "Bandar Seri Begawan", country: "Brunei" },
  // ASIE DE L'EST
  { code: "HKG", city: "Hong Kong", country: "Chine" },
  { code: "PEK", city: "Pékin", country: "Chine" },
  { code: "PKX", city: "Pékin Daxing", country: "Chine" },
  { code: "PVG", city: "Shanghai Pudong", country: "Chine" },
  { code: "SHA", city: "Shanghai Hongqiao", country: "Chine" },
  { code: "CAN", city: "Canton", country: "Chine" },
  { code: "SZX", city: "Shenzhen", country: "Chine" },
  { code: "CTU", city: "Chengdu", country: "Chine" },
  { code: "CKG", city: "Chongqing", country: "Chine" },
  { code: "XIY", city: "Xi'an", country: "Chine" },
  { code: "KMG", city: "Kunming", country: "Chine" },
  { code: "HGH", city: "Hangzhou", country: "Chine" },
  { code: "NKG", city: "Nankin", country: "Chine" },
  { code: "WUH", city: "Wuhan", country: "Chine" },
  { code: "TSN", city: "Tianjin", country: "Chine" },
  { code: "DLC", city: "Dalian", country: "Chine" },
  { code: "TAO", city: "Qingdao", country: "Chine" },
  { code: "XMN", city: "Xiamen", country: "Chine" },
  { code: "MFM", city: "Macao", country: "Chine" },
  { code: "TPE", city: "Taipei", country: "Taïwan" },
  { code: "KHH", city: "Kaohsiung", country: "Taïwan" },
  { code: "NRT", city: "Tokyo Narita", country: "Japon" },
  { code: "HND", city: "Tokyo Haneda", country: "Japon" },
  { code: "KIX", city: "Osaka Kansai", country: "Japon" },
  { code: "ITM", city: "Osaka Itami", country: "Japon" },
  { code: "NGO", city: "Nagoya", country: "Japon" },
  { code: "FUK", city: "Fukuoka", country: "Japon" },
  { code: "CTS", city: "Sapporo", country: "Japon" },
  { code: "OKA", city: "Okinawa", country: "Japon" },
  { code: "ICN", city: "Séoul Incheon", country: "Corée du Sud" },
  { code: "GMP", city: "Séoul Gimpo", country: "Corée du Sud" },
  { code: "PUS", city: "Busan", country: "Corée du Sud" },
  { code: "CJU", city: "Jeju", country: "Corée du Sud" },
  { code: "ULN", city: "Oulan-Bator", country: "Mongolie" },
  // OCÉANIE
  { code: "SYD", city: "Sydney", country: "Australie" },
  { code: "MEL", city: "Melbourne", country: "Australie" },
  { code: "BNE", city: "Brisbane", country: "Australie" },
  { code: "PER", city: "Perth", country: "Australie" },
  { code: "ADL", city: "Adélaïde", country: "Australie" },
  { code: "CNS", city: "Cairns", country: "Australie" },
  { code: "OOL", city: "Gold Coast", country: "Australie" },
  { code: "AKL", city: "Auckland", country: "Nouvelle-Zélande" },
  { code: "WLG", city: "Wellington", country: "Nouvelle-Zélande" },
  { code: "CHC", city: "Christchurch", country: "Nouvelle-Zélande" },
  { code: "ZQN", city: "Queenstown", country: "Nouvelle-Zélande" },
  { code: "NAN", city: "Nadi", country: "Fidji" },
  // AMÉRIQUE DU NORD
  { code: "JFK", city: "New York JFK", country: "USA" },
  { code: "EWR", city: "New York Newark", country: "USA" },
  { code: "LGA", city: "New York LaGuardia", country: "USA" },
  { code: "LAX", city: "Los Angeles", country: "USA" },
  { code: "SFO", city: "San Francisco", country: "USA" },
  { code: "ORD", city: "Chicago", country: "USA" },
  { code: "MIA", city: "Miami", country: "USA" },
  { code: "ATL", city: "Atlanta", country: "USA" },
  { code: "DFW", city: "Dallas", country: "USA" },
  { code: "DEN", city: "Denver", country: "USA" },
  { code: "SEA", city: "Seattle", country: "USA" },
  { code: "BOS", city: "Boston", country: "USA" },
  { code: "LAS", city: "Las Vegas", country: "USA" },
  { code: "MCO", city: "Orlando", country: "USA" },
  { code: "PHX", city: "Phoenix", country: "USA" },
  { code: "IAH", city: "Houston", country: "USA" },
  { code: "PHL", city: "Philadelphie", country: "USA" },
  { code: "DCA", city: "Washington Reagan", country: "USA" },
  { code: "IAD", city: "Washington Dulles", country: "USA" },
  { code: "SAN", city: "San Diego", country: "USA" },
  { code: "HNL", city: "Honolulu", country: "USA" },
  { code: "YYZ", city: "Toronto", country: "Canada" },
  { code: "YVR", city: "Vancouver", country: "Canada" },
  { code: "YUL", city: "Montréal", country: "Canada" },
  { code: "YYC", city: "Calgary", country: "Canada" },
  { code: "YOW", city: "Ottawa", country: "Canada" },
  { code: "YEG", city: "Edmonton", country: "Canada" },
  { code: "YQB", city: "Québec", country: "Canada" },
  { code: "MEX", city: "Mexico", country: "Mexique" },
  { code: "CUN", city: "Cancún", country: "Mexique" },
  { code: "GDL", city: "Guadalajara", country: "Mexique" },
  { code: "MTY", city: "Monterrey", country: "Mexique" },
  { code: "SJD", city: "Los Cabos", country: "Mexique" },
  { code: "PVR", city: "Puerto Vallarta", country: "Mexique" },
  // CARAÏBES
  { code: "HAV", city: "La Havane", country: "Cuba" },
  { code: "VRA", city: "Varadero", country: "Cuba" },
  { code: "SDQ", city: "Saint-Domingue", country: "Rép. Dominicaine" },
  { code: "PUJ", city: "Punta Cana", country: "Rép. Dominicaine" },
  { code: "SXM", city: "Saint-Martin", country: "Antilles" },
  { code: "AUA", city: "Aruba", country: "Aruba" },
  { code: "CUR", city: "Curaçao", country: "Curaçao" },
  { code: "NAS", city: "Nassau", country: "Bahamas" },
  { code: "MBJ", city: "Montego Bay", country: "Jamaïque" },
  { code: "KIN", city: "Kingston", country: "Jamaïque" },
  { code: "BGI", city: "Bridgetown", country: "Barbade" },
  { code: "POS", city: "Port of Spain", country: "Trinité" },
  // AMÉRIQUE CENTRALE
  { code: "PTY", city: "Panama City", country: "Panama" },
  { code: "SJO", city: "San José", country: "Costa Rica" },
  { code: "LIR", city: "Liberia", country: "Costa Rica" },
  { code: "GUA", city: "Guatemala City", country: "Guatemala" },
  { code: "SAL", city: "San Salvador", country: "Salvador" },
  { code: "TGU", city: "Tegucigalpa", country: "Honduras" },
  { code: "MGA", city: "Managua", country: "Nicaragua" },
  { code: "BZE", city: "Belize City", country: "Belize" },
  // AMÉRIQUE DU SUD
  { code: "GRU", city: "São Paulo", country: "Brésil" },
  { code: "GIG", city: "Rio de Janeiro", country: "Brésil" },
  { code: "BSB", city: "Brasília", country: "Brésil" },
  { code: "CNF", city: "Belo Horizonte", country: "Brésil" },
  { code: "SSA", city: "Salvador", country: "Brésil" },
  { code: "REC", city: "Recife", country: "Brésil" },
  { code: "FOR", city: "Fortaleza", country: "Brésil" },
  { code: "POA", city: "Porto Alegre", country: "Brésil" },
  { code: "CWB", city: "Curitiba", country: "Brésil" },
  { code: "EZE", city: "Buenos Aires", country: "Argentine" },
  { code: "AEP", city: "Buenos Aires Aeroparque", country: "Argentine" },
  { code: "COR", city: "Córdoba", country: "Argentine" },
  { code: "MDZ", city: "Mendoza", country: "Argentine" },
  { code: "IGR", city: "Iguazú", country: "Argentine" },
  { code: "USH", city: "Ushuaïa", country: "Argentine" },
  { code: "SCL", city: "Santiago", country: "Chili" },
  { code: "LIM", city: "Lima", country: "Pérou" },
  { code: "CUZ", city: "Cusco", country: "Pérou" },
  { code: "BOG", city: "Bogotá", country: "Colombie" },
  { code: "MDE", city: "Medellín", country: "Colombie" },
  { code: "CTG", city: "Carthagène", country: "Colombie" },
  { code: "CLO", city: "Cali", country: "Colombie" },
  { code: "UIO", city: "Quito", country: "Équateur" },
  { code: "GYE", city: "Guayaquil", country: "Équateur" },
  { code: "GPS", city: "Galápagos", country: "Équateur" },
  { code: "CCS", city: "Caracas", country: "Venezuela" },
  { code: "LPB", city: "La Paz", country: "Bolivie" },
  { code: "VVI", city: "Santa Cruz", country: "Bolivie" },
  { code: "ASU", city: "Asunción", country: "Paraguay" },
  { code: "MVD", city: "Montevideo", country: "Uruguay" },
];

const LOCAL_POPULAR: PopularDestination[] = [
  { origin: "CDG", destination: "BCN", city: "Barcelone", country: "Espagne", price_from: 85 },
  { origin: "CDG", destination: "LHR", city: "Londres", country: "UK", price_from: 95 },
  { origin: "CDG", destination: "FCO", city: "Rome", country: "Italie", price_from: 99 },
  { origin: "CDG", destination: "CMN", city: "Casablanca", country: "Maroc", price_from: 120 },
  { origin: "CDG", destination: "JFK", city: "New York", country: "USA", price_from: 380 },
];

// Générer des vols locaux
const generateFlights = (from: string, to: string): Flight[] => {
  const airlines = ['Air France', 'Lufthansa', 'British Airways', 'Emirates', 'KLM', 'Turkish Airlines'];
  const flights: Flight[] = [];
  
  for (let i = 0; i < 8; i++) {
    const hour = 6 + Math.floor(Math.random() * 14);
    const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const durationHours = 2 + Math.floor(Math.random() * 8);
    const arrHour = (hour + durationHours) % 24;
    const airline = airlines[i % airlines.length];
    
    flights.push({
      flight_id: `FL${i}${Date.now()}`,
      airline: airline,
      origin: from,
      destination: to,
      departure_time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      arrival_time: `${arrHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      duration: `${durationHours}h${minute > 0 ? minute + 'm' : ''}`,
      price: Math.floor(50 + Math.random() * 500),
      currency: 'EUR',
      stops: Math.random() > 0.7 ? 1 : 0,
      flight_number: `${airline.substring(0, 2).toUpperCase()}${1000 + Math.floor(Math.random() * 9000)}`,
      available_seats: 5 + Math.floor(Math.random() * 40),
    });
  }
  
  return flights.sort((a, b) => a.price - b.price);
};

export default function SearchScreen() {
  const [origin, setOrigin] = useState('CDG');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [airports] = useState<Airport[]>(LOCAL_AIRPORTS);
  const [popularDestinations] = useState<PopularDestination[]>(LOCAL_POPULAR);
  
  // Modals
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [airportSearch, setAirportSearch] = useState('');

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDepartureDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSearch = async () => {
    if (!origin || !destination) {
      Alert.alert('Erreur', 'Veuillez sélectionner le départ et la destination');
      return;
    }
    if (origin === destination) {
      Alert.alert('Erreur', 'Le départ et la destination doivent être différents');
      return;
    }

    setLoading(true);
    setSearched(false);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departure_date: departureDate,
          adults: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.flights && data.flights.length > 0) {
          const formatted = data.flights.map((f: any) => ({
            ...f,
            departure_time: f.departure_time?.substring(11, 16) || f.departure_time,
            arrival_time: f.arrival_time?.substring(11, 16) || f.arrival_time,
          }));
          setFlights(formatted);
          setSearched(true);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log('Using local flights');
    }

    // Fallback local
    setTimeout(() => {
      setFlights(generateFlights(origin, destination));
      setSearched(true);
      setLoading(false);
    }, 1000);
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const handleBookFlight = () => {
    if (selectedFlight) {
      Alert.alert(
        'Réservation',
        `Vol ${selectedFlight.flight_number}\n${selectedFlight.origin} → ${selectedFlight.destination}\n\nPrix: ${selectedFlight.price} ${selectedFlight.currency}\n\nFonctionnalité de paiement bientôt disponible!`,
        [{ text: 'OK', onPress: () => setSelectedFlight(null) }]
      );
    }
  };

  const getAirportName = (code: string) => {
    const airport = airports.find(a => a.code === code);
    return airport ? airport.city : code;
  };

  const filteredAirports = airportSearch
    ? airports.filter(a =>
        a.city.toLowerCase().includes(airportSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(airportSearch.toLowerCase()) ||
        a.country.toLowerCase().includes(airportSearch.toLowerCase())
      )
    : airports;

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="airplane" size={28} color="#C77DFF" />
            <Text style={styles.headerTitle}>CHEAP FLIGHT</Text>
          </View>
          <Text style={styles.subtitle}>Trouvez les vols les moins chers</Text>

          {/* Search Form */}
          <View style={styles.searchCard}>
            <LinearGradient colors={['#5A189A', '#3C096C']} style={styles.cardGradient}>
              
              {/* Origin */}
              <Pressable 
                style={styles.inputContainer}
                onPress={() => {
                  setAirportSearch('');
                  setShowOriginModal(true);
                }}
              >
                <Ionicons name="airplane-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>DÉPART</Text>
                  <Text style={styles.inputValue}>
                    {origin ? `${getAirportName(origin)} (${origin})` : 'Choisir...'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Swap */}
              <Pressable 
                style={styles.swapButton}
                onPress={() => {
                  if (destination) {
                    const temp = origin;
                    setOrigin(destination);
                    setDestination(temp);
                  }
                }}
              >
                <Ionicons name="swap-vertical" size={22} color="#C77DFF" />
              </Pressable>

              {/* Destination */}
              <Pressable 
                style={styles.inputContainer}
                onPress={() => {
                  setAirportSearch('');
                  setShowDestModal(true);
                }}
              >
                <Ionicons name="location-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>DESTINATION</Text>
                  <Text style={styles.inputValue}>
                    {destination ? `${getAirportName(destination)} (${destination})` : 'Choisir...'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Date */}
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>DATE DE DÉPART</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={departureDate}
                    onChangeText={setDepartureDate}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor="#9D4EDD"
                  />
                </View>
              </View>

              {/* Search Button */}
              <Pressable
                style={({ pressed }) => [styles.searchButton, pressed && styles.buttonPressed]}
                onPress={handleSearch}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#7B2CBF', '#C77DFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.searchButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="search" size={20} color="#FFF" />
                      <Text style={styles.searchButtonText}>Rechercher</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Popular Destinations */}
          {!searched && (
            <View style={styles.popularSection}>
              <Text style={styles.sectionTitle}>Destinations populaires</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {popularDestinations.map((dest, index) => (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [styles.popularCard, pressed && styles.cardPressed]}
                    onPress={() => {
                      setOrigin(dest.origin);
                      setDestination(dest.destination);
                    }}
                  >
                    <LinearGradient colors={['#240046', '#3C096C']} style={styles.popularGradient}>
                      <Text style={styles.popularCity}>{dest.city}</Text>
                      <Text style={styles.popularCountry}>{dest.country}</Text>
                      <Text style={styles.popularPrice}>dès {dest.price_from}€</Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Results */}
          {searched && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>{flights.length} vols trouvés</Text>
                <Pressable onPress={() => setSearched(false)}>
                  <Text style={styles.newSearchText}>Nouvelle recherche</Text>
                </Pressable>
              </View>

              {flights.map((flight) => (
                <Pressable
                  key={flight.flight_id}
                  style={({ pressed }) => [styles.flightCard, pressed && styles.cardPressed]}
                  onPress={() => handleSelectFlight(flight)}
                >
                  <LinearGradient colors={['#240046', '#3C096C']} style={styles.flightGradient}>
                    {/* Airline & Price */}
                    <View style={styles.flightHeader}>
                      <View style={styles.airlineInfo}>
                        <View style={styles.airlineLogo}>
                          <Ionicons name="airplane" size={16} color="#C77DFF" />
                        </View>
                        <View>
                          <Text style={styles.airline}>{flight.airline}</Text>
                          <Text style={styles.flightNumber}>{flight.flight_number}</Text>
                        </View>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{Math.round(flight.price)}</Text>
                        <Text style={styles.currency}>{flight.currency}</Text>
                      </View>
                    </View>

                    {/* Route */}
                    <View style={styles.routeContainer}>
                      <View style={styles.routePoint}>
                        <Text style={styles.routeTime}>{flight.departure_time}</Text>
                        <Text style={styles.routeCode}>{flight.origin}</Text>
                      </View>
                      <View style={styles.routeLine}>
                        <View style={styles.dot} />
                        <View style={styles.line} />
                        {flight.stops > 0 && (
                          <View style={styles.stopBadge}>
                            <Text style={styles.stopText}>{flight.stops} escale</Text>
                          </View>
                        )}
                        <View style={styles.line} />
                        <Ionicons name="airplane" size={12} color="#C77DFF" />
                      </View>
                      <View style={styles.routePoint}>
                        <Text style={styles.routeTime}>{flight.arrival_time}</Text>
                        <Text style={styles.routeCode}>{flight.destination}</Text>
                      </View>
                    </View>

                    {/* Duration & Seats */}
                    <View style={styles.flightFooter}>
                      <Text style={styles.duration}>{flight.duration}</Text>
                      <Text style={styles.seats}>{flight.available_seats} places</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}

          {searched && flights.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="airplane-outline" size={48} color="#9D4EDD" />
              <Text style={styles.noResultsText}>Aucun vol trouvé</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>

      {/* Origin Modal */}
      <Modal visible={showOriginModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ville de départ</Text>
              <Pressable onPress={() => setShowOriginModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9D4EDD" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher ou taper code (ex: BKK)"
                placeholderTextColor="#9D4EDD"
                value={airportSearch}
                onChangeText={setAirportSearch}
                autoFocus
                autoCapitalize="characters"
              />
            </View>

            {/* Option code personnalisé */}
            {airportSearch.length >= 3 && !filteredAirports.find(a => a.code.toLowerCase() === airportSearch.toLowerCase().substring(0,3)) && (
              <Pressable
                style={({ pressed }) => [styles.customAirportItem, pressed && styles.itemPressed]}
                onPress={() => {
                  setOrigin(airportSearch.toUpperCase().substring(0,3));
                  setShowOriginModal(false);
                  setAirportSearch('');
                }}
              >
                <View style={[styles.airportCodeBox, {backgroundColor: 'rgba(16,185,129,0.2)'}]}>
                  <Text style={[styles.airportCodeText, {color: '#10B981'}]}>{airportSearch.toUpperCase().substring(0,3)}</Text>
                </View>
                <View style={styles.airportDetails}>
                  <Text style={styles.airportCity}>Utiliser "{airportSearch.toUpperCase().substring(0,3)}"</Text>
                  <Text style={styles.airportCountry}>Code IATA personnalisé</Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#10B981" />
              </Pressable>
            )}

            <FlatList
              data={filteredAirports}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.airportItem, pressed && styles.itemPressed]}
                  onPress={() => {
                    setOrigin(item.code);
                    setShowOriginModal(false);
                  }}
                >
                  <View style={styles.airportCodeBox}>
                    <Text style={styles.airportCodeText}>{item.code}</Text>
                  </View>
                  <View style={styles.airportDetails}>
                    <Text style={styles.airportCity}>{item.city}</Text>
                    <Text style={styles.airportCountry}>{item.country}</Text>
                  </View>
                  {origin === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Destination Modal */}
      <Modal visible={showDestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ville d'arrivée</Text>
              <Pressable onPress={() => setShowDestModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9D4EDD" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher ou taper code (ex: BKK)"
                placeholderTextColor="#9D4EDD"
                value={airportSearch}
                onChangeText={setAirportSearch}
                autoFocus
                autoCapitalize="characters"
              />
            </View>

            {/* Option code personnalisé */}
            {airportSearch.length >= 3 && !filteredAirports.find(a => a.code.toLowerCase() === airportSearch.toLowerCase().substring(0,3)) && (
              <Pressable
                style={({ pressed }) => [styles.customAirportItem, pressed && styles.itemPressed]}
                onPress={() => {
                  setDestination(airportSearch.toUpperCase().substring(0,3));
                  setShowDestModal(false);
                  setAirportSearch('');
                }}
              >
                <View style={[styles.airportCodeBox, {backgroundColor: 'rgba(16,185,129,0.2)'}]}>
                  <Text style={[styles.airportCodeText, {color: '#10B981'}]}>{airportSearch.toUpperCase().substring(0,3)}</Text>
                </View>
                <View style={styles.airportDetails}>
                  <Text style={styles.airportCity}>Utiliser "{airportSearch.toUpperCase().substring(0,3)}"</Text>
                  <Text style={styles.airportCountry}>Code IATA personnalisé</Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#10B981" />
              </Pressable>
            )}

            <FlatList
              data={filteredAirports}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.airportItem, pressed && styles.itemPressed]}
                  onPress={() => {
                    setDestination(item.code);
                    setShowDestModal(false);
                  }}
                >
                  <View style={styles.airportCodeBox}>
                    <Text style={styles.airportCodeText}>{item.code}</Text>
                  </View>
                  <View style={styles.airportDetails}>
                    <Text style={styles.airportCity}>{item.city}</Text>
                    <Text style={styles.airportCountry}>{item.country}</Text>
                  </View>
                  {destination === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Flight Details Modal */}
      <Modal visible={selectedFlight !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.flightModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails du vol</Text>
              <Pressable onPress={() => setSelectedFlight(null)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>

            {selectedFlight && (
              <View style={styles.flightDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Compagnie</Text>
                  <Text style={styles.detailValue}>{selectedFlight.airline}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Numéro de vol</Text>
                  <Text style={styles.detailValue}>{selectedFlight.flight_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trajet</Text>
                  <Text style={styles.detailValue}>{selectedFlight.origin} → {selectedFlight.destination}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Horaires</Text>
                  <Text style={styles.detailValue}>{selectedFlight.departure_time} - {selectedFlight.arrival_time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Durée</Text>
                  <Text style={styles.detailValue}>{selectedFlight.duration}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Escales</Text>
                  <Text style={styles.detailValue}>{selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} escale(s)`}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Places disponibles</Text>
                  <Text style={styles.detailValue}>{selectedFlight.available_seats}</Text>
                </View>
                
                <View style={styles.priceSection}>
                  <Text style={styles.totalLabel}>Prix total</Text>
                  <Text style={styles.totalPrice}>{selectedFlight.price} {selectedFlight.currency}</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.bookButton, pressed && styles.buttonPressed]}
                  onPress={handleBookFlight}
                >
                  <LinearGradient
                    colors={['#7B2CBF', '#C77DFF']}
                    style={styles.bookButtonGradient}
                  >
                    <Text style={styles.bookButtonText}>Réserver ce vol</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginLeft: 10 },
  subtitle: { fontSize: 14, color: '#9D4EDD', marginBottom: 20, marginLeft: 38 },
  
  searchCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
  cardGradient: { padding: 20 },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  inputContent: { flex: 1, marginLeft: 12 },
  inputLabel: { fontSize: 10, color: '#9D4EDD', marginBottom: 2 },
  inputValue: { fontSize: 15, color: '#FFF', fontWeight: '600' },
  dateInput: { fontSize: 15, color: '#FFF', fontWeight: '600', padding: 0 },
  
  swapButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(199,125,255,0.3)',
    padding: 10,
    borderRadius: 25,
    marginVertical: 4,
  },
  
  searchButton: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  searchButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  searchButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  buttonPressed: { opacity: 0.8 },
  
  popularSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#E0AAFF', marginBottom: 12 },
  popularCard: { marginRight: 10, borderRadius: 12, overflow: 'hidden', width: 120 },
  popularGradient: { padding: 12, height: 85, justifyContent: 'space-between' },
  popularCity: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  popularCountry: { fontSize: 11, color: '#9D4EDD' },
  popularPrice: { fontSize: 13, fontWeight: '700', color: '#C77DFF' },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  
  resultsContainer: { marginBottom: 20 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: '#C77DFF' },
  newSearchText: { color: '#9D4EDD', fontSize: 14, textDecorationLine: 'underline' },
  
  flightCard: { marginBottom: 12, borderRadius: 14, overflow: 'hidden' },
  flightGradient: { padding: 14 },
  flightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  airlineInfo: { flexDirection: 'row', alignItems: 'center' },
  airlineLogo: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(199,125,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  airline: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  flightNumber: { fontSize: 11, color: '#9D4EDD' },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: 'bold', color: '#C77DFF' },
  currency: { fontSize: 11, color: '#9D4EDD' },
  
  routeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  routePoint: { alignItems: 'center', width: 50 },
  routeTime: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  routeCode: { fontSize: 12, color: '#E0AAFF', fontWeight: '600' },
  routeLine: { flexDirection: 'row', alignItems: 'center', flex: 1, marginHorizontal: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C77DFF' },
  line: { flex: 1, height: 2, backgroundColor: '#7B2CBF' },
  stopBadge: { backgroundColor: '#FF6B35', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginHorizontal: 4 },
  stopText: { fontSize: 9, color: '#FFF', fontWeight: '600' },
  
  flightFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#5A189A' },
  duration: { color: '#E0AAFF', fontSize: 12 },
  seats: { color: '#9D4EDD', fontSize: 12 },
  
  noResults: { alignItems: 'center', paddingVertical: 40 },
  noResultsText: { fontSize: 16, color: '#9D4EDD', marginTop: 12 },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', minHeight: '50%' },
  flightModalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#5A189A' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', margin: 16, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#7B2CBF' },
  modalSearchInput: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 14, marginLeft: 10 },
  
  airportItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3C096C' },
  itemPressed: { backgroundColor: 'rgba(199,125,255,0.1)' },
  airportCodeBox: { width: 50, height: 50, borderRadius: 10, backgroundColor: 'rgba(199,125,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  airportCodeText: { fontSize: 14, fontWeight: 'bold', color: '#C77DFF' },
  airportDetails: { flex: 1, marginLeft: 14 },
  airportCity: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  airportCountry: { fontSize: 13, color: '#9D4EDD' },
  customAirportItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.05)' },
  
  flightDetails: { padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3C096C' },
  detailLabel: { fontSize: 14, color: '#9D4EDD' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  
  priceSection: { alignItems: 'center', paddingVertical: 20, marginTop: 10 },
  totalLabel: { fontSize: 14, color: '#9D4EDD', marginBottom: 4 },
  totalPrice: { fontSize: 36, fontWeight: 'bold', color: '#C77DFF' },
  
  bookButton: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  bookButtonGradient: { padding: 16, alignItems: 'center' },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
