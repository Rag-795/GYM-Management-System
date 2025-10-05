import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Dumbbell, Calendar, Briefcase } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import api from '../../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER', // Default role
    agreeToTerms: false,
    marketingEmails: false,
    // Trainer-specific fields
    specialties: [],
    experience: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const trainerSpecialties = [
    'Weight Training', 'Cardio', 'HIIT', 'CrossFit', 'Yoga', 
    'Pilates', 'Boxing', 'MMA', 'Dance Fitness', 'Zumba',
    'Strength Training', 'Nutrition', 'Rehabilitation'
  ];

  // Password strength helper (computed on render)
  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const strengthLevels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

    return {
      level: strengthLevels[strength - 1] || 'Weak',
      color: strengthColors[strength - 1] || '#ef4444',
      percentage: Math.min((strength / 5) * 100, 100)
    };
  };

  const strength = passwordStrength();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-()]/g, ''))) { 
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 16) {
        newErrors.dateOfBirth = 'You must be at least 16 years old';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Trainer-specific validation
    if (formData.role === 'TRAINER') {
      if (formData.specialties.length === 0) {
        newErrors.specialties = 'Please select at least one specialty';
      }
      if (!formData.experience) {
        newErrors.experience = 'Experience is required for trainers';
      }
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const handleNextStep = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
        role: formData.role,
        marketingEmails: formData.marketingEmails
      };

      // Add trainer-specific data if role is TRAINER
      if (formData.role === 'TRAINER') {
        signupData.specialties = formData.specialties;
        signupData.experience = formData.experience;
        signupData.bio = formData.bio;
      }

      const response = await api.signup(signupData);

      setAlert({ 
        type: 'success', 
        message: 'Account created successfully! Please login to your account.' 
      });
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.message || 'Failed to create account. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Section - Image/Graphics */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-50"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920)'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-6">
              Join The FitHub Community
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {formData.role === 'TRAINER' 
                ? 'Help others achieve their fitness goals as a trainer'
                : 'Get access to exclusive features and start your transformation'
              }
            </p>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
                <p className="text-white/90">
                  {formData.role === 'TRAINER' 
                    ? 'Manage your clients and training schedules'
                    : 'Personalized workout plans tailored to your goals'
                  }
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
                <p className="text-white/90">
                  {formData.role === 'TRAINER' 
                    ? 'Track client progress and performance metrics'
                    : 'Track your progress with advanced analytics'
                  }
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
                <p className="text-white/90">
                  {formData.role === 'TRAINER' 
                    ? 'Build your professional trainer profile'
                    : 'Connect with trainers and fellow fitness enthusiasts'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8 mt-4">
            <Link to="/" className="inline-flex items-center justify-center space-x-2">
              <Dumbbell className="h-10 w-10 text-yellow-400" />
              <span className="text-3xl font-black text-yellow-400">FitHub</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Create Your Account
            </h2>
            <p className="mt-2 text-gray-400">
              {step === 1 ? 'Enter your personal information' : 'Complete your profile'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400'
              }`}>
                1
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-yellow-400' : 'bg-gray-800'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Alert */}
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    icon={User}
                    error={errors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    error={errors.lastName}
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  icon={Mail}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  icon={Phone}
                  error={errors.phone}
                  required
                  autoComplete="tel"
                />

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    I want to join as <span className="text-yellow-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.role === 'MEMBER' 
                        ? 'border-yellow-400 bg-yellow-400/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="MEMBER"
                        checked={formData.role === 'MEMBER'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <User className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                        <div className="text-white font-medium">Member</div>
                        <div className="text-gray-400 text-sm">Start your fitness journey</div>
                      </div>
                    </label>
                    <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.role === 'TRAINER' 
                        ? 'border-yellow-400 bg-yellow-400/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="TRAINER"
                        checked={formData.role === 'TRAINER'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                        <div className="text-white font-medium">Trainer</div>
                        <div className="text-gray-400 text-sm">Help others achieve goals</div>
                      </div>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="text-sm text-red-500 mt-1">{errors.role}</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={handleNextStep}
                  icon={ArrowRight}
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Input
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  icon={Calendar}
                  error={errors.dateOfBirth}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  icon={Lock}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                />

                {/* Password strength meter */}
                <div className="mt-1" aria-live="polite">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Password strength</span>
                    {strength && (
                      <span className="text-xs font-medium" style={{ color: strength.color }}>
                        {strength.level}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 h-2 bg-gray-800 rounded overflow-hidden">
                    <div
                      className="h-2 rounded transition-all duration-300"
                      style={{
                        width: `${strength?.percentage || 0}%`,
                        backgroundColor: strength?.color || '#ef4444'
                      }}
                    />
                  </div>
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  icon={Lock}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />

                {/* Trainer-specific fields */}
                {formData.role === 'TRAINER' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Specialties <span className="text-yellow-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {trainerSpecialties.map(specialty => (
                          <label key={specialty} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.specialties.includes(specialty)}
                              onChange={() => handleSpecialtyToggle(specialty)}
                              className="rounded border-gray-600 text-yellow-400 focus:ring-yellow-400 mr-2"
                            />
                            <span className="text-gray-300 text-sm">{specialty}</span>
                          </label>
                        ))}
                      </div>
                      {errors.specialties && (
                        <p className="text-sm text-red-500 mt-1">{errors.specialties}</p>
                      )}
                    </div>

                    <Input
                      label="Years of Experience"
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g., 3"
                      error={errors.experience}
                      min={0}
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Bio (Optional)
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                        placeholder="Tell us about yourself and your training philosophy..."
                      />
                    </div>
                  </>
                )}

                {/* Terms and Conditions */}
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-yellow-400 bg-gray-900 border-gray-700 rounded focus:ring-yellow-400 focus:ring-2 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-400">
                      I agree to the{' '}
                      <Link to="/terms" className="text-yellow-400 hover:text-yellow-300">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-yellow-400 hover:text-yellow-300">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-500 ml-6">{errors.agreeToTerms}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    fullWidth
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    icon={ArrowRight}
                  >
                    Create Account
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <p className="mt-4 text-center text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;