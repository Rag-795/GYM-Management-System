"""
Test script to verify the synthetic data generation
"""
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, Role, User, Trainer, Member, MembershipPlan

def test_data_generation():
    """Test if the data was generated correctly"""
    app = create_app()
    
    with app.app_context():
        print("Testing database connection and data...")
        
        try:
            # Test role creation
            roles = Role.query.all()
            print(f"✓ Roles found: {len(roles)}")
            for role in roles:
                print(f"  - {role.name}: {role.description}")
            
            # Test user creation
            users = User.query.all()
            print(f"✓ Users found: {len(users)}")
            
            # Test trainer creation
            trainers = Trainer.query.all()
            print(f"✓ Trainers found: {len(trainers)}")
            if trainers:
                sample_trainer = trainers[0]
                print(f"  Sample trainer: {sample_trainer.first_name} {sample_trainer.last_name}")
                print(f"  Specialization: {sample_trainer.specialization}")
                print(f"  Salary: ${sample_trainer.salary}")
            
            # Test member creation
            members = Member.query.all()
            print(f"✓ Members found: {len(members)}")
            if members:
                sample_member = members[0]
                print(f"  Sample member: {sample_member.first_name} {sample_member.last_name}")
            
            # Test membership plans
            plans = MembershipPlan.query.all()
            print(f"✓ Membership plans found: {len(plans)}")
            for plan in plans:
                print(f"  - {plan.name}: ${plan.price} for {plan.duration_days} days")
            
            print("\n" + "="*50)
            print("DATA GENERATION TEST SUCCESSFUL!")
            print("="*50)
            
        except Exception as e:
            print(f"❌ Error during testing: {str(e)}")
            return False
    
    return True

if __name__ == "__main__":
    test_data_generation()