from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Table, Column, ForeignKey
import uuid
import bcrypt

db = SQLAlchemy()

# Helper function for UTC timestamps
def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

# Association tables (many-to-many)
member_workout_assoc = Table(
    "member_workout_plans", db.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("member_id", UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
    Column("workout_id", UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False),
    Column("assigned_at", db.TIMESTAMP(timezone=True), default=utc_now)
)

member_diet_assoc = Table(
    "member_diet_plans", db.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("member_id", UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
    Column("diet_id", UUID(as_uuid=True), ForeignKey("diet_plans.id", ondelete="CASCADE"), nullable=False),
    Column("assigned_at", db.TIMESTAMP(timezone=True), default=utc_now)
)

workout_equipment_assoc = Table(
    "workout_equipment", db.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("workout_id", UUID(as_uuid=True), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False),
    Column("equipment_id", UUID(as_uuid=True), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False)
)

# Core Models
class Role(db.Model):
    __tablename__ = "roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(db.String(50), unique=True, nullable=False)
    description = Column(db.Text)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class User(db.Model):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = Column(db.Text, nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    is_active = Column(db.Boolean, default=True)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)
    updated_at = Column(db.TIMESTAMP(timezone=True), default=utc_now, onupdate=utc_now)

    role = db.relationship("Role", backref="users")

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches the hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'role': self.role.name if self.role else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TrainerPhone(db.Model):
    __tablename__ = "trainer_phones"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    phone = Column(db.String(50), nullable=False)

class Trainer(db.Model):
    __tablename__ = "trainers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(db.String(120))
    last_name = Column(db.String(120))
    gender = Column(db.String(20))
    specialization = Column(db.String(200))
    experience_years = Column(db.Integer, default=0)
    bio = Column(db.Text)
    is_active = Column(db.Boolean, default=True)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)
    updated_at = Column(db.TIMESTAMP(timezone=True), default=utc_now, onupdate=utc_now)

    user = db.relationship("User", backref="trainer_profile")
    phones = db.relationship("TrainerPhone", cascade="all,delete-orphan")

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name or ''} {self.last_name or ''}".strip(),
            'gender': self.gender,
            'specialization': self.specialization,
            'experience_years': self.experience_years,
            'bio': self.bio,
            'is_active': self.is_active,
            'phones': [phone.phone for phone in self.phones] if self.phones else []
        }

class MemberPhone(db.Model):
    __tablename__ = "member_phones"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    phone = Column(db.String(50), nullable=False)

class Address(db.Model):
    __tablename__ = "addresses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    street_name = Column(db.String(255))
    city_name = Column(db.String(120))
    state_name = Column(db.String(120))
    postal_code = Column(db.String(30))

class Member(db.Model):
    __tablename__ = "members"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(db.String(120))
    last_name = Column(db.String(120))
    dob = Column(db.Date)
    gender = Column(db.String(20))
    joined_on = Column(db.Date, default=lambda: datetime.now(timezone.utc).date())
    current_plan_id = Column(UUID(as_uuid=True), ForeignKey("member_memberships.id"), nullable=True)
    emergency_contact = Column(db.String(50))
    is_active = Column(db.Boolean, default=True)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)
    updated_at = Column(db.TIMESTAMP(timezone=True), default=utc_now, onupdate=utc_now)

    user = db.relationship("User", backref="member_profile")
    phones = db.relationship("MemberPhone", cascade="all,delete-orphan")
    addresses = db.relationship("Address", cascade="all,delete-orphan")
    memberships = db.relationship("MemberMembership", back_populates="member", foreign_keys="[MemberMembership.member_id]")
    current_plan = db.relationship("MemberMembership", foreign_keys=[current_plan_id], post_update=True)
    workout_plans = db.relationship("WorkoutPlan", secondary=member_workout_assoc, back_populates="members")
    diet_plans = db.relationship("DietPlan", secondary=member_diet_assoc, back_populates="members")

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name or ''} {self.last_name or ''}".strip(),
            'dob': self.dob.isoformat() if self.dob else None,
            'gender': self.gender,
            'joined_on': self.joined_on.isoformat() if self.joined_on else None,
            'emergency_contact': self.emergency_contact,
            'is_active': self.is_active,
            'phones': [phone.phone for phone in self.phones] if self.phones else [],
            'addresses': [
                {
                    'street_name': addr.street_name,
                    'city_name': addr.city_name,
                    'state_name': addr.state_name,
                    'postal_code': addr.postal_code
                } for addr in self.addresses
            ] if self.addresses else []
        }

class MembershipPlan(db.Model):
    __tablename__ = "membership_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(db.String(120), nullable=False)
    duration_days = Column(db.Integer, nullable=False)
    price = Column(db.Numeric(10, 2), nullable=False)
    description = Column(db.Text)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)

class MemberMembership(db.Model):
    __tablename__ = "member_memberships"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("membership_plans.id"), nullable=False)
    start_date = Column(db.Date, nullable=False)
    end_date = Column(db.Date, nullable=False)
    status = Column(db.String(50), default="active")
    amount_paid = Column(db.Numeric(10, 2))
    discount = Column(db.Numeric(7, 2), default=0)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)

    member = db.relationship("Member", back_populates="memberships", foreign_keys=[member_id])
    plan = db.relationship("MembershipPlan")

class WorkoutPlan(db.Model):
    __tablename__ = "workout_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(db.String(200), nullable=False)
    type = Column(db.String(100))  # strength/cardio/etc
    description = Column(db.Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("trainers.id"))
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)

    trainer = db.relationship("Trainer")
    members = db.relationship("Member", secondary=member_workout_assoc, back_populates="workout_plans")
    equipment = db.relationship("Equipment", secondary=workout_equipment_assoc)

class DietPlan(db.Model):
    __tablename__ = "diet_plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(db.String(200), nullable=False)
    type = Column(db.String(100))
    description = Column(db.Text)
    kcal_count = Column(db.Integer)
    created_by = Column(UUID(as_uuid=True), ForeignKey("trainers.id"))
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)

    trainer = db.relationship("Trainer")
    members = db.relationship("Member", secondary=member_diet_assoc, back_populates="diet_plans")

class Equipment(db.Model):
    __tablename__ = "equipment"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(db.String(200), nullable=False)
    category = Column(db.String(120))
    quantity = Column(db.Integer, default=1)
    purchase_date = Column(db.Date)
    last_maintenance_date = Column(db.Date)
    next_maintenance_date = Column(db.Date)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)

class Attendance(db.Model):
    __tablename__ = "attendance"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)
    check_in = Column(db.TIMESTAMP(timezone=True), nullable=False)
    check_out = Column(db.TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)

class Payment(db.Model):
    __tablename__ = "payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    membership_id = Column(UUID(as_uuid=True), ForeignKey("member_memberships.id", ondelete="SET NULL"), nullable=True)
    amount = Column(db.Numeric(10, 2), nullable=False)
    date = Column(db.TIMESTAMP(timezone=True), default=utc_now)
    mode = Column(db.String(80))

class PhysicalMetric(db.Model):
    __tablename__ = "physical_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    measured_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)
    height_cm = Column(db.Numeric(6, 2))
    weight_kg = Column(db.Numeric(6, 2))
    bmi = Column(db.Numeric(6, 2))
    created_at = Column(db.TIMESTAMP(timezone=True), default=utc_now)