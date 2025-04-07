# 🚀 Space Station Cargo Management System API

This repository provides a minimal and modular implementation of the **Space Station Cargo Management System API** for the hackathon. Built using **Python** and **FastAPI**, it demonstrates a simple, containerized approach to solving item placement within constrained 3D spaces.

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/monojoycodes/space-hackathon.git
cd space-hackathon
```

### 2. Build the Docker Image
```bash
docker build -t cargo-management .
```

### 3. Run the Container
```bash
docker run -p 8000:8000 cargo-management
```

### 4. Access the API
Visit [http://localhost:8000](http://localhost:8000) in your browser.

Note: The venv/ directory is excluded from version control. Always use requirements.txt to recreate the virtual environment.

---

## 🗂️ Project Structure
```
fb1/
├── models/               # Pydantic models for data validation
├── routes/               # API route handlers (e.g., items.py)
├── services/             # Business logic and utility functions
├── Test/                 # Unit and integration test scripts
├── venv/                 # Virtual environment (excluded from Git)
├── __pycache__/          # Python bytecode cache
├── containers.csv        # Sample container configuration
├── input_items.csv       # Sample items for placement
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker image instructions
├── main.py               # FastAPI app entry point
├── requirements.txt      # Project dependencies
└── README.md             # Project documentation
```

---

## 📘 API Reference

### 🔄 Item Placement Endpoint
- **Endpoint:** `POST /api/placement`

#### ✅ Request Format
```json
{
  "items": [
    {
      "itemId": "item-1",
      "name": "Example Item",
      "width": 10,
      "depth": 10,
      "height": 10,
      "mass": 1,
      "priority": 1,
      "preferredZone": "A"
    }
  ],
  "containers": [
    {
      "containerId": "container-1",
      "zone": "A",
      "width": 100,
      "depth": 100,
      "height": 100
    }
  ]
}
```

#### ✅ Response Format
```json
{
  "success": true,
  "placements": [
    {
      "itemId": "item-1",
      "containerId": "container-1",
      "position": {
        "startCoordinates": {"width": 0, "depth": 0, "height": 0},
        "endCoordinates": {"width": 10, "depth": 10, "height": 10}
      }
    }
  ]
}
```

---

## ✅ Key Features
- Placement API (Sample provided. Use your own code instead.)
- Search API
- Retrieve API
- Place API
- Waste Management APIs
- Time Simulation API
- Import/Export APIs
- Logging API
---


