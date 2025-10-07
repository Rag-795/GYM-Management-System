from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import (
    db, Member, User, Role, MemberPhone, Address, MemberMembership, 
    MembershipPlan, PhysicalMetric, Attendance, Payment, Trainer,
    WorkoutPlan, DietPlan, member_workout_assoc, member_diet_assoc
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, desc
from datetime import datetime, timezone, date, timedelta
import uuid
import re

member_bp = Blueprint('members', __name__, url_prefix='/api/members')

def get_current_user():
    """Helper function to get current user from JWT token"""
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return None
    return User.query.get(current_user_id)

def get_member_profile(user):
    """Safely get member profile from user (handles backref list issue)"""
    if not user:
        return None
    profile = user.member_profile
    # member_profile is a list due to backref, get first item
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

def is_trainer(user):
    """Check if user has trainer role"""
    if not user or not user.role:
        return False
    # Handle both uppercase and lowercase role names
    role_name = user.role.name.upper() if user.role.name else ''
    return role_name == 'TRAINER'

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number format"""
    # Remove all non-digit characters
    digits_only = re.sub(r'[^\d]', '', phone)
    return len(digits_only) >= 10

def calculate_age(birth_date):
    """Calculate age from birth date"""
    if not birth_date:
        return None
    today = date.today()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age

def get_member_stats(member):
    """Get additional member statistics"""
    try:
        # Get latest physical metrics
        latest_metric = PhysicalMetric.query.filter_by(member_id=member.id)\
            .order_by(desc(PhysicalMetric.measured_at)).first()
        
        # Get current membership
        current_membership = MemberMembership.query.filter_by(
            member_id=member.id, 
            status='active'
        ).first()
        
        # Calculate attendance percentage (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        total_days = 30
        attended_days = db.session.query(func.count(func.distinct(func.date(Attendance.check_in))))\
            .filter(
                Attendance.member_id == member.id,
                Attendance.check_in >= thirty_days_ago
            ).scalar() or 0
        
        attendance_percentage = round((attended_days / total_days) * 100, 1)
        
        # Get last check-in
        last_attendance = Attendance.query.filter_by(member_id=member.id)\
            .order_by(desc(Attendance.check_in)).first()
        
        return {
            'weight': f"{latest_metric.weight_kg} kg" if latest_metric and latest_metric.weight_kg else None,
            'height': f"{latest_metric.height_cm} cm" if latest_metric and latest_metric.height_cm else None,
            'bmi': float(latest_metric.bmi) if latest_metric and latest_metric.bmi else None,
            'attendance': f"{attendance_percentage}%",
            'last_check_in': last_attendance.check_in.strftime('%Y-%m-%d %I:%M %p') if last_attendance else None,
            'plan': current_membership.plan.name if current_membership and current_membership.plan else None,
            'next_payment': current_membership.end_date.isoformat() if current_membership else None
        }
    except Exception as e:
        print(f"Error calculating member stats: {e}")
        return {
            'weight': None, 'height': None, 'bmi': None,
            'attendance': '0%', 'last_check_in': None,
            'plan': None, 'next_payment': None
        }

@member_bp.route('/', methods=['GET'])
@jwt_required()
def get_members():
    """Get all members with filtering and search"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Debug logging
        print(f"DEBUG: User {current_user.email} with role '{current_user.role.name if current_user.role else 'None'}' accessing members")
        
        # Check permissions - admins can view all members, trainers can view their assigned members
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'error': 'Admin or trainer access required'}), 403
        
        # Get query parameters
        search = request.args.get('search', '').strip()
        status = request.args.get('status', 'all')  # all, active, inactive
        plan = request.args.get('plan', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = db.session.query(Member).join(User)
        
        # For trainers, show all active members (they can work with any member)
        # Note: In the current schema, there's no direct trainer-member assignment
        # Trainers can view all members to assign workout/diet plans or track attendance
        if is_trainer(current_user):
            # Trainers can see all active members
            query = query.filter(Member.is_active == True)
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Member.first_name.ilike(search_term),
                    Member.last_name.ilike(search_term),
                    User.email.ilike(search_term),
                    func.concat(Member.first_name, ' ', Member.last_name).ilike(search_term)
                )
            )
        
        # Apply status filter
        if status == 'active':
            query = query.filter(Member.is_active == True)
        elif status == 'inactive':
            query = query.filter(Member.is_active == False)
        
        # Apply membership plan filter
        if plan:
            query = query.join(MemberMembership).join(MembershipPlan)\
                .filter(MembershipPlan.name.ilike(f"%{plan}%"))
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        members = query.offset(offset).limit(limit).all()
        
        # Format response with additional stats
        members_data = []
        for member in members:
            member_dict = member.to_dict()
            stats = get_member_stats(member)
            member_dict.update(stats)
            member_dict['age'] = calculate_age(member.dob)
            
            # Add user email
            if member.user:
                member_dict['email'] = member.user.email
            
            # Add current membership info - get most recent membership (active or most recent expired)
            current_membership = MemberMembership.query.filter_by(
                member_id=member.id
            ).join(MembershipPlan).order_by(MemberMembership.start_date.desc()).first()
            
            if current_membership:
                member_dict['current_membership'] = {
                    'plan_name': current_membership.plan.name,
                    'start_date': current_membership.start_date.isoformat(),
                    'end_date': current_membership.end_date.isoformat(),
                    'status': current_membership.status
                }
                # Show plan name with status indicator
                if current_membership.status == 'active':
                    member_dict['membership_type'] = current_membership.plan.name
                else:
                    member_dict['membership_type'] = f"{current_membership.plan.name} ({current_membership.status.title()})"
            else:
                member_dict['current_membership'] = None
                member_dict['membership_type'] = 'No Plan History'
            
            # Add trainer information (if assigned)
            # For now, we'll set it as 'Unassigned' since trainer assignment is not in the current schema
            member_dict['trainer_name'] = 'Unassigned'
            
            members_data.append(member_dict)
        
        return jsonify({
            'members': members_data,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@member_bp.route('/<member_id>', methods=['GET'])
@jwt_required()
def get_member(member_id):
    """Get specific member details"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate UUID format
        try:
            uuid.UUID(member_id)
        except ValueError:
            return jsonify({'error': 'Invalid member ID format'}), 400
        
        member = Member.query.get(member_id)
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Check permissions (role names in DB are lowercase: 'member', 'trainer', 'admin')
        member_profile = get_member_profile(current_user)
        is_same_member = (current_user.role.name.lower() == 'member' and 
                         member_profile and 
                         str(member_profile.id) == member_id)
        
        if not (is_admin(current_user) or is_same_member):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Get detailed member information
        member_dict = member.to_dict()
        stats = get_member_stats(member)
        member_dict.update(stats)
        member_dict['age'] = calculate_age(member.dob)
        
        # Add user email
        if member.user:
            member_dict['email'] = member.user.email
        
        # Get membership history
        memberships = MemberMembership.query.filter_by(member_id=member.id)\
            .join(MembershipPlan).order_by(desc(MemberMembership.start_date)).all()
        
        member_dict['membership_history'] = [{
            'id': str(membership.id),
            'plan_id': str(membership.plan_id),
            'plan_name': membership.plan.name,
            'start_date': membership.start_date.isoformat(),
            'end_date': membership.end_date.isoformat(),
            'status': membership.status,
            'amount_paid': float(membership.amount_paid) if membership.amount_paid else 0,
            'discount': float(membership.discount) if membership.discount else 0
        } for membership in memberships]
        
        # Get physical metrics history
        metrics = PhysicalMetric.query.filter_by(member_id=member.id)\
            .order_by(desc(PhysicalMetric.measured_at)).limit(10).all()
        
        member_dict['physical_metrics'] = [{
            'id': str(metric.id),
            'measured_at': metric.measured_at.isoformat(),
            'height_cm': float(metric.height_cm) if metric.height_cm else None,
            'weight_kg': float(metric.weight_kg) if metric.weight_kg else None,
            'bmi': float(metric.bmi) if metric.bmi else None
        } for metric in metrics]
        
        # Get workout plans assigned to member
        member_dict['workout_plans'] = [{
            'id': str(plan.id),
            'name': plan.name,
            'type': plan.type,
            'description': plan.description,
            'created_by': str(plan.created_by) if plan.created_by else None,
            'trainer_name': f"{plan.trainer.first_name} {plan.trainer.last_name}" if plan.trainer else None,
            'created_at': plan.created_at.isoformat() if plan.created_at else None
        } for plan in member.workout_plans] if member.workout_plans else []
        
        # Get diet plans assigned to member
        member_dict['diet_plans'] = [{
            'id': str(plan.id),
            'name': plan.name,
            'type': plan.type,
            'description': plan.description,
            'kcal_count': plan.kcal_count,
            'created_by': str(plan.created_by) if plan.created_by else None,
            'trainer_name': f"{plan.trainer.first_name} {plan.trainer.last_name}" if plan.trainer else None,
            'created_at': plan.created_at.isoformat() if plan.created_at else None
        } for plan in member.diet_plans] if member.diet_plans else []
        
        return jsonify({'member': member_dict}), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in get_member: {str(e)}")
        return jsonify({'error': str(e)}), 500

@member_bp.route('/', methods=['POST'])
@jwt_required()
def create_member():
    """Create a new member"""
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
        required_fields = ['email', 'firstName', 'lastName', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already exists'}), 400
        
        # Get member role
        member_role = Role.query.filter_by(name='MEMBER').first()
        if not member_role:
            return jsonify({'error': 'Member role not found'}), 500
        
        # Create user account
        user = User(
            email=data['email'],
            role_id=member_role.id,
            is_active=True
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Parse date of birth
        dob = None
        if data.get('dateOfBirth'):
            try:
                dob = datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format for dateOfBirth. Use YYYY-MM-DD'}), 400
        
        # Create member profile
        member = Member(
            user_id=user.id,
            first_name=data['firstName'],
            last_name=data['lastName'],
            dob=dob,
            gender=data.get('gender'),
            emergency_contact=data.get('emergencyContact'),
            is_active=True
        )
        db.session.add(member)
        db.session.flush()  # Get member ID
        
        # Add phone number if provided
        if data.get('phone') and validate_phone(data['phone']):
            phone = MemberPhone(
                member_id=member.id,
                phone=data['phone']
            )
            db.session.add(phone)
        
        # Add address if provided
        if any(data.get(field) for field in ['address', 'city', 'zipCode']):
            address = Address(
                member_id=member.id,
                street_name=data.get('address'),
                city_name=data.get('city'),
                postal_code=data.get('zipCode')
            )
            db.session.add(address)
        
        # Add physical metrics if provided
        if any(data.get(field) for field in ['height', 'weight']):
            height = float(data['height']) if data.get('height') else None
            weight = float(data['weight']) if data.get('weight') else None
            bmi = None
            
            if height and weight:
                bmi = round(weight / ((height/100) ** 2), 2)
            
            metric = PhysicalMetric(
                member_id=member.id,
                height_cm=height,
                weight_kg=weight,
                bmi=bmi
            )
            db.session.add(metric)
        
        # Create membership if plan is specified
        if data.get('membershipPlan'):
            plan = MembershipPlan.query.filter_by(name=data['membershipPlan']).first()
            if plan:
                start_date = date.today()
                if data.get('startDate'):
                    try:
                        start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
                    except ValueError:
                        pass
                
                end_date = start_date + timedelta(days=plan.duration_days)
                
                membership = MemberMembership(
                    member_id=member.id,
                    plan_id=plan.id,
                    start_date=start_date,
                    end_date=end_date,
                    status='active',
                    amount_paid=plan.price
                )
                db.session.add(membership)
        
        db.session.commit()
        
        # Return created member data
        member_dict = member.to_dict()
        member_dict['email'] = user.email
        member_dict['age'] = calculate_age(member.dob)
        
        return jsonify({
            'message': 'Member created successfully',
            'member': member_dict
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@member_bp.route('/<member_id>', methods=['PUT'])
@jwt_required()
def update_member(member_id):
    """Update member information"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate UUID format
        try:
            uuid.UUID(member_id)
        except ValueError:
            return jsonify({'error': 'Invalid member ID format'}), 400
        
        member = Member.query.get(member_id)
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Check permissions
        member_profile = get_member_profile(current_user)
        is_same_member = (current_user.role.name.lower() == 'member' and 
                         member_profile and 
                         str(member_profile.id) == member_id)
        
        if not (is_admin(current_user) or is_same_member):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update member basic information
        if 'firstName' in data:
            member.first_name = data['firstName']
        elif 'first_name' in data:
            member.first_name = data['first_name']
            
        if 'lastName' in data:
            member.last_name = data['lastName']
        elif 'last_name' in data:
            member.last_name = data['last_name']
            
        if 'gender' in data:
            member.gender = data['gender']
            
        if 'emergencyContact' in data:
            member.emergency_contact = data['emergencyContact']
        elif 'emergency_contact' in data:
            member.emergency_contact = data['emergency_contact']
            
        if 'dob' in data:
            if data['dob']:
                try:
                    member.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
                except ValueError:
                    pass
        
        # Update date of birth
        if 'dateOfBirth' in data and data['dateOfBirth']:
            try:
                member.dob = datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format for dateOfBirth. Use YYYY-MM-DD'}), 400
        
        # Admin can update status
        if is_admin(current_user) and 'is_active' in data:
            member.is_active = bool(data['is_active'])
        
        # Update email (if admin)
        if is_admin(current_user) and 'email' in data:
            if validate_email(data['email']):
                existing_user = User.query.filter(
                    User.email == data['email'],
                    User.id != member.user_id
                ).first()
                if existing_user:
                    return jsonify({'error': 'Email already exists'}), 400
                member.user.email = data['email']
            else:
                return jsonify({'error': 'Invalid email format'}), 400
        
        # Update phone number
        if 'phone' in data:
            # Remove existing phone numbers
            MemberPhone.query.filter_by(member_id=member.id).delete()
            
            if data['phone'] and validate_phone(data['phone']):
                phone = MemberPhone(
                    member_id=member.id,
                    phone=data['phone']
                )
                db.session.add(phone)
        
        # Update address
        if any(field in data for field in ['address', 'city', 'zipCode']):
            # Get or create address
            address = Address.query.filter_by(member_id=member.id).first()
            if not address:
                address = Address(member_id=member.id)
                db.session.add(address)
            
            if 'address' in data:
                address.street_name = data['address']
            if 'city' in data:
                address.city_name = data['city']
            if 'zipCode' in data:
                address.postal_code = data['zipCode']
        
        # Add new physical metrics if provided
        if any(field in data for field in ['height', 'weight']):
            height = float(data['height']) if data.get('height') else None
            weight = float(data['weight']) if data.get('weight') else None
            bmi = None
            
            if height and weight:
                bmi = round(weight / ((height/100) ** 2), 2)
            
            metric = PhysicalMetric(
                member_id=member.id,
                height_cm=height,
                weight_kg=weight,
                bmi=bmi
            )
            db.session.add(metric)
        
        db.session.commit()
        
        # Return updated member data
        member_dict = member.to_dict()
        stats = get_member_stats(member)
        member_dict.update(stats)
        member_dict['age'] = calculate_age(member.dob)
        member_dict['email'] = member.user.email
        
        return jsonify({
            'message': 'Member updated successfully',
            'member': member_dict
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@member_bp.route('/<member_id>', methods=['DELETE'])
@jwt_required()
def delete_member(member_id):
    """Delete/deactivate a member (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate UUID format
        try:
            uuid.UUID(member_id)
        except ValueError:
            return jsonify({'error': 'Invalid member ID format'}), 400
        
        member = Member.query.get(member_id)
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Hard delete - actually remove from database
        # First, delete related records to maintain referential integrity
        
        # Delete member phones
        MemberPhone.query.filter_by(member_id=member.id).delete()
        
        # Delete member addresses
        Address.query.filter_by(member_id=member.id).delete()
        
        # Delete physical metrics
        PhysicalMetric.query.filter_by(member_id=member.id).delete()
        
        # Delete membership history
        MemberMembership.query.filter_by(member_id=member.id).delete()
        
        # Delete attendance records
        Attendance.query.filter_by(member_id=member.id).delete()
        
        # Delete payment records
        Payment.query.filter_by(member_id=member.id).delete()
        
        # Delete the user account associated with this member
        user = member.user
        
        # Delete the member record
        db.session.delete(member)
        
        # Delete the user record
        if user:
            db.session.delete(user)
        
        db.session.commit()
        
        return jsonify({'message': 'Member deleted successfully'}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@member_bp.route('/<member_id>/metrics', methods=['POST'])
@jwt_required()
def add_physical_metrics(member_id):
    """Add physical metrics for a member"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate UUID format
        try:
            uuid.UUID(member_id)
        except ValueError:
            return jsonify({'error': 'Invalid member ID format'}), 400
        
        member = Member.query.get(member_id)
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Check permissions
        member_profile = get_member_profile(current_user)
        is_same_member = (current_user.role.name.lower() == 'member' and 
                         member_profile and 
                         str(member_profile.id) == member_id)
        
        if not (is_admin(current_user) or current_user.role.name.lower() == 'trainer' or is_same_member):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required metrics
        if not any(data.get(field) for field in ['height', 'weight']):
            return jsonify({'error': 'At least height or weight is required'}), 400
        
        height = float(data['height']) if data.get('height') else None
        weight = float(data['weight']) if data.get('weight') else None
        bmi = None
        
        if height and weight:
            bmi = round(weight / ((height/100) ** 2), 2)
        
        metric = PhysicalMetric(
            member_id=member.id,
            height_cm=height,
            weight_kg=weight,
            bmi=bmi
        )
        db.session.add(metric)
        db.session.commit()
        
        return jsonify({
            'message': 'Physical metrics added successfully',
            'metric': {
                'id': str(metric.id),
                'measured_at': metric.measured_at.isoformat(),
                'height_cm': float(metric.height_cm) if metric.height_cm else None,
                'weight_kg': float(metric.weight_kg) if metric.weight_kg else None,
                'bmi': float(metric.bmi) if metric.bmi else None
            }
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Invalid numeric values for height or weight'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@member_bp.route('/membership-plans', methods=['GET'])
@jwt_required()
def get_membership_plans():
    """Get all available membership plans"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Fetch distinct plan names from membership_plans table
        plans = db.session.query(MembershipPlan.name).distinct().all()
        
        # Convert to simple list of plan names
        plan_names = [plan[0] for plan in plans]
        
        return jsonify({
            'plans': plan_names
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500