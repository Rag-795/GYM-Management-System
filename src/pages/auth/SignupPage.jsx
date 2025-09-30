import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Dumbbell, Github, Calendar } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { SocialButton } from '../../components/SocialButton';
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
    agreeToTerms: false,
    marketingEmails: false
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);


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
    const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e']; // red, orange, yellow, lime, green

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
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
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
      const response = await api.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
        marketingEmails: formData.marketingEmails
      });

      setAlert({ 
        type: 'success', 
        message: 'Account created successfully! Please check your email to verify your account.' 
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

  const handleSocialSignup = async (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/${provider}`;
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
              Get access to exclusive features and start your transformation
            </p>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
                <p className="text-white/90">Personalized workout plans tailored to your goals</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
                <p className="text-white/90">Track your progress with advanced analytics</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
                <p className="text-white/90">Connect with trainers and fellow fitness enthusiasts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center space-x-2">
              <Dumbbell className="h-10 w-10 text-yellow-400" />
              <span className="text-3xl font-black text-yellow-400">FitHub</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Create Your Account
            </h2>
            <p className="mt-2 text-gray-400">
              {step === 1 ? 'Enter your personal information' : 'Set up your password'}
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
                  placeholder="+1 (555) 123-4567"
                  icon={Phone}
                  error={errors.phone}
                  required
                  autoComplete="tel"
                />

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

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="marketingEmails"
                      checked={formData.marketingEmails}
                      onChange={handleChange}
                      className="h-4 w-4 text-yellow-400 bg-gray-900 border-gray-700 rounded focus:ring-yellow-400 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-400">
                      Send me tips, trends, and promos (optional)
                    </span>
                  </label>
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

          {step === 1 && (
            <>
              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black text-gray-400">Or sign up with</span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="space-y-3">
                <SocialButton
                  provider="Google"
                  icon={() => (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                      <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                      <path fill="#FBBC05" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                      <path fill="#4285F4" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                    </svg>
                  )}
                  onClick={() => handleSocialSignup('google')}
                />
                <SocialButton
                  provider="GitHub"
                  icon={Github}
                  onClick={() => handleSocialSignup('github')}
                />
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="mt-8 text-center text-gray-400">
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