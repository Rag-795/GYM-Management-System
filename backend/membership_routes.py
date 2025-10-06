from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import (
    db, MembershipPlan, MemberMembership, Member, User, Role, Payment
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, desc
from datetime import datetime, timezone, date, timedelta
import uuid

membership_bp = Blueprint('memberships', __name__, url_prefix='/api/memberships')

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

# Membership Plans Routes
@membership_bp.route('/plans', methods=['GET'])
@jwt_required()
def get_membership_plans():
    """Get all membership plans"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        plans = MembershipPlan.query.order_by(MembershipPlan.duration_days, MembershipPlan.price).all()
        
        plans_data = []
        for plan in plans:
            plan_dict = {
                'id': str(plan.id),
                'name': plan.name,
                'duration_days': plan.duration_days,
                'price': float(plan.price),
                'description': plan.description,
                'created_at': plan.created_at.isoformat() if plan.created_at else None
            }
            
            # Add statistics for admins
            if is_admin(current_user):
                # Count active memberships for this plan
                active_count = MemberMembership.query.filter_by(
                    plan_id=plan.id,
                    status='active'
                ).count()
                
                # Calculate total revenue from this plan
                total_revenue = db.session.query(func.sum(MemberMembership.amount_paid))\
                    .filter_by(plan_id=plan.id).scalar() or 0
                
                plan_dict.update({
                    'active_memberships': active_count,
                    'total_revenue': float(total_revenue)
                })
            
            plans_data.append(plan_dict)
        
        return jsonify({
            'plans': plans_data,
            'total': len(plans_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@membership_bp.route('/plans', methods=['POST'])
@jwt_required()
def create_membership_plan():
    """Create a new membership plan (Admin only)"""
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
        required_fields = ['name', 'duration_days', 'price']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate data types
        try:
            duration_days = int(data['duration_days'])
            price = float(data['price'])
            
            if duration_days <= 0:
                return jsonify({'error': 'Duration must be positive'}), 400
            if price < 0:
                return jsonify({'error': 'Price cannot be negative'}), 400
                
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid duration_days or price format'}), 400
        
        # Check if plan name already exists
        existing_plan = MembershipPlan.query.filter_by(name=data['name']).first()
        if existing_plan:
            return jsonify({'error': 'Plan name already exists'}), 400
        
        # Create new plan
        plan = MembershipPlan(
            name=data['name'],
            duration_days=duration_days,
            price=price,
            description=data.get('description', '')
        )
        
        db.session.add(plan)
        db.session.commit()
        
        return jsonify({
            'message': 'Membership plan created successfully',
            'plan': {
                'id': str(plan.id),
                'name': plan.name,
                'duration_days': plan.duration_days,
                'price': float(plan.price),
                'description': plan.description
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@membership_bp.route('/plans/<plan_id>', methods=['PUT'])
@jwt_required()
def update_membership_plan(plan_id):
    """Update a membership plan (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate UUID format
        try:
            uuid.UUID(plan_id)
        except ValueError:
            return jsonify({'error': 'Invalid plan ID format'}), 400
        
        plan = MembershipPlan.query.get(plan_id)
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update plan fields
        if 'name' in data:
            # Check if new name conflicts with existing plans
            existing_plan = MembershipPlan.query.filter(
                MembershipPlan.name == data['name'],
                MembershipPlan.id != plan.id
            ).first()
            if existing_plan:
                return jsonify({'error': 'Plan name already exists'}), 400
            plan.name = data['name']
        
        if 'duration_days' in data:
            try:
                duration_days = int(data['duration_days'])
                if duration_days <= 0:
                    return jsonify({'error': 'Duration must be positive'}), 400
                plan.duration_days = duration_days
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid duration_days format'}), 400
        
        if 'price' in data:
            try:
                price = float(data['price'])
                if price < 0:
                    return jsonify({'error': 'Price cannot be negative'}), 400
                plan.price = price
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid price format'}), 400
        
        if 'description' in data:
            plan.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Membership plan updated successfully',
            'plan': {
                'id': str(plan.id),
                'name': plan.name,
                'duration_days': plan.duration_days,
                'price': float(plan.price),
                'description': plan.description
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@membership_bp.route('/plans/<plan_id>', methods=['DELETE'])
@jwt_required()
def delete_membership_plan(plan_id):
    """Delete a membership plan (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate UUID format
        try:
            uuid.UUID(plan_id)
        except ValueError:
            return jsonify({'error': 'Invalid plan ID format'}), 400
        
        plan = MembershipPlan.query.get(plan_id)
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        # Check if plan has active memberships
        active_memberships = MemberMembership.query.filter_by(
            plan_id=plan.id,
            status='active'
        ).count()
        
        if active_memberships > 0:
            return jsonify({
                'error': f'Cannot delete plan with {active_memberships} active memberships'
            }), 400
        
        db.session.delete(plan)
        db.session.commit()
        
        return jsonify({'message': 'Membership plan deleted successfully'}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Member Memberships Routes
@membership_bp.route('/', methods=['GET'])
@jwt_required()
def get_memberships():
    """Get all member memberships with filtering"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get query parameters
        status = request.args.get('status', 'all')  # all, active, expired, cancelled
        member_id = request.args.get('member_id')
        plan_id = request.args.get('plan_id')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = db.session.query(MemberMembership)\
            .join(Member).join(MembershipPlan)
        
        # Apply filters
        if status != 'all':
            query = query.filter(MemberMembership.status == status)
        
        if member_id:
            try:
                uuid.UUID(member_id)
                query = query.filter(MemberMembership.member_id == member_id)
            except ValueError:
                return jsonify({'error': 'Invalid member ID format'}), 400
        
        if plan_id:
            try:
                uuid.UUID(plan_id)
                query = query.filter(MemberMembership.plan_id == plan_id)
            except ValueError:
                return jsonify({'error': 'Invalid plan ID format'}), 400
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        memberships = query.order_by(desc(MemberMembership.start_date))\
            .offset((page - 1) * limit).limit(limit).all()
        
        # Format response
        memberships_data = []
        for membership in memberships:
            membership_dict = {
                'id': str(membership.id),
                'member_id': str(membership.member_id),
                'member_name': f"{membership.member.first_name} {membership.member.last_name}",
                'member_email': membership.member.user.email,
                'plan_id': str(membership.plan_id),
                'plan_name': membership.plan.name,
                'start_date': membership.start_date.isoformat(),
                'end_date': membership.end_date.isoformat(),
                'status': membership.status,
                'amount_paid': float(membership.amount_paid) if membership.amount_paid else 0,
                'discount': float(membership.discount) if membership.discount else 0,
                'created_at': membership.created_at.isoformat() if membership.created_at else None
            }
            
            # Calculate days remaining for active memberships
            if membership.status == 'active':
                today = date.today()
                days_remaining = (membership.end_date - today).days
                membership_dict['days_remaining'] = max(0, days_remaining)
            
            memberships_data.append(membership_dict)
        
        return jsonify({
            'memberships': memberships_data,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@membership_bp.route('/', methods=['POST'])
@jwt_required()
def create_membership():
    """Create a new membership for a member (Admin only)"""
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
        required_fields = ['member_id', 'plan_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate UUIDs
        try:
            uuid.UUID(data['member_id'])
            uuid.UUID(data['plan_id'])
        except ValueError:
            return jsonify({'error': 'Invalid member_id or plan_id format'}), 400
        
        # Check if member exists
        member = Member.query.get(data['member_id'])
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Check if plan exists
        plan = MembershipPlan.query.get(data['plan_id'])
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        # Parse start date
        start_date = date.today()
        if data.get('start_date'):
            try:
                start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        # Calculate end date
        end_date = start_date + timedelta(days=plan.duration_days)
        
        # Calculate amount (with optional discount)
        discount = float(data.get('discount', 0))
        if discount < 0 or discount > 100:
            return jsonify({'error': 'Discount must be between 0 and 100'}), 400
        
        amount_paid = float(plan.price) * (1 - discount / 100)
        
        # Check for overlapping active memberships
        overlapping = MemberMembership.query.filter(
            MemberMembership.member_id == data['member_id'],
            MemberMembership.status == 'active',
            MemberMembership.end_date >= start_date
        ).first()
        
        if overlapping:
            return jsonify({
                'error': f'Member has an active membership until {overlapping.end_date}'
            }), 400
        
        # Create membership
        membership = MemberMembership(
            member_id=data['member_id'],
            plan_id=data['plan_id'],
            start_date=start_date,
            end_date=end_date,
            status='active',
            amount_paid=amount_paid,
            discount=discount
        )
        
        db.session.add(membership)
        db.session.flush()  # Get membership ID
        
        # Create payment record
        payment = Payment(
            member_id=data['member_id'],
            membership_id=membership.id,
            amount=amount_paid,
            date=datetime.now(timezone.utc),
            mode=data.get('payment_mode', 'Cash')
        )
        db.session.add(payment)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Membership created successfully',
            'membership': {
                'id': str(membership.id),
                'member_name': f"{member.first_name} {member.last_name}",
                'plan_name': plan.name,
                'start_date': membership.start_date.isoformat(),
                'end_date': membership.end_date.isoformat(),
                'amount_paid': float(membership.amount_paid)
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@membership_bp.route('/<membership_id>', methods=['PUT'])
@jwt_required()
def update_membership(membership_id):
    """Update membership status or details (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Validate UUID format
        try:
            uuid.UUID(membership_id)
        except ValueError:
            return jsonify({'error': 'Invalid membership ID format'}), 400
        
        membership = MemberMembership.query.get(membership_id)
        if not membership:
            return jsonify({'error': 'Membership not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update allowed fields
        if 'status' in data:
            allowed_statuses = ['active', 'expired', 'cancelled', 'suspended']
            if data['status'] not in allowed_statuses:
                return jsonify({'error': f'Status must be one of: {allowed_statuses}'}), 400
            membership.status = data['status']
        
        if 'end_date' in data:
            try:
                new_end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
                if new_end_date < membership.start_date:
                    return jsonify({'error': 'End date cannot be before start date'}), 400
                membership.end_date = new_end_date
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Membership updated successfully',
            'membership': {
                'id': str(membership.id),
                'status': membership.status,
                'end_date': membership.end_date.isoformat()
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@membership_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_membership_statistics():
    """Get membership statistics (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get current statistics
        today = date.today()
        
        # Total memberships by status
        active_count = MemberMembership.query.filter_by(status='active').count()
        expired_count = MemberMembership.query.filter_by(status='expired').count()
        cancelled_count = MemberMembership.query.filter_by(status='cancelled').count()
        
        # Memberships expiring soon (next 30 days)
        expiring_soon = MemberMembership.query.filter(
            MemberMembership.status == 'active',
            MemberMembership.end_date <= today + timedelta(days=30),
            MemberMembership.end_date >= today
        ).count()
        
        # Revenue statistics
        total_revenue = db.session.query(func.sum(MemberMembership.amount_paid)).scalar() or 0
        current_month_revenue = db.session.query(func.sum(MemberMembership.amount_paid))\
            .filter(
                func.extract('year', MemberMembership.created_at) == today.year,
                func.extract('month', MemberMembership.created_at) == today.month
            ).scalar() or 0
        
        # Popular plans
        popular_plans = db.session.query(
            MembershipPlan.name,
            func.count(MemberMembership.id).label('count')
        ).join(MemberMembership)\
         .group_by(MembershipPlan.name)\
         .order_by(desc('count'))\
         .limit(5).all()
        
        return jsonify({
            'membership_counts': {
                'active': active_count,
                'expired': expired_count,
                'cancelled': cancelled_count,
                'expiring_soon': expiring_soon
            },
            'revenue': {
                'total': float(total_revenue),
                'current_month': float(current_month_revenue)
            },
            'popular_plans': [
                {'name': plan[0], 'count': plan[1]} 
                for plan in popular_plans
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500