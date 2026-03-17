from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'cheap_flight')]

# Aviationstack API
AVIATIONSTACK_API_KEY = os.environ.get('AVIATIONSTACK_API_KEY', '')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="CHEAP FLIGHT API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= MODELS =============
class Flight(BaseModel):
    flight_id: str
    airline: str
    airline_logo: Optional[str] = None
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    duration: str
    price: float
    currency: str = "EUR"
    stops: int = 0
    flight_number: str = ""
    available_seats: int = 0

class SearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1

# ============= AIRPORTS DATA =============
AIRPORTS = {
    "CDG": {"city": "Paris", "country": "France", "name": "Charles de Gaulle"},
    "ORY": {"city": "Paris", "country": "France", "name": "Orly"},
    "LHR": {"city": "London", "country": "UK", "name": "Heathrow"},
    "JFK": {"city": "New York", "country": "USA", "name": "John F. Kennedy"},
    "LAX": {"city": "Los Angeles", "country": "USA", "name": "Los Angeles Intl"},
    "DXB": {"city": "Dubai", "country": "UAE", "name": "Dubai Intl"},
    "SIN": {"city": "Singapore", "country": "Singapore", "name": "Changi"},
    "HND": {"city": "Tokyo", "country": "Japan", "name": "Haneda"},
    "FCO": {"city": "Rome", "country": "Italy", "name": "Fiumicino"},
    "BCN": {"city": "Barcelona", "country": "Spain", "name": "El Prat"},
    "MAD": {"city": "Madrid", "country": "Spain", "name": "Barajas"},
    "AMS": {"city": "Amsterdam", "country": "Netherlands", "name": "Schiphol"},
    "FRA": {"city": "Frankfurt", "country": "Germany", "name": "Frankfurt"},
    "IST": {"city": "Istanbul", "country": "Turkey", "name": "Istanbul"},
    "BKK": {"city": "Bangkok", "country": "Thailand", "name": "Suvarnabhumi"},
    "CMN": {"city": "Casablanca", "country": "Morocco", "name": "Mohammed V"},
    "ALG": {"city": "Algiers", "country": "Algeria", "name": "Houari Boumediene"},
    "TUN": {"city": "Tunis", "country": "Tunisia", "name": "Carthage"},
    "ABJ": {"city": "Abidjan", "country": "Ivory Coast", "name": "Félix-Houphouët-Boigny"},
    "DKR": {"city": "Dakar", "country": "Senegal", "name": "Blaise Diagne"},
    "NYC": {"city": "New York", "country": "USA", "name": "All Airports"},
    "PAR": {"city": "Paris", "country": "France", "name": "All Airports"},
    "LON": {"city": "London", "country": "UK", "name": "All Airports"},
}

AIRLINES = [
    {"code": "AF", "name": "Air France"},
    {"code": "LH", "name": "Lufthansa"},
    {"code": "BA", "name": "British Airways"},
    {"code": "EK", "name": "Emirates"},
    {"code": "QR", "name": "Qatar Airways"},
    {"code": "TK", "name": "Turkish Airlines"},
    {"code": "KL", "name": "KLM"},
    {"code": "IB", "name": "Iberia"},
    {"code": "AT", "name": "Royal Air Maroc"},
    {"code": "AH", "name": "Air Algérie"},
]

# ============= FLIGHT SEARCH =============
async def get_aviationstack_flights(origin: str, destination: str, flight_date: str):
    """Get real flight data from Aviationstack API"""
    if not AVIATIONSTACK_API_KEY:
        logger.warning("Aviationstack API key not found")
        return []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            params = {
                'access_key': AVIATIONSTACK_API_KEY,
                'dep_iata': origin.upper(),
                'arr_iata': destination.upper(),
                'limit': 20
            }
            
            response = await http_client.get(
                'http://api.aviationstack.com/v1/flights',
                params=params
            )
            
            if response.status_code != 200:
                logger.error(f"Aviationstack API error: {response.status_code}")
                return []
            
            data = response.json()
            flights = data.get('data', [])
            
            transformed_flights = []
            for flight in flights:
                try:
                    dep_time = flight.get('departure', {}).get('scheduled')
                    arr_time = flight.get('arrival', {}).get('scheduled')
                    
                    if dep_time and arr_time:
                        dep_dt = datetime.fromisoformat(dep_time.replace('Z', '+00:00'))
                        arr_dt = datetime.fromisoformat(arr_time.replace('Z', '+00:00'))
                        duration_mins = int((arr_dt - dep_dt).total_seconds() / 60)
                        duration = f"{duration_mins // 60}h {duration_mins % 60}m"
                    else:
                        duration = "N/A"
                    
                    # Generate price based on duration
                    base_price = 50 + (duration_mins // 60 * 30) + random.randint(-20, 50)
                    
                    transformed_flight = {
                        "flight_id": flight.get('flight', {}).get('iata', f"FL{uuid.uuid4().hex[:8].upper()}"),
                        "airline": flight.get('airline', {}).get('name', 'Unknown Airline'),
                        "airline_logo": f"https://images.kiwi.com/airlines/64/{flight.get('airline', {}).get('iata', 'XX')}.png",
                        "origin": flight.get('departure', {}).get('iata', origin),
                        "destination": flight.get('arrival', {}).get('iata', destination),
                        "departure_time": dep_time or f"{flight_date}T00:00:00",
                        "arrival_time": arr_time or f"{flight_date}T00:00:00",
                        "duration": duration,
                        "price": float(base_price),
                        "currency": "EUR",
                        "stops": 0,
                        "flight_number": flight.get('flight', {}).get('iata', 'N/A'),
                        "available_seats": random.randint(5, 50)
                    }
                    transformed_flights.append(transformed_flight)
                except Exception as e:
                    logger.error(f"Error transforming flight: {e}")
                    continue
            
            return transformed_flights
            
    except Exception as e:
        logger.error(f"Aviationstack API error: {e}")
        return []

def generate_mock_flights(origin: str, destination: str, flight_date: str, count: int = 8):
    """Generate mock flight data"""
    flights = []
    
    base_prices = {
        ("CDG", "JFK"): 450, ("PAR", "NYC"): 450, ("CDG", "DXB"): 380,
        ("CDG", "BCN"): 85, ("CDG", "LHR"): 95, ("PAR", "LON"): 95,
        ("CDG", "FCO"): 110, ("CDG", "CMN"): 120,
    }
    base_price = base_prices.get((origin.upper(), destination.upper()), random.randint(150, 600))
    
    for i in range(count):
        airline = random.choice(AIRLINES)
        hour = random.randint(6, 22)
        minute = random.choice([0, 15, 30, 45])
        
        # Duration based on destination
        if origin.upper()[:1] == destination.upper()[:1]:
            duration_hours = random.randint(1, 3)
        else:
            duration_hours = random.randint(4, 12)
        duration_mins = random.choice([0, 15, 30, 45])
        
        arr_hour = (hour + duration_hours) % 24
        arr_minute = (minute + duration_mins) % 60
        
        price_var = random.uniform(0.8, 1.3)
        stops = random.choices([0, 1], weights=[70, 30])[0]
        if stops > 0:
            price_var *= 0.85
        
        flight = {
            "flight_id": f"FL{uuid.uuid4().hex[:8].upper()}",
            "airline": airline["name"],
            "airline_logo": f"https://images.kiwi.com/airlines/64/{airline['code']}.png",
            "origin": origin.upper(),
            "destination": destination.upper(),
            "departure_time": f"{flight_date}T{hour:02d}:{minute:02d}:00",
            "arrival_time": f"{flight_date}T{arr_hour:02d}:{arr_minute:02d}:00",
            "duration": f"{duration_hours}h {duration_mins}m",
            "price": round(base_price * price_var, 2),
            "currency": "EUR",
            "stops": stops,
            "flight_number": f"{airline['code']}{random.randint(100, 9999)}",
            "available_seats": random.randint(3, 45)
        }
        flights.append(flight)
    
    flights.sort(key=lambda x: x["price"])
    return flights

# ============= API ROUTES (PUBLIC - NO AUTH REQUIRED) =============

@api_router.get("/")
async def root():
    return {
        "message": "CHEAP FLIGHT API",
        "status": "online",
        "version": "2.0",
        "aviationstack": "enabled" if AVIATIONSTACK_API_KEY else "disabled"
    }

@api_router.get("/airports")
async def get_airports(query: str = None):
    """Search airports"""
    if not query or len(query) < 2:
        return [{"code": k, **v} for k, v in list(AIRPORTS.items())[:10]]
    
    query_lower = query.lower()
    results = []
    for code, info in AIRPORTS.items():
        if (query_lower in code.lower() or 
            query_lower in info["city"].lower() or 
            query_lower in info["country"].lower()):
            results.append({"code": code, **info})
    return results[:10]

@api_router.post("/flights/search")
async def search_flights(search: SearchRequest):
    """Search flights - NO AUTH REQUIRED"""
    origin = search.origin.upper()
    destination = search.destination.upper()
    
    # Map city codes to airport codes
    city_to_airport = {"PAR": "CDG", "NYC": "JFK", "LON": "LHR"}
    origin = city_to_airport.get(origin, origin)
    destination = city_to_airport.get(destination, destination)
    
    # Try real API first
    flights = await get_aviationstack_flights(origin, destination, search.departure_date)
    
    # Fallback to mock data
    if not flights:
        logger.info("Using mock data")
        flights = generate_mock_flights(origin, destination, search.departure_date)
    
    # Save to search history (anonymous)
    await db.search_history.insert_one({
        "id": str(uuid.uuid4()),
        "origin": origin,
        "destination": destination,
        "departure_date": search.departure_date,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"flights": flights, "count": len(flights)}

@api_router.get("/flights/popular")
async def get_popular():
    """Get popular destinations"""
    return [
        {"origin": "CDG", "destination": "BCN", "city": "Barcelona", "country": "Spain", "price_from": 85},
        {"origin": "CDG", "destination": "LHR", "city": "London", "country": "UK", "price_from": 95},
        {"origin": "CDG", "destination": "FCO", "city": "Rome", "country": "Italy", "price_from": 99},
        {"origin": "CDG", "destination": "MAD", "city": "Madrid", "country": "Spain", "price_from": 89},
        {"origin": "CDG", "destination": "AMS", "city": "Amsterdam", "country": "Netherlands", "price_from": 79},
        {"origin": "CDG", "destination": "CMN", "city": "Casablanca", "country": "Morocco", "price_from": 120},
        {"origin": "CDG", "destination": "JFK", "city": "New York", "country": "USA", "price_from": 380},
        {"origin": "CDG", "destination": "DXB", "city": "Dubai", "country": "UAE", "price_from": 350},
    ]

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
