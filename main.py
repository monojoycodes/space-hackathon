import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the items router
from routes.items import router as items_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create the FastAPI application
app = FastAPI(
    title="Storage Management System",
    description="API for managing storage containers and items",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the items router
app.include_router(items_router, tags=["Items Management"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Storage Management System API",
        "endpoints": {
            "Place Items": "/api/place/",
            "Retrieve Item": "/api/retrieve/",
            "Waste Items": "/api/waste/identify/",
            "Simulate Day": "/api/simulate/day/",
            "Get Logs": "/api/logs/"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)