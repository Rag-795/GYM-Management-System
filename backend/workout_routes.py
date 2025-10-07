"""
Workout Plan Routes - Backend API for managing workout plans
Works with existing schema: WorkoutPlan(id, name, type, description, created_by, created_at)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, WorkoutPlan, Member, User, Trainer, member_workout_assoc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, func, and_
from datetime import datetime, timezone
import uuid
import logging

# Configure logging
logger = logging.getLogger(__name__)

workout_bp = Blueprint('workout_plans', __name__, url_prefix='/api/workout-plans')

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
    except (ValueError, TypeError, AttributeError):
        return False

def format_workout_plan_dict(workout_plan, include_members=True):
    """Format workout plan for API response"""
    try:
        formatted_plan = {
            'id': str(workout_plan.id),
            'name': workout_plan.name,
            'type': workout_plan.type,
            'description': workout_plan.description,
            'created_at': workout_plan.created_at.isoformat() if workout_plan.created_at else None,
            'trainer_name': None,
            'assigned_members': []
        }
        
        # Add trainer information if available
        if workout_plan.trainer:
            formatted_plan['trainer_name'] = f"{workout_plan.trainer.first_name} {workout_plan.trainer.last_name}"
        
        # Add assigned members if requested
        if include_members and workout_plan.members:
            formatted_plan['assigned_members'] = [
                {
                    'id': str(member.id),
                    'name': f"{member.first_name} {member.last_name}",
                    'email': member.user.email if member.user else None
                }
                for member in workout_plan.members
            ]
        
        return formatted_plan
    except Exception as e:
        logger.error(f"Error formatting workout plan: {str(e)}")
        return None

def get_trainer_profile_id():
    """Get trainer profile ID for current user"""
    try:
        current_user = get_current_user()
        if not current_user:
            return None
            
        if is_trainer(current_user):
            trainer_profile = Trainer.query.filter_by(user_id=current_user.id).first()
            if trainer_profile:
                return trainer_profile.id
        return None
    except Exception as e:
        logger.error(f"Error getting trainer profile ID: {str(e)}")
        return None

@workout_bp.route('/', methods=['GET'])
@jwt_required()
def get_workout_plans():
    """Get all workout plans with filtering and pagination"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 items per page
        search = request.args.get('search', '').strip()
        workout_type = request.args.get('type', '').strip()

        # Build base query
        query = WorkoutPlan.query.join(Trainer, WorkoutPlan.created_by == Trainer.id, isouter=True)

        # For trainers, only show their own plans
        if is_trainer(current_user):
            trainer_id = get_trainer_profile_id()
            if trainer_id:
                query = query.filter(WorkoutPlan.created_by == trainer_id)
            else:
                return jsonify({'success': True, 'workout_plans': [], 'total': 0, 'pages': 0}), 200

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WorkoutPlan.name.ilike(search_pattern),
                    WorkoutPlan.description.ilike(search_pattern),
                    WorkoutPlan.type.ilike(search_pattern)
                )
            )

        # Apply type filter
        if workout_type:
            query = query.filter(WorkoutPlan.type.ilike(f"%{workout_type}%"))

        # Get total count for pagination
        total_plans = query.count()
        total_pages = (total_plans + limit - 1) // limit

        # Apply pagination
        workout_plans = query.order_by(WorkoutPlan.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        # Format response
        formatted_plans = []
        for plan in workout_plans:
            formatted_plan = format_workout_plan_dict(plan)
            if formatted_plan:
                formatted_plans.append(formatted_plan)

        return jsonify({
            'success': True,
            'workout_plans': formatted_plans,
            'total': total_plans,
            'pages': total_pages,
            'current_page': page,
            'limit': limit
        }), 200

    except ValueError as e:
        logger.error(f"Value error in get_workout_plans: {str(e)}")
        return jsonify({'success': False, 'error': 'Invalid parameters'}), 400
    except Exception as e:
        logger.error(f"Unexpected error in get_workout_plans: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@workout_bp.route('/', methods=['POST'])
@jwt_required()
def create_workout_plan():
    """Create a new workout plan"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Validate required fields
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'success': False, 'error': 'Workout plan name is required'}), 400

        # Get trainer profile ID
        trainer_id = get_trainer_profile_id()
        if not trainer_id:
            return jsonify({'success': False, 'error': 'Trainer profile not found'}), 404

        # Create workout plan
        workout_plan = WorkoutPlan(
            name=name,
            type=data.get('type', '').strip(),
            description=data.get('description', '').strip(),
            created_by=trainer_id,
            created_at=utc_now()
        )

        db.session.add(workout_plan)
        db.session.flush()  # Flush to get the ID

        # Handle member assignments
        assigned_member_ids = data.get('assigned_members', [])
        logger.info(f"Received assigned_members: {assigned_member_ids}")
        if assigned_member_ids:
            valid_members = []
            for member_data in assigned_member_ids:
                member_id = member_data.get('id') if isinstance(member_data, dict) else member_data
                logger.info(f"Processing member_data: {member_data}, extracted member_id: {member_id}")
                if member_id and validate_uuid(str(member_id)):
                    member = Member.query.get(member_id)
                    if member:
                        valid_members.append(member)
                        logger.info(f"Added valid member: {member.first_name} {member.last_name}")
                    else:
                        logger.warning(f"Member not found for ID: {member_id}")
                else:
                    logger.warning(f"Invalid member ID: {member_id}")

            # Assign members to workout plan
            workout_plan.members = valid_members
            logger.info(f"Assigned {len(valid_members)} members to workout plan")

        db.session.commit()

        # Format response
        formatted_plan = format_workout_plan_dict(workout_plan)
        
        return jsonify({
            'success': True,
            'message': 'Workout plan created successfully',
            'workout_plan': formatted_plan
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error in create_workout_plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error in create_workout_plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@workout_bp.route('/<workout_plan_id>', methods=['GET'])
@jwt_required()
def get_workout_plan(workout_plan_id):
    """Get a specific workout plan by ID"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        # Validate UUID
        if not validate_uuid(workout_plan_id):
            return jsonify({'success': False, 'error': 'Invalid workout plan ID'}), 400

        # Find workout plan
        workout_plan = WorkoutPlan.query.get(workout_plan_id)
        if not workout_plan:
            return jsonify({'success': False, 'error': 'Workout plan not found'}), 404

        # Check if trainer can access this plan
        if is_trainer(current_user):
            trainer_id = get_trainer_profile_id()
            if trainer_id != workout_plan.created_by:
                return jsonify({'success': False, 'error': 'Access denied'}), 403

        # Format response
        formatted_plan = format_workout_plan_dict(workout_plan)
        
        return jsonify({
            'success': True,
            'workout_plan': formatted_plan
        }), 200

    except Exception as e:
        logger.error(f"Error in get_workout_plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@workout_bp.route('/<workout_plan_id>', methods=['PUT'])
@jwt_required()
def update_workout_plan(workout_plan_id):
    """Update a workout plan"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        # Validate UUID
        if not validate_uuid(workout_plan_id):
            return jsonify({'success': False, 'error': 'Invalid workout plan ID'}), 400

        # Find workout plan
        workout_plan = WorkoutPlan.query.get(workout_plan_id)
        if not workout_plan:
            return jsonify({'success': False, 'error': 'Workout plan not found'}), 404

        # Check if trainer can access this plan
        if is_trainer(current_user):
            trainer_id = get_trainer_profile_id()
            if trainer_id != workout_plan.created_by:
                return jsonify({'success': False, 'error': 'Access denied'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Update fields
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({'success': False, 'error': 'Workout plan name cannot be empty'}), 400
            workout_plan.name = name

        if 'type' in data:
            workout_plan.type = data['type'].strip()

        if 'description' in data:
            workout_plan.description = data['description'].strip()

        # Handle member assignments
        if 'assigned_members' in data:
            assigned_member_ids = data['assigned_members']
            logger.info(f"UPDATE: Received assigned_members: {assigned_member_ids}")
            valid_members = []
            for member_data in assigned_member_ids:
                member_id = member_data.get('id') if isinstance(member_data, dict) else member_data
                logger.info(f"UPDATE: Processing member_data: {member_data}, extracted member_id: {member_id}")
                if member_id and validate_uuid(str(member_id)):
                    member = Member.query.get(member_id)
                    if member:
                        valid_members.append(member)
                        logger.info(f"UPDATE: Added valid member: {member.first_name} {member.last_name}")
                    else:
                        logger.warning(f"UPDATE: Member not found for ID: {member_id}")
                else:
                    logger.warning(f"UPDATE: Invalid member ID: {member_id}")

            workout_plan.members = valid_members
            logger.info(f"UPDATE: Assigned {len(valid_members)} members to workout plan")

        db.session.commit()

        # Format response
        formatted_plan = format_workout_plan_dict(workout_plan)
        
        return jsonify({
            'success': True,
            'message': 'Workout plan updated successfully',
            'workout_plan': formatted_plan
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error in update_workout_plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in update_workout_plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@workout_bp.route('/<workout_plan_id>', methods=['DELETE'])
@jwt_required()
def delete_workout_plan(workout_plan_id):
    """Delete a workout plan"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        # Validate UUID
        if not validate_uuid(workout_plan_id):
            return jsonify({'success': False, 'error': 'Invalid workout plan ID'}), 400

        # Find workout plan
        workout_plan = WorkoutPlan.query.get(workout_plan_id)
        if not workout_plan:
            return jsonify({'success': False, 'error': 'Workout plan not found'}), 404

        # Check if trainer can access this plan
        if is_trainer(current_user):
            trainer_id = get_trainer_profile_id()
            if trainer_id != workout_plan.created_by:
                return jsonify({'success': False, 'error': 'Access denied'}), 403

        # Store plan name for response
        plan_name = workout_plan.name

        # Delete the workout plan
        db.session.delete(workout_plan)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Workout plan "{plan_name}" deleted successfully'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error in delete_workout_plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in delete_workout_plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@workout_bp.route('/types', methods=['GET'])
@jwt_required()
def get_workout_plan_types():
    """Get available workout plan types"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        # Predefined workout types based on common fitness categories
        workout_types = [
            'strength',
            'cardio',
            'flexibility',
            'plyometric',
            'core',
            'power',
            'mobility',
            'balance',
            'hiit',
            'endurance',
            'rehabilitation',
            'functional'
        ]

        return jsonify({
            'success': True,
            'workout_types': workout_types
        }), 200

    except Exception as e:
        logger.error(f"Error in get_workout_plan_types: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@workout_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_workout_plan_statistics():
    """Get workout plan statistics"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        # Base query
        query = WorkoutPlan.query

        # For trainers, only show their own plans
        if is_trainer(current_user):
            trainer_id = get_trainer_profile_id()
            if trainer_id:
                query = query.filter(WorkoutPlan.created_by == trainer_id)
            else:
                return jsonify({
                    'success': True,
                    'statistics': {
                        'total_plans': 0,
                        'plans_by_type': {},
                        'total_assigned_members': 0,
                        'avg_members_per_plan': 0
                    }
                }), 200

        # Get statistics
        total_plans = query.count()
        
        # Plans by type
        type_stats = db.session.query(
            WorkoutPlan.type,
            func.count(WorkoutPlan.id).label('count')
        ).filter(
            WorkoutPlan.created_by == trainer_id if is_trainer(current_user) and trainer_id else True
        ).group_by(WorkoutPlan.type).all()

        plans_by_type = {stat.type or 'unspecified': stat.count for stat in type_stats}

        # Total assigned members (unique)
        total_assigned_members = db.session.query(
            func.count(func.distinct(member_workout_assoc.c.member_id))
        ).select_from(
            member_workout_assoc.join(WorkoutPlan, member_workout_assoc.c.workout_plan_id == WorkoutPlan.id)
        ).filter(
            WorkoutPlan.created_by == trainer_id if is_trainer(current_user) and trainer_id else True
        ).scalar() or 0

        # Average members per plan
        avg_members_per_plan = round(total_assigned_members / total_plans, 1) if total_plans > 0 else 0

        return jsonify({
            'success': True,
            'statistics': {
                'total_plans': total_plans,
                'plans_by_type': plans_by_type,
                'total_assigned_members': total_assigned_members,
                'avg_members_per_plan': avg_members_per_plan
            }
        }), 200

    except Exception as e:
        logger.error(f"Error in get_workout_plan_statistics: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@workout_bp.route('/members', methods=['GET'])
@jwt_required()
def get_available_members():
    """Get available members for workout plan assignment"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Admin or trainer access required'}), 403

        # Get query parameters
        search = request.args.get('search', '').strip()
        limit = min(int(request.args.get('limit', 50)), 100)

        # Build query for active members
        query = Member.query.join(User).filter(Member.is_active == True)

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Member.first_name.ilike(search_pattern),
                    Member.last_name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    func.concat(Member.first_name, ' ', Member.last_name).ilike(search_pattern)
                )
            )

        # Get members
        members = query.order_by(Member.first_name, Member.last_name).limit(limit).all()

        # Format members
        formatted_members = []
        for member in members:
            formatted_members.append({
                'id': str(member.id),
                'first_name': member.first_name,
                'last_name': member.last_name,
                'full_name': f"{member.first_name} {member.last_name}",
                'email': member.user.email if member.user else None,
                'is_active': member.is_active
            })

        return jsonify({
            'success': True,
            'members': formatted_members,
            'total': len(formatted_members)
        }), 200

    except ValueError as e:
        logger.error(f"Value error in get_available_members: {str(e)}")
        return jsonify({'success': False, 'error': 'Invalid parameters'}), 400
    except Exception as e:
        logger.error(f"Error in get_available_members: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500