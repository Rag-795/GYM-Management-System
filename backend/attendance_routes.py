from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Attendance, Member, Trainer, User, Role
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, desc, and_, extract
from datetime import datetime, timezone, date, timedelta
import uuid

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

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

def is_trainer(user):
    """Check if user has trainer role"""
    return user and user.role and user.role.name.lower() == 'trainer'

def is_member(user):
    """Check if user has member role"""
    return user and user.role and user.role.name.lower() == 'member'

@attendance_bp.route('/', methods=['GET'])
@jwt_required()
def get_attendance_records():
    """Get attendance records with filtering"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        member_id = request.args.get('member_id')
        trainer_id = request.args.get('trainer_id')
        start_date = request.args.get('start_date')  # YYYY-MM-DD
        end_date = request.args.get('end_date')      # YYYY-MM-DD
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build base query
        query = db.session.query(Attendance)\
            .join(Member, Attendance.member_id == Member.id, isouter=True)\
            .join(Trainer, Attendance.trainer_id == Trainer.id, isouter=True)
        
        # Apply role-based filtering
        if is_member(current_user):
            # Members can only see their own attendance
            member_profile = get_member_profile(current_user)
            if member_profile:
                query = query.filter(Attendance.member_id == member_profile.id)
            else:
                return jsonify({'error': 'Member profile not found'}), 404
        elif is_trainer(current_user):
            # Trainers can see their own sessions and all attendance if no specific filters
            if not (member_id or trainer_id):
                # If no specific filters, show trainer's own sessions
                trainer_profile = get_trainer_profile(current_user)
                if trainer_profile:
                    query = query.filter(Attendance.trainer_id == trainer_profile.id)
                else:
                    return jsonify({'error': 'Trainer profile not found'}), 404
        elif not is_admin(current_user):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Apply additional filters
        if member_id:
            try:
                uuid.UUID(member_id)
                query = query.filter(Attendance.member_id == member_id)
            except ValueError:
                return jsonify({'error': 'Invalid member ID format'}), 400
        
        if trainer_id:
            try:
                uuid.UUID(trainer_id)
                query = query.filter(Attendance.trainer_id == trainer_id)
            except ValueError:
                return jsonify({'error': 'Invalid trainer ID format'}), 400
        
        # Apply date filters
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                query = query.filter(Attendance.check_in >= start_dt)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
                query = query.filter(Attendance.check_in <= end_dt)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        attendance_records = query.order_by(desc(Attendance.check_in))\
            .offset((page - 1) * limit).limit(limit).all()
        
        # Format response
        attendance_data = []
        for record in attendance_records:
            record_dict = {
                'id': str(record.id),
                'member_id': str(record.member_id) if record.member_id else None,
                'member_name': f"{record.member.first_name} {record.member.last_name}" if record.member else None,
                'trainer_id': str(record.trainer_id) if record.trainer_id else None,
                'trainer_name': f"{record.trainer.first_name} {record.trainer.last_name}" if record.trainer else None,
                'check_in': record.check_in.isoformat(),
                'check_out': record.check_out.isoformat() if record.check_out else None,
                'created_at': record.created_at.isoformat() if record.created_at else None
            }
            
            # Calculate session duration
            if record.check_out:
                duration = record.check_out - record.check_in
                record_dict['duration_minutes'] = int(duration.total_seconds() / 60)
            else:
                record_dict['duration_minutes'] = None
                record_dict['is_active'] = True  # Still checked in
            
            attendance_data.append(record_dict)
        
        return jsonify({
            'attendance': attendance_data,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/check-in', methods=['POST'])
@jwt_required()
def check_in():
    """Record member check-in"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Determine member_id based on role
        if is_member(current_user):
            # Members can only check themselves in
            member_profile = get_member_profile(current_user)
            if not member_profile:
                return jsonify({'error': 'Member profile not found'}), 404
            member_id = member_profile.id
        elif is_admin(current_user) or is_trainer(current_user):
            # Admins and trainers can check in members
            if not data or not data.get('member_id'):
                return jsonify({'error': 'member_id is required'}), 400
            
            try:
                uuid.UUID(data['member_id'])
                member_id = data['member_id']
            except ValueError:
                return jsonify({'error': 'Invalid member ID format'}), 400
        else:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Verify member exists
        member = Member.query.get(member_id)
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        # Check if member is already checked in (no check-out record)
        existing_checkin = Attendance.query.filter(
            Attendance.member_id == member_id,
            Attendance.check_out.is_(None)
        ).first()
        
        if existing_checkin:
            return jsonify({
                'error': 'Member is already checked in',
                'existing_checkin': existing_checkin.check_in.isoformat()
            }), 400
        
        # Get trainer_id if provided
        trainer_id = None
        if data and data.get('trainer_id'):
            try:
                uuid.UUID(data['trainer_id'])
                trainer = Trainer.query.get(data['trainer_id'])
                if trainer:
                    trainer_id = data['trainer_id']
                else:
                    return jsonify({'error': 'Trainer not found'}), 404
            except ValueError:
                return jsonify({'error': 'Invalid trainer ID format'}), 400
        
        # Create attendance record
        attendance = Attendance(
            member_id=member_id,
            trainer_id=trainer_id,
            check_in=datetime.now(timezone.utc)
        )
        
        db.session.add(attendance)
        db.session.commit()
        
        return jsonify({
            'message': 'Check-in recorded successfully',
            'attendance': {
                'id': str(attendance.id),
                'member_name': f"{member.first_name} {member.last_name}",
                'check_in': attendance.check_in.isoformat(),
                'trainer_name': f"{attendance.trainer.first_name} {attendance.trainer.last_name}" if attendance.trainer else None
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/check-out', methods=['POST'])
@jwt_required()
def check_out():
    """Record member check-out"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Determine member_id based on role
        if is_member(current_user):
            # Members can only check themselves out
            member_profile = get_member_profile(current_user)
            if not member_profile:
                return jsonify({'error': 'Member profile not found'}), 404
            member_id = member_profile.id
        elif is_admin(current_user) or is_trainer(current_user):
            # Admins and trainers can check out members
            if not data or not data.get('member_id'):
                return jsonify({'error': 'member_id is required'}), 400
            
            try:
                uuid.UUID(data['member_id'])
                member_id = data['member_id']
            except ValueError:
                return jsonify({'error': 'Invalid member ID format'}), 400
        else:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Find active check-in record
        attendance = Attendance.query.filter(
            Attendance.member_id == member_id,
            Attendance.check_out.is_(None)
        ).first()
        
        if not attendance:
            return jsonify({'error': 'No active check-in found for this member'}), 404
        
        # Record check-out time
        check_out_time = datetime.now(timezone.utc)
        attendance.check_out = check_out_time
        
        # Calculate duration
        duration = check_out_time - attendance.check_in
        duration_minutes = int(duration.total_seconds() / 60)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Check-out recorded successfully',
            'attendance': {
                'id': str(attendance.id),
                'check_in': attendance.check_in.isoformat(),
                'check_out': attendance.check_out.isoformat(),
                'duration_minutes': duration_minutes
            }
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_attendance():
    """Get currently checked-in members"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'error': 'Admin or Trainer access required'}), 403
        
        # Get all active check-ins (no check-out)
        active_attendance = db.session.query(Attendance)\
            .join(Member)\
            .filter(Attendance.check_out.is_(None))\
            .order_by(Attendance.check_in).all()
        
        current_members = []
        for record in active_attendance:
            # Calculate time since check-in
            time_since_checkin = datetime.now(timezone.utc) - record.check_in
            hours_since = int(time_since_checkin.total_seconds() / 3600)
            minutes_since = int((time_since_checkin.total_seconds() % 3600) / 60)
            
            member_data = {
                'attendance_id': str(record.id),
                'member_id': str(record.member_id),
                'member_name': f"{record.member.first_name} {record.member.last_name}",
                'check_in': record.check_in.isoformat(),
                'time_since_checkin': f"{hours_since}h {minutes_since}m",
                'trainer_name': f"{record.trainer.first_name} {record.trainer.last_name}" if record.trainer else None
            }
            current_members.append(member_data)
        
        return jsonify({
            'current_members': current_members,
            'total_current': len(current_members)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_attendance_statistics():
    """Get attendance statistics"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        period = request.args.get('period', 'month')  # week, month, year
        member_id = request.args.get('member_id')
        
        # Role-based access control
        if is_member(current_user):
            member_profile = get_member_profile(current_user)
            if not member_profile:
                return jsonify({'error': 'Member profile not found'}), 404
            member_id = str(member_profile.id)  # Members can only see their own stats
        elif not (is_admin(current_user) or is_trainer(current_user)):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Calculate date range based on period
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
        
        # Build base query
        query = db.session.query(Attendance)\
            .filter(Attendance.check_in >= start_datetime)
        
        if member_id:
            try:
                uuid.UUID(member_id)
                query = query.filter(Attendance.member_id == member_id)
            except ValueError:
                return jsonify({'error': 'Invalid member ID format'}), 400
        
        # Get attendance records
        attendance_records = query.all()
        
        # Calculate statistics
        total_visits = len(attendance_records)
        
        # Calculate total workout time (only completed sessions)
        completed_sessions = [a for a in attendance_records if a.check_out]
        total_workout_minutes = sum(
            int((a.check_out - a.check_in).total_seconds() / 60)
            for a in completed_sessions
        )
        
        # Calculate average session duration
        avg_session_minutes = 0
        if completed_sessions:
            avg_session_minutes = total_workout_minutes / len(completed_sessions)
        
        # Daily visit counts for trend analysis
        daily_visits = {}
        for record in attendance_records:
            visit_date = record.check_in.date()
            daily_visits[visit_date] = daily_visits.get(visit_date, 0) + 1
        
        # Most active days
        most_active_day = None
        max_visits = 0
        if daily_visits:
            most_active_day = max(daily_visits, key=daily_visits.get)
            max_visits = daily_visits[most_active_day]
        
        # Weekly pattern (if enough data)
        weekly_pattern = {}
        if period in ['month', 'year']:
            for record in attendance_records:
                day_name = record.check_in.strftime('%A')
                weekly_pattern[day_name] = weekly_pattern.get(day_name, 0) + 1
        
        # Member-specific stats (if single member)
        member_info = None
        if member_id:
            member = Member.query.get(member_id)
            if member:
                # Calculate attendance rate
                total_days = (today - start_date).days
                unique_visit_days = len(set(record.check_in.date() for record in attendance_records))
                attendance_rate = (unique_visit_days / total_days) * 100 if total_days > 0 else 0
                
                member_info = {
                    'member_name': f"{member.first_name} {member.last_name}",
                    'unique_visit_days': unique_visit_days,
                    'attendance_rate': round(attendance_rate, 1)
                }
        
        return jsonify({
            'period': period,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': today.isoformat()
            },
            'total_visits': total_visits,
            'total_workout_hours': round(total_workout_minutes / 60, 1),
            'average_session_minutes': round(avg_session_minutes, 1),
            'most_active_day': {
                'date': most_active_day.isoformat() if most_active_day else None,
                'visits': max_visits
            },
            'weekly_pattern': weekly_pattern,
            'daily_visits': {
                date_str.isoformat(): count 
                for date_str, count in daily_visits.items()
            },
            'member_info': member_info
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/report', methods=['GET'])
@jwt_required()
def get_attendance_report():
    """Generate attendance report (Admin only)"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        if not is_admin(current_user):
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Default to last 30 days if no dates provided
        if not start_date:
            start_date = (date.today() - timedelta(days=30)).isoformat()
        if not end_date:
            end_date = date.today().isoformat()
        
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Get attendance data for the period
        attendance_query = db.session.query(Attendance)\
            .join(Member)\
            .filter(
                Attendance.check_in >= start_dt,
                Attendance.check_in <= end_dt
            )
        
        # Member attendance summary
        member_stats = db.session.query(
            Member.id,
            Member.first_name,
            Member.last_name,
            func.count(Attendance.id).label('visit_count'),
            func.sum(
                func.case(
                    (Attendance.check_out.isnot(None),
                     func.extract('epoch', Attendance.check_out - Attendance.check_in) / 60),
                    else_=0
                )
            ).label('total_minutes')
        ).join(Attendance)\
         .filter(
             Attendance.check_in >= start_dt,
             Attendance.check_in <= end_dt
         )\
         .group_by(Member.id, Member.first_name, Member.last_name)\
         .order_by(desc('visit_count')).all()
        
        # Daily attendance counts
        daily_counts = db.session.query(
            func.date(Attendance.check_in).label('date'),
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.check_in >= start_dt,
            Attendance.check_in <= end_dt
        ).group_by(func.date(Attendance.check_in))\
         .order_by('date').all()
        
        # Peak hours analysis
        hourly_counts = db.session.query(
            func.extract('hour', Attendance.check_in).label('hour'),
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.check_in >= start_dt,
            Attendance.check_in <= end_dt
        ).group_by(func.extract('hour', Attendance.check_in))\
         .order_by('hour').all()
        
        # Format response
        member_summary = []
        for stat in member_stats:
            total_hours = float(stat.total_minutes or 0) / 60
            member_summary.append({
                'member_id': str(stat.id),
                'member_name': f"{stat.first_name} {stat.last_name}",
                'visit_count': stat.visit_count,
                'total_hours': round(total_hours, 1),
                'avg_session_hours': round(total_hours / stat.visit_count, 1) if stat.visit_count > 0 else 0
            })
        
        return jsonify({
            'report_period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_visits': sum(stat.visit_count for stat in member_stats),
                'unique_members': len(member_stats),
                'total_workout_hours': round(sum(float(stat.total_minutes or 0) for stat in member_stats) / 60, 1)
            },
            'member_summary': member_summary,
            'daily_attendance': [
                {
                    'date': daily.date.isoformat(),
                    'visits': daily.count
                }
                for daily in daily_counts
            ],
            'peak_hours': [
                {
                    'hour': int(hour.hour),
                    'visits': hour.count
                }
                for hour in hourly_counts
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/overall-stats', methods=['GET'])
@jwt_required()
def get_attendance_stats():
    """Get overall attendance statistics"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate attendance rate for the last 30 days
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        
        # Total active members
        total_members = Member.query.filter_by(is_active=True).count()
        
        if total_members == 0:
            return jsonify({'average_attendance': 0}), 200
        
        # Get unique members who attended in the last 30 days
        attended_members = db.session.query(Attendance.member_id).filter(
            Attendance.check_in >= thirty_days_ago
        ).distinct().count()
        
        # Calculate average attendance percentage
        avg_attendance = round((attended_members / total_members) * 100, 1)
        
        return jsonify({
            'average_attendance': avg_attendance,
            'total_active_members': total_members,
            'members_attended_last_30_days': attended_members
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500