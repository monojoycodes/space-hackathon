from pydantic import BaseModel
from typing import List, Dict, Optional, Tuple, Annotated
from datetime import datetime
import itertools

# Coordinates model for defining positions
class CoordinatesModel(BaseModel):
    width: float
    depth: float
    height: float

# Position model for defining the start and end coordinates of an item
class Position(BaseModel):
    startCoordinates: CoordinatesModel
    endCoordinates: CoordinatesModel

# Forward declare Item for type hints
class Item(BaseModel):
    pass

# Container schema - shared across the application
class Container(BaseModel):
    id: str
    zone: str
    width_cm: float
    depth_cm: float
    height_cm: float
    stored_items: List["Item"] = []  # Use string literal for forward reference

# Redefine Item with full implementation
class Item(BaseModel):
    id: str
    name: str
    width_cm: float       # in cm
    depth_cm: float       # in cm
    height_cm: float      # in cm
    mass_kg: float        # in kg
    priority: int
    expiry_date: Optional[str] = None   # ISO format (YYYY-MM-DD) or null
    usage_limit: Optional[int] = None
    preferred_zone: str
    current_zone: Optional[str] = None
    usage_count: int = 0
    added_date: datetime = datetime.utcnow()
    position: Optional[Position] = None
    
    # Helper methods for item functionality
    def get_orientations(self) -> List[Tuple[float, float, float]]:
        dims = [self.width_cm, self.depth_cm, self.height_cm]
        orientations = set()
        for perm in itertools.permutations(dims):
            orientations.add(perm)
        return list(orientations)
    
    def fits_in_container(self, orientation: Tuple[float, float, float], container: Container) -> bool:
        w, d, h = orientation
        return (w <= container.width_cm and 
                d <= container.depth_cm and 
                h <= container.height_cm)

# Type annotation models
Container.model_rebuild()
Item.model_rebuild()