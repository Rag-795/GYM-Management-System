# FitHub - Gym Management System

A comprehensive gym management system built with React frontend and Flask backend, featuring role-based authentication and user management for admins, trainers, and members.

## 🏋️ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with role-based access control
- Three user roles: Admin, Trainer, Member
- Secure password hashing with bcrypt
- Email validation and password strength requirements

### 👥 User Management
- Role-based signup and login
- Separate profiles for members and trainers
- User profile management with contact information
- Account activation/deactivation controls

### 🎯 Role-Specific Features
- **Admin Dashboard**: Complete system oversight and user management
- **Trainer Dashboard**: Member management and training program oversight
- **Member Dashboard**: Personal profile and gym activity tracking

### 🔧 Technical Features
- PostgreSQL database with comprehensive schema
- RESTful API design
- CORS enabled for cross-origin requests
- Responsive React frontend with modern UI components
- Form validation and error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Flask** - Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT token management
- **Flask-CORS** - Cross-origin resource sharing
- **bcrypt** - Password hashing

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Rag-795/GYM-Management-System.git
cd GYM-Management-System/FitHub
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb gymdb

# Or using PostgreSQL command line:
psql -U postgres
CREATE DATABASE gymdb;
\q
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
# Set DATABASE_URL=postgresql://username:password@localhost:5432/fithub
# Replace username and password with your PostgreSQL credentials

# Initialize database schema
python setup.py

# Start the Flask server
python app.py
```

The backend server will start on `http://localhost:5000`

### 4. Frontend Setup
```bash
# Open a new terminal and navigate to project root
cd ../

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎮 Usage

### Default User Accounts
The system comes with three pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fithub.com | Admin@123 |
| Trainer | trainer@fithub.com | Trainer@123 |
| Member | member@fithub.com | Member@123 |

### API Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user profile

#### Health Check
- `GET /health` - API health status
- `GET /` - API information

### Environment Variables

**⚠️ IMPORTANT: Never commit actual credentials to GitHub!**

1. Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

2. Edit the `.env` file with your actual credentials:
```env
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@localhost:5432/fithub

# JWT Security (REQUIRED - Generate strong random keys for production)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
SECRET_KEY=your-flask-secret-key-change-this-in-production

# Development Settings
FLASK_DEBUG=True
FLASK_ENV=development
```

3. Replace `username` and `password` with your PostgreSQL credentials
4. Generate strong secret keys for production deployment

## 📁 Project Structure

```
FitHub/
├── backend/                 # Flask backend
│   ├── app.py              # Main application entry point
│   ├── auth_routes.py      # Authentication endpoints
│   ├── models.py           # Database models
│   ├── config.py           # Configuration settings
│   ├── setup.py            # Database initialization
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   └── assets/            # Static assets
├── public/                # Public assets
└── package.json          # Node.js dependencies
```

## 🔧 Development

### Backend Development
```bash
cd backend
python app.py  # Starts server with auto-reload in debug mode
```

### Frontend Development
```bash
npm run dev  # Starts Vite dev server with hot reload
```

### Building for Production
```bash
# Frontend build
npm run build

# Backend deployment
# Set FLASK_ENV=production in environment variables
```

## 📝 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **Users** - Core user authentication
- **Roles** - Admin, Trainer, Member roles
- **Members** - Member-specific profiles and data
- **Trainers** - Trainer-specific profiles and data
- **Phones** - Contact information for users

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � Security Considerations

- **Never commit `.env` files** - These contain sensitive credentials
- **Use strong secret keys** - Generate random keys for JWT_SECRET_KEY and SECRET_KEY
- **Change default passwords** - Always use strong, unique passwords for production
- **Environment isolation** - Use different databases for development and production
- **HTTPS in production** - Always use HTTPS for production deployments

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of DBMS course project
- Inspired by modern gym management needs
- Uses industry-standard security practices

## 📞 Support

For support, email [support@fithub.com](mailto:support@fithub.com) or create an issue in the GitHub repository.
