import logging
from typing import List, Dict, Optional, Tuple, Set
import heapq
from datetime import datetime, timedelta
from models.storage import Item, Container, Position, CoordinatesModel

logger = logging.getLogger(__name__)

# Global state (should be replaced with a proper state management system in production)
containers: Dict[str, Container] = {}
waste_container = []
retrieval_queue = []  # Min-Heap keyed by priority.
storage_map = {}
action_logs = []
MAX_UNDOCKING_WEIGHT = 100  # Example weight limit

def log_action(action_type: str, astronaut_id: str, details: Dict):
    action_logs.append({
        "timestamp": datetime.utcnow(),
        "astronaut_id": astronaut_id,
        "action_type": action_type,
        "details": details
    })

def get_occupied_positions(container: Container) -> Set[Tuple[float, float, float]]:
    """Get all occupied positions in the container."""
    occupied = set()
    for item in container.stored_items:
        if item.position:
            start = item.position.startCoordinates
            end = item.position.endCoordinates
            # Add all points in the item's volume
            for x in range(int(start.width), int(end.width) + 1):
                for y in range(int(start.depth), int(end.depth) + 1):
                    for z in range(int(start.height), int(end.height) + 1):
                        occupied.add((float(x), float(y), float(z)))
    return occupied

def find_available_position(container: Container, item: Item, orientation: Tuple[float, float, float]) -> Optional[Position]:
    """Find an available position for the item in the container."""
    w, d, h = orientation
    occupied = get_occupied_positions(container)
    
    # Try positions starting from bottom-left-front
    for x in range(int(container.width_cm - w + 1)):
        for y in range(int(container.depth_cm - d + 1)):
            for z in range(int(container.height_cm - h + 1)):
                # Check if this position is available
                position_occupied = False
                for px in range(int(x), int(x + w + 1)):
                    for py in range(int(y), int(y + d + 1)):
                        for pz in range(int(z), int(z + h + 1)):
                            if (float(px), float(py), float(pz)) in occupied:
                                position_occupied = True
                                break
                        if position_occupied:
                            break
                    if position_occupied:
                        break
                
                if not position_occupied:
                    # Found an available position
                    start = CoordinatesModel(width=float(x), depth=float(y), height=float(z))
                    end = CoordinatesModel(width=float(x + w), depth=float(y + d), height=float(z + h))
                    return Position(startCoordinates=start, endCoordinates=end)
    
    return None

def pack_item_in_container(item: Item, container: Container) -> Optional[Dict]:
    """Try to pack an item in the container with optimal space utilization."""
    best_position = None
    best_orientation = None
    min_wasted_space = float('inf')
    
    for orientation in item.get_orientations():
        position = find_available_position(container, item, orientation)
        if position:
            # Calculate wasted space (space between this item and others)
            wasted_space = calculate_wasted_space(container, item, position)
            if wasted_space < min_wasted_space:
                min_wasted_space = wasted_space
                best_position = position
                best_orientation = orientation
    
    if best_position and best_orientation:
        item.position = best_position
        container.stored_items.append(item)
        return {"position": best_position, "orientation": best_orientation}
    return None

def calculate_wasted_space(container: Container, item: Item, position: Position) -> float:
    """Calculate the amount of wasted space around the item's position."""
    # This is a simplified calculation - in a real implementation,
    # you would want to consider more factors like accessibility
    occupied = get_occupied_positions(container)
    wasted = 0.0
    
    # Check space around the item
    for x in range(int(position.startCoordinates.width - 1), int(position.endCoordinates.width + 2)):
        for y in range(int(position.startCoordinates.depth - 1), int(position.endCoordinates.depth + 2)):
            for z in range(int(position.startCoordinates.height - 1), int(position.endCoordinates.height + 2)):
                if (float(x), float(y), float(z)) not in occupied:
                    wasted += 1.0
    
    return wasted

def place_items_geometric(containers_dict: Dict[str, Container], items: List[Item]) -> Tuple[List[Dict], List[Item]]:
    """Place items in containers with optimal space utilization and handle rearrangements."""
    placed_items = []
    unplaced_items = []
    items_sorted = sorted(items, key=lambda x: x.priority, reverse=True)
    
    for item in items_sorted:
        placed = None
        preferred_zone = item.preferred_zone
        
        # Try preferred zone first
        if preferred_zone in containers_dict:
            placed = pack_item_in_container(item, containers_dict[preferred_zone])
            if placed:
                item.current_zone = preferred_zone
                placement_record = {
                    "id": item.id,
                    "name": item.name,
                    "zone": preferred_zone,
                    "position": placed["position"],
                    "orientation": placed["orientation"]
                }
                placed_items.append(placement_record)
        
        # If not placed in preferred zone, try other zones
        if not placed:
            for zone_key, container in containers_dict.items():
                if zone_key != preferred_zone:  # Skip preferred zone as we already tried it
                    placed = pack_item_in_container(item, container)
                    if placed:
                        item.current_zone = zone_key
                        placement_record = {
                            "id": item.id,
                            "name": item.name,
                            "zone": zone_key,
                            "position": placed["position"],
                            "orientation": placed["orientation"]
                        }
                        placed_items.append(placement_record)
                        break
        
        if not placed:
            unplaced_items.append(item)
    
    return placed_items, unplaced_items

def is_blocked(zone: str, position: Position) -> bool:
    """Check if a position is blocked by other items."""
    if zone not in containers:
        return True
    
    container = containers[zone]
    occupied = get_occupied_positions(container)
    
    # Check if any point in the position is occupied
    for x in range(int(position.startCoordinates.width), int(position.endCoordinates.width) + 1):
        for y in range(int(position.startCoordinates.depth), int(position.endCoordinates.depth) + 1):
            for z in range(int(position.startCoordinates.height), int(position.endCoordinates.height) + 1):
                if (float(x), float(y), float(z)) in occupied:
                    return True
    return False

def remove_from_storage(zone: str, item_id: str) -> Optional[Item]:
    """Remove an item from storage and return it."""
    if zone not in containers:
        return None
    
    container = containers[zone]
    for i, item in enumerate(container.stored_items):
        if item.id == item_id:
            return container.stored_items.pop(i)
    return None

def generate_movement_plan(zone: str, position: Position) -> List[Dict]:
    """Generate a plan to move items to make space for a new item."""
    if zone not in containers:
        return []
    
    container = containers[zone]
    movement_plan = []
    items_to_move = []
    
    # Find items that need to be moved
    for item in container.stored_items:
        if item.position and (
            (item.position.startCoordinates.width <= position.startCoordinates.width and 
             item.position.endCoordinates.width >= position.startCoordinates.width) or
            (item.position.startCoordinates.depth <= position.startCoordinates.depth and 
             item.position.endCoordinates.depth >= position.startCoordinates.depth) or
            (item.position.startCoordinates.height <= position.startCoordinates.height and 
             item.position.endCoordinates.height >= position.startCoordinates.height)
        ):
            items_to_move.append(item)
    
    # Sort items by priority (lower priority items should be moved first)
    items_to_move.sort(key=lambda x: x.priority)
    
    # Generate movement steps
    for item in items_to_move:
        # Find a new position for the item
        new_position = find_available_position(container, item, (item.width_cm, item.depth_cm, item.height_cm))
        if new_position:
            movement_plan.append({
                "action": "move",
                "itemId": item.id,
                "fromPosition": item.position,
                "toPosition": new_position
            })
        else:
            # If no position found, item needs to be removed
            movement_plan.append({
                "action": "remove",
                "itemId": item.id,
                "fromPosition": item.position
            })
    
    return movement_plan