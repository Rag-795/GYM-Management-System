"""
Diet Plan Routes - Backend API for managing diet plans
Works with existing schema: DietPlan(id, name, type, description, kcal_count, created_by, created_at)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, DietPlan, Member, User, Trainer, member_diet_assoc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, func, and_
from datetime import datetime, timezone
import uuid
import logging

# Configure logging
logger = logging.getLogger(__name__)

diet_bp = Blueprint('diet_plans', __name__, url_prefix='/api/diet-plans')

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
    except ValueError:
        return False

def get_trainer_profile_id(user):
    """Get trainer profile ID safely - handles the fact that trainer_profile is a list"""
    if not user or not user.trainer_profile:
        return None
    # trainer_profile is a backref list, get the first (should be only) one
    if isinstance(user.trainer_profile, list) and len(user.trainer_profile) > 0:
        return user.trainer_profile[0].id
    elif hasattr(user.trainer_profile, 'id'):
        # This shouldn't happen given the backref, but handle it anyway
        return user.trainer_profile.id
    return None

def format_diet_plan_dict(diet_plan, include_members=False, current_user=None):
    """Format diet plan data for response"""
    # Basic data - these should always work
    data = {
        'id': str(diet_plan.id),
        'name': diet_plan.name or '',
        'type': diet_plan.type or 'General',
        'description': diet_plan.description or '',
        'kcal_count': diet_plan.kcal_count or 0,
        'created_by': str(diet_plan.created_by) if diet_plan.created_by else None,
        'created_at': diet_plan.created_at.isoformat() if diet_plan.created_at else None,
        'creator_name': None,
        'assigned_members': [],
        'member_count': 0,
        'status': 'active'
    }
    
    # Try to get creator name - but don't fail if relationship doesn't exist
    try:
        if diet_plan.trainer and hasattr(diet_plan.trainer, 'first_name'):
            first_name = diet_plan.trainer.first_name or ''
            last_name = diet_plan.trainer.last_name or ''
            data['creator_name'] = f"{first_name} {last_name}".strip() or None
    except:
        pass  # Just use None for creator_name
    
    # Try to get members - but don't fail if relationship doesn't exist
    if include_members:
        try:
            if diet_plan.members:
                assigned_members = []
                for member in diet_plan.members:
                    try:
                        member_info = {
                            'id': str(member.id),
                            'name': f"{member.first_name or ''} {member.last_name or ''}".strip() or 'Unknown',
                            'email': member.user.email if member.user else None
                        }
                        assigned_members.append(member_info)
                    except:
                        continue  # Skip problematic members
                data['assigned_members'] = assigned_members
                data['member_count'] = len(assigned_members)
        except:
            pass  # Keep default empty values
    
    return data

@diet_bp.route('/', methods=['GET'])
@jwt_required()
def get_diet_plans():
    """Get all diet plans with optional filters and pagination"""
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
        plan_type = request.args.get('type', '', type=str)
        created_by = request.args.get('created_by', '', type=str)
        
        # Limit per_page to maximum 100
        per_page = min(per_page, 100)
        
        # Build query
        query = DietPlan.query.join(Trainer, DietPlan.created_by == Trainer.id, isouter=True)
        
        # If trainer, only show their own plans
        if is_trainer(current_user) and not is_admin(current_user):
            trainer_id = get_trainer_profile_id(current_user)
            if trainer_id:
                query = query.filter(DietPlan.created_by == trainer_id)
            else:
                # Trainer with no profile - return empty
                return jsonify({
                    'success': True,
                    'diet_plans': [],
                    'pagination': {
                        'total': 0,
                        'pages': 0,
                        'current_page': page,
                        'per_page': per_page,
                        'has_prev': False,
                        'has_next': False
                    }
                }), 200
        
        # Search filter
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                or_(
                    DietPlan.name.ilike(search_pattern),
                    DietPlan.description.ilike(search_pattern),
                    DietPlan.type.ilike(search_pattern)
                )
            )
        
        # Type filter
        if plan_type:
            query = query.filter(DietPlan.type.ilike(f'%{plan_type}%'))
        
        # Created by filter (for admins)
        if created_by and is_admin(current_user):
            if validate_uuid(created_by):
                query = query.filter(DietPlan.created_by == created_by)
        
        # Order by creation date (newest first)
        query = query.order_by(DietPlan.created_at.desc())
        
        # Execute query with pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        diet_plans_data = []
        for diet_plan in paginated.items:
            plan_dict = format_diet_plan_dict(diet_plan, include_members=True, current_user=current_user)
            diet_plans_data.append(plan_dict)
        
        return jsonify({
            'success': True,
            'diet_plans': diet_plans_data,
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
        logger.error(f"Error fetching diet plans: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@diet_bp.route('/<plan_id>', methods=['GET'])
@jwt_required()
def get_diet_plan(plan_id):
    """Get specific diet plan details"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Validate plan_id
        if not validate_uuid(plan_id):
            return jsonify({'success': False, 'error': 'Invalid diet plan ID format'}), 400
        
        diet_plan = DietPlan.query.get(plan_id)
        if not diet_plan:
            return jsonify({'success': False, 'error': 'Diet plan not found'}), 404
        
        # Check permissions
        trainer_id = get_trainer_profile_id(current_user)
        can_view = (
            is_admin(current_user) or 
            (is_trainer(current_user) and 
             trainer_id and 
             str(trainer_id) == str(diet_plan.created_by))
        )
        
        if not can_view:
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        plan_dict = format_diet_plan_dict(diet_plan, include_members=True, current_user=current_user)
        
        # Add edit permissions
        trainer_id = get_trainer_profile_id(current_user)
        can_edit = (
            is_admin(current_user) or 
            (is_trainer(current_user) and 
             trainer_id and 
             str(trainer_id) == str(diet_plan.created_by))
        )
        
        return jsonify({
            'success': True,
            'diet_plan': plan_dict,
            'can_edit': can_edit
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching diet plan: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@diet_bp.route('/', methods=['POST'])
@jwt_required()
def create_diet_plan():
    """Create new diet plan"""
    import traceback
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Check permissions - only trainers can create diet plans
        if not is_trainer(current_user):
            return jsonify({'success': False, 'error': 'Only trainers can create diet plans'}), 403
        
        # Check if user has trainer profile
        trainer_id = get_trainer_profile_id(current_user)
        if not trainer_id:
            return jsonify({'success': False, 'error': 'Trainer profile not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'success': False, 'error': 'Plan name is required'}), 400
        
        # Create new diet plan
        diet_plan = DietPlan(
            name=data['name'],
            type=data.get('type', 'General'),
            description=data.get('description'),
            kcal_count=data.get('kcal_count', 0) or data.get('total_calories', 0),
            created_by=trainer_id
        )
        
        db.session.add(diet_plan)
        db.session.flush()  # To get the ID
        
        # Assign to members if provided
        assigned_member_ids = data.get('assigned_members', [])
        if assigned_member_ids:
            for member_data in assigned_member_ids:
                try:
                    member_id = member_data.get('id') if isinstance(member_data, dict) else member_data
                    if validate_uuid(str(member_id)):
                        member = Member.query.get(member_id)
                        if member:
                            diet_plan.members.append(member)
                except Exception as e:
                    logger.error(f"Error processing member {member_data}: {str(e)}")
                    continue
        
        db.session.commit()
        
        plan_dict = format_diet_plan_dict(diet_plan, include_members=True, current_user=current_user)
        
        return jsonify({
            'success': True,
            'message': 'Diet plan created successfully',
            'diet_plan': plan_dict
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error creating diet plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating diet plan: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

@diet_bp.route('/<plan_id>', methods=['PUT'])
@jwt_required()
def update_diet_plan(plan_id):
    """Update diet plan"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Validate plan_id
        if not validate_uuid(plan_id):
            return jsonify({'success': False, 'error': 'Invalid diet plan ID format'}), 400
        
        diet_plan = DietPlan.query.get(plan_id)
        if not diet_plan:
            return jsonify({'success': False, 'error': 'Diet plan not found'}), 404
        
        # Check permissions
        trainer_id = get_trainer_profile_id(current_user)
        can_edit = (
            is_admin(current_user) or 
            (is_trainer(current_user) and 
             trainer_id and 
             str(trainer_id) == str(diet_plan.created_by))
        )
        
        if not can_edit:
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Update allowed fields
        updated_fields = []
        if 'name' in data and data['name']:
            diet_plan.name = data['name']
            updated_fields.append('name')
        
        if 'type' in data:
            diet_plan.type = data['type']
            updated_fields.append('type')
        
        if 'description' in data:
            diet_plan.description = data['description']
            updated_fields.append('description')
        
        if 'kcal_count' in data:
            diet_plan.kcal_count = data['kcal_count']
            updated_fields.append('kcal_count')
        elif 'total_calories' in data:
            diet_plan.kcal_count = data['total_calories']
            updated_fields.append('kcal_count')
        
        # Update member assignments if provided
        if 'assigned_members' in data:
            # Clear existing assignments
            diet_plan.members.clear()
            
            # Add new assignments
            assigned_member_ids = data['assigned_members']
            for member_data in assigned_member_ids:
                member_id = member_data.get('id') if isinstance(member_data, dict) else member_data
                if validate_uuid(str(member_id)):
                    member = Member.query.get(member_id)
                    if member:
                        diet_plan.members.append(member)
            
            updated_fields.append('assigned_members')
        
        db.session.commit()
        
        plan_dict = format_diet_plan_dict(diet_plan, include_members=True, current_user=current_user)
        
        return jsonify({
            'success': True,
            'message': 'Diet plan updated successfully',
            'diet_plan': plan_dict,
            'updated_fields': updated_fields
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error updating diet plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating diet plan: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@diet_bp.route('/<plan_id>', methods=['DELETE'])
@jwt_required()
def delete_diet_plan(plan_id):
    """Delete diet plan"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Validate plan_id
        if not validate_uuid(plan_id):
            return jsonify({'success': False, 'error': 'Invalid diet plan ID format'}), 400
        
        diet_plan = DietPlan.query.get(plan_id)
        if not diet_plan:
            return jsonify({'success': False, 'error': 'Diet plan not found'}), 404
        
        # Check permissions
        trainer_id = get_trainer_profile_id(current_user)
        can_delete = (
            is_admin(current_user) or 
            (is_trainer(current_user) and 
             trainer_id and 
             str(trainer_id) == str(diet_plan.created_by))
        )
        
        if not can_delete:
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        plan_name = diet_plan.name
        db.session.delete(diet_plan)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Diet plan "{plan_name}" deleted successfully'
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error deleting diet plan: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting diet plan: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@diet_bp.route('/members', methods=['GET'])
@jwt_required()
def get_available_members():
    """Get list of members that can be assigned to diet plans"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        # Get search parameter
        search = request.args.get('search', '', type=str)
        
        # Build query
        query = Member.query.join(User).filter(Member.is_active == True, User.is_active == True)
        
        # Search filter
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                or_(
                    Member.first_name.ilike(search_pattern),
                    Member.last_name.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )
        
        # Order by name
        query = query.order_by(Member.first_name, Member.last_name)
        
        members = query.all()
        
        members_data = []
        for member in members:
            members_data.append({
                'id': str(member.id),
                'first_name': member.first_name,
                'last_name': member.last_name,
                'email': member.user.email if member.user else None,
                'status': 'active' if member.is_active else 'inactive'
            })
        
        return jsonify({
            'success': True,
            'members': members_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching members: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@diet_bp.route('/types', methods=['GET'])
@jwt_required()
def get_diet_plan_types():
    """Get list of unique diet plan types"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Check permissions
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        
        types = db.session.query(DietPlan.type).filter(
            DietPlan.type.isnot(None),
            DietPlan.type != ''
        ).distinct().all()
        
        type_list = [type_row[0] for type_row in types if type_row[0]]
        
        # Add some common diet types if none exist
        if not type_list:
            type_list = [
                'Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic Performance', 
                'Vegetarian', 'Vegan', 'Keto', 'Low Carb', 'High Protein'
            ]
        
        return jsonify({
            'success': True,
            'types': sorted(type_list)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching diet plan types: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@diet_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_diet_plan_statistics():
    """Get diet plan statistics (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Calculate statistics
        total_plans = DietPlan.query.count()
        
        # Plans by type
        type_stats = db.session.query(
            DietPlan.type,
            func.count(DietPlan.id)
        ).filter(
            DietPlan.type.isnot(None)
        ).group_by(DietPlan.type).all()
        
        # Average calories
        avg_calories = db.session.query(func.avg(DietPlan.kcal_count)).scalar() or 0
        
        # Plans by trainer
        trainer_stats = db.session.query(
            Trainer.first_name,
            Trainer.last_name,
            func.count(DietPlan.id)
        ).join(DietPlan, Trainer.id == DietPlan.created_by).group_by(
            Trainer.id, Trainer.first_name, Trainer.last_name
        ).all()
        
        return jsonify({
            'success': True,
            'statistics': {
                'total_plans': total_plans,
                'average_calories': round(float(avg_calories), 1),
                'types': [
                    {
                        'name': stat[0],
                        'count': stat[1]
                    } for stat in type_stats
                ],
                'by_trainer': [
                    {
                        'trainer_name': f"{stat[0]} {stat[1]}".strip(),
                        'plan_count': stat[2]
                    } for stat in trainer_stats
                ]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching diet plan statistics: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500