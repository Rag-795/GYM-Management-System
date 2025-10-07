#!/usr/bin/env python3
"""
Debug script to isolate the diet plan creation issue
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, DietPlan, Trainer, User
import traceback

def test_diet_creation():
    app = create_app()
    with app.app_context():
        try:
            # Get a trainer user
            trainer_user = User.query.filter_by(email='trainer@fithub.com').first()
            if not trainer_user:
                print("Trainer user not found")
                return
                
            print(f"Found trainer user: {trainer_user.id}")
            print(f"Trainer profile: {trainer_user.trainer_profile}")
            print(f"Trainer profile type: {type(trainer_user.trainer_profile)}")
            
            if not trainer_user.trainer_profile:
                print("No trainer profile found")
                return
                
            # Get the first trainer profile since it's a list
            trainer_profile = trainer_user.trainer_profile[0] if trainer_user.trainer_profile else None
            if not trainer_profile:
                print("No trainer profile in list")
                return
                
            print(f"Trainer profile ID: {trainer_profile.id}")
            
            # Try to create a simple diet plan
            diet_plan = DietPlan(
                name="Test Diet Plan",
                type="General", 
                description="Test description",
                kcal_count=2000,
                created_by=trainer_profile.id
            )
            
            print("Created diet plan object")
            
            db.session.add(diet_plan)
            print("Added to session")
            
            db.session.flush()
            print(f"Flushed - diet plan ID: {diet_plan.id}")
            
            # Try accessing members (this might be where it fails)
            print(f"Diet plan members: {diet_plan.members}")
            print(f"Members type: {type(diet_plan.members)}")
            
            # Try to commit
            db.session.commit()
            print("Committed successfully")
            
            print("SUCCESS: Diet plan created without errors")
            
        except Exception as e:
            print(f"ERROR: {str(e)}")
            print(f"TRACEBACK:\n{traceback.format_exc()}")
            db.session.rollback()

if __name__ == "__main__":
    test_diet_creation()