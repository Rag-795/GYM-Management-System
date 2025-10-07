from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Equipment, User, Role
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, desc
from datetime import datetime, timezone, date, timedelta
import uuid

equipment_bp = Blueprint('equipment', __name__, url_prefix='/api/equipment')

def get_current_user():
    """Helper function to get current user from JWT token"""
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return None
    return User.query.get(current_user_id)

def is_admin(user):
    """Check if user has admin role"""
    if not user or not user.role:
        return False
    # Handle both uppercase and lowercase role names
    role_name = user.role.name.upper() if user.role.name else ''
    return role_name == 'ADMIN'

def is_trainer(user):
    """Check if user has trainer role"""
    return user and user.role and user.role.name.lower() == 'trainer'

@equipment_bp.route('/', methods=['GET'])
@jwt_required()
def get_equipment():
    """Get all equipment with filtering and search"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Admins and trainers can view equipment
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Get query parameters
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '')
        maintenance_status = request.args.get('maintenance_status', 'all')  # all, due, overdue
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = Equipment.query
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Equipment.name.ilike(search_term),
                    Equipment.category.ilike(search_term)
                )
            )
        
        # Apply category filter
        if category:
            query = query.filter(Equipment.category.ilike(f"%{category}%"))
        
        # Apply maintenance status filter
        today = date.today()
        if maintenance_status == 'due':
            # Due within next 30 days
            due_date = today + timedelta(days=30)
            query = query.filter(
                Equipment.next_maintenance_date <= due_date,
                Equipment.next_maintenance_date >= today
            )
        elif maintenance_status == 'overdue':
            # Past due date
            query = query.filter(Equipment.next_maintenance_date < today)
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination and ordering
        equipment_list = query.order_by(Equipment.category, Equipment.name)\
            .offset((page - 1) * limit).limit(limit).all()
        
        # Format response
        equipment_data = []
        for equipment in equipment_list:
            equipment_dict = {
                'id': str(equipment.id),
                'name': equipment.name,
                'category': equipment.category,
                'quantity': equipment.quantity,
                'purchase_date': equipment.purchase_date.isoformat() if equipment.purchase_date else None,
                'last_maintenance_date': equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
                'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
                'created_at': equipment.created_at.isoformat() if equipment.created_at else None
            }
            
            # Calculate maintenance status
            if equipment.next_maintenance_date:
                days_until_maintenance = (equipment.next_maintenance_date - today).days
                if days_until_maintenance < 0:
                    equipment_dict['maintenance_status'] = 'overdue'
                    equipment_dict['days_until_maintenance'] = days_until_maintenance
                elif days_until_maintenance <= 30:
                    equipment_dict['maintenance_status'] = 'due_soon'
                    equipment_dict['days_until_maintenance'] = days_until_maintenance
                else:
                    equipment_dict['maintenance_status'] = 'good'
                    equipment_dict['days_until_maintenance'] = days_until_maintenance
            else:
                equipment_dict['maintenance_status'] = 'unknown'
                equipment_dict['days_until_maintenance'] = None
            
            # Calculate age of equipment
            if equipment.purchase_date:
                age_days = (today - equipment.purchase_date).days
                equipment_dict['age_years'] = round(age_days / 365.25, 1)
            else:
                equipment_dict['age_years'] = None
            
            equipment_data.append(equipment_dict)
        
        return jsonify({
            'equipment': equipment_data,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>', methods=['GET'])
@jwt_required()
def get_equipment_details(equipment_id):
    """Get specific equipment details"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Validate UUID format
        try:
            uuid.UUID(equipment_id)
        except ValueError:
            return jsonify({'error': 'Invalid equipment ID format'}), 400
        
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        # Get detailed equipment information
        today = date.today()
        equipment_dict = {
            'id': str(equipment.id),
            'name': equipment.name,
            'category': equipment.category,
            'quantity': equipment.quantity,
            'purchase_date': equipment.purchase_date.isoformat() if equipment.purchase_date else None,
            'last_maintenance_date': equipment.last_maintenance_date.isoformat() if equipment.last_maintenance_date else None,
            'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None,
            'created_at': equipment.created_at.isoformat() if equipment.created_at else None
        }
        
        # Calculate maintenance status and other metrics
        if equipment.next_maintenance_date:
            days_until_maintenance = (equipment.next_maintenance_date - today).days
            equipment_dict['days_until_maintenance'] = days_until_maintenance
            
            if days_until_maintenance < 0:
                equipment_dict['maintenance_status'] = 'overdue'
            elif days_until_maintenance <= 30:
                equipment_dict['maintenance_status'] = 'due_soon'
            else:
                equipment_dict['maintenance_status'] = 'good'
        else:
            equipment_dict['maintenance_status'] = 'unknown'
            equipment_dict['days_until_maintenance'] = None
        
        # Calculate age and usage info
        if equipment.purchase_date:
            age_days = (today - equipment.purchase_date).days
            equipment_dict['age_years'] = round(age_days / 365.25, 1)
            equipment_dict['age_days'] = age_days
        else:
            equipment_dict['age_years'] = None
            equipment_dict['age_days'] = None
        
        # Calculate maintenance frequency
        if equipment.last_maintenance_date and equipment.purchase_date:
            maintenance_days = (equipment.last_maintenance_date - equipment.purchase_date).days
            if maintenance_days > 0:
                equipment_dict['maintenance_frequency_days'] = maintenance_days
            else:
                equipment_dict['maintenance_frequency_days'] = None
        else:
            equipment_dict['maintenance_frequency_days'] = None
        
        return jsonify({'equipment': equipment_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/', methods=['POST'])
@jwt_required()
def create_equipment():
    """Create new equipment (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate quantity
        quantity = int(data.get('quantity', 1))
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        
        # Parse dates
        purchase_date = None
        if data.get('purchase_date'):
            try:
                purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid purchase_date format. Use YYYY-MM-DD'}), 400
        
        last_maintenance_date = None
        if data.get('last_maintenance_date'):
            try:
                last_maintenance_date = datetime.strptime(data['last_maintenance_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid last_maintenance_date format. Use YYYY-MM-DD'}), 400
        
        next_maintenance_date = None
        if data.get('next_maintenance_date'):
            try:
                next_maintenance_date = datetime.strptime(data['next_maintenance_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid next_maintenance_date format. Use YYYY-MM-DD'}), 400
        
        # Validate date logic
        if last_maintenance_date and purchase_date and last_maintenance_date < purchase_date:
            return jsonify({'error': 'Last maintenance date cannot be before purchase date'}), 400
        
        if next_maintenance_date and last_maintenance_date and next_maintenance_date <= last_maintenance_date:
            return jsonify({'error': 'Next maintenance date must be after last maintenance date'}), 400
        
        # Create equipment
        equipment = Equipment(
            name=data['name'],
            category=data['category'],
            quantity=quantity,
            purchase_date=purchase_date,
            last_maintenance_date=last_maintenance_date,
            next_maintenance_date=next_maintenance_date
        )
        
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
                'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None
            }
        }), 201
        
    except ValueError as ve:
        return jsonify({'error': f'Invalid data format: {str(ve)}'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>', methods=['PUT'])
@jwt_required()
def update_equipment(equipment_id):
    """Update equipment information (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate UUID format
        try:
            uuid.UUID(equipment_id)
        except ValueError:
            return jsonify({'error': 'Invalid equipment ID format'}), 400
        
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update basic fields
        if 'name' in data:
            equipment.name = data['name']
        
        if 'category' in data:
            equipment.category = data['category']
        
        if 'quantity' in data:
            try:
                quantity = int(data['quantity'])
                if quantity <= 0:
                    return jsonify({'error': 'Quantity must be positive'}), 400
                equipment.quantity = quantity
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid quantity format'}), 400
        
        # Update dates
        if 'purchase_date' in data:
            if data['purchase_date']:
                try:
                    equipment.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid purchase_date format. Use YYYY-MM-DD'}), 400
            else:
                equipment.purchase_date = None
        
        if 'last_maintenance_date' in data:
            if data['last_maintenance_date']:
                try:
                    equipment.last_maintenance_date = datetime.strptime(data['last_maintenance_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid last_maintenance_date format. Use YYYY-MM-DD'}), 400
            else:
                equipment.last_maintenance_date = None
        
        if 'next_maintenance_date' in data:
            if data['next_maintenance_date']:
                try:
                    equipment.next_maintenance_date = datetime.strptime(data['next_maintenance_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid next_maintenance_date format. Use YYYY-MM-DD'}), 400
            else:
                equipment.next_maintenance_date = None
        
        # Validate date logic
        if (equipment.last_maintenance_date and equipment.purchase_date and 
            equipment.last_maintenance_date < equipment.purchase_date):
            return jsonify({'error': 'Last maintenance date cannot be before purchase date'}), 400
        
        if (equipment.next_maintenance_date and equipment.last_maintenance_date and 
            equipment.next_maintenance_date <= equipment.last_maintenance_date):
            return jsonify({'error': 'Next maintenance date must be after last maintenance date'}), 400
        
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
                'next_maintenance_date': equipment.next_maintenance_date.isoformat() if equipment.next_maintenance_date else None
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>', methods=['DELETE'])
@jwt_required()
def delete_equipment(equipment_id):
    """Delete equipment (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate UUID format
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
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>/maintenance', methods=['POST'])
@jwt_required()
def record_maintenance(equipment_id):
    """Record maintenance for equipment (Admin/Trainer)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'error': 'Admin or Trainer access required'}), 403
        
        # Validate UUID format
        try:
            uuid.UUID(equipment_id)
        except ValueError:
            return jsonify({'error': 'Invalid equipment ID format'}), 400
        
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'error': 'Equipment not found'}), 404
        
        data = request.get_json()
        maintenance_date = date.today()
        
        # Parse maintenance date if provided
        if data and data.get('maintenance_date'):
            try:
                maintenance_date = datetime.strptime(data['maintenance_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid maintenance_date format. Use YYYY-MM-DD'}), 400
        
        # Calculate next maintenance date (default: 3 months from now)
        next_maintenance_days = 90  # Default 3 months
        if data and data.get('next_maintenance_days'):
            try:
                next_maintenance_days = int(data['next_maintenance_days'])
                if next_maintenance_days <= 0:
                    return jsonify({'error': 'Next maintenance days must be positive'}), 400
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid next_maintenance_days format'}), 400
        
        next_maintenance_date = maintenance_date + timedelta(days=next_maintenance_days)
        
        # Update equipment maintenance dates
        equipment.last_maintenance_date = maintenance_date
        equipment.next_maintenance_date = next_maintenance_date
        
        db.session.commit()
        
        return jsonify({
            'message': 'Maintenance recorded successfully',
            'equipment': {
                'id': str(equipment.id),
                'name': equipment.name,
                'last_maintenance_date': equipment.last_maintenance_date.isoformat(),
                'next_maintenance_date': equipment.next_maintenance_date.isoformat()
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_equipment_categories():
    """Get all equipment categories"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Get distinct categories with counts
        categories = db.session.query(
            Equipment.category,
            func.count(Equipment.id).label('count')
        ).group_by(Equipment.category)\
         .order_by(Equipment.category).all()
        
        categories_data = [
            {'name': category[0], 'count': category[1]}
            for category in categories
        ]
        
        return jsonify({
            'categories': categories_data,
            'total': len(categories_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_equipment_statistics():
    """Get equipment statistics (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        today = date.today()
        
        # Total equipment count
        total_equipment = Equipment.query.count()
        total_quantity = db.session.query(func.sum(Equipment.quantity)).scalar() or 0
        
        # Maintenance statistics
        overdue_count = Equipment.query.filter(
            Equipment.next_maintenance_date < today
        ).count()
        
        due_soon_count = Equipment.query.filter(
            Equipment.next_maintenance_date >= today,
            Equipment.next_maintenance_date <= today + timedelta(days=30)
        ).count()
        
        # Equipment by category
        category_stats = db.session.query(
            Equipment.category,
            func.count(Equipment.id).label('count'),
            func.sum(Equipment.quantity).label('total_quantity')
        ).group_by(Equipment.category)\
         .order_by(desc('count')).all()
        
        # Average age of equipment
        equipment_with_dates = Equipment.query.filter(
            Equipment.purchase_date.isnot(None)
        ).all()
        
        average_age_days = 0
        if equipment_with_dates:
            total_age_days = sum(
                (today - eq.purchase_date).days 
                for eq in equipment_with_dates
            )
            average_age_days = total_age_days / len(equipment_with_dates)
        
        return jsonify({
            'total_equipment': total_equipment,
            'total_quantity': int(total_quantity),
            'maintenance': {
                'overdue': overdue_count,
                'due_soon': due_soon_count,
                'good': total_equipment - overdue_count - due_soon_count
            },
            'categories': [
                {
                    'name': stat[0],
                    'equipment_count': stat[1],
                    'total_quantity': int(stat[2])
                }
                for stat in category_stats
            ],
            'average_age_years': round(average_age_days / 365.25, 1) if average_age_days > 0 else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500