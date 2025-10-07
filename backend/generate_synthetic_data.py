"""
Synthetic Data Generator for FitHub Gym Management System
This script generates realistic synthetic data for demonstration purposes.
"""

import sys
import os
from datetime import datetime, timezone, date, timedelta
import random
from faker import Faker
from decimal import Decimal
from datetime import datetime
import bcrypt

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import (
    db, Role, User, Trainer, TrainerPhone, Member, MemberPhone, 
    Address, MembershipPlan, MemberMembership, WorkoutPlan, 
    DietPlan, Equipment, Attendance, Payment, PhysicalMetric
)

fake = Faker('en_IN')  # Use Indian locale for more relevant data

def create_users_and_trainers(roles, count=10):
    """Create trainer users and trainer profiles"""
    trainers = []
    specializations = [
        'Weight Training', 'Cardio Fitness', 'Yoga', 'CrossFit', 
        'Personal Training', 'Group Fitness', 'Strength Training',
        'Pilates', 'Martial Arts', 'Swimming', 'Nutrition Coaching'
    ]
    
    availability_options = ['Full-time', 'Part-time', 'Weekend Only', 'Flexible']
    
    for i in range(count):
        # Create user account for trainer
        email = fake.unique.email()
        user = User(
            email=email,
            role_id=roles['TRAINER'],
            is_active=True
        )
        user.set_password('Password.123')  # Default password for demo
        db.session.add(user)
        db.session.flush()  # Get the user ID
        
        # Create trainer profile
        trainer = Trainer(
            user_id=user.id,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            gender=random.choice(['Male', 'Female', 'Other']),
            specialization=random.choice(specializations),
            experience_years=random.randint(1, 15),
            bio=fake.text(max_nb_chars=200),
            rating=round(random.uniform(3.5, 5.0), 2),
            salary=random.randint(25000, 60000),
            total_clients=random.randint(5, 30),
            availability=random.choice(availability_options),
            is_active=True
        )
        db.session.add(trainer)
        db.session.flush()
        
        # Add phone numbers (1-2 per trainer)
        for _ in range(random.randint(1, 2)):
            phone = TrainerPhone(
                trainer_id=trainer.id,
                phone=fake.phone_number()
            )
            db.session.add(phone)
        
        trainers.append(trainer)
    
    db.session.commit()
    return trainers

def create_membership_plans():
    """Create various membership plans"""
    plans_data = [
        {
            'name': 'Basic Monthly',
            'duration_days': 30,
            'price': 999,
            'description': 'Basic gym access with standard equipment'
        },
        {
            'name': 'Premium Monthly',
            'duration_days': 30,
            'price': 1999,
            'description': 'Full gym access with personal training sessions'
        },
        {
            'name': 'Basic Annual',
            'duration_days': 365,
            'price': 9999,
            'description': 'Basic gym access for a full year - Save 20%'
        },
        {
            'name': 'Premium Annual',
            'duration_days': 365,
            'price': 19999,
            'description': 'Premium access for a full year with all benefits'
        },
        {
            'name': 'Student Monthly',
            'duration_days': 30,
            'price': 599,
            'description': 'Discounted rate for students with valid ID'
        },
        {
            'name': 'Family Package',
            'duration_days': 30,
            'price': 2499,
            'description': 'Monthly access for up to 4 family members'
        }
    ]
    
    plans = []
    for plan_data in plans_data:
        plan = MembershipPlan(**plan_data)
        db.session.add(plan)
        plans.append(plan)
    
    db.session.commit()
    return plans

def create_members_and_memberships(roles, membership_plans, count=50):
    """Create member users, profiles, and their memberships"""
    members = []
    
    for i in range(count):
        # Create user account for member
        email = fake.unique.email()
        user = User(
            email=email,
            role_id=roles['MEMBER'],
            is_active=random.choice([True, True, True, False])  # 75% active
        )
        user.set_password('Password.123')  # Default password for demo
        db.session.add(user)
        db.session.flush()
        
        # Create member profile
        join_date = fake.date_between(start_date='-2y', end_date='today')
        member = Member(
            user_id=user.id,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            dob=fake.date_of_birth(minimum_age=16, maximum_age=65),
            gender=random.choice(['Male', 'Female', 'Other']),
            joined_on=join_date,
            emergency_contact=fake.phone_number(),
            is_active=user.is_active
        )
        db.session.add(member)
        db.session.flush()
        
        # Add phone numbers (1-2 per member)
        for _ in range(random.randint(1, 2)):
            phone = MemberPhone(
                member_id=member.id,
                phone=fake.phone_number()
            )
            db.session.add(phone)
        
        # Add address
        address = Address(
            member_id=member.id,
            street_name=fake.street_address(),
            city_name=fake.city(),
            state_name=fake.state(),
            postal_code=fake.postcode()
        )
        db.session.add(address)
        
        # Create membership history (can have multiple memberships)
        num_memberships = random.randint(1, 3)
        for j in range(num_memberships):
            plan = random.choice(membership_plans)
            
            if j == 0:
                start_date = join_date
            else:
                start_date = fake.date_between(start_date=join_date, end_date='today')
            
            end_date = start_date + timedelta(days=plan.duration_days)
            
            # Determine status based on dates
            today = date.today()
            if end_date < today:
                status = 'expired'
            elif start_date <= today <= end_date:
                status = 'active'
            else:
                status = 'upcoming'
            
            # Apply discount (0-20%)
            discount = round(random.uniform(0, 20), 2)
            amount_paid = plan.price * (Decimal(1) - Decimal(discount) / Decimal(100))
            
            membership = MemberMembership(
                member_id=member.id,
                plan_id=plan.id,
                start_date=start_date,
                end_date=end_date,
                status=status,
                amount_paid=round(amount_paid, 2),
                discount=discount
            )
            db.session.add(membership)
        
        # Add physical metrics
        for k in range(random.randint(1, 5)):  # 1-5 measurements over time
            metric_date = fake.date_between(start_date=join_date, end_date='today')
            height = round(random.uniform(150, 200), 2)  # cm
            weight = round(random.uniform(50, 120), 2)   # kg
            bmi = round(weight / ((height/100) ** 2), 2)
            
            metric = PhysicalMetric(
                member_id=member.id,
                measured_at = datetime.combine(metric_date, fake.time_object()),
                height_cm=height,
                weight_kg=weight,
                bmi=bmi
            )
            db.session.add(metric)
        
        members.append(member)
    
    db.session.commit()
    return members

def create_workout_and_diet_plans(trainers):
    """Create workout and diet plans"""
    workout_types = ['Strength', 'Cardio', 'HIIT', 'Flexibility', 'Endurance', 'CrossFit']
    diet_types = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic Performance', 'Vegetarian', 'Keto']
    
    workout_plans = []
    diet_plans = []
    
    # Create workout plans
    for i in range(20):
        plan = WorkoutPlan(
            name=f"{random.choice(workout_types)} {fake.word().title()} Program",
            type=random.choice(workout_types),
            description=fake.text(max_nb_chars=300),
            created_by=random.choice(trainers).id
        )
        db.session.add(plan)
        workout_plans.append(plan)
    
    # Create diet plans
    for i in range(15):
        plan = DietPlan(
            name=f"{random.choice(diet_types)} {fake.word().title()} Diet",
            type=random.choice(diet_types),
            description=fake.text(max_nb_chars=300),
            kcal_count=random.randint(1200, 3000),
            created_by=random.choice(trainers).id
        )
        db.session.add(plan)
        diet_plans.append(plan)
    
    db.session.commit()
    return workout_plans, diet_plans

def create_equipment():
    """Create gym equipment records"""
    equipment_data = [
        {'category': 'Cardio', 'items': ['Treadmill', 'Elliptical', 'Stationary Bike', 'Rowing Machine', 'Stair Climber']},
        {'category': 'Strength', 'items': ['Bench Press', 'Squat Rack', 'Leg Press', 'Lat Pulldown', 'Cable Machine']},
        {'category': 'Free Weights', 'items': ['Dumbbells', 'Barbells', 'Kettlebells', 'Weight Plates', 'Medicine Balls']},
        {'category': 'Functional', 'items': ['Pull-up Bar', 'Battle Ropes', 'TRX Suspension', 'Bosu Ball', 'Resistance Bands']}
    ]
    
    equipment_list = []
    for category in equipment_data:
        for item in category['items']:
            for i in range(random.randint(2, 8)):  # Multiple units of each equipment
                purchase_date = fake.date_between(start_date='-5y', end_date='-1y')
                last_maintenance = fake.date_between(start_date=purchase_date, end_date='today')
                next_maintenance = last_maintenance + timedelta(days=random.randint(30, 180))
                
                equipment = Equipment(
                    name=f"{item} #{i+1}",
                    category=category['category'],
                    quantity=1,
                    purchase_date=purchase_date,
                    last_maintenance_date=last_maintenance,
                    next_maintenance_date=next_maintenance
                )
                db.session.add(equipment)
                equipment_list.append(equipment)
    
    db.session.commit()
    return equipment_list

def create_attendance_records(members, trainers):
    """Create attendance records"""
    for member in members[:30]:  # Generate attendance for 30 members
        if not member.is_active:
            continue
            
        # Generate attendance for the last 90 days
        start_date = datetime.now() - timedelta(days=90)
        current_date = start_date
        
        while current_date <= datetime.now():
            # 70% chance of attendance on any given day
            if random.random() < 0.7:
                check_in_time = current_date.replace(
                    hour=random.randint(6, 21),
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59)
                )
                
                # Check out 1-3 hours later
                check_out_time = check_in_time + timedelta(
                    hours=random.randint(1, 3),
                    minutes=random.randint(0, 59)
                )
                
                attendance = Attendance(
                    member_id=member.id,
                    trainer_id=random.choice(trainers).id if random.random() < 0.3 else None,  # 30% chance with trainer
                    check_in=check_in_time,
                    check_out=check_out_time
                )
                db.session.add(attendance)
            
            current_date += timedelta(days=1)
    
    db.session.commit()

def create_payments(members):
    """Create payment records"""
    payment_modes = ['Cash', 'Card', 'Net Banking', 'UPI']
    
    for member in members:
        # Get member's memberships
        memberships = MemberMembership.query.filter_by(member_id=member.id).all()
        
        for membership in memberships:
            # Create payment for each membership
            payment = Payment(
                member_id=member.id,
                membership_id=membership.id,
                amount=membership.amount_paid,
                date=datetime.combine(membership.start_date, fake.time_object()),
                mode=random.choice(payment_modes)
            )
            db.session.add(payment)
            
            # Sometimes add partial payments
            if random.random() < 0.2:  # 20% chance of partial payment
                partial_payment = Payment(
                    member_id=member.id,
                    membership_id=membership.id,
                    amount=round(float(membership.amount_paid) * 0.5, 2),
                    date=datetime.combine(membership.start_date - timedelta(days=15), fake.time_object()),
                    mode=random.choice(payment_modes)
                )
                db.session.add(partial_payment)
    
    db.session.commit()

def main():
    """Main function to generate all synthetic data"""
    app = create_app()
    
    with app.app_context():
        print("Starting synthetic data generation...")
        
        # Create tables
        db.create_all()

        roles = {
            "ADMIN": os.getenv("ADMIN"),
            "TRAINER": os.getenv("TRAINER"),
            "MEMBER": os.getenv("MEMBER")
        }
        
        # Create membership plans
        print("Creating membership plans...")
        membership_plans = create_membership_plans()
        
        # Create trainers
        print("Creating trainers...")
        trainers = create_users_and_trainers(roles, count=10)
        
        # Create members
        print("Creating members...")
        members = create_members_and_memberships(roles, membership_plans, count=50)
        
        # Create workout and diet plans
        print("Creating workout and diet plans...")
        workout_plans, diet_plans = create_workout_and_diet_plans(trainers)
        
        # Create equipment
        print("Creating equipment...")
        equipment = create_equipment()
        
        # Create attendance records
        print("Creating attendance records...")
        create_attendance_records(members, trainers)
        
        # Create payments
        print("Creating payments...")
        create_payments(members)
        
        print("\n" + "="*50)
        print("SYNTHETIC DATA GENERATION COMPLETE!")
        print("="*50)
        print(f"✓ Created {len(roles)} roles")
        print(f"✓ Created {len(trainers)} trainers")
        print(f"✓ Created {len(members)} members")
        print(f"✓ Created {len(membership_plans)} membership plans")
        print(f"✓ Created {len(workout_plans)} workout plans")
        print(f"✓ Created {len(diet_plans)} diet plans")
        print(f"✓ Created {len(equipment)} equipment items")
        print("✓ Created attendance records")
        print("✓ Created payment records")
        print("\nAll trainer/member accounts use password: Password.123")

if __name__ == "__main__":
    main()