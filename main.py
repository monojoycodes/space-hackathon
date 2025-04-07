import logging
from fastapi import FastAPI

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

# Include the items router
app.include_router(items_router, tags=["Items Management"])

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Docker working correctly at port 8000",
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
    uvicorn.run(app, host="127.0.0.1", port=8000)