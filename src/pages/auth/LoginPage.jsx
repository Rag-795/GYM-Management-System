import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Dumbbell } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button }  from '../../components/Button';
import { Alert } from '../../components/Alert';
import api from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await api.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
      
      // Role-based routing
      setTimeout(() => {
        const userRole = response.user.role;
        switch (userRole) {
          case 'ADMIN':
            navigate('/admin/members');
            break;
          case 'TRAINER':
            navigate('/trainer/dashboard');
            break;
          case 'MEMBER':
          default:
            navigate('/member/dashboard');
            break;
        }
      }, 1500);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.message || 'Invalid email or password' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Section - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center space-x-2">
              <Dumbbell className="h-10 w-10 text-yellow-400" />
              <span className="text-3xl font-black text-yellow-400">FitHub</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Welcome Back!
            </h2>
            <p className="mt-2 text-gray-400">
              Log in to access your fitness journey
            </p>
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
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={Mail}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-400 bg-gray-900 border-gray-700 rounded focus:ring-yellow-400 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/auth/signup"
              className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Image/Graphics */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-50"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920)'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-6">
              Start Your Fitness Journey Today
            </h1>
            <p className="text-xl text-white/90">
              Join thousands of members achieving their fitness goals with FitHub
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-bold text-white">10K+</p>
                <p className="text-white/80">Active Members</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">500+</p>
                <p className="text-white/80">Classes/Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;