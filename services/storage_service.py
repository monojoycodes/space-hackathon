import logging
from typing import List, Dict, Optional, Tuple
import heapq
from datetime import datetime, timedelta

from models.storage import Item, Container

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

def available_volume(container: Container) -> float:
    used_volume = sum(item.width_cm * item.depth_cm * item.height_cm for item in container.stored_items)
    total_volume = container.width_cm * container.depth_cm * container.height_cm
    return total_volume - used_volume

def pack_item_in_container(item: Item, container: Container) -> Optional[Dict]:
    for orientation in item.get_orientations():
        if not item.fits_in_container(orientation, container):
            continue
        if orientation[0] * orientation[1] * orientation[2] <= available_volume(container):
            x = len(container.stored_items) * 10.0  # Dummy spacing along the x-axis
            position = (x, 0.0, 0.0)
            container.stored_items.append(item)
            return {"position": position, "orientation": orientation}
    return None

def place_items_geometric(containers_dict: Dict[str, Container], items: List[Item]) -> Tuple[List[Dict], List[Item]]:
    placed_items = []
    unplaced_items = []
    items_sorted = sorted(items, key=lambda x: x.priority, reverse=True)
    
    for item in items_sorted:
        placed = None
        preferred_zone = item.preferred_zone
        
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
                
        if not placed:
            for zone_key, container in containers_dict.items():
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

def is_blocked(zone, position):
    # Placeholder for actual implementation
    return False

def remove_from_storage(zone, item_id):
    if zone not in containers:
        return None
    
    for item in containers[zone].stored_items:
        if item.id == item_id:
            containers[zone].stored_items.remove(item)
            return item
    return None

def generate_movement_plan(zone, position):
    # Placeholder for actual implementation
    return ["Move Item_X to position A", "Move Item_Y to position B", "Retrieve requested item"]