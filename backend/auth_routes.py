from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Role, Member, Trainer, MemberPhone, TrainerPhone
from datetime import datetime, timezone
import uuid
import re
from email_validator import validate_email, EmailNotValidError

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    return True, "Password is valid"

def validate_phone(phone):
    """Validate phone number format"""
    # Remove all non-digit characters
    cleaned_phone = re.sub(r'[^\d]', '', phone)
    
    # Check if it's a valid length (10 digits)
    if len(cleaned_phone) != 10:
        return False
    
    return True

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email
        try:
            validated_email = validate_email(data['email'])
            email = validated_email.email
        except EmailNotValidError:
            return jsonify({'error': 'Invalid email address'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Validate password
        is_valid, password_message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': password_message}), 400
        
        # Validate phone
        if not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Validate date of birth (must be at least 16 years old)
        try:
            dob = datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date()
            today = datetime.now().date()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 16:
                return jsonify({'error': 'You must be at least 16 years old'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid date of birth format'}), 400
        
        # Get role from request (default to member if not provided)
        requested_role = data.get('role', 'MEMBER').upper()
        role_mapping = {
            'ADMIN': 'admin',
            'TRAINER': 'trainer', 
            'MEMBER': 'member'
        }
        
        role_name = role_mapping.get(requested_role, 'member')
        user_role = Role.query.filter_by(name=role_name).first()
        if not user_role:
            return jsonify({'error': f'{role_name} role not found. Please contact administrator.'}), 500
        
        # Create user with the specified role
        user = User(
            email=email,
            role_id=user_role.id
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()  # To get the user ID
        
        profile = None
        
        # Create role-specific profile
        if role_name == 'member':
            # Create member profile
            member = Member(
                user_id=user.id,
                first_name=data['firstName'],
                last_name=data['lastName'],
                dob=dob,
                emergency_contact=data.get('emergencyContact', data['phone'])
            )
            db.session.add(member)
            db.session.flush()
            
            # Add member phone
            phone = MemberPhone(
                member_id=member.id,
                phone=data['phone']
            )
            db.session.add(phone)
            profile = member.to_dict()
            
        elif role_name == 'trainer':
            # Create trainer profile
            trainer = Trainer(
                user_id=user.id,
                first_name=data['firstName'],
                last_name=data['lastName'],
                specialization=', '.join(data.get('specialties', [])),
                experience_years=int(data.get('experience', 0)) if data.get('experience') else 0,
                bio=data.get('bio', '')
            )
            db.session.add(trainer)
            db.session.flush()
            
            # Add trainer phone
            phone = TrainerPhone(
                trainer_id=trainer.id,
                phone=data['phone']
            )
            db.session.add(phone)
            profile = trainer.to_dict()
        
        db.session.commit()
        
        # Create access token with uppercase role for frontend compatibility
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'role': requested_role,  # Use uppercase role for frontend
                'email': user.email
            }
        )
        
        return jsonify({
            'message': 'Account created successfully',
            'token': access_token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'role': requested_role,  # Return uppercase role
                'profile': profile
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({'error': 'An error occurred during registration'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated. Please contact administrator.'}), 401
        
        # Get user profile
        profile = None
        try:
            if user.role.name == 'member':
                member_profile = Member.query.filter_by(user_id=user.id).first()
                if member_profile:
                    profile = member_profile.to_dict()
            elif user.role.name == 'trainer':
                trainer_profile = Trainer.query.filter_by(user_id=user.id).first()
                if trainer_profile:
                    profile = trainer_profile.to_dict()
        except Exception as e:
            print(f"Profile loading error: {str(e)}")
            profile = None
        
        # Create access token with uppercase role for frontend compatibility
        role_mapping = {
            'admin': 'ADMIN',
            'trainer': 'TRAINER',
            'member': 'MEMBER'
        }
        frontend_role = role_mapping.get(user.role.name, 'MEMBER')
        
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'role': frontend_role,  # Use uppercase role for frontend
                'email': user.email
            }
        )
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'role': frontend_role,  # Return uppercase role
                'profile': profile
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'An error occurred during login'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user profile
        profile = None
        try:
            if user.role.name == 'member':
                member_profile = Member.query.filter_by(user_id=user.id).first()
                if member_profile:
                    profile = member_profile.to_dict()
            elif user.role.name == 'trainer':
                trainer_profile = Trainer.query.filter_by(user_id=user.id).first()
                if trainer_profile:
                    profile = trainer_profile.to_dict()
        except Exception as e:
            print(f"Profile loading error: {str(e)}")
            profile = None
        
        # Map role to frontend format
        role_mapping = {
            'admin': 'ADMIN',
            'trainer': 'TRAINER', 
            'member': 'MEMBER'
        }
        frontend_role = role_mapping.get(user.role.name, 'MEMBER')
        
        return jsonify({
            'user': {
                'id': str(user.id),
                'email': user.email,
                'role': frontend_role,  # Return uppercase role
                'profile': profile
            }
        }), 200
        
    except Exception as e:
        print(f"Get current user error: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching user data'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        # Create new access token
        new_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'role': user.role.name,
                'email': user.email
            }
        )
        
        return jsonify({'token': new_token}), 200
        
    except Exception as e:
        print(f"Refresh token error: {str(e)}")
        return jsonify({'error': 'An error occurred while refreshing token'}), 500