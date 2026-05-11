export const translations = {
  fr: {
    // Navigation
    flights: "Vols",
    hotels: "Hôtels", 
    cars: "Voitures",
    favorites: "Favoris",
    alerts: "Alertes",
    profile: "Profil",
    
    // Search
    departure: "DÉPART",
    destination: "DESTINATION",
    departureDate: "DATE DE DÉPART",
    travelers: "VOYAGEURS",
    search: "Rechercher",
    findCheapestFlights: "Trouvez les vols les moins chers",
    chooseCity: "Choisir...",
    
    // Hotels
    city: "VILLE",
    checkIn: "ARRIVÉE",
    checkOut: "DÉPART",
    guests: "VOYAGEURS",
    findBestHotels: "Trouvez les meilleurs hôtels",
    chooseDate: "Choisir une date",
    person: "personne",
    persons: "personnes",
    
    // Cars
    pickupLocation: "LIEU DE PRISE EN CHARGE",
    pickupDate: "DATE DE PRISE EN CHARGE",
    returnDate: "DATE DE RETOUR",
    rentAtBestPrice: "Louez au meilleur prix",
    
    // Profile
    settings: "Paramètres",
    editProfile: "Modifier le profil",
    history: "Historique",
    language: "Langue",
    support: "Support",
    helpCenter: "Centre d'aide",
    termsConditions: "Conditions d'utilisation",
    privacyPolicy: "Politique de confidentialité",
    logout: "Déconnexion",
    login: "Se connecter",
    
    // Common
    error: "Erreur",
    cancel: "Annuler",
    confirm: "Confirmer",
    comingSoon: "Fonctionnalité bientôt disponible",
    redirectPartner: "Vous serez redirigé vers notre partenaire",
    freeCancellation: "Annulation gratuite",
    noHiddenFees: "Pas de frais cachés",
    support247: "Assistance 24/7",
    searchCity: "Rechercher une ville...",
    selectDates: "Veuillez sélectionner les dates",
  },
  
  en: {
    // Navigation
    flights: "Flights",
    hotels: "Hotels",
    cars: "Cars", 
    favorites: "Favorites",
    alerts: "Alerts",
    profile: "Profile",
    
    // Search
    departure: "DEPARTURE",
    destination: "DESTINATION", 
    departureDate: "DEPARTURE DATE",
    travelers: "TRAVELERS",
    search: "Search",
    findCheapestFlights: "Find the cheapest flights",
    chooseCity: "Choose...",
    
    // Hotels
    city: "CITY",
    checkIn: "CHECK-IN",
    checkOut: "CHECK-OUT",
    guests: "GUESTS",
    findBestHotels: "Find the best hotels",
    chooseDate: "Choose a date",
    person: "person",
    persons: "persons",
    
    // Cars
    pickupLocation: "PICKUP LOCATION",
    pickupDate: "PICKUP DATE",
    returnDate: "RETURN DATE",
    rentAtBestPrice: "Rent at the best price",
    
    // Profile
    settings: "Settings",
    editProfile: "Edit Profile",
    history: "History",
    language: "Language",
    support: "Support",
    helpCenter: "Help Center",
    termsConditions: "Terms & Conditions",
    privacyPolicy: "Privacy Policy",
    logout: "Logout",
    login: "Login",
    
    // Common
    error: "Error",
    cancel: "Cancel",
    confirm: "Confirm",
    comingSoon: "Feature coming soon",
    redirectPartner: "You will be redirected to our partner",
    freeCancellation: "Free cancellation",
    noHiddenFees: "No hidden fees",
    support247: "24/7 Support",
    searchCity: "Search a city...",
    selectDates: "Please select the dates",
  }
};

export type Language = 'fr' | 'en';
export type TranslationKey = keyof typeof translations.fr;
