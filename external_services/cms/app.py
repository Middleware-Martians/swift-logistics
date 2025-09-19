from fastapi import FastAPI
from db_conf import Base, engine
from routes import soapRoutes as soap_clients
from routes import simpleRoutes as simple_clients

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include routers
app.include_router(soap_clients.router)
app.include_router(simple_clients.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
