from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, Role, User, Trainer, Member, MemberPhone, TrainerPhone
from auth_routes import auth_bp
from trainer_routes import trainer_bp
from member_routes import member_bp
from membership_routes import membership_bp
from equipment_routes import equipment_bp
from attendance_routes import attendance_bp
from payment_routes import payment_bp
from config import config
import os
from datetime import datetime, timezone

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_CONFIG', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Configure CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(trainer_bp)
    app.register_blueprint(member_bp)
    app.register_blueprint(membership_bp)
    app.register_blueprint(equipment_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(payment_bp)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization token is required'}), 401
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'version': '1.0.0'
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'FitHub API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/auth',
                'health': '/health'
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

def create_dummy_users():
    """Create dummy users for testing"""
    try:
        # Check if roles exist
        admin_role = Role.query.filter_by(name='admin').first()
        trainer_role = Role.query.filter_by(name='trainer').first()
        member_role = Role.query.filter_by(name='member').first()
        
        if not admin_role or not trainer_role or not member_role:
            print("Roles not found. Please run setup.py first.")
            return
        
        # Create admin user if doesn't exist
        admin_user = User.query.filter_by(email='admin@fithub.com').first()
        if not admin_user:
            admin_user = User(
                email='admin@fithub.com',
                role_id=admin_role.id
            )
            admin_user.set_password('Admin@123')
            db.session.add(admin_user)
            print("Created admin user: admin@fithub.com / Admin@123")
        
        # Create trainer user if doesn't exist
        trainer_user = User.query.filter_by(email='trainer@fithub.com').first()
        if not trainer_user:
            trainer_user = User(
                email='trainer@fithub.com',
                role_id=trainer_role.id
            )
            trainer_user.set_password('Trainer@123')
            db.session.add(trainer_user)
            db.session.flush()
            
            # Create trainer profile
            trainer_profile = Trainer(
                user_id=trainer_user.id,
                first_name='John',
                last_name='Fitness',
                gender='Male',
                specialization='Strength Training',
                experience_years=5,
                bio='Experienced fitness trainer specializing in strength training and muscle building.'
            )
            db.session.add(trainer_profile)
            db.session.flush()
            
            # Add trainer phone
            trainer_phone = TrainerPhone(
                trainer_id=trainer_profile.id,
                phone='+1-555-0102'
            )
            db.session.add(trainer_phone)
            print("Created trainer user: trainer@fithub.com / Trainer@123")
        
        # Create member user if doesn't exist
        member_user = User.query.filter_by(email='member@fithub.com').first()
        if not member_user:
            member_user = User(
                email='member@fithub.com',
                role_id=member_role.id
            )
            member_user.set_password('Member@123')
            db.session.add(member_user)
            db.session.flush()
            
            # Create member profile
            member_profile = Member(
                user_id=member_user.id,
                first_name='Jane',
                last_name='Doe',
                dob=datetime(1995, 5, 15).date(),
                gender='Female',
                emergency_contact='+1-555-0103'
            )
            db.session.add(member_profile)
            db.session.flush()
            
            # Add member phone
            member_phone = MemberPhone(
                member_id=member_profile.id,
                phone='+1-555-0103'
            )
            db.session.add(member_phone)
            print("Created member user: member@fithub.com / Member@123")
        
        db.session.commit()
        print("Dummy users created successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating dummy users: {str(e)}")

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Create dummy users
        create_dummy_users()
        
        print("Starting FitHub API server...")
        print("Admin user: admin@fithub.com / Admin@123")
        print("Trainer user: trainer@fithub.com / Trainer@123")
        print("Member user: member@fithub.com / Member@123")
    
    app.run(host='0.0.0.0', port=5000, debug=True)