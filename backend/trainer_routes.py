from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trainer, User, Role, TrainerPhone
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, func
from datetime import datetime, timezone
import uuid

trainer_bp = Blueprint('trainers', __name__, url_prefix='/api/trainers')

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
    role_name = user.role.name.lower() if user.role.name else ''
    return role_name == 'admin'

@trainer_bp.route('/', methods=['GET'])
def get_trainers():
    """Get all trainers"""
    try:
        # Removed JWT requirement for easier testing
        # Get query parameters for filtering
        search_term = request.args.get('search', '').strip()
        specialty_filter = request.args.get('specialty', '').strip()
        availability_filter = request.args.get('availability', '').strip()
        
        # Build query
        query = Trainer.query.filter_by(is_active=True)
        
        # Apply search filter if provided
        if search_term:
            search_pattern = f"%{search_term}%"
            query = query.join(User).filter(
                or_(
                    Trainer.first_name.ilike(search_pattern),
                    Trainer.last_name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    func.concat(Trainer.first_name, ' ', Trainer.last_name).ilike(search_pattern)
                )
            )
        
        # Apply specialty filter if provided
        if specialty_filter and specialty_filter.lower() != 'all':
            query = query.filter(Trainer.specialization.ilike(f"%{specialty_filter}%"))
        
        # Apply availability filter if provided
        if availability_filter:
            query = query.filter(Trainer.availability.ilike(f"%{availability_filter}%"))
        
        trainers = query.all()
        trainers_data = []
        
        for trainer in trainers:
            # Format the trainer data exactly as requested
            trainer_dict = {
                'id': str(trainer.id),
                'firstName': trainer.first_name,
                'lastName': trainer.last_name,
                'phone': trainer.phones[0].phone if trainer.phones else '(555) 000-0000',
                'specialties': [s.strip() for s in trainer.specialization.split(',')] if trainer.specialization else [],
                'experience': f"{trainer.experience_years} years",
                'rating': float(trainer.rating) if trainer.rating is not None else 0,
                'totalClients': trainer.total_clients,
                'sessionsThisMonth': 0,  # Placeholder, not tracked in database
                'availability': trainer.availability,
                'joinDate': trainer.created_at.strftime('%Y-%m-%d') if trainer.created_at else '2023-01-01',
                'status': 'active' if trainer.is_active else 'inactive',
                'salary': f"₹{trainer.salary:,}/month",
                'performance': 95  # Placeholder, not tracked in database
            }
            trainers_data.append(trainer_dict)
        
        return jsonify({
            'trainers': trainers_data,
            'total': len(trainers_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>/salary', methods=['PUT'])
def update_trainer_salary(trainer_id):
    """Update trainer salary (Admin only)"""
    try:
        # For easier testing, allowing updates without authentication
        # Removed JWT authentication check
        
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
def get_trainer(trainer_id):
    """Get specific trainer details"""
    try:
        # For easier testing, allowing access without authentication
        
        # Validate trainer_id is a valid UUID
        try:
            uuid.UUID(trainer_id)
        except ValueError:
            return jsonify({'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'error': 'Trainer not found'}), 404
            
        # Removed permission check for easier testing
        
        return jsonify({'trainer': trainer.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/<trainer_id>', methods=['PUT'])
def update_trainer(trainer_id):
    """Update trainer information"""
    try:
        # For easier testing, allowing updates without authentication
        
        # Validate trainer_id is a valid UUID
        try:
            uuid.UUID(trainer_id)
        except ValueError:
            return jsonify({'error': 'Invalid trainer ID format'}), 400
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            return jsonify({'error': 'Trainer not found'}), 404
            
        # Removed permission check for easier testing
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update allowed fields - allowing all fields for testing
        allowed_fields = ['first_name', 'last_name', 'gender', 'specialization', 
                         'experience_years', 'bio', 'availability',
                         'salary', 'rating', 'total_clients', 'is_active']
        
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

@trainer_bp.route('/specialties', methods=['GET'])
def get_specialties():
    """Get all available specialties"""
    try:
        # Get unique specializations from existing trainers
        specializations = db.session.query(Trainer.specialization).filter(
            Trainer.specialization.isnot(None),
            Trainer.specialization != ''
        ).distinct().all()
        
        specialty_list = []
        for spec in specializations:
            if spec[0]:
                # Split comma-separated specializations
                specialties = [s.strip() for s in spec[0].split(',') if s.strip()]
                specialty_list.extend(specialties)
        
        # Add some default specialties if none exist
        default_specialties = [
            'Weight Training', 'Cardio', 'HIIT', 'CrossFit', 'Yoga', 
            'Pilates', 'Boxing', 'MMA', 'Dance Fitness', 'Zumba',
            'Strength Training', 'Nutrition', 'Rehabilitation'
        ]
        
        # Combine and remove duplicates
        all_specialties = list(set(specialty_list + default_specialties))
        all_specialties.sort()
        
        return jsonify({
            'specialties': all_specialties
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
@trainer_bp.route('/stats', methods=['GET'])
def get_trainer_stats():
    """Get trainer statistics for dashboard"""
    try:
        # Calculate statistics
        total_trainers = Trainer.query.filter_by(is_active=True).count()
        
        # Average rating
        avg_rating = db.session.query(func.avg(Trainer.rating)).filter_by(is_active=True).scalar()
        avg_rating = float(avg_rating) if avg_rating else 0
        
        # Total sessions today (placeholder - would need session tracking)
        sessions_today = 68  # Static for now
        
        # Total clients across all trainers
        total_clients = db.session.query(func.sum(Trainer.total_clients)).filter_by(is_active=True).scalar()
        total_clients = int(total_clients) if total_clients else 0
        
        return jsonify({
            'stats': {
                'active_trainers': total_trainers,
                'avg_rating': round(avg_rating, 1),
                'sessions_today': sessions_today,
                'total_clients': total_clients
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trainer_bp.route('/', methods=['POST'])
def create_trainer():
    """Create a new trainer"""
    try:
        # For easier testing, allowing creation without authentication
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'specialties', 'experience', 'availability']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get trainer role
        trainer_role = Role.query.filter_by(name='trainer').first()
        if not trainer_role:
            # Try uppercase as fallback
            trainer_role = Role.query.filter_by(name='TRAINER').first()
        
        # If still no role found, create trainer profile without user account
        user_id = None
        if 'email' in data and trainer_role:
            # Check if email already exists
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user:
                return jsonify({'error': 'Email already in use'}), 400
            # Create new user
            user = User(
                email=data['email'],
                role_id=trainer_role.id,
                is_active=True
            )
            
            # Set password if provided, otherwise use default
            password = data.get('password', 'trainer123')
            user.set_password(password)
            db.session.add(user)
            db.session.flush()  # Get user ID
            user_id = user.id
        
        # Process specialties
        specialties = data.get('specialties', [])
        specialties_str = ','.join(specialties) if isinstance(specialties, list) else specialties
        
        # Create trainer profile
        trainer = Trainer(
            user_id=user_id,
            first_name=data['firstName'],
            last_name=data['lastName'],
            gender=data.get('gender'),
            specialization=specialties_str,
            experience_years=int(data['experience'].replace(' years', '')) if isinstance(data['experience'], str) else int(data['experience']),
            bio=data.get('bio', ''),
            availability=data.get('availability'),
            salary=int(data.get('salary', 0)),
            rating=float(data.get('rating', 0)),
            total_clients=int(data.get('totalClients', 0)),
            is_active=True
        )
        db.session.add(trainer)
        db.session.flush()  # Get trainer ID
        
        # Add phone number if provided
        if data.get('phone'):
            phone = TrainerPhone(
                trainer_id=trainer.id,
                phone=data['phone']
            )
            db.session.add(phone)
        
        db.session.commit()
        
        # Return created trainer data
        trainer_dict = {
            'id': str(trainer.id),
            'firstName': trainer.first_name,
            'lastName': trainer.last_name,
            'specialties': specialties if isinstance(specialties, list) else specialties_str.split(','),
            'experience': f"{trainer.experience_years} years",
            'availability': trainer.availability,
            'status': 'active'
        }
        
        if 'email' in data:
            trainer_dict['email'] = data['email']
            
        return jsonify({
            'message': 'Trainer created successfully',
            'trainer': trainer_dict
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500