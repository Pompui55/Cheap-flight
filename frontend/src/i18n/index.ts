
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  fr: {
    // Header
    appName: 'CHEAP FLIGHT',
    subtitle: 'Trouvez les vols les moins chers',
    
    // Search form
    departure: 'DÉPART',
    destination: 'DESTINATION',
    choose: 'Choisir...',
    departureDate: 'DATE DE DÉPART',
    returnDate: 'DATE DE RETOUR',
    chooseDate: 'Choisir une date',
    travelers: 'VOYAGEURS',
    passenger: 'passager',
    passengers: 'passagers',
    search: 'Rechercher',
    oneWay: 'Aller simple',
    flexibleDates: 'Dates flexibles (±3 jours)',
    roundTrip: 'Aller-retour',
    
    // Destinations
    popularDestinations: 'Destinations populaires',
    from: 'dès',
    
    // Results
    flightsFound: 'vols trouvés',
    newSearch: 'Nouvelle recherche',
    noFlights: 'Aucun vol trouvé',
    stopover: 'escale',
    seats: 'places',
    direct: 'Direct',
    
    // Modal
    departureCity: 'Ville de départ',
    arrivalCity: "Ville d'arrivée",
    searchOrType: 'Rechercher ou taper code (ex: BKK)',
    useCode: 'Utiliser',
    customIATA: 'Code IATA personnalisé',
    
    // Flight details
    flightDetails: 'Détails du vol',
    airline: 'Compagnie',
    flightNumber: 'Numéro de vol',
    route: 'Trajet',
    schedule: 'Horaires',
    duration: 'Durée',
    stopovers: 'Escales',
    availableSeats: 'Places disponibles',
    totalPrice: 'Prix total',
    bookFlight: 'Réserver ce vol',
    
    // Errors
    errorTitle: 'Erreur',
    selectDepartureDestination: 'Veuillez sélectionner le départ et la destination',
    differentCities: 'Le départ et la destination doivent être différents',
    selectDate: 'Veuillez sélectionner une date de départ',
    linkError: "Impossible d'ouvrir le lien vers Aviasales",
  },
  
  en: {
    // Header
    appName: 'CHEAP FLIGHT',
    subtitle: 'Find the cheapest flights',
    
    // Search form
    departure: 'DEPARTURE',
    destination: 'DESTINATION',
    choose: 'Choose...',
    departureDate: 'DEPARTURE DATE',
    returnDate: 'RETURN DATE',
    chooseDate: 'Choose a date',
    travelers: 'TRAVELERS',
    passenger: 'passenger',
    passengers: 'passengers',
    search: 'Search',
    oneWay: 'One way',
    flexibleDates: 'Flexible dates (±3 days)',
    roundTrip: 'Round trip',
    
    // Destinations
    popularDestinations: 'Popular destinations',
    from: 'from',
    
    // Results
    flightsFound: 'flights found',
    newSearch: 'New search',
    noFlights: 'No flights found',
    stopover: 'stopover',
    seats: 'seats',
    direct: 'Direct',
    
    // Modal
    departureCity: 'Departure city',
    arrivalCity: 'Arrival city',
    searchOrType: 'Search or type code (e.g. BKK)',
    useCode: 'Use',
    customIATA: 'Custom IATA code',
    
    // Flight details
    flightDetails: 'Flight details',
    airline: 'Airline',
    flightNumber: 'Flight number',
    route: 'Route',
    schedule: 'Schedule',
    duration: 'Duration',
    stopovers: 'Stopovers',
    availableSeats: 'Available seats',
    totalPrice: 'Total price',
    bookFlight: 'Book this flight',
    
    // Errors
    errorTitle: 'Error',
    selectDepartureDestination: 'Please select departure and destination',
    differentCities: 'Departure and destination must be different',
    selectDate: 'Please select a departure date',
    linkError: 'Unable to open Aviasales link',
  },
};

const i18n = new I18n(translations);

// Détecte la langue du téléphone
const deviceLanguage = getLocales()[0]?.languageCode || 'fr';
i18n.locale = deviceLanguage === 'en' ? 'en' : 'fr';
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

export default i18n;
