from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import (
    db, Payment, Member, MemberMembership, MembershipPlan, User, Role
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, desc, extract
from datetime import datetime, timezone, date, timedelta
import uuid

payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

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

def is_member(user):
    """Check if user has member role"""
    return user and user.role and user.role.name == 'MEMBER'

@payment_bp.route('/', methods=['GET'])
@jwt_required()
def get_payments():
    """Get payment records with filtering"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        member_id = request.args.get('member_id')
        start_date = request.args.get('start_date')  # YYYY-MM-DD
        end_date = request.args.get('end_date')      # YYYY-MM-DD
        payment_mode = request.args.get('payment_mode')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build base query
        query = db.session.query(Payment)\
            .join(Member, Payment.member_id == Member.id, isouter=True)\
            .join(MemberMembership, Payment.membership_id == MemberMembership.id, isouter=True)\
            .join(MembershipPlan, MemberMembership.plan_id == MembershipPlan.id, isouter=True)
        
        # Apply role-based filtering
        if is_member(current_user):
            # Members can only see their own payments
            if current_user.member_profile:
                query = query.filter(Payment.member_id == current_user.member_profile.id)
            else:
                return jsonify({'error': 'Member profile not found'}), 404
        elif not is_admin(current_user):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Apply additional filters
        if member_id:
            try:
                uuid.UUID(member_id)
                query = query.filter(Payment.member_id == member_id)
            except ValueError:
                return jsonify({'error': 'Invalid member ID format'}), 400
        
        if payment_mode:
            query = query.filter(Payment.mode.ilike(f"%{payment_mode}%"))
        
        # Apply date filters
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                query = query.filter(Payment.date >= start_dt)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
                query = query.filter(Payment.date <= end_dt)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        payments = query.order_by(desc(Payment.date))\
            .offset((page - 1) * limit).limit(limit).all()
        
        # Format response
        payments_data = []
        for payment in payments:
            payment_dict = {
                'id': str(payment.id),
                'member_id': str(payment.member_id) if payment.member_id else None,
                'member_name': f"{payment.member.first_name} {payment.member.last_name}" if payment.member else None,
                'membership_id': str(payment.membership_id) if payment.membership_id else None,
                'plan_name': payment.membership.plan.name if payment.membership and payment.membership.plan else None,
                'amount': float(payment.amount),
                'date': payment.date.isoformat(),
                'mode': payment.mode,
                'receipt_number': str(payment.id)[:8].upper()  # Simple receipt number
            }
            payments_data.append(payment_dict)
        
        return jsonify({
            'payments': payments_data,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/', methods=['POST'])
@jwt_required()
def create_payment():
    """Create a new payment record (Admin only)"""
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
        required_fields = ['member_id', 'amount', 'mode']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate member_id
        try:
            uuid.UUID(data['member_id'])
        except ValueError:
            return jsonify({'error': 'Invalid member ID format'}), 400
        
        # Check if member exists
        member = Member.query.get(data['member_id'])
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount format'}), 400
        
        # Validate membership_id if provided
        membership_id = None
        if data.get('membership_id'):
            try:
                uuid.UUID(data['membership_id'])
                membership = MemberMembership.query.get(data['membership_id'])
                if not membership:
                    return jsonify({'error': 'Membership not found'}), 404
                if str(membership.member_id) != data['member_id']:
                    return jsonify({'error': 'Membership does not belong to this member'}), 400
                membership_id = data['membership_id']
            except ValueError:
                return jsonify({'error': 'Invalid membership ID format'}), 400
        
        # Parse payment date
        payment_date = datetime.now(timezone.utc)
        if data.get('date'):
            try:
                payment_date = datetime.strptime(data['date'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Create payment record
        payment = Payment(
            member_id=data['member_id'],
            membership_id=membership_id,
            amount=amount,
            date=payment_date,
            mode=data['mode']
        )
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment recorded successfully',
            'payment': {
                'id': str(payment.id),
                'member_name': f"{member.first_name} {member.last_name}",
                'amount': float(payment.amount),
                'date': payment.date.isoformat(),
                'mode': payment.mode,
                'receipt_number': str(payment.id)[:8].upper()
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment_details(payment_id):
    """Get specific payment details"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate UUID format
        try:
            uuid.UUID(payment_id)
        except ValueError:
            return jsonify({'error': 'Invalid payment ID format'}), 400
        
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        # Check permissions
        if is_member(current_user):
            if not current_user.member_profile or str(payment.member_id) != str(current_user.member_profile.id):
                return jsonify({'error': 'Access denied'}), 403
        elif not is_admin(current_user):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Get detailed payment information
        payment_dict = {
            'id': str(payment.id),
            'member_id': str(payment.member_id) if payment.member_id else None,
            'member_name': f"{payment.member.first_name} {payment.member.last_name}" if payment.member else None,
            'member_email': payment.member.user.email if payment.member and payment.member.user else None,
            'membership_id': str(payment.membership_id) if payment.membership_id else None,
            'plan_name': payment.membership.plan.name if payment.membership and payment.membership.plan else None,
            'amount': float(payment.amount),
            'date': payment.date.isoformat(),
            'mode': payment.mode,
            'receipt_number': str(payment.id)[:8].upper()
        }
        
        # Add membership details if available
        if payment.membership:
            payment_dict['membership_details'] = {
                'plan_name': payment.membership.plan.name,
                'start_date': payment.membership.start_date.isoformat(),
                'end_date': payment.membership.end_date.isoformat(),
                'status': payment.membership.status
            }
        
        return jsonify({'payment': payment_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_payment_statistics():
    """Get payment statistics (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get query parameters
        period = request.args.get('period', 'month')  # week, month, year
        
        # Calculate date range
        today = date.today()
        if period == 'week':
            start_date = today - timedelta(days=7)
        elif period == 'month':
            start_date = today - timedelta(days=30)
        elif period == 'year':
            start_date = today - timedelta(days=365)
        else:
            return jsonify({'error': 'Invalid period. Use week, month, or year'}), 400
        
        start_datetime = datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        
        # Total revenue for period
        period_revenue = db.session.query(func.sum(Payment.amount))\
            .filter(Payment.date >= start_datetime).scalar() or 0
        
        # Total revenue all time
        total_revenue = db.session.query(func.sum(Payment.amount)).scalar() or 0
        
        # Payment count for period
        period_payments = Payment.query.filter(Payment.date >= start_datetime).count()
        
        # Payment modes distribution
        payment_modes = db.session.query(
            Payment.mode,
            func.count(Payment.id).label('count'),
            func.sum(Payment.amount).label('total')
        ).filter(Payment.date >= start_datetime)\
         .group_by(Payment.mode)\
         .order_by(desc('total')).all()
        
        # Daily revenue for trend analysis
        daily_revenue = db.session.query(
            func.date(Payment.date).label('date'),
            func.sum(Payment.amount).label('revenue'),
            func.count(Payment.id).label('count')
        ).filter(Payment.date >= start_datetime)\
         .group_by(func.date(Payment.date))\
         .order_by('date').all()
        
        # Monthly revenue (for yearly period)
        monthly_revenue = []
        if period == 'year':
            monthly_revenue = db.session.query(
                extract('year', Payment.date).label('year'),
                extract('month', Payment.date).label('month'),
                func.sum(Payment.amount).label('revenue')
            ).filter(Payment.date >= start_datetime)\
             .group_by(extract('year', Payment.date), extract('month', Payment.date))\
             .order_by('year', 'month').all()
        
        # Top paying members
        top_members = db.session.query(
            Member.first_name,
            Member.last_name,
            func.sum(Payment.amount).label('total_paid'),
            func.count(Payment.id).label('payment_count')
        ).join(Payment)\
         .filter(Payment.date >= start_datetime)\
         .group_by(Member.id, Member.first_name, Member.last_name)\
         .order_by(desc('total_paid'))\
         .limit(10).all()
        
        # Average payment amount
        avg_payment = db.session.query(func.avg(Payment.amount))\
            .filter(Payment.date >= start_datetime).scalar() or 0
        
        return jsonify({
            'period': period,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': today.isoformat()
            },
            'revenue': {
                'period_total': float(period_revenue),
                'all_time_total': float(total_revenue),
                'average_payment': float(avg_payment)
            },
            'payment_count': period_payments,
            'payment_modes': [
                {
                    'mode': mode.mode,
                    'count': mode.count,
                    'total_amount': float(mode.total)
                }
                for mode in payment_modes
            ],
            'daily_revenue': [
                {
                    'date': day.date.isoformat(),
                    'revenue': float(day.revenue),
                    'payment_count': day.count
                }
                for day in daily_revenue
            ],
            'monthly_revenue': [
                {
                    'year': int(month.year),
                    'month': int(month.month),
                    'revenue': float(month.revenue)
                }
                for month in monthly_revenue
            ],
            'top_members': [
                {
                    'member_name': f"{member.first_name} {member.last_name}",
                    'total_paid': float(member.total_paid),
                    'payment_count': member.payment_count
                }
                for member in top_members
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/modes', methods=['GET'])
@jwt_required()
def get_payment_modes():
    """Get available payment modes"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get distinct payment modes from database
        modes = db.session.query(Payment.mode)\
            .distinct()\
            .filter(Payment.mode.isnot(None))\
            .order_by(Payment.mode).all()
        
        modes_list = [mode[0] for mode in modes if mode[0]]
        
        # Add common payment modes if not in database yet
        common_modes = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Check']
        for mode in common_modes:
            if mode not in modes_list:
                modes_list.append(mode)
        
        return jsonify({
            'payment_modes': sorted(modes_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500