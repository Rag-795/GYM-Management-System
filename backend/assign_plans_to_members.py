"""
Script to assign workout and diet plans to all members
"""
import random
from app import create_app, db
from models import Member, WorkoutPlan, DietPlan

# Create app instance
app = create_app()

def assign_plans_to_all_members():
    """Assign random workout and diet plans to all members"""
    with app.app_context():
        members = Member.query.all()
        workout_plans = WorkoutPlan.query.all()
        diet_plans = DietPlan.query.all()
        
        if not workout_plans:
            print("No workout plans found! Run generate_synthetic_data.py first.")
            return
        
        if not diet_plans:
            print("No diet plans found! Run generate_synthetic_data.py first.")
            return
        
        print(f"Found {len(members)} members, {len(workout_plans)} workout plans, {len(diet_plans)} diet plans")
        print("="  * 80)
        
        for member in members:
            try:
                # Clear existing plans
                member.workout_plans.clear()
                member.diet_plans.clear()
                
                # Assign 1-2 random workout plans
                num_workout_plans = random.randint(1, 2)
                selected_workout_plans = random.sample(workout_plans, min(num_workout_plans, len(workout_plans)))
                for plan in selected_workout_plans:
                    member.workout_plans.append(plan)
                
                # Assign 1 random diet plan
                selected_diet_plan = random.choice(diet_plans)
                member.diet_plans.append(selected_diet_plan)
                
                db.session.commit()
                print(f"✓ {member.first_name:15} {member.last_name:15} - {num_workout_plans} workout plan(s), 1 diet plan")
                
            except Exception as e:
                db.session.rollback()
                print(f"✗ Error for {member.first_name} {member.last_name}: {e}")
        
        print("=" * 80)
        print(f"✓ Plan assignment complete for all members!")

if __name__ == '__main__':
    assign_plans_to_all_members()
