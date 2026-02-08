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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= MODELS =============
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

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
    currency: str = "USD"
    stops: int = 0
    flight_number: str = ""
    available_seats: int = 0

class SearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1

class Favorite(BaseModel):
    favorite_id: str
    user_id: str
    flight: Flight
    created_at: datetime

class PriceAlert(BaseModel):
    alert_id: str
    user_id: str
    origin: str
    destination: str
    max_price: float
    active: bool = True
    created_at: datetime

class SearchHistory(BaseModel):
    history_id: str
    user_id: str
    search_params: dict
    timestamp: datetime

# ============= AUTH HELPER =============
async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    """Get current user from session_token (cookie or header)"""
    session_token = None
    
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)

# ============= AUTH ENDPOINTS =============
@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for user data and create session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            auth_response.raise_for_status()
            user_data = auth_response.json()
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")
    
    # Create or update user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": user_data["name"],
                "picture": user_data.get("picture")
            }}
        )
    else:
        await db.users.insert_one({
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "created_at": datetime.now(timezone.utc)
        })
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return User(**user_doc)

@api_router.get("/auth/me")
async def get_me(request: Request, authorization: Optional[str] = Header(None)):
    """Get current user info"""
    user = await get_current_user(request, authorization)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, authorization: Optional[str] = Header(None)):
    """Logout user"""
    try:
        user = await get_current_user(request, authorization)
        session_token = request.cookies.get("session_token")
        if session_token:
            await db.user_sessions.delete_one({"session_token": session_token})
        response.delete_cookie("session_token", path="/")
        return {"message": "Logged out"}
    except:
        return {"message": "Logged out"}

# ============= FLIGHT SEARCH =============
@api_router.post("/flights/search")
async def search_flights(search: SearchRequest, request: Request, authorization: Optional[str] = Header(None)):
    """Search flights (mock data until Amadeus API is integrated)"""
    user = await get_current_user(request, authorization)
    
    # Save to search history
    history_id = f"history_{uuid.uuid4().hex[:12]}"
    await db.search_history.insert_one({
        "history_id": history_id,
        "user_id": user.user_id,
        "search_params": search.dict(),
        "timestamp": datetime.now(timezone.utc)
    })
    
    # TODO: Replace with real Amadeus API call
    # For now, return mock data
    mock_flights = [
        {
            "flight_id": f"FL{uuid.uuid4().hex[:8].upper()}",
            "airline": "Air France",
            "airline_logo": "https://images.kiwi.com/airlines/64/AF.png",
            "origin": search.origin,
            "destination": search.destination,
            "departure_time": f"{search.departure_date}T08:00:00",
            "arrival_time": f"{search.departure_date}T14:30:00",
            "duration": "6h 30m",
            "price": 450.00,
            "currency": "USD",
            "stops": 0,
            "flight_number": "AF1234",
            "available_seats": 12
        },
        {
            "flight_id": f"FL{uuid.uuid4().hex[:8].upper()}",
            "airline": "Lufthansa",
            "airline_logo": "https://images.kiwi.com/airlines/64/LH.png",
            "origin": search.origin,
            "destination": search.destination,
            "departure_time": f"{search.departure_date}T10:15:00",
            "arrival_time": f"{search.departure_date}T17:00:00",
            "duration": "6h 45m",
            "price": 520.00,
            "currency": "USD",
            "stops": 1,
            "flight_number": "LH5678",
            "available_seats": 8
        },
        {
            "flight_id": f"FL{uuid.uuid4().hex[:8].upper()}",
            "airline": "Emirates",
            "airline_logo": "https://images.kiwi.com/airlines/64/EK.png",
            "origin": search.origin,
            "destination": search.destination,
            "departure_time": f"{search.departure_date}T15:30:00",
            "arrival_time": f"{search.departure_date}T23:00:00",
            "duration": "7h 30m",
            "price": 380.00,
            "currency": "USD",
            "stops": 1,
            "flight_number": "EK9012",
            "available_seats": 20
        }
    ]
    
    return {"flights": mock_flights, "count": len(mock_flights)}

# ============= FAVORITES =============
@api_router.post("/flights/favorites")
async def add_favorite(flight: Flight, request: Request, authorization: Optional[str] = Header(None)):
    """Add flight to favorites"""
    user = await get_current_user(request, authorization)
    
    favorite_id = f"fav_{uuid.uuid4().hex[:12]}"
    await db.favorites.insert_one({
        "favorite_id": favorite_id,
        "user_id": user.user_id,
        "flight": flight.dict(),
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Added to favorites", "favorite_id": favorite_id}

@api_router.get("/flights/favorites")
async def get_favorites(request: Request, authorization: Optional[str] = Header(None)):
    """Get user's favorite flights"""
    user = await get_current_user(request, authorization)
    
    favorites = await db.favorites.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"favorites": favorites}

@api_router.delete("/flights/favorites/{favorite_id}")
async def remove_favorite(favorite_id: str, request: Request, authorization: Optional[str] = Header(None)):
    """Remove flight from favorites"""
    user = await get_current_user(request, authorization)
    
    result = await db.favorites.delete_one({
        "favorite_id": favorite_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

# ============= PRICE ALERTS =============
@api_router.post("/alerts")
async def create_alert(alert_data: dict, request: Request, authorization: Optional[str] = Header(None)):
    """Create price alert"""
    user = await get_current_user(request, authorization)
    
    alert_id = f"alert_{uuid.uuid4().hex[:12]}"
    await db.price_alerts.insert_one({
        "alert_id": alert_id,
        "user_id": user.user_id,
        "origin": alert_data["origin"],
        "destination": alert_data["destination"],
        "max_price": alert_data["max_price"],
        "active": True,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Alert created", "alert_id": alert_id}

@api_router.get("/alerts")
async def get_alerts(request: Request, authorization: Optional[str] = Header(None)):
    """Get user's price alerts"""
    user = await get_current_user(request, authorization)
    
    alerts = await db.price_alerts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"alerts": alerts}

@api_router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, request: Request, authorization: Optional[str] = Header(None)):
    """Delete price alert"""
    user = await get_current_user(request, authorization)
    
    result = await db.price_alerts.delete_one({
        "alert_id": alert_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert deleted"}

# ============= SEARCH HISTORY =============
@api_router.get("/history")
async def get_history(request: Request, authorization: Optional[str] = Header(None)):
    """Get user's search history"""
    user = await get_current_user(request, authorization)
    
    history = await db.search_history.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    
    return {"history": history}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
