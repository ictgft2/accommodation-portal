import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    gender: 'female',
    countryCode: '+234',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    remark: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Clear errors when form data changes
  React.useEffect(() => {
    if (error) {
      clearError();
    }
    setFormErrors({});
  }, [formData, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender: gender
    }));
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
      const registrationData = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: `${formData.countryCode}${formData.phoneNumber.trim()}`,
        gender: formData.gender,
        user_id: formData.userId.trim(),
        remark: formData.remark.trim()
      };
      
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
    console.log('Navigate to login');
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
              Login your personal information.
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
      <div className="w-full lg:w-1/2 flex items-start justify-start px-8 pt-8">
        <div className="w-full ">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          </div>

          <div className="space-y-6">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                User ID
              </label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                placeholder="User ID"
                className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                required
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-left">
                Gender
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={() => handleGenderChange('male')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.gender === 'male' 
                      ? 'border-red-500 bg-red-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.gender === 'male' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">Male</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={() => handleGenderChange('female')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.gender === 'female' 
                      ? 'border-red-500 bg-red-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.gender === 'female' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-700">Female</span>
                </label>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Phone Number (WhatsApp)
              </label>
              <div className="flex gap-2">
                <div className="relative">
                    <input
                  type="text"
                  value={formData.countryCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                  placeholder="+234"
                  className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                />
                
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="(801) 122-3344"
                  className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your registered email address"
                className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Confirm Password*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
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
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Remark
              </label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                placeholder="Optional remarks..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

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
