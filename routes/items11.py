import logging
import heapq
import json
import csv
import io
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Body, Form
from fastapi.responses import FileResponse
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from models.storage import Item, Container, Position, CoordinatesModel
from services.storage_service import (
    containers, storage_map, action_logs, log_action,
    is_blocked, remove_from_storage, generate_movement_plan
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Pydantic models for request and response validation
class CoordinatesModel(BaseModel):
    width: float
    depth: float
    height: float

class PositionModel(BaseModel):
    startCoordinates: CoordinatesModel
    endCoordinates: CoordinatesModel

class ItemRequestModel(BaseModel):
    itemId: str
    name: str
    width: float
    depth: float
    height: float
    priority: int
    expiryDate: Optional[str] = None
    usageLimit: Optional[int] = None
    preferredZone: Optional[str] = None

class ContainerRequestModel(BaseModel):
    containerId: str
    zone: str
    width: float
    depth: float
    height: float

class PlacementRequestModel(BaseModel):
    items: List[ItemRequestModel]
    containers: List[ContainerRequestModel]

class PlacementResponseModel(BaseModel):
    itemId: str
    containerId: str
    position: PositionModel

class RearrangementStepModel(BaseModel):
    step: int
    action: str  # "move", "remove", "place"
    itemId: str
    fromContainer: Optional[str] = None
    fromPosition: Optional[PositionModel] = None
    toContainer: Optional[str] = None
    toPosition: Optional[PositionModel] = None

class PlacementResponseBodyModel(BaseModel):
    success: bool
    placements: List[PlacementResponseModel]
    rearrangements: List[RearrangementStepModel]

class RetrievalStepModel(BaseModel):
    step: int
    action: str  # "remove", "setAside", "retrieve", "placeBack"
    itemId: str
    itemName: str

class ItemResponseModel(BaseModel):
    itemId: str
    name: str
    containerId: str
    zone: str
    position: PositionModel

class SearchResponseModel(BaseModel):
    success: bool
    found: bool
    item: Optional[ItemResponseModel] = None
    retrievalSteps: List[RetrievalStepModel] = []

class RetrieveRequestModel(BaseModel):
    itemId: str
    userId: str
    timestamp: str

class SimpleResponseModel(BaseModel):
    success: bool

class PlaceRequestModel(BaseModel):
    itemId: str
    userId: str
    timestamp: str
    containerId: str
    position: PositionModel

# New Pydantic models for the waste management, time simulation, and logging APIs

class WasteItemModel(BaseModel):
    itemId: str
    name: str
    reason: str  # "Expired", "OutOfUses"
    containerId: str
    position: PositionModel

class WasteIdentifyResponseModel(BaseModel):
    success: bool
    wasteItems: List[WasteItemModel]

class ReturnItemModel(BaseModel):
    itemId: str
    name: str
    reason: str

class ReturnManifestModel(BaseModel):
    undockingContainerId: str
    undockingDate: str
    returnItems: List[ReturnItemModel]
    totalVolume: float
    totalWeight: float

class ReturnPlanStepModel(BaseModel):
    step: int
    itemId: str
    itemName: str
    fromContainer: str
    toContainer: str

class ReturnPlanResponseModel(BaseModel):
    success: bool
    returnPlan: List[ReturnPlanStepModel]
    retrievalSteps: List[RetrievalStepModel]
    returnManifest: ReturnManifestModel

class UndockingRequestModel(BaseModel):
    undockingContainerId: str
    timestamp: str

class UndockingResponseModel(BaseModel):
    success: bool
    itemsRemoved: int

class ReturnPlanRequestModel(BaseModel):
    undockingContainerId: str
    undockingDate: str
    maxWeight: float

class SimulationItemModel(BaseModel):
    itemId: Optional[str] = None
    name: Optional[str] = None

class SimulationRequestModel(BaseModel):
    numOfDays: Optional[int] = None
    toTimestamp: Optional[str] = None
    itemsToBeUsedPerDay: List[SimulationItemModel]

class SimulationUsedItemModel(BaseModel):
    itemId: str
    name: str
    remainingUses: int

class SimulationExpiredItemModel(BaseModel):
    itemId: str
    name: str

class SimulationChangesModel(BaseModel):
    itemsUsed: List[SimulationUsedItemModel]
    itemsExpired: List[SimulationExpiredItemModel]
    itemsDepletedToday: List[SimulationExpiredItemModel]

class SimulationResponseModel(BaseModel):
    success: bool
    newDate: str
    changes: SimulationChangesModel

class ImportErrorModel(BaseModel):
    row: int
    message: str

class ImportResponseModel(BaseModel):
    success: bool
    itemsImported: int
    errors: List[ImportErrorModel]

class ContainerImportResponseModel(BaseModel):
    success: bool
    containersImported: int
    errors: List[ImportErrorModel]

class LogDetailModel(BaseModel):
    fromContainer: Optional[str] = None
    toContainer: Optional[str] = None
    reason: Optional[str] = None

class LogModel(BaseModel):
    timestamp: str
    userId: str
    actionType: str
    itemId: str
    details: LogDetailModel

class LogResponseModel(BaseModel):
    logs: List[LogModel]

# Existing API endpoints...
@router.post("/api/placement", response_model=PlacementResponseBodyModel)
def get_placement_recommendations(request: PlacementRequestModel):
    """
    Generate recommendations for placing items in containers,
    including any necessary rearrangements.
    """
    # Convert request models to internal data structures
    items_to_place = []
    for item_req in request.items:
        item = Item(
            id=item_req.itemId,
            name=item_req.name,
            width_cm=item_req.width,
            depth_cm=item_req.depth,
            height_cm=item_req.height,
            mass_kg=1.0,  # Default value since not provided
            priority=item_req.priority,
            preferred_zone=item_req.preferredZone or "",
            expiry_date=item_req.expiryDate,
            usage_limit=item_req.usageLimit,
            usage_count=0
        )
        items_to_place.append(item)
    
    # Handle container definitions
    container_map = {}
    for container_req in request.containers:
        container = Container(
            id=container_req.containerId,
            zone=container_req.zone,
            width_cm=container_req.width,
            depth_cm=container_req.depth,
            height_cm=container_req.height,
            stored_items=[]
        )
        container_map[container_req.containerId] = container
    
    # Call the placement algorithm
    placements = []
    rearrangements = []
    
    # Algorithm to generate placements and rearrangements
    # This is a placeholder for the actual implementation
    try:
        # Sort items by priority (higher priority first)
        sorted_items = sorted(items_to_place, key=lambda x: -x.priority)
        
        # Assign preferred zones when possible
        step_counter = 1
        
        for item in sorted_items:
            placed = False
            preferred_container = None
            
            # Try to place in preferred zone first
            if item.preferred_zone:
                for container in container_map.values():
                    if container.zone == item.preferred_zone:
                        preferred_container = container
                        # Check if item fits in this container
                        if (container.width_cm >= item.width_cm and 
                            container.depth_cm >= item.depth_cm and 
                            container.height_cm >= item.height_cm):
                            

                            # Calculate position (simple algorithm - place at origin)
                            start_coords = CoordinatesModel(width=0, depth=0, height=0)
                            end_coords = CoordinatesModel(
                                width=item.width_cm,
                                depth=item.depth_cm,
                                height=item.height_cm
                            )
                            position = PositionModel(
                                startCoordinates=start_coords,
                                endCoordinates=end_coords
                            )
                            
                            # Add to placements
                            placements.append(PlacementResponseModel(
                                itemId=item.id,
                                containerId=container.id,
                                position=position
                            ))
                            
                            # Store the item in the container
                            container.stored_items.append(item)
                            placed = True
                            break
            
            # If not placed in preferred zone, try any container
            if not placed:
                for container in container_map.values():
                    if (container.width_cm >= item.width_cm and 
                        container.depth_cm >= item.depth_cm and 
                        container.height_cm >= item.height_cm):
                        
                        # Calculate position
                        start_coords = CoordinatesModel(width=0, depth=0, height=0)
                        end_coords = CoordinatesModel(
                            width=item.width_cm,
                            depth=item.depth_cm,
                            height=item.height_cm
                        )
                        position = PositionModel(
                            startCoordinates=start_coords,
                            endCoordinates=end_coords
                        )
                        
                        # Add to placements
                        placements.append(PlacementResponseModel(
                            itemId=item.id,
                            containerId=container.id,
                            position=position
                        ))
                        
                        # If we couldn't place in preferred zone, add rearrangement steps
                        if preferred_container and container.id != preferred_container.id:
                            # Need to rearrange some items to make space in preferred container
                            # This is a placeholder for actual rearrangement logic
                            rearrangements.append(RearrangementStepModel(
                                step=step_counter,
                                action="move",
                                itemId=item.id,
                                toContainer=container.id,
                                toPosition=position
                            ))
                            step_counter += 1
                        
                        # Store the item in the container
                        container.stored_items.append(item)
                        placed = True
                        break
            
            # If still not placed, we need more complex rearrangement
            if not placed:
                # This would involve more sophisticated algorithms
                # For now, we'll just indicate that placement failed
                logger.error(f"Could not place item {item.id}")
                
        return PlacementResponseBodyModel(
            success=True,
            placements=placements,
            rearrangements=rearrangements
        )
        
    except Exception as e:
        logger.error(f"Error generating placement recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate placement recommendations")

@router.get("/api/search", response_model=SearchResponseModel)
def search_item(itemId: Optional[str] = None, itemName: Optional[str] = None, userId: Optional[str] = None):
    """
    Search for an item by ID or name and provide retrieval instructions.
    """
    if not itemId and not itemName:
        raise HTTPException(status_code=400, detail="Either itemId or itemName must be provided")
    
    # Find the item in storage
    found_item = None
    container_id = None
    container_zone = None
    item_position = None
    
    # First, try to find by ID if provided
    if itemId and itemId in storage_map:
        zone, position = storage_map[itemId]
        
        for container in containers.values():
            if container.zone == zone:
                for item in container.stored_items:
                    if item.id == itemId:
                        found_item = item
                        container_id = container.id
                        container_zone = zone
                        
                        # Create position object
                        start_coords = CoordinatesModel(width=0, depth=0, height=0)  # Simplified
                        end_coords = CoordinatesModel(
                            width=item.width_cm,
                            depth=item.height_cm,
                            height=item.height_cm
                        )
                        item_position = PositionModel(
                            startCoordinates=start_coords,
                            endCoordinates=end_coords
                        )
                        break
                if found_item:
                    break
    
    # If not found by ID, try to find by name
    if not found_item and itemName:
        for zone, container in containers.items():
            for pos, item in enumerate(container.stored_items):
                if item.name.lower() == itemName.lower():
                    found_item = item
                    container_id = container.id
                    container_zone = zone
                    
                    # Create position object
                    start_coords = CoordinatesModel(width=0, depth=0, height=0)  # Simplified
                    end_coords = CoordinatesModel(
                        width=item.width_cm,
                        depth=item.height_cm,
                        height=item.height_cm
                    )
                    item_position = PositionModel(
                        startCoordinates=start_coords,
                        endCoordinates=end_coords
                    )
                    break
            if found_item:
                break
    
    # If item not found, return appropriate response
    if not found_item:
        return SearchResponseModel(
            success=True,
            found=False,
            retrievalSteps=[]
        )
    
    # Generate retrieval steps
    retrieval_steps = []
    step_counter = 1
    
    # Check if item is blocked and generate appropriate steps
    if is_blocked(container_zone, position):
        # Get movement plan
        movement_plan = generate_movement_plan(container_zone, position)
        
        # Convert movement plan to retrieval steps
        for step in movement_plan:
            move_item = step["item"]
            retrieval_steps.append(RetrievalStepModel(
                step=step_counter,
                action="setAside",
                itemId=move_item.id,
                itemName=move_item.name
            ))
            step_counter += 1
    
    # Add the actual retrieval step
    retrieval_steps.append(RetrievalStepModel(
        step=step_counter,
        action="retrieve",
        itemId=found_item.id,
        itemName=found_item.name
    ))
    step_counter += 1
    
    # Add steps to place back any moved items
    if is_blocked(container_zone, position):
        for step in reversed(movement_plan):
            move_item = step["item"]
            retrieval_steps.append(RetrievalStepModel(
                step=step_counter,
                action="placeBack",
                itemId=move_item.id,
                itemName=move_item.name
            ))
            step_counter += 1
    
    # Log the search
    if userId:
        log_action("item_search", userId, {
            "item_id": found_item.id,
            "item_name": found_item.name,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    # Create and return response
    item_response = ItemResponseModel(
        itemId=found_item.id,
        name=found_item.name,
        containerId=container_id,
        zone=container_zone,
        position=item_position
    )
    
    return SearchResponseModel(
        success=True,
        found=True,
        item=item_response,
        retrievalSteps=retrieval_steps
    )

@router.post("/api/retrieve", response_model=SimpleResponseModel)
def retrieve_item(request: RetrieveRequestModel):
    """
    Mark an item as retrieved and update its usage count.
    """
    item_id = request.itemId
    user_id = request.userId
    timestamp = request.timestamp
    
    # Validate timestamp
    try:
        dt = datetime.fromisoformat(timestamp)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    # Check if item exists in storage
    if item_id not in storage_map:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found in storage")
    
    zone, position = storage_map[item_id]
    
    # Check if item is blocked
    if is_blocked(zone, position):
        raise HTTPException(status_code=400, detail="Cannot retrieve blocked item directly, follow retrieval steps")
    
    # Get the item and update usage count
    for container in containers.values():
        if container.zone == zone:
            for item in container.stored_items:
                if item.id == item_id:
                    # Increment usage count
                    item.usage_count += 1
                    
                    # Remove from storage
                    container.stored_items.remove(item)
                    del storage_map[item_id]
                    
                    # Log the retrieval
                    log_action("retrieval", user_id, {
                        "item_id": item_id,
                        "item_name": item.name,
                        "zone": zone,
                        "usage_count": item.usage_count,
                        "timestamp": timestamp
                    })
                    
                    return SimpleResponseModel(success=True)
    
    # Should not reach here if item was in storage_map
    raise HTTPException(status_code=500, detail="Failed to retrieve item")

@router.post("/api/place",response_model=SimpleResponseModel,
             operation_id="place_single_item",  # Added unique operation ID
             tags=["Items"],  # Added tag for better API documentation
             summary="Place a single item in a container",
             description="Place an item in a specific container at the given position")
async def place_item(request: PlaceRequestModel):
    """
    Place a single item in a container at the specified position.
    
    Args:
        request: PlaceRequestModel containing item and placement details
        
    Returns:
        SimpleResponseModel indicating success/failure
        
    Raises:
        HTTPException: 
            - 404 if container not found
            - 400 if item doesn't fit or overlaps
            - 500 for other errors
    """
    try:
        # First validate the container exists and get its dimensions
        container = get_container(request.containerId)
        if not container:
            raise HTTPException(
                status_code=404, 
                detail=f"Container {request.containerId} not found"
            )

        # Validate item fits within container dimensions
        if not item_fits_container(request.position, container):
            raise HTTPException(
                status_code=400,
                detail="Item dimensions exceed container dimensions"
            )

        # Check if item already exists in storage
        if item_exists(request.itemId):
            # Remove from old location first
            remove_existing_item(request.itemId)

        # Check for overlapping items in target container
        if items_overlap(request.position, request.containerId):
            raise HTTPException(
                status_code=400,
                detail="Position overlaps with existing items"
            )

        # Place the item
        place_item_in_container(
            request.itemId,
            request.containerId,
            request.position
        )

        # Log the action
        log_action(
            "place",
            request.userId,
            {
                "item_id": request.itemId,
                "container_id": request.containerId,
                "position": request.position.dict(),
                "timestamp": request.timestamp
            }
        )

        return SimpleResponseModel(success=True)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error placing item: {str(e)}"
        )

# Helper Functions

def get_container(container_id: str) -> Optional[dict]:
    """
    Get container details from storage.
    
    Args:
        container_id: ID of the container to retrieve
        
    Returns:
        Container details if found, None otherwise
    """
    try:
        # Implement container lookup logic
        # This should connect to your storage system
        return None  # Placeholder
    except Exception:
        return None

def item_fits_container(position: PositionModel, container: dict) -> bool:
    """
    Check if item dimensions fit within container dimensions.
    
    Args:
        position: Item position with dimensions
        container: Container details with dimensions
        
    Returns:
        True if item fits, False otherwise
    """
    # Get item dimensions from position
    item_width = position.endCoordinates.width - position.startCoordinates.width
    item_depth = position.endCoordinates.depth - position.startCoordinates.depth
    item_height = position.endCoordinates.height - position.startCoordinates.height

    # Check if item fits
    return (item_width <= container["width"] and
            item_depth <= container["depth"] and
            item_height <= container["height"])

def item_exists(item_id: str) -> bool:
    """
    Check if item already exists in storage.
    
    Args:
        item_id: ID of item to check
        
    Returns:
        True if item exists, False otherwise
    """
    # Implement item existence check
    # This should connect to your storage system
    return False  # Placeholder

def remove_existing_item(item_id: str):
    """
    Remove item from its current location.
    
    Args:
        item_id: ID of item to remove
    """
    # Implement item removal logic
    # This should connect to your storage system
    pass

def items_overlap(position: PositionModel, container_id: str) -> bool:
    """
    Check if position overlaps with any existing items in container.
    
    Args:
        position: Proposed position for new item
        container_id: Container to check for overlaps
        
    Returns:
        True if overlap found, False otherwise
    """
    # Implement overlap detection logic
    # This should check against items in your storage system
    return False  # Placeholder

def place_item_in_container(item_id: str, container_id: str, position: PositionModel):
    """
    Place item in container at specified position.
    
    Args:
        item_id: ID of item to place
        container_id: ID of target container
        position: Position where to place item
    """
    # Implement item placement logic
    # This should update your storage system
    pass

def log_action(action: str, user_id: str, details: dict):
    """
    Log placement action.
    
    Args:
        action: Type of action performed
        user_id: ID of user performing action
        details: Additional action details
    """
    # Implement logging logic
    # This should connect to your logging system
    pass


@router.post("/api/import/containers", response_model=ContainerImportResponseModel)
async def import_containers(file: UploadFile = File(...)):
    """
    Import containers from a CSV file.
    """
    global containers
    containers_imported = 0
    errors = []
    
    try:
        # Read the CSV file contents
        contents = await file.read()
        decoded_contents = contents.decode('utf-8-sig')  # Handle BOM if present
        
        # Parse CSV
        csv_reader = csv.DictReader(decoded_contents.splitlines())
        
        # Process each row
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Extract and validate data
                container_id = row['container_id'].strip()
                zone = row['zone'].strip()
                
                try:
                    width = float(row['width_cm'])
                    depth = float(row['depth_cm'])
                    height = float(row['height_cm'])
                except ValueError:
                    raise ValueError("Width, depth, and height must be numeric values")
                
                # Validate dimensions
                if any(dim <= 0 for dim in [width, depth, height]):
                    raise ValueError("All dimensions must be positive numbers")
                    
                # Create container object
                container = Container(
                    id=container_id,
                    zone=zone,
                    width_cm=width,
                    depth_cm=depth,
                    height_cm=height,
                    stored_items=[]
                )
                
                # Add to containers dictionary
                containers[container_id] = container
                containers_imported += 1
                
                logger.debug(f"Added container: {container_id}")
                
            except Exception as e:
                errors.append(ImportErrorModel(row=row_num, message=str(e)))
                logger.error(f"Error processing row {row_num}: {str(e)}")
                
        logger.debug(f"Import completed. Total containers: {len(containers)}")
        
        return ContainerImportResponseModel(
            success=True,
            containersImported=containers_imported,
            errors=errors
        )
        
    except Exception as e:
        logger.error(f"Error reading CSV file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")

# NEW API ENDPOINTS

# 1. Waste Management API

@router.get("/api/waste/identify", response_model=WasteIdentifyResponseModel)
def identify_waste_items():
    """
    Identify items that should be marked as waste (expired or out of uses).
    """
    waste_items = []
    current_date = datetime.utcnow()
    
    # Scan through all items in storage
    for container_id, container in containers.items():
        for item in container.stored_items:
            # Check if item is expired
            if item.expiry_date:
                try:
                    expiry_date = datetime.fromisoformat(item.expiry_date)
                    if expiry_date < current_date:
                        # Item is expired
                        position = PositionModel(
                            startCoordinates=CoordinatesModel(width=0, depth=0, height=0),
                            endCoordinates=CoordinatesModel(
                                width=item.width_cm,
                                depth=item.depth_cm,
                                height=item.height_cm
                            )
                        )
                        
                        waste_items.append(WasteItemModel(
                            itemId=item.id,
                            name=item.name,
                            reason="Expired",
                            containerId=container_id,
                            position=position
                        ))
                        continue
                except ValueError:
                    # Invalid date format, skip this item
                    logger.warning(f"Invalid expiry date format for item {item.id}")
            
            # Check if item is out of uses
            if item.usage_limit is not None and item.usage_count >= item.usage_limit:
                position = PositionModel(
                    startCoordinates=CoordinatesModel(width=0, depth=0, height=0),
                    endCoordinates=CoordinatesModel(
                        width=item.width_cm,
                        depth=item.depth_cm,
                        height=item.height_cm
                    )
                )
                
                waste_items.append(WasteItemModel(
                    itemId=item.id,
                    name=item.name,
                    reason="OutOfUses",
                    containerId=container_id,
                    position=position
                ))
    
    return WasteIdentifyResponseModel(
        success=True,
        wasteItems=waste_items
    )

@router.post("/api/waste/return-plan", response_model=ReturnPlanResponseModel)
def create_return_plan(request: ReturnPlanRequestModel):
    """
    Create a plan for returning waste items to a specific container for undocking.
    """
    undocking_container_id = request.undockingContainerId
    undocking_date = request.undockingDate
    max_weight = request.maxWeight
    
    # Validate undocking date
    try:
        undocking_dt = datetime.fromisoformat(undocking_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid undocking date format")
    
    # Find the undocking container
    undocking_container = None
    for container in containers.values():
        if container.id == undocking_container_id:
            undocking_container = container
            break
    
    if not undocking_container:
        raise HTTPException(status_code=404, detail=f"Undocking container {undocking_container_id} not found")
    
    # Get all waste items
    waste_items_response = identify_waste_items()
    waste_items = waste_items_response.wasteItems
    
    # Calculate retrieval steps for each waste item
    return_plan = []
    retrieval_steps = []
    return_items = []
    step_counter = 1
    retrieval_step_counter = 1
    total_volume = 0
    total_weight = 0
    
    for waste_item in waste_items:
        # Calculate item volume and weight
        item_volume = 0
        item_weight = 0
        
        # Find the actual item object
        item_obj = None
        for container in containers.values():
            for item in container.stored_items:
                if item.id == waste_item.itemId:
                    item_obj = item
                    item_volume = item.width_cm * item.depth_cm * item.height_cm
                    item_weight = item.mass_kg
                    break
            if item_obj:
                break
        
        if not item_obj:
            logger.warning(f"Could not find waste item {waste_item.itemId} in storage")
            continue
        
        # Check if adding this item would exceed the weight limit
        if total_weight + item_weight > max_weight:
            logger.info(f"Skipping item {waste_item.itemId} as it would exceed weight limit")
            continue
        
        # Add to return items
        return_items.append(ReturnItemModel(
            itemId=waste_item.itemId,
            name=waste_item.name,
            reason=waste_item.reason
        ))
        
        # Update totals
        total_volume += item_volume
        total_weight += item_weight
        
        # Generate retrieval steps if item is blocked
        from_container_id = waste_item.containerId
        if from_container_id != undocking_container_id:
            # Add movement plan steps if needed
            retrieval_steps.append(RetrievalStepModel(
                step=retrieval_step_counter,
                action="retrieve",
                itemId=waste_item.itemId,
                itemName=waste_item.name
            ))
            retrieval_step_counter += 1
            
            # Add to return plan
            return_plan.append(ReturnPlanStepModel(
                step=step_counter,
                itemId=waste_item.itemId,
                itemName=waste_item.name,
                fromContainer=from_container_id,
                toContainer=undocking_container_id
            ))
            step_counter += 1
    
    # Create return manifest
    return_manifest = ReturnManifestModel(
        undockingContainerId=undocking_container_id,
        undockingDate=undocking_date,
        returnItems=return_items,
        totalVolume=total_volume,
        totalWeight=total_weight
    )
    
    return ReturnPlanResponseModel(
        success=True,
        returnPlan=return_plan,
        retrievalSteps=retrieval_steps,
        returnManifest=return_manifest
    )

@router.post("/api/waste/complete-undocking", response_model=UndockingResponseModel)
def complete_undocking(request: UndockingRequestModel):
    """
    Complete the undocking process for a container of waste items.
    """
    undocking_container_id = request.undockingContainerId
    timestamp = request.timestamp
    
    # Validate timestamp
    try:
        dt = datetime.fromisoformat(timestamp)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    
    # Find the undocking container
    undocking_container = None
    for container in containers.values():
        if container.id == undocking_container_id:
            undocking_container = container
            break
    
    if not undocking_container:
        raise HTTPException(status_code=404, detail=f"Undocking container {undocking_container_id} not found")
    
    # Count items to be removed
    items_count = len(undocking_container.stored_items)
    
    # Get item IDs for logging
    item_ids = [item.id for item in undocking_container.stored_items]
    
    # Remove all items from the container
    for item in undocking_container.stored_items:
        if item.id in storage_map:
            del storage_map[item.id]
    
    # Clear the container
    undocking_container.stored_items = []
    
    # Log the undocking
    log_action("waste_disposal", "system", {
        "container_id": undocking_container_id,
        "items_removed": items_count,
        "item_ids": item_ids,
        "timestamp": timestamp
    })
    
    return UndockingResponseModel(
        success=True,
        itemsRemoved=items_count
    )

# 2. Time Simulation API

@router.post("/api/simulate/day", response_model=SimulationResponseModel)
def simulate_day(request: SimulationRequestModel):
    """
    Simulate the passage of time and update item statuses accordingly.
    """
    # Determine the simulation end date
    current_date = datetime.utcnow()
    end_date = None
    
    if request.numOfDays is not None:
        end_date = current_date + timedelta(days=request.numOfDays)
    elif request.toTimestamp:
        try:
            end_date = datetime.fromisoformat(request.toTimestamp)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid timestamp format")
    else:
        raise HTTPException(status_code=400, detail="Either numOfDays or toTimestamp must be provided")
    
    # Track changes
    items_used = []
    items_expired = []
    items_depleted_today = []
    
    # Process items that will be used daily
    for sim_item in request.itemsToBeUsedPerDay:
        # Find the item in storage
        found_item = None
        
        if sim_item.itemId:
            # Try to find by ID
            for container in containers.values():
                for item in container.stored_items:
                    if item.id == sim_item.itemId:
                        found_item = item
                        break
                if found_item:
                    break
        
        elif sim_item.name:
            # Try to find by name
            for container in containers.values():
                for item in container.stored_items:
                    if item.name.lower() == sim_item.name.lower():
                        found_item = item
                        break
                if found_item:
                    break
        
        if found_item:
            # Update usage count and check for expiration
            if found_item.usage_limit is not None:
                if found_item.usage_count < found_item.usage_limit:
                    found_item.usage_count += 1
                    items_used.append(SimulationUsedItemModel(
                        itemId=found_item.id,
                        name=found_item.name,
                        remainingUses=found_item.usage_limit - found_item.usage_count
                    ))
                else:
                    items_depleted_today.append(SimulationExpiredItemModel(
                        itemId=found_item.id,
                        name=found_item.name
                    ))
            else:
                items_used.append(SimulationUsedItemModel(
                    itemId=found_item.id,
                    name=found_item.name,
                    remainingUses=None  # No limit
                ))
    
    # Check for expired items
    for container in containers.values():
        for item in container.stored_items:
            if item.expiry_date:
                try:
                    expiry_date = datetime.fromisoformat(item.expiry_date)
                    if expiry_date < end_date:
                        items_expired.append(SimulationExpiredItemModel(
                            itemId=item.id,
                            name=item.name
                        ))
                except ValueError:
                    logger.warning(f"Invalid expiry date format for item {item.id}")
    
    # Update the date
    new_date = end_date.isoformat()
    
    return SimulationResponseModel(
        success=True,
        newDate=new_date,
        changes=SimulationChangesModel(
            itemsUsed=items_used,
            itemsExpired=items_expired,
            itemsDepletedToday=items_depleted_today
        )
    )

# 3. Import/Export API
@router.post("/api/import/items", response_model=ImportResponseModel)
async def import_items(file: UploadFile = File(...)):
    """
    Import items from a CSV file.
    """
    items_imported = 0
    errors = []
    
    # Read the CSV file
    contents = await file.read()
    decoded_contents = contents.decode("utf-8")
    rows = decoded_contents.splitlines()
    
    # Skip the header row if present
    for row_number, row in enumerate(csv.reader(rows)):
        if row_number == 0:
            continue  # Skip the header row
        try:
            # Ensure we only take the first 6 values
            item_data = row[:6]  # Take only the first 6 columns
            item_id, name, width, depth, height, priority = item_data
            
            item = Item(
                id=item_id,
                name=name,
                width_cm=float(width),
                depth_cm=float(depth),
                height_cm=float(height),
                mass_kg=1.0,  # Default value
                priority=int(float(priority)),  # Convert to float first, then to int
                preferred_zone="",
                expiry_date=None,
                usage_limit=None,
                usage_count=0
            )
            # Add item to storage (this should be a function that handles adding items)
            # Example: add_item_to_storage(item)
            items_imported += 1
        except Exception as e:
            errors.append(ImportErrorModel(row=row_number + 1, message=str(e)))
    
    return ImportResponseModel(
        success=True,
        itemsImported=items_imported,
        errors=errors
    )

@router.post("/api/import/containers", response_model=ContainerImportResponseModel)
async def import_containers(file: UploadFile = File(...)):
    """
    Import containers from a CSV file.
    Expected format:
    zone,container_id,width_cm,depth_cm,height_cm
    """
    global containers  # Ensure we're modifying the global containers dictionary
    containers_imported = 0
    errors = []
    
    try:
        # Read the CSV file contents
        contents = await file.read()
        decoded_contents = contents.decode('utf-8-sig')  # Handle BOM if present
        
        # Use StringIO to create a file-like object
        csv_file = io.StringIO(decoded_contents)
        csv_reader = csv.reader(csv_file)
        
        # Read header
        header = next(csv_reader, None)
        if not header:
            raise HTTPException(status_code=400, detail="CSV file is empty")
            
        # Validate header structure
        expected_headers = ['zone', 'container_id', 'width_cm', 'depth_cm', 'height_cm']
        if not all(col in header for col in expected_headers):
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must have columns: {', '.join(expected_headers)}"
            )
        
        # Create a mapping of header positions
        header_map = {col: idx for idx, col in enumerate(header)}
        
        # Process each row
        for row_num, row in enumerate(csv_reader, start=2):  # Start from 2 as 1 is header
            try:
                if len(row) < len(expected_headers):
                    raise ValueError(f"Expected {len(expected_headers)} columns but got {len(row)}")
                
                # Extract data using header mapping
                container_id = row[header_map['container_id']].strip()
                zone = row[header_map['zone']].strip()
                width = float(row[header_map['width_cm']])
                depth = float(row[header_map['depth_cm']])
                height = float(row[header_map['height_cm']])
                
                # Validate dimensions
                if any(dim <= 0 for dim in [width, depth, height]):
                    raise ValueError("All dimensions must be positive numbers")
                
                # Create and store container
                container = Container(
                    id=container_id,
                    zone=zone,
                    width_cm=width,
                    depth_cm=depth,
                    height_cm=height,
                    stored_items=[]
                )
                
                containers[container_id] = container
                containers_imported += 1
                logger.debug(f"Imported container {container_id} in zone {zone}")
                
            except Exception as e:
                error_msg = f"Row {row_num}: {str(e)}"
                logger.error(error_msg)
                errors.append(ImportErrorModel(row=row_num, message=error_msg))
                continue
        
        logger.info(f"Successfully imported {containers_imported} containers")
        return ContainerImportResponseModel(
            success=True,
            containersImported=containers_imported,
            errors=errors
        )
        
    except Exception as e:
        logger.error(f"Failed to process container import: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process container import: {str(e)}"
        )

@router.get("/api/export/arrangement")
def export_arrangement():
    """
    Export the current arrangement of items in CSV format.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Item ID", "Container ID", "Coordinates (W1,D1,H1)", "Coordinates (W2,D2,H2)"])
    
    for container in containers.values():
        for item in container.stored_items:
            start_coords = (0, 0, 0)  # Placeholder for actual start coordinates
            end_coords = (item.width_cm, item.depth_cm, item.height_cm)  # Placeholder for actual end coordinates


@router.get("/api/logs", response_model=LogResponseModel)
def get_logs(
    startDate: str,
    endDate: str,
    itemId: Optional[str] = None,
    userId: Optional[str] = None,
    actionType: Optional[str] = None
):
    """
    Retrieve logs based on the specified filters.
    """
    # Validate date formats
    try:
        start_dt = datetime.fromisoformat(startDate)
        end_dt = datetime.fromisoformat(endDate)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")

    # Check if start date is before end date
    if start_dt > end_dt:
        raise HTTPException(status_code=400, detail="startDate must be before endDate.")

    # Filter logs based on the provided parameters
    filtered_logs = []
    for log in action_logs:
        log_timestamp = datetime.fromisoformat(log.timestamp)
        
        # Check if log falls within the date range
        if start_dt <= log_timestamp <= end_dt:
            # Apply additional filters if provided
            if (itemId and log.itemId != itemId) or \
               (userId and log.userId != userId) or \
               (actionType and log.actionType != actionType):
                continue
            
            filtered_logs.append(log)

    return LogResponseModel(logs=filtered_logs)