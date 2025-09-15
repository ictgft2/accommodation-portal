import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Clear errors when component mounts or form data changes
  React.useEffect(() => {
    if (error) {
      clearError();
    }
    setFormErrors({});
  }, [formData, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (result.success) {
        // Get intended destination or default to dashboard based on user role
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        // Handle API validation errors
        if (result.errors) {
          setFormErrors(result.errors);
        }
        // General error is handled by the auth context
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
    console.log('Navigate to sign up');
  };

  const handleForgotPassword = () => {
    // This would navigate to forgot password page
    console.log('Navigate to forgot password');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form Section */}
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'serif' }}>
              Login
            </h1>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Address */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3 text-left">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your registered email address"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-offset-2 ${
                  formErrors.email 
                    ? 'bg-red-50 border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'bg-red-50 border-red-600 focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200'
                }`}
                required
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3 text-left">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-offset-2 ${
                    formErrors.password 
                      ? 'bg-red-50 border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'bg-red-50 border-red-600 focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                disabled={isSubmitting}
              >
                Forgot password
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`w-full py-4 px-4 rounded-lg font-semibold text-white text-lg transition-colors duration-200 ${
                isSubmitting || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="w-full h-full relative"
          style={{
            backgroundImage: `url('assets/images/login-sidebar.png')`,
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'repeat'
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
            {/* Logo Placeholder */}
            <div className="mb-6 w-20 h-20 flex items-center justify-center">
             <img 
                src="assets/images/ft-logo.png" 
                alt="Logo" 
                className="w-20 h-24 object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold text-center font-serif">
              Hello, Friend!
            </h1>
            
            <p className="text-md mb-1 text-center max-w-md">
              Don't have an account?
              <br />
              Sign up now to get started!
            </p>

            <button
              onClick={handleSignUpRedirect}
              className="bg-white text-red-600 px-10 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sign Up Link */}
      <div className="md:hidden fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-600 mb-4">Don't have an account?</p>
        <button
          onClick={handleSignUpRedirect}
          className="text-red-600 hover:text-red-700 font-semibold"
        >
          Sign up here
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
