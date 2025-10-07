from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Equipment, User
from datetime import datetime, timezone
from sqlalchemy import func, case, and_, or_
from sqlalchemy.exc import SQLAlchemyError
import uuid

equipment_bp = Blueprint('equipment', __name__, url_prefix='/api/equipment')

# Helper function for UTC timestamps
def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

# Helper function to calculate equipment status based on maintenance dates
def calculate_equipment_status(equipment):
    """Calculate equipment status based on maintenance dates"""
    if not equipment.next_maintenance_date:
        return 'operational'
    
    today = datetime.now(timezone.utc).date()
    next_date = equipment.next_maintenance_date
    
    if next_date < today:
        return 'needs-attention'  # Overdue
    elif (next_date - today).days <= 7:
        return 'maintenance'  # Due soon
    else:
        return 'operational'

@equipment_bp.route('', methods=['GET'])
@jwt_required()
def get_equipment():
    """Get all equipment with optional filtering and pagination"""
    try:
        # Get query parameters
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        status = request.args.get('status', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 100))
        
        # Build query
        query = Equipment.query
        
        # Apply search filter
        if search:
            search_filter = or_(
                Equipment.name.ilike(f'%{search}%'),
                Equipment.category.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)
        
        # Apply category filter
        if category:
            query = query.filter(Equipment.category.ilike(f'%{category}%'))
        
        # Get all equipment first (for status filtering)
        all_equipment = query.all()
        
        # Apply status filter if needed
        if status:
            filtered_equipment = []
            for equip in all_equipment:
                equip_status = calculate_equipment_status(equip)
                if equip_status == status:
                    filtered_equipment.append(equip)
            all_equipment = filtered_equipment
        
        # Apply pagination
        total = len(all_equipment)
        start = (page - 1) * limit
        end = start + limit
        paginated_equipment = all_equipment[start:end]
        
        # Convert to dict
        equipment_list = []
        for equip in paginated_equipment:
            equip_dict = {
                'id': str(equip.id),
                'name': equip.name,
                'category': equip.category,
                'quantity': equip.quantity,
                'purchase_date': equip.purchase_date.isoformat() if equip.purchase_date else None,
                'last_maintenance_date': equip.last_maintenance_date.isoformat() if equip.last_maintenance_date else None,
                'next_maintenance_date': equip.next_maintenance_date.isoformat() if equip.next_maintenance_date else None,
                'created_at': equip.created_at.isoformat() if equip.created_at else None,
                'status': calculate_equipment_status(equip)
            }
            equipment_list.append(equip_dict)
        
        return jsonify({
            'equipment': equipment_list,
            'pagination': {
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid pagination parameters'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to fetch equipment: {str(e)}'}), 500

@equipment_bp.route('/<equipment_id>', methods=['GET'])
@jwt_required()
def get_equipment_details(equipment_id):
    """Get detailed information about specific equipment"""
    try:
        # Validate UUID
        try:
            uuid.UUID(equipment_id)
        except ValueError:
            return jsonify({'error': 'Invalid equipment ID format'}), 400
        
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        equipment_data = {
            'id': str(equipment.id),
            'name': equipment.name,
            'category': equipment.category,
            'quantity': equipment.quantity,
            'purchase_date': equipment.purchase_date.isoformat() if equipment.purchase_date else None,
            'last_maintenance_date': equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
            'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
            'created_at': equipment.created_at.isoformat() if equipment.created_at else None,
            'status': calculate_equipment_status(equipment)
        }
        
        return jsonify(equipment_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch equipment details: {str(e)}'}), 500

@equipment_bp.route('', methods=['POST'])
@jwt_required()
def create_equipment():
    """Create new equipment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Equipment name is required'}), 400
        
        if not data.get('category'):
            return jsonify({'error': 'Category is required'}), 400
        
        # Create new equipment
        equipment = Equipment(
            name=data['name'],
            category=data['category'],
            quantity=data.get('quantity', 1)
        )
        
        # Set optional date fields
        if data.get('purchase_date'):
            try:
                equipment.purchase_date = datetime.fromisoformat(data['purchase_date'].replace('Z', '+00:00')).date()
            except ValueError:
                return jsonify({'error': 'Invalid purchase_date format. Use ISO format (YYYY-MM-DD)'}), 400
        
        if data.get('last_maintenance_date'):
            try:
                equipment.last_maintenance_date = datetime.fromisoformat(data['last_maintenance_date'].replace('Z', '+00:00')).date()
            except ValueError:
                return jsonify({'error': 'Invalid last_maintenance_date format. Use ISO format (YYYY-MM-DD)'}), 400
        
        if data.get('next_maintenance_date'):
            try:
                equipment.next_maintenance_date = datetime.fromisoformat(data['next_maintenance_date'].replace('Z', '+00:00')).date()
            except ValueError:
                return jsonify({'error': 'Invalid next_maintenance_date format. Use ISO format (YYYY-MM-DD)'}), 400
        
        db.session.add(equipment)
        db.session.commit()
        
        return jsonify({
            'message': 'Equipment created successfully',
            'equipment': {
                'id': str(equipment.id),
                'name': equipment.name,
                'category': equipment.category,
                'quantity': equipment.quantity,
                'purchase_date': equipment.purchase_date.isoformat() if equipment.purchase_date else None,
                'last_maintenance_date': equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
                'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
                'status': calculate_equipment_status(equipment)
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create equipment: {str(e)}'}), 500

@equipment_bp.route('/<equipment_id>', methods=['PUT'])
@jwt_required()
def update_equipment(equipment_id):
    """Update equipment information"""
    try:
        # Validate UUID
        try:
            uuid.UUID(equipment_id)
        except ValueError:
            return jsonify({'error': 'Invalid equipment ID format'}), 400
        
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            equipment.name = data['name']
        
        if 'category' in data:
            equipment.category = data['category']
        
        if 'quantity' in data:
            equipment.quantity = data['quantity']
        
        if 'purchase_date' in data:
            if data['purchase_date']:
                try:
                    equipment.purchase_date = datetime.fromisoformat(data['purchase_date'].replace('Z', '+00:00')).date()
                except ValueError:
                    return jsonify({'error': 'Invalid purchase_date format'}), 400
            else:
                equipment.purchase_date = None
        
        if 'last_maintenance_date' in data:
            if data['last_maintenance_date']:
                try:
                    equipment.last_maintenance_date = datetime.fromisoformat(data['last_maintenance_date'].replace('Z', '+00:00')).date()
                except ValueError:
                    return jsonify({'error': 'Invalid last_maintenance_date format'}), 400
            else:
                equipment.last_maintenance_date = None
        
        if 'next_maintenance_date' in data:
            if data['next_maintenance_date']:
                try:
                    equipment.next_maintenance_date = datetime.fromisoformat(data['next_maintenance_date'].replace('Z', '+00:00')).date()
                except ValueError:
                    return jsonify({'error': 'Invalid next_maintenance_date format'}), 400
            else:
                equipment.next_maintenance_date = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Equipment updated successfully',
            'equipment': {
                'id': str(equipment.id),
                'name': equipment.name,
                'category': equipment.category,
                'quantity': equipment.quantity,
                'purchase_date': equipment.purchase_date.isoformat() if equipment.purchase_date else None,
                'last_maintenance_date': equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
                'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
                'status': calculate_equipment_status(equipment)
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update equipment: {str(e)}'}), 500

@equipment_bp.route('/<equipment_id>', methods=['DELETE'])
@jwt_required()
def delete_equipment(equipment_id):
    """Delete equipment"""
    try:
        # Validate UUID
        try:
            uuid.UUID(equipment_id)
        except ValueError:
            return jsonify({'error': 'Invalid equipment ID format'}), 400
        
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        equipment_name = equipment.name
        db.session.delete(equipment)
        db.session.commit()
        
        return jsonify({
            'message': f'Equipment "{equipment_name}" deleted successfully'
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete equipment: {str(e)}'}), 500

@equipment_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_equipment_categories():
    """Get list of all equipment categories with counts"""
    try:
        # Query to get categories and their counts
        categories = db.session.query(
            Equipment.category,
            func.count(Equipment.id).label('count')
        ).group_by(Equipment.category).all()
        
        category_list = [
            {
                'name': category[0],
                'count': category[1]
            }
            for category in categories
        ]
        
        return jsonify({
            'categories': category_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch categories: {str(e)}'}), 500

@equipment_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_equipment_stats():
    """Get equipment statistics"""
    try:
        # Get all equipment
        all_equipment = Equipment.query.all()
        
        # Calculate stats
        total = len(all_equipment)
        operational = 0
        maintenance = 0
        needs_attention = 0
        
        for equip in all_equipment:
            status = calculate_equipment_status(equip)
            if status == 'operational':
                operational += 1
            elif status == 'maintenance':
                maintenance += 1
            elif status == 'needs-attention':
                needs_attention += 1
        
        stats = {
            'total': total,
            'operational': operational,
            'maintenance': maintenance,
            'needsAttention': needs_attention,
            'totalValue': '$0',  # Placeholder - would need cost data
            'utilizationRate': '0%'  # Placeholder - would need usage data
        }
        
        return jsonify({
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500

@equipment_bp.route('/<equipment_id>/maintenance', methods=['POST'])
@jwt_required()
def record_maintenance(equipment_id):
    """Record maintenance for equipment"""
    try:
        # Validate UUID
        try:
            uuid.UUID(equipment_id)
        except ValueError:
            return jsonify({'error': 'Invalid equipment ID format'}), 400
        
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        data = request.get_json()
        
        # Update maintenance dates
        if 'maintenance_date' in data:
            try:
                equipment.last_maintenance_date = datetime.fromisoformat(data['maintenance_date'].replace('Z', '+00:00')).date()
            except ValueError:
                return jsonify({'error': 'Invalid maintenance_date format'}), 400
        else:
            equipment.last_maintenance_date = datetime.now(timezone.utc).date()
        
        if 'next_maintenance_date' in data:
            try:
                equipment.next_maintenance_date = datetime.fromisoformat(data['next_maintenance_date'].replace('Z', '+00:00')).date()
            except ValueError:
                return jsonify({'error': 'Invalid next_maintenance_date format'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Maintenance recorded successfully',
            'equipment': {
                'id': str(equipment.id),
                'name': equipment.name,
                'last_maintenance_date': equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
                'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
                'status': calculate_equipment_status(equipment)
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to record maintenance: {str(e)}'}), 500