import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuthContext } from '../../contexts/authContext';
import userService from '../../services/userService';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  RefreshCw,
  Camera,
  Building,
  Clock,
  Users,
  Home,
  CheckCircle,
  Settings
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    full_name: '',
    phone_number: '',
    role: '',
    service_unit: '',
    service_unit_name: '',
    avatar: null,
    avatar_url: null,
    date_joined: '',
    last_login: '',
    created_at: '',
    updated_at: '',
    current_allocation: null,
    allocation_count: 0,
    is_service_unit_admin: false
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getProfile();
      
      if (response.success) {
        setProfileData({
          ...response.data,
          phone_number: response.data.phone_number || '',
        });
      } else {
        setError(response.message || 'Failed to fetch profile data');
      }
    } catch (err) {
      setError('An error occurred while fetching profile data');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setErrors({});
    setError(null);
    setSuccessMessage('');
    
    try {
      // Prepare data for update
      const updateData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
      };

      const response = await userService.updateProfile(updateData);
      
      if (response.success) {
        setProfileData(prev => ({
          ...prev,
          ...response.data
        }));
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setError(response.message || 'Failed to update profile');
        }
      }
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    setSaving(true);
    setErrors({});
    setError(null);
    setSuccessMessage('');
    
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        setErrors({ confirm_password: 'Passwords do not match' });
        setSaving(false);
        return;
      }

      const response = await userService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.confirm_password
      });
      
      if (response.success) {
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        setShowPasswordForm(false);
        setSuccessMessage('Password changed successfully!');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setError(response.message || 'Failed to change password');
        }
      }
    } catch (err) {
      setError('An error occurred while changing password');
      console.error('Error changing password:', err);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await userService.uploadAvatar(avatarFile);
      
      if (response.success) {
        setProfileData(prev => ({
          ...prev,
          ...response.data
        }));
        setAvatarFile(null);
        setAvatarPreview(null);
        setSuccessMessage('Avatar updated successfully!');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to upload avatar');
      }
    } catch (err) {
      setError('An error occurred while uploading avatar');
      console.error('Error uploading avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'SuperAdmin': 'Super Administrator',
      'ServiceUnitAdmin': 'Service Unit Administrator',
      'Pastor': 'Pastor',
      'Member': 'Member'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      'SuperAdmin': 'bg-purple-100 text-purple-800',
      'ServiceUnitAdmin': 'bg-blue-100 text-blue-800',
      'Pastor': 'bg-green-100 text-green-800',
      'Member': 'bg-gray-100 text-gray-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (isActive, allocationType) => {
    if (isActive) {
      const colorMap = {
        'ServiceUnit': 'bg-blue-100 text-blue-800',
        'Pastor': 'bg-green-100 text-green-800',
        'Member': 'bg-purple-100 text-purple-800'
      };
      return colorMap[allocationType] || 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-gray-600">Loading profile...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-red-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                  <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
                </div>
              </div>
              
              {!isEditing && !showPasswordForm && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <Settings className="w-4 h-4 inline-block mr-2" />
                    Change Password
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    <Edit className="w-4 h-4 inline-block mr-2" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-100">
                        <User className="w-16 h-16 text-red-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Avatar Upload Button */}
                  <label className="absolute bottom-0 right-0 bg-red-600 rounded-full p-2 cursor-pointer hover:bg-red-700 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Upload Avatar Button */}
                {avatarFile && (
                  <div className="mt-4">
                    <button
                      onClick={uploadAvatar}
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Uploading...' : 'Upload Avatar'}
                    </button>
                  </div>
                )}

                {/* User Basic Info */}
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-gray-900">{profileData.full_name || 'No Name'}</h2>
                  <p className="text-gray-600">@{profileData.username}</p>
                  
                  {/* Role Badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profileData.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleDisplayName(profileData.role)}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{profileData.allocation_count}</div>
                    <div className="text-xs text-gray-500">Total Allocations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatDateOnly(profileData.date_joined).split(',')[1]?.trim() || new Date().getFullYear()}
                    </div>
                    <div className="text-xs text-gray-500">Member Since</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                            errors.first_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                            errors.last_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.phone_number ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter phone number (e.g., +1234567890)"
                      />
                      {errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 inline-block mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          fetchProfileData(); // Reset data
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4 inline-block mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Full Name</div>
                          <div className="font-medium text-gray-900">{profileData.full_name || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium text-gray-900">{profileData.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-medium text-gray-900">{profileData.phone_number || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Service Unit</div>
                          <div className="font-medium text-gray-900">{profileData.service_unit_name || 'Not assigned'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Allocation */}
            {profileData.current_allocation && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Current Allocation</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Room</div>
                        <div className="font-medium text-gray-900">
                          Room {profileData.current_allocation.room_number}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Building</div>
                        <div className="font-medium text-gray-900">
                          {profileData.current_allocation.building_name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Allocation Date</div>
                        <div className="font-medium text-gray-900">
                          {formatDateOnly(profileData.current_allocation.allocation_date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(profileData.current_allocation.is_active, profileData.current_allocation.allocation_type)}`}>
                          {profileData.current_allocation.is_active ? 'Active' : 'Inactive'} - {profileData.current_allocation.allocation_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Joined</div>
                      <div className="font-medium text-gray-900">{formatDate(profileData.date_joined)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Last Login</div>
                      <div className="font-medium text-gray-900">
                        {profileData.last_login ? formatDate(profileData.last_login) : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.old_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.old_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.old_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.new_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={savePassword}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 inline-block mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        old_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                      setErrors({});
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 inline-block mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;
