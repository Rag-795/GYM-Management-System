import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Dumbbell } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Email is invalid';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateEmail();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      await api.forgotPassword(email);
      setEmailSent(true);
      setAlert({ 
        type: 'success', 
        message: 'Password reset instructions have been sent to your email.' 
      });
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.message || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setAlert(null);

    try {
      await api.forgotPassword(email);
      setAlert({ 
        type: 'success', 
        message: 'Reset email has been resent successfully.' 
      });
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: 'Failed to resend email. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920')] bg-cover bg-center opacity-5"></div>
      
      <div className="relative max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center space-x-2">
            <Dumbbell className="h-10 w-10 text-yellow-400" />
            <span className="text-3xl font-black text-yellow-400">FitHub</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/20">
          {!emailSent ? (
            <>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-400 text-center mb-8">
                No worries! Enter your email and we'll send you reset instructions.
              </p>

              {/* Alert */}
              {alert && (
                <Alert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                />
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your registered email"
                  icon={Mail}
                  error={error}
                  required
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  icon={Send}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-400 mb-8">
                  We've sent password reset instructions to<br />
                  <span className="text-yellow-400 font-semibold">{email}</span>
                </p>

                {/* Alert */}
                {alert && (
                  <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                  />
                )}

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={() => navigate('/auth/login')}
                  >
                    Back to Login
                  </Button>

                  <p className="text-gray-400 text-sm">
                    Didn't receive the email?{' '}
                    <button
                      onClick={handleResendEmail}
                      disabled={loading}
                      className="text-yellow-400 hover:text-yellow-300 font-semibold disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Back to login link */}
          {!emailSent && (
            <div className="mt-8 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          )}
        </div>

        {/* Help text */}
        <p className="mt-8 text-center text-gray-500 text-sm">
          Need help?{' '}
          <a href="mailto:support@fithub.com" className="text-yellow-400 hover:text-yellow-300">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;