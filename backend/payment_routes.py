from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Payment, Member, MemberMembership, MembershipPlan, User
from datetime import datetime, timezone, timedelta
from sqlalchemy import func, case, and_, or_, extract
from sqlalchemy.exc import SQLAlchemyError
import uuid

payment_bp = Blueprint('payment', __name__, url_prefix='/api/payments')

# Helper function for UTC timestamps
def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

@payment_bp.route('', methods=['GET'])
@jwt_required()
def get_payments():
    """Get all payments with optional filtering and pagination"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 100))
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        member_id = request.args.get('member_id')
        mode = request.args.get('mode')
        
        # Build query with joins
        query = db.session.query(
            Payment,
            Member.first_name,
            Member.last_name,
            MembershipPlan.name.label('plan_name')
        ).outerjoin(
            Member, Payment.member_id == Member.id
        ).outerjoin(
            MemberMembership, Payment.membership_id == MemberMembership.id
        ).outerjoin(
            MembershipPlan, MemberMembership.plan_id == MembershipPlan.id
        )
        
        # Apply filters
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(Payment.date >= start_dt)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format'}), 400
        
        if end_date:
            try:
                # Add 1 day to include the end date entirely
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                query = query.filter(Payment.date <= end_dt)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format'}), 400
        
        if member_id:
            try:
                uuid.UUID(member_id)
                query = query.filter(Payment.member_id == member_id)
            except ValueError:
                return jsonify({'error': 'Invalid member_id format'}), 400
        
        if mode:
            query = query.filter(Payment.mode.ilike(f'%{mode}%'))
        
        # Order by date descending (most recent first)
        query = query.order_by(Payment.date.desc())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        payments = query.offset((page - 1) * limit).limit(limit).all()
        
        # Format response
        payment_list = []
        for payment, first_name, last_name, plan_name in payments:
            member_name = None
            if first_name and last_name:
                member_name = f"{first_name} {last_name}"
            elif first_name:
                member_name = first_name
            elif last_name:
                member_name = last_name
            
            payment_dict = {
                'id': str(payment.id),
                'member_id': str(payment.member_id) if payment.member_id else None,
                'member_name': member_name,
                'membership_id': str(payment.membership_id) if payment.membership_id else None,
                'plan_name': plan_name,
                'amount': float(payment.amount),
                'date': payment.date.isoformat() if payment.date else None,
                'mode': payment.mode,
                'receipt_number': f"RCP-{str(payment.id)[:8].upper()}"  # Generate receipt number
            }
            payment_list.append(payment_dict)
        
        return jsonify({
            'payments': payment_list,
            'pagination': {
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid pagination parameters'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to fetch payments: {str(e)}'}), 500

@payment_bp.route('/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment_details(payment_id):
    """Get detailed information about a specific payment"""
    try:
        # Validate UUID
        try:
            uuid.UUID(payment_id)
        except ValueError:
            return jsonify({'error': 'Invalid payment ID format'}), 400
        
        # Query with joins
        result = db.session.query(
            Payment,
            Member.first_name,
            Member.last_name,
            Member.user_id,
            MembershipPlan.name.label('plan_name'),
            MembershipPlan.duration_days
        ).outerjoin(
            Member, Payment.member_id == Member.id
        ).outerjoin(
            MemberMembership, Payment.membership_id == MemberMembership.id
        ).outerjoin(
            MembershipPlan, MemberMembership.plan_id == MembershipPlan.id
        ).filter(Payment.id == payment_id).first()
        
        if not result:
            return jsonify({'error': 'Payment not found'}), 404
        
        payment, first_name, last_name, user_id, plan_name, duration_days = result
        
        # Get member email if user_id exists
        member_email = None
        if user_id:
            user = User.query.get(user_id)
            if user:
                member_email = user.email
        
        member_name = None
        if first_name and last_name:
            member_name = f"{first_name} {last_name}"
        elif first_name:
            member_name = first_name
        
        payment_data = {
            'id': str(payment.id),
            'member_id': str(payment.member_id) if payment.member_id else None,
            'member_name': member_name,
            'member_email': member_email,
            'membership_id': str(payment.membership_id) if payment.membership_id else None,
            'plan_name': plan_name,
            'plan_duration_days': duration_days,
            'amount': float(payment.amount),
            'date': payment.date.isoformat() if payment.date else None,
            'mode': payment.mode,
            'receipt_number': f"RCP-{str(payment.id)[:8].upper()}"
        }
        
        return jsonify(payment_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch payment details: {str(e)}'}), 500

@payment_bp.route('', methods=['POST'])
@jwt_required()
def create_payment():
    """Create a new payment record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('amount'):
            return jsonify({'error': 'Payment amount is required'}), 400
        
        if not data.get('mode'):
            return jsonify({'error': 'Payment mode is required'}), 400
        
        # Validate member_id if provided
        member_id = data.get('member_id')
        if member_id:
            try:
                uuid.UUID(member_id)
                member = Member.query.get(member_id)
                if not member:
                    return jsonify({'error': 'Member not found'}), 404
            except ValueError:
                return jsonify({'error': 'Invalid member_id format'}), 400
        
        # Validate membership_id if provided
        membership_id = data.get('membership_id')
        if membership_id:
            try:
                uuid.UUID(membership_id)
                membership = MemberMembership.query.get(membership_id)
                if not membership:
                    return jsonify({'error': 'Membership not found'}), 404
            except ValueError:
                return jsonify({'error': 'Invalid membership_id format'}), 400
        
        # Create payment
        payment = Payment(
            member_id=member_id if member_id else None,
            membership_id=membership_id if membership_id else None,
            amount=float(data['amount']),
            mode=data['mode']
        )
        
        # Set payment date if provided, otherwise use current time
        if data.get('date'):
            try:
                payment.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use ISO format'}), 400
        else:
            payment.date = utc_now()
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment created successfully',
            'payment': {
                'id': str(payment.id),
                'member_id': str(payment.member_id) if payment.member_id else None,
                'membership_id': str(payment.membership_id) if payment.membership_id else None,
                'amount': float(payment.amount),
                'date': payment.date.isoformat() if payment.date else None,
                'mode': payment.mode,
                'receipt_number': f"RCP-{str(payment.id)[:8].upper()}"
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create payment: {str(e)}'}), 500

@payment_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_payment_stats():
    """Get payment statistics including revenue trends and payment mode breakdown"""
    try:
        period = request.args.get('period', 'month')  # week, month, year
        
        # Calculate date range based on period
        today = datetime.now(timezone.utc)
        if period == 'week':
            start_date = today - timedelta(days=7)
            days_range = 7
        elif period == 'year':
            start_date = today - timedelta(days=365)
            days_range = 365
        else:  # month
            start_date = today - timedelta(days=30)
            days_range = 30
        
        # Get all-time total
        all_time_total = db.session.query(
            func.sum(Payment.amount)
        ).scalar() or 0
        
        # Get period total
        period_total = db.session.query(
            func.sum(Payment.amount)
        ).filter(Payment.date >= start_date).scalar() or 0
        
        # Get average payment
        avg_payment = db.session.query(
            func.avg(Payment.amount)
        ).filter(Payment.date >= start_date).scalar() or 0
        
        # Get daily revenue for the period
        daily_revenue = db.session.query(
            func.date(Payment.date).label('date'),
            func.sum(Payment.amount).label('revenue')
        ).filter(
            Payment.date >= start_date
        ).group_by(
            func.date(Payment.date)
        ).order_by(
            func.date(Payment.date)
        ).all()
        
        # Fill in missing days with 0 revenue
        daily_revenue_dict = {str(date): float(revenue) for date, revenue in daily_revenue}
        daily_revenue_list = []
        for i in range(days_range):
            date = (start_date + timedelta(days=i)).date()
            date_str = str(date)
            daily_revenue_list.append({
                'date': date_str,
                'revenue': daily_revenue_dict.get(date_str, 0)
            })
        
        # Get monthly revenue (last 12 months)
        twelve_months_ago = today - timedelta(days=365)
        monthly_revenue = db.session.query(
            extract('year', Payment.date).label('year'),
            extract('month', Payment.date).label('month'),
            func.sum(Payment.amount).label('revenue')
        ).filter(
            Payment.date >= twelve_months_ago
        ).group_by(
            extract('year', Payment.date),
            extract('month', Payment.date)
        ).order_by(
            extract('year', Payment.date),
            extract('month', Payment.date)
        ).all()
        
        monthly_revenue_list = []
        for year, month, revenue in monthly_revenue:
            month_name = datetime(int(year), int(month), 1).strftime('%b %Y')
            monthly_revenue_list.append({
                'year': int(year),
                'month': int(month),
                'month_name': month_name,
                'revenue': float(revenue)
            })
        
        # Get payment mode breakdown
        payment_modes = db.session.query(
            Payment.mode,
            func.count(Payment.id).label('count'),
            func.sum(Payment.amount).label('total_amount')
        ).filter(
            Payment.date >= start_date
        ).group_by(
            Payment.mode
        ).all()
        
        payment_modes_list = []
        for mode, count, total_amount in payment_modes:
            payment_modes_list.append({
                'mode': mode,
                'count': count,
                'total_amount': float(total_amount) if total_amount else 0
            })
        
        return jsonify({
            'period_total': float(period_total),
            'all_time_total': float(all_time_total),
            'average_payment': float(avg_payment),
            'daily_revenue': daily_revenue_list,
            'monthly_revenue': monthly_revenue_list,
            'payment_modes': payment_modes_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch payment stats: {str(e)}'}), 500

@payment_bp.route('/modes', methods=['GET'])
@jwt_required()
def get_payment_modes():
    """Get list of all payment modes used"""
    try:
        modes = db.session.query(
            Payment.mode,
            func.count(Payment.id).label('count')
        ).group_by(
            Payment.mode
        ).order_by(
            func.count(Payment.id).desc()
        ).all()
        
        mode_list = []
        for mode, count in modes:
            if mode:  # Only include non-null modes
                mode_list.append({
                    'mode': mode,
                    'count': count
                })
        
        return jsonify({
            'modes': mode_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch payment modes: {str(e)}'}), 500

@payment_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_payments():
    """Get most recent payments (last 10 by default)"""
    try:
        limit = int(request.args.get('limit', 10))
        
        # Query with joins
        payments = db.session.query(
            Payment,
            Member.first_name,
            Member.last_name,
            MembershipPlan.name.label('plan_name')
        ).outerjoin(
            Member, Payment.member_id == Member.id
        ).outerjoin(
            MemberMembership, Payment.membership_id == MemberMembership.id
        ).outerjoin(
            MembershipPlan, MemberMembership.plan_id == MembershipPlan.id
        ).order_by(
            Payment.date.desc()
        ).limit(limit).all()
        
        payment_list = []
        for payment, first_name, last_name, plan_name in payments:
            member_name = None
            if first_name and last_name:
                member_name = f"{first_name} {last_name}"
            elif first_name:
                member_name = first_name
            
            payment_dict = {
                'id': str(payment.id),
                'member_name': member_name,
                'plan_name': plan_name,
                'amount': float(payment.amount),
                'date': payment.date.isoformat() if payment.date else None,
                'mode': payment.mode
            }
            payment_list.append(payment_dict)
        
        return jsonify({
            'payments': payment_list
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid limit parameter'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to fetch recent payments: {str(e)}'}), 500

@payment_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_payment_summary():
    """Get summary of payments including total revenue, count, and averages"""
    try:
        # Get query parameters for date filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build base query
        query = db.session.query(Payment)
        
        # Apply date filters
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(Payment.date >= start_dt)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format'}), 400
        
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                query = query.filter(Payment.date <= end_dt)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format'}), 400
        
        # Get aggregated data
        summary = query.with_entities(
            func.count(Payment.id).label('total_count'),
            func.sum(Payment.amount).label('total_revenue'),
            func.avg(Payment.amount).label('average_amount'),
            func.min(Payment.amount).label('min_amount'),
            func.max(Payment.amount).label('max_amount')
        ).first()
        
        return jsonify({
            'total_count': summary.total_count or 0,
            'total_revenue': float(summary.total_revenue) if summary.total_revenue else 0,
            'average_amount': float(summary.average_amount) if summary.average_amount else 0,
            'min_amount': float(summary.min_amount) if summary.min_amount else 0,
            'max_amount': float(summary.max_amount) if summary.max_amount else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch payment summary: {str(e)}'}), 500