from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trainer, User, Role, TrainerPhone
from sqlalchemy.exc import SQLAlchemyError
import uuid

trainer_bp = Blueprint('trainers', __name__, url_prefix='/api/trainers')

def get_current_user():
    """Helper function to get current user from JWT token"""
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return None
    return User.query.get(current_user_id)

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
    # Handle both uppercase and lowercase role names
    role_name = user.role.name.upper() if user.role.name else ''
    return role_name == 'ADMIN'

@trainer_bp.route('/', methods=['GET'])
@jwt_required()
def get_trainers():
    """Get all trainers"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Admin can see all trainers, trainers can see themselves and other trainers (case-insensitive)
        if not (is_admin(current_user) or current_user.role.name.lower() == 'trainer'):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        trainers = Trainer.query.filter_by(is_active=True).all()
        trainers_data = [trainer.to_dict() for trainer in trainers]
        
        return jsonify({
            'trainers': trainers_data,
            'total': len(trainers_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>/salary', methods=['PUT'])
@jwt_required()
def update_trainer_salary(trainer_id):
    """Update trainer salary (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate trainer_id is a valid UUID
        try:
            uuid.UUID(trainer_id)
        except ValueError:
            return jsonify({'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'error': 'Trainer not found'}), 404
        
        data = request.get_json()
        if not data or 'salary' not in data:
            return jsonify({'error': 'Salary is required'}), 400
        
        try:
            salary = float(data['salary'])
            if salary < 0:
                return jsonify({'error': 'Salary must be non-negative'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid salary format'}), 400
        
        trainer.salary = int(salary)  # Store as integer (cents or full amount)
        db.session.commit()
        
        return jsonify({
            'message': 'Salary updated successfully',
            'trainer': trainer.to_dict()
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>', methods=['GET'])
@jwt_required()
def get_trainer(trainer_id):
    """Get specific trainer details"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate trainer_id is a valid UUID
        try:
            uuid.UUID(trainer_id)
        except ValueError:
            return jsonify({'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'error': 'Trainer not found'}), 404
        
        # Check permissions
        trainer_profile = get_trainer_profile(current_user)
        is_same_trainer = (current_user.role.name.lower() == 'trainer' and 
                          trainer_profile and 
                          str(trainer_profile.id) == trainer_id)
        
        if not (is_admin(current_user) or is_same_trainer):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        return jsonify({'trainer': trainer.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>', methods=['PUT'])
@jwt_required()
def update_trainer(trainer_id):
    """Update trainer information"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate trainer_id is a valid UUID
        try:
            uuid.UUID(trainer_id)
        except ValueError:
            return jsonify({'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'error': 'Trainer not found'}), 404
        
        # Check permissions
        trainer_profile = get_trainer_profile(current_user)
        is_same_trainer = (current_user.role.name.lower() == 'trainer' and 
                          trainer_profile and 
                          str(trainer_profile.id) == trainer_id)
        
        if not (is_admin(current_user) or is_same_trainer):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'gender', 'specialization', 
                         'experience_years', 'bio', 'availability']
        
        # Admin can update additional fields
        if is_admin(current_user):
            allowed_fields.extend(['salary', 'rating', 'total_clients', 'is_active'])
        
        for field in allowed_fields:
            if field in data:
                setattr(trainer, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Trainer updated successfully',
            'trainer': trainer.to_dict()
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500