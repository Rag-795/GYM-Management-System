from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trainer, User, Role, TrainerPhone
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, func
from datetime import datetime, timezone
import uuid
import logging

# Configure logging
logger = logging.getLogger(__name__)

trainer_bp = Blueprint('trainers', __name__, url_prefix='/api/trainers')

def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

def get_current_user():
    """Helper function to get current user from JWT token"""
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return None
        return User.query.get(current_user_id)
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return None

def get_trainer_profile(user):
    """Safely get trainer profile from user (handles backref list issue)"""
    if not user:
        return None
    profile = user.trainer_profile
    # trainer_profile is a list due to backref, get first item
    if isinstance(profile, list):
        return profile[0] if profile else None
    return profile

def get_trainer_profile(user):
    """Safely get trainer profile from user (handles backref list issue)"""
    if not user:
        return None
    profile = user.trainer_profile
    # trainer_profile is a list due to backref, get first item
    if isinstance(profile, list):
        return profile[0] if profile else None
    return profile

def is_admin(user):
    """Check if user has admin role"""
    if not user or not user.role:
        return False
    role_name = user.role.name.lower() if user.role.name else ''
    return role_name == 'admin'

def is_trainer(user):
    """Check if user has trainer role"""
    if not user or not user.role:
        return False
    role_name = user.role.name.lower() if user.role.name else ''
    return role_name == 'trainer'

def validate_uuid(uuid_string):
    """Validate UUID format"""
    try:
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False

def format_trainer_dict(trainer, include_sensitive=False):
    """Format trainer data for response"""
    data = {
        'id': str(trainer.id),
        'user_id': str(trainer.user_id) if trainer.user_id else None,
        'email': trainer.user.email if trainer.user else None,
        'first_name': trainer.first_name,
        'last_name': trainer.last_name,
        'full_name': f"{trainer.first_name} {trainer.last_name}" if trainer.first_name and trainer.last_name else None,
        'gender': trainer.gender,
        'specialization': trainer.specialization,
        'experience_years': trainer.experience_years,
        'bio': trainer.bio,
        'rating': float(trainer.rating) if trainer.rating else 0.0,
        'total_clients': trainer.total_clients or 0,
        'availability': trainer.availability,
        'is_active': trainer.is_active,
        'created_at': trainer.created_at.isoformat() if trainer.created_at else None,
        'updated_at': trainer.updated_at.isoformat() if trainer.updated_at else None,
    }
    
    # Include sensitive data only for admins or the trainer themselves
    if include_sensitive:
        data['salary'] = float(trainer.salary) if trainer.salary else 0.0
        
    # Include phone numbers if they exist
    if hasattr(trainer, 'phones') and trainer.phones:
        data['phones'] = [phone.phone for phone in trainer.phones]
    else:
        data['phones'] = []
    
    return data

@trainer_bp.route('/', methods=['GET'])
@jwt_required()
def get_trainers():
    """Get all trainers with optional pagination and search"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Check permissions - allow admin and trainer roles
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str)
        specialization = request.args.get('specialization', '', type=str)
        is_active = request.args.get('is_active', 'true', type=str)
        sort_by = request.args.get('sort_by', 'created_at', type=str)
        sort_order = request.args.get('sort_order', 'desc', type=str)
        
        # Limit per_page to maximum 100
        per_page = min(per_page, 100)
        
        # Build query with User join for email access
        query = Trainer.query.join(User)
        
        # Filter by active status
        if is_active.lower() == 'true':
            query = query.filter(Trainer.is_active == True)
        elif is_active.lower() == 'false':
            query = query.filter(Trainer.is_active == False)
        # If is_active is 'all', don't filter
        
        # Search filter
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                or_(
                    Trainer.first_name.ilike(search_pattern),
                    Trainer.last_name.ilike(search_pattern),
                    Trainer.specialization.ilike(search_pattern),
                    Trainer.bio.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )
        
        # Specialization filter
        if specialization:
            query = query.filter(Trainer.specialization.ilike(f'%{specialization}%'))
        
        # Sorting
        if sort_by == 'email':
            sort_column = User.email
        elif hasattr(Trainer, sort_by):
            sort_column = getattr(Trainer, sort_by)
        else:
            sort_column = Trainer.created_at
            
        if sort_order == 'asc':
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
        
        # Execute query with pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        include_sensitive = is_admin(current_user)
        trainers_data = []
        
        for trainer in paginated.items:
            trainer_dict = format_trainer_dict(trainer, include_sensitive)
            
            # Hide salary for non-admin trainers viewing other trainers
            if is_trainer(current_user) and not is_admin(current_user):
                if current_user.trainer_profile and str(current_user.trainer_profile.id) != str(trainer.id):
                    trainer_dict.pop('salary', None)
            
            trainers_data.append(trainer_dict)
        
        return jsonify({
            'success': True,
            'trainers': trainers_data,
            'pagination': {
                'total': paginated.total,
                'pages': paginated.pages,
                'current_page': page,
                'per_page': per_page,
                'has_prev': paginated.has_prev,
                'has_next': paginated.has_next
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching trainers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>', methods=['GET'])
@jwt_required()
def get_trainer(trainer_id):
    """Get specific trainer details"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Validate trainer_id
        if not validate_uuid(trainer_id):
            return jsonify({'success': False, 'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'success': False, 'error': 'Trainer not found'}), 404
        
        # Check permissions
        is_same_trainer = (
            is_trainer(current_user) and 
            current_user.trainer_profile and 
            str(current_user.trainer_profile.id) == trainer_id
        )
        
        # Allow trainers to view other trainers' profiles
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        include_sensitive = is_admin(current_user) or is_same_trainer
        trainer_dict = format_trainer_dict(trainer, include_sensitive)
        
        return jsonify({
            'success': True,
            'trainer': trainer_dict,
            'can_edit': is_admin(current_user) or is_same_trainer
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching trainer: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>', methods=['PUT'])
@jwt_required()
def update_trainer(trainer_id):
    """Update trainer information"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Validate trainer_id
        if not validate_uuid(trainer_id):
            return jsonify({'success': False, 'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'success': False, 'error': 'Trainer not found'}), 404
        
        # Check permissions
        is_same_trainer = (
            is_trainer(current_user) and 
            current_user.trainer_profile and 
            str(current_user.trainer_profile.id) == trainer_id
        )
        
        if not (is_admin(current_user) or is_same_trainer):
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Update allowed fields
        allowed_fields = [
            'first_name', 'last_name', 'gender', 'specialization', 
            'experience_years', 'bio', 'availability'
        ]
        
        # Admin can update additional fields
        if is_admin(current_user):
            allowed_fields.extend(['salary', 'rating', 'total_clients', 'is_active'])
        
        updated_fields = []
        for field in allowed_fields:
            if field in data:
                # Validate specific fields
                if field == 'experience_years' and data[field] is not None:
                    if not isinstance(data[field], (int, float)) or data[field] < 0:
                        return jsonify({'success': False, 'error': f'Invalid value for experience_years'}), 400
                    data[field] = int(data[field])
                
                if field == 'rating' and data[field] is not None:
                    try:
                        rating = float(data[field])
                        if not 0 <= rating <= 5:
                            return jsonify({'success': False, 'error': 'Rating must be between 0 and 5'}), 400
                        data[field] = rating
                    except (ValueError, TypeError):
                        return jsonify({'success': False, 'error': 'Invalid rating format'}), 400
                
                if field == 'salary' and data[field] is not None:
                    try:
                        salary = float(data[field])
                        if salary < 0:
                            return jsonify({'success': False, 'error': 'Salary must be non-negative'}), 400
                        data[field] = int(salary)  # Store as integer
                    except (ValueError, TypeError):
                        return jsonify({'success': False, 'error': 'Invalid salary format'}), 400
                
                setattr(trainer, field, data[field])
                updated_fields.append(field)
        
        # Update phone numbers if provided
        if 'phones' in data and is_admin(current_user):
            # Delete existing phones
            TrainerPhone.query.filter_by(trainer_id=trainer.id).delete()
            
            # Add new phones
            for phone in data['phones']:
                if phone:  # Only add non-empty phone numbers
                    new_phone = TrainerPhone(
                        trainer_id=trainer.id,
                        phone=phone
                    )
                    db.session.add(new_phone)
            updated_fields.append('phones')
        
        trainer.updated_at = utc_now()
        db.session.commit()
        
        include_sensitive = is_admin(current_user) or is_same_trainer
        trainer_dict = format_trainer_dict(trainer, include_sensitive)
        
        return jsonify({
            'success': True,
            'message': 'Trainer updated successfully',
            'trainer': trainer_dict,
            'updated_fields': updated_fields
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error updating trainer: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Error updating trainer: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>/salary', methods=['PUT'])
@jwt_required()
def update_trainer_salary(trainer_id):
    """Update trainer salary (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Validate trainer_id
        if not validate_uuid(trainer_id):
            return jsonify({'success': False, 'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'success': False, 'error': 'Trainer not found'}), 404
        
        data = request.get_json()
        if not data or 'salary' not in data:
            return jsonify({'success': False, 'error': 'Salary is required'}), 400
        
        try:
            salary = float(data['salary'])
            if salary < 0:
                return jsonify({'success': False, 'error': 'Salary must be non-negative'}), 400
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'Invalid salary format'}), 400
        
        old_salary = trainer.salary
        trainer.salary = int(salary)  # Store as integer
        trainer.updated_at = utc_now()
        db.session.commit()
        
        trainer_dict = format_trainer_dict(trainer, include_sensitive=True)
        
        return jsonify({
            'success': True,
            'message': 'Salary updated successfully',
            'trainer': trainer_dict,
            'old_salary': float(old_salary) if old_salary else 0.0,
            'new_salary': salary
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error updating salary: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Error updating salary: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_trainer_status(trainer_id):
    """Toggle trainer active status (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Validate trainer_id
        if not validate_uuid(trainer_id):
            return jsonify({'success': False, 'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'success': False, 'error': 'Trainer not found'}), 404
        
        # Toggle status
        trainer.is_active = not trainer.is_active
        trainer.updated_at = utc_now()
        
        # Also update the User's is_active status
        if trainer.user:
            trainer.user.is_active = trainer.is_active
            trainer.user.updated_at = utc_now()
        
        db.session.commit()
        
        trainer_dict = format_trainer_dict(trainer, include_sensitive=True)
        
        return jsonify({
            'success': True,
            'message': f"Trainer {'activated' if trainer.is_active else 'deactivated'} successfully",
            'trainer': trainer_dict
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error toggling status: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Error toggling status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@trainer_bp.route('/specializations', methods=['GET'])
@jwt_required()
def get_specializations():
    """Get list of unique specializations"""
    try:
        specializations = db.session.query(
            Trainer.specialization
        ).filter(
            Trainer.specialization.isnot(None),
            Trainer.is_active == True
        ).distinct().all()
        
        specialization_list = [spec[0] for spec in specializations if spec[0]]
        
        return jsonify({
            'success': True,
            'specializations': sorted(specialization_list)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching specializations: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@trainer_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_trainer_statistics():
    """Get trainer statistics (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Calculate statistics
        total_trainers = Trainer.query.count()
        active_trainers = Trainer.query.filter_by(is_active=True).count()
        inactive_trainers = Trainer.query.filter_by(is_active=False).count()
        
        # Average statistics
        avg_experience = db.session.query(func.avg(Trainer.experience_years)).scalar() or 0
        avg_rating = db.session.query(func.avg(Trainer.rating)).scalar() or 0
        avg_salary = db.session.query(func.avg(Trainer.salary)).scalar() or 0
        
        # Total clients across all trainers
        total_clients = db.session.query(func.sum(Trainer.total_clients)).scalar() or 0
        
        # Specialization distribution
        specialization_stats = db.session.query(
            Trainer.specialization,
            func.count(Trainer.id)
        ).filter(
            Trainer.specialization.isnot(None)
        ).group_by(Trainer.specialization).all()
        
        # Top rated trainers
        top_trainers = Trainer.query.filter(
            Trainer.is_active == True,
            Trainer.rating > 0
        ).order_by(Trainer.rating.desc()).limit(5).all()
        
        return jsonify({
            'success': True,
            'statistics': {
                'total_trainers': total_trainers,
                'active_trainers': active_trainers,
                'inactive_trainers': inactive_trainers,
                'total_clients': int(total_clients),
                'averages': {
                    'experience_years': round(float(avg_experience), 1),
                    'rating': round(float(avg_rating), 2),
                    'salary': round(float(avg_salary), 2)
                },
                'specializations': [
                    {
                        'name': spec[0],
                        'count': spec[1]
                    } for spec in specialization_stats
                ],
                'top_trainers': [
                    {
                        'id': str(trainer.id),
                        'name': f"{trainer.first_name} {trainer.last_name}",
                        'rating': float(trainer.rating),
                        'specialization': trainer.specialization
                    } for trainer in top_trainers
                ]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching trainer statistics: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500