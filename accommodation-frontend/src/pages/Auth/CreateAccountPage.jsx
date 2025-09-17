import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    service_unit: '',
    password: '',
    password_confirm: ''
  });

  const [serviceUnits, setServiceUnits] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Fetch service units on component mount
  useEffect(() => {
    const fetchServiceUnits = async () => {
      try {
        const response = await fetch('/api/service-units/');
        if (response.ok) {
          const data = await response.json();
          setServiceUnits(data.results || data);
        } else {
          // Since registration doesn't have auth, use the fallback data
          setServiceUnits([
            { id: 1, name: 'Choir' },
            { id: 2, name: 'Ushers' },
            { id: 3, name: 'Protocol' },
            { id: 4, name: 'Media' },
            { id: 5, name: 'ICT' },
            { id: 6, name: 'C.C.U' },
            { id: 7, name: "Deacon's Board" },
            { id: 8, name: 'Social Media' },
            { id: 9, name: 'Utility' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching service units:', err);
        // Use fallback service units since API might require authentication
        setServiceUnits([
          { id: 1, name: 'Choir' },
          { id: 2, name: 'Ushers' },
          { id: 3, name: 'Protocol' },
          { id: 4, name: 'Media' },
          { id: 5, name: 'ICT' },
          { id: 6, name: 'C.C.U' },
          { id: 7, name: "Deacon's Board" },
          { id: 8, name: 'Social Media' },
          { id: 9, name: 'Utility' }
        ]);
      }
    };

    fetchServiceUnits();
  }, []);

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormErrors({});
  }, [formData, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password_confirm.trim()) {
      errors.password_confirm = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
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
      // Prepare data for registration - only include fields that exist in the User model
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        role: 'Member', // Always set to Member for self-registration
        password: formData.password,
        password_confirm: formData.password_confirm
      };

      // Only include service_unit if one is selected
      if (formData.service_unit) {
        registrationData.service_unit = parseInt(formData.service_unit);
      }
      
      const result = await register(registrationData);
      
      if (result.success) {
        setRegistrationSuccess(true);
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/auth/login', { 
            state: { 
              message: 'Account created successfully! Please log in with your credentials.' 
            }
          });
        }, 2000);
      } else {
        // Handle API validation errors
        if (result.errors) {
          setFormErrors(result.errors);
        }
        // General error is handled by the auth context
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="w-full h-full relative"
          style={{
            backgroundImage: `url('assets/images/login-sidebar.png')`,
            backgroundPosition: 'left center',
            backgroundSize: 'contain',
            backgroundRepeat: 'repeat'
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-start text-white p-8 pt-40">
            {/* Logo */}
            <div className="mb-4">
              <img 
                src="assets/images/ft-logo.png" 
                alt="Logo" 
                className="w-20 h-24 object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold text-center font-serif mb-4">
              Welcome Back!
            </h1>
            
            <p className="text-lg mb-6 text-center max-w-md opacity-90">
              Already have an account?
              <br />
              Login with your credentials.
            </p>

            <button
              onClick={handleLoginRedirect}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-200 shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-start justify-center px-8 pt-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <UserPlus className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Join the accommodation portal</p>
          </div>

          {/* Success Message */}
          {registrationSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-center font-medium">
                Registration successful! Redirecting to login...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  formErrors.username 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                }`}
                required
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  formErrors.first_name 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                }`}
                required
              />
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  formErrors.last_name 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                }`}
                required
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  formErrors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                }`}
                required
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+234XXXXXXXXXX or format like +1234567890"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  formErrors.phone_number 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                }`}
                required
              />
              {formErrors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone_number}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g., +234 for Nigeria)
              </p>
            </div>

            {/* Service Unit - Optional for regular members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Unit (Optional)
              </label>
              <select
                name="service_unit"
                value={formData.service_unit}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  formErrors.service_unit 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                }`}
              >
                <option value="">Select a service unit (optional)</option>
                {serviceUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
              {formErrors.service_unit && (
                <p className="mt-1 text-sm text-red-600">{formErrors.service_unit}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Choose a service unit you'd like to join (optional)
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors pr-12 ${
                    formErrors.password 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors pr-12 ${
                    formErrors.password_confirm 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 focus:border-red-500 focus:bg-red-50'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password_confirm && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password_confirm}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || registrationSuccess}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                isSubmitting || registrationSuccess
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Mobile Login Link */}
          <div className="md:hidden mt-8 text-center">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <button
              onClick={handleLoginRedirect}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
