"""
setup.py
Create PostgreSQL schema for Gym Management System using SQLAlchemy.

Usage:
  1. Install dependencies:
     pip install sqlalchemy psycopg2-binary python-dotenv

  2. Set DATABASE_URL environment variable, for example:
     export DATABASE_URL="postgresql+psycopg2://gym_admin:yourpassword@localhost:5432/gymdb"

     (On Windows CMD use `set` instead of export)

  3. Run:
     python setup.py

Notes:
  - This script uses gen_random_uuid() from pgcrypto. If pgcrypto is unavailable, UUIDs will still be generated client-side.
  - For production migrations, use Alembic / Flask-Migrate instead of create_all.
"""

import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, String, Integer, Date, DateTime, Boolean, Text,
    ForeignKey, Table, Numeric, TIMESTAMP
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.sql import text
import uuid

# Load environment variables from .env file
load_dotenv()

# Initialize Base FIRST before using it
Base = declarative_base()

# Helper function for UTC timestamps
def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)


# Association tables (many-to-many)
member_workout_assoc = Table(
    "member_workout_plans", Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("member_id", UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
    Column("workout_id", UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False),
    Column("assigned_at", TIMESTAMP(timezone=True), default=utc_now)
)

member_diet_assoc = Table(
    "member_diet_plans", Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("member_id", UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
    Column("diet_id", UUID(as_uuid=True), ForeignKey("diet_plans.id", ondelete="CASCADE"), nullable=False),
    Column("assigned_at", TIMESTAMP(timezone=True), default=utc_now)
)

workout_equipment_assoc = Table(
    "workout_equipment", Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("workout_id", UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False),
    Column("equipment_id", UUID(as_uuid=True), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False)
)


# Core tables
class Role(Base):
    __tablename__ = "roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)
    updated_at = Column(TIMESTAMP(timezone=True), default=utc_now, onupdate=utc_now)

    role = relationship("Role")


class TrainerPhone(Base):
    __tablename__ = "trainer_phones"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    phone = Column(String(50), nullable=False)


class Trainer(Base):
    __tablename__ = "trainers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(120))
    last_name = Column(String(120))
    gender = Column(String(20))
    specialization = Column(String(200))
    experience_years = Column(Integer, default=0)
    bio = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)
    updated_at = Column(TIMESTAMP(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", backref="trainer_profile")
    phones = relationship("TrainerPhone", cascade="all,delete-orphan")


class MemberPhone(Base):
    __tablename__ = "member_phones"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    phone = Column(String(50), nullable=False)


class Address(Base):
    __tablename__ = "addresses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    street_name = Column(String(255))
    city_name = Column(String(120))
    state_name = Column(String(120))
    postal_code = Column(String(30))


class Member(Base):
    __tablename__ = "members"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(120))
    last_name = Column(String(120))
    dob = Column(Date)
    gender = Column(String(20))
    joined_on = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    current_plan_id = Column(UUID(as_uuid=True), ForeignKey("member_memberships.id"), nullable=True)
    emergency_contact = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)
    updated_at = Column(TIMESTAMP(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", backref="member_profile")
    phones = relationship("MemberPhone", cascade="all,delete-orphan")
    addresses = relationship("Address", cascade="all,delete-orphan")
    memberships = relationship("MemberMembership", back_populates="member", foreign_keys="[MemberMembership.member_id]")
    current_plan = relationship("MemberMembership", foreign_keys=[current_plan_id], post_update=True)
    workout_plans = relationship("WorkoutPlan", secondary=member_workout_assoc, back_populates="members")
    diet_plans = relationship("DietPlan", secondary=member_diet_assoc, back_populates="members")


class MembershipPlan(Base):
    __tablename__ = "membership_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    duration_days = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)


class MemberMembership(Base):
    __tablename__ = "member_memberships"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("membership_plans.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(50), default="active")
    amount_paid = Column(Numeric(10, 2))
    discount = Column(Numeric(7, 2), default=0)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)

    member = relationship("Member", back_populates="memberships",foreign_keys=[member_id])
    plan = relationship("MembershipPlan")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    type = Column(String(100))  # strength/cardio/etc
    description = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("trainers.id"))
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)

    trainer = relationship("Trainer")
    members = relationship("Member", secondary=member_workout_assoc, back_populates="workout_plans")
    equipment = relationship("Equipment", secondary=workout_equipment_assoc)


class DietPlan(Base):
    __tablename__ = "diet_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    type = Column(String(100))
    description = Column(Text)
    kcal_count = Column(Integer)
    created_by = Column(UUID(as_uuid=True), ForeignKey("trainers.id"))
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)

    trainer = relationship("Trainer")
    members = relationship("Member", secondary=member_diet_assoc, back_populates="diet_plans")


class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    category = Column(String(120))
    quantity = Column(Integer, default=1)
    purchase_date = Column(Date)
    last_maintenance_date = Column(Date)
    next_maintenance_date = Column(Date)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)


class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)
    check_in = Column(TIMESTAMP(timezone=True), nullable=False)
    check_out = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)


class Payment(Base):
    __tablename__ = "payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    membership_id = Column(UUID(as_uuid=True), ForeignKey("member_memberships.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(TIMESTAMP(timezone=True), default=utc_now)
    mode = Column(String(80))


class PhysicalMetric(Base):
    __tablename__ = "physical_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    measured_at = Column(TIMESTAMP(timezone=True), default=utc_now)
    height_cm = Column(Numeric(6, 2))
    weight_kg = Column(Numeric(6, 2))
    bmi = Column(Numeric(6, 2))
    created_at = Column(TIMESTAMP(timezone=True), default=utc_now)


def main():
    # Get database URL from environment variable
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL environment variable not set!")
        print("Please set it using:")
        print("  export DATABASE_URL='postgresql://username:password@localhost:5432/fithub'")
        print("  (Replace username and password with your PostgreSQL credentials)")
        return
    
    print(f"Connecting to PostgreSQL database...")
    engine = create_engine(DATABASE_URL, echo=False)
    
    print("Creating database tables...")
    Base.metadata.create_all(engine)

    print("Database setup complete! Tables have been created in the 'fithub' database.")

    # Seed roles
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        existing = session.query(Role).count()
        if existing == 0:
            print("Seeding roles...")
            session.add_all([
                Role(name="admin", description="Administrator with full access"),
                Role(name="trainer", description="Trainer role"),
                Role(name="member", description="Member / customer role")
            ])
            session.commit()
            print("Seeded roles: admin, trainer, member")
        else:
            print("Roles already present, skipping seed.")
    except Exception as e:
        print(f"Error seeding roles: {e}")
        session.rollback()
    finally:
        session.close()
    
    print("Done.")


if __name__ == "__main__":
    main()