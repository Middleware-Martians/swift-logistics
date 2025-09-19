from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db_conf import Base, engine
from routes import soapRoutes as soap_clients
from routes import simpleRoutes as simple_clients

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(soap_clients.router)
app.include_router(simple_clients.router)
app.include_router(simple_clients.order_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
