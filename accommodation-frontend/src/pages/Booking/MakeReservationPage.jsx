import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MakeReservationPage = () => {
  const navigate = useNavigate();
  const currentStep = 'booking';
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('reservation.bookingInfo')) || null; } catch { return null; }
  })();
  const [formData, setFormData] = useState(stored || {
    // Personal Info
    firstName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    countryCode: '+234',
    townCity: '',
    country: '',
    adults: '',
    children: '',
    checkIn: '',
    checkOut: '',
    
    // Next of Kin
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinCountryCode: '+234',
    nextOfKinTownCity: '',
    nextOfKinCountry: '',
    remark: ''
  });

  const [touched, setTouched] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const formRef = useRef(null);

  const requiredFields = [
    'firstName', 'lastName', 'gender', 'phoneNumber',
    'townCity', 'country', 'adults', 'checkIn', 'checkOut',
    'nextOfKinName', 'nextOfKinPhone', 'nextOfKinTownCity', 'nextOfKinCountry'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const fieldError = (name) => {
    if (!requiredFields.includes(name)) return '';
    if (!formData[name] || formData[name].trim() === '') return 'Required';
    if (name === 'checkOut' && formData.checkIn && formData.checkOut && formData.checkOut < formData.checkIn) return 'Must be after check in';
    return '';
  };

 const handleNext = () => {
  setAttemptedSubmit(true);
  if (isFormValid()) {
    // persist
    localStorage.setItem('reservation.bookingInfo', JSON.stringify(formData));
    navigate('/reservations/choose-room');
  } else {
    // scroll to first error
    setTimeout(() => {
      const firstError = formRef.current?.querySelector('[data-error="true"]');
      firstError && firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }
};

  const handlePrevious = () => {
  // Only navigate back if not on booking-info step
  if (currentStep !== 'booking') {
    navigate(-1); // Go back to previous page
  }
};

  const steps = [
  { id: 'booking', name: 'Booking Info', active: true, completed: false },
  { id: 'room', name: 'Choose Room', active: false, completed: false },
  { id: 'confirmation', name: 'Confirmation', active: false, completed: false },
  { id: 'payment', name: 'Payment', active: false, completed: false }
];

const isFormValid = () => requiredFields.every(f => fieldError(f) === '');

  // auto-persist on change (debounced minimal via effect)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try { localStorage.setItem('reservation.bookingInfo', JSON.stringify(formData)); } catch {}
    }, 300);
    return () => clearTimeout(timeout);
  }, [formData]);

  return (
    <div className="min-h-screen">
      {/* Header with Background */}
      <div 
  className="relative h-48 bg-cover bg-center"
  style={{
    backgroundImage: `url('/assets/images/comp.png')`
  }}
>
  <div className="absolute inset-0 bg-black/60"></div>
  <div className="relative z-10 flex items-center justify-between h-full px-8">
    {/* Logo */}
    <div className="flex items-center space-x-4">
      <button 
        onClick={handlePrevious}
        className="text-white hover:text-gray-300 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
    </div>
    
    {/* Title */}
    <h1 className="text-3xl lg:text-4xl font-bold text-white font-serif">
      Make Reservation
    </h1>
    
    {/* Logo */}
    <div>
      <img 
        src="/assets/images/ft-logo.png" 
        alt="Winners Portal Logo" 
        className="w-12 h-12 object-contain"
      />
    </div>
  </div>
</div>

      {/* Progress Steps */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center space-x-8 py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`text-lg font-medium ${
                  step.active ? 'text-red-600 border-b-2 border-red-600 pb-2' : 'text-gray-400'
                }`}>
                  {step.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8" ref={formRef}>
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="First name"
                aria-invalid={!!fieldError('firstName')}
                data-error={!!fieldError('firstName') && (touched.firstName || attemptedSubmit)}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('firstName') && (touched.firstName || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`}
              />
              {fieldError('firstName') && (touched.firstName || attemptedSubmit) && (
                <p className="mt-1 text-xs text-red-600">{fieldError('firstName')}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last name
              </label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={handleBlur} placeholder="Last name" aria-invalid={!!fieldError('lastName')} data-error={!!fieldError('lastName') && (touched.lastName || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('lastName') && (touched.lastName || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
              {fieldError('lastName') && (touched.lastName || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('lastName')}</p>)}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <select name="gender" value={formData.gender} onChange={handleInputChange} onBlur={handleBlur} aria-invalid={!!fieldError('gender')} data-error={!!fieldError('gender') && (touched.gender || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('gender') && (touched.gender || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`}>
                  <option value="">Male or Female</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {fieldError('gender') && (touched.gender || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('gender')}</p>)}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  placeholder="+234"
                  className="w-20 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} onBlur={handleBlur} placeholder="(239) 555-0108" aria-invalid={!!fieldError('phoneNumber')} data-error={!!fieldError('phoneNumber') && (touched.phoneNumber || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('phoneNumber') && (touched.phoneNumber || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
              </div>
              {fieldError('phoneNumber') && (touched.phoneNumber || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('phoneNumber')}</p>)}
            </div>

            {/* Town/City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Town/City
              </label>
              <input type="text" name="townCity" value={formData.townCity} onChange={handleInputChange} onBlur={handleBlur} placeholder="Town" aria-invalid={!!fieldError('townCity')} data-error={!!fieldError('townCity') && (touched.townCity || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('townCity') && (touched.townCity || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
              {fieldError('townCity') && (touched.townCity || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('townCity')}</p>)}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input type="text" name="country" value={formData.country} onChange={handleInputChange} onBlur={handleBlur} placeholder="Country" aria-invalid={!!fieldError('country')} data-error={!!fieldError('country') && (touched.country || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('country') && (touched.country || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
              {fieldError('country') && (touched.country || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('country')}</p>)}
            </div>

            {/* Adults */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adults
              </label>
              <div className="relative">
                <select name="adults" value={formData.adults} onChange={handleInputChange} onBlur={handleBlur} aria-invalid={!!fieldError('adults')} data-error={!!fieldError('adults') && (touched.adults || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('adults') && (touched.adults || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`}>
                  <option value="">Select</option>
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {fieldError('adults') && (touched.adults || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('adults')}</p>)}
            </div>

            {/* Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Children
              </label>
              <div className="relative">
                <select name="children" value={formData.children} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-200 focus:border-red-500 bg-red-50 border-red-300">
                  <option value="">Select</option>
                  <option value="0">0 Children</option>
                  <option value="1">1 Child</option>
                  <option value="2">2 Children</option>
                  <option value="3">3 Children</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 pointer-events-none" />
              </div>
            </div>

            {/* Check In */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check in
              </label>
              <div className="relative">
                <input type="date" name="checkIn" value={formData.checkIn} onChange={handleInputChange} onBlur={handleBlur} aria-invalid={!!fieldError('checkIn')} data-error={!!fieldError('checkIn') && (touched.checkIn || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('checkIn') && (touched.checkIn || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 pointer-events-none" />
              </div>
              {fieldError('checkIn') && (touched.checkIn || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('checkIn')}</p>)}
            </div>

            {/* Check Out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check out
              </label>
              <div className="relative">
                <input type="date" name="checkOut" value={formData.checkOut} min={formData.checkIn || undefined} onChange={handleInputChange} onBlur={handleBlur} aria-invalid={!!fieldError('checkOut')} data-error={!!fieldError('checkOut') && (touched.checkOut || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('checkOut') && (touched.checkOut || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 pointer-events-none" />
              </div>
              {fieldError('checkOut') && (touched.checkOut || attemptedSubmit) && (<p className="mt-1 text-xs text-red-600">{fieldError('checkOut')}</p>)}
            </div>
          </div>

          {/* Next of Kin Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-6">Next of Kin information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Next of Kin Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  name="nextOfKinName"
                  value={formData.nextOfKinName}
                  onChange={handleInputChange}
                  placeholder="Next of Kin (full name)"
                  className="w-full px-4 py-3 border bg-red-50 border-red-600 rounded-lg outline-none transition-colors focus:border-red-500 focus:bg-red-100 hover:border-red-400 focus:ring-red-200"
                />
              </div>

              {/* Next of Kin Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="nextOfKinCountryCode"
                    value={formData.nextOfKinCountryCode}
                    onChange={handleInputChange}
                    placeholder="+234"
                    className="w-20 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <input type="tel" name="nextOfKinPhone" value={formData.nextOfKinPhone} onChange={handleInputChange} onBlur={handleBlur} placeholder="(801) 122-3344" aria-invalid={!!fieldError('nextOfKinPhone')} data-error={!!fieldError('nextOfKinPhone') && (touched.nextOfKinPhone || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('nextOfKinPhone') && (touched.nextOfKinPhone || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
                </div>
              </div>

              {/* Next of Kin Town/City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Town/City
                </label>
                <input type="text" name="nextOfKinTownCity" value={formData.nextOfKinTownCity} onChange={handleInputChange} onBlur={handleBlur} placeholder="Town" aria-invalid={!!fieldError('nextOfKinTownCity')} data-error={!!fieldError('nextOfKinTownCity') && (touched.nextOfKinTownCity || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('nextOfKinTownCity') && (touched.nextOfKinTownCity || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
              </div>

              {/* Next of Kin Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input type="text" name="nextOfKinCountry" value={formData.nextOfKinCountry} onChange={handleInputChange} onBlur={handleBlur} placeholder="Country" aria-invalid={!!fieldError('nextOfKinCountry')} data-error={!!fieldError('nextOfKinCountry') && (touched.nextOfKinCountry || attemptedSubmit)} className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 ${fieldError('nextOfKinCountry') && (touched.nextOfKinCountry || attemptedSubmit) ? 'border-red-600' : 'border-red-300'}`} />
              </div>
            </div>

            {/* Remark */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark
              </label>
              <textarea name="remark" value={formData.remark} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 border-red-300 resize-none" placeholder="Additional information or special requests..." />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button onClick={handlePrevious} disabled={currentStep === 'booking'} className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors border ${currentStep === 'booking' ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}>            
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>
            <button onClick={handleNext} disabled={!isFormValid()} className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-colors ${isFormValid() ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-300 text-white cursor-not-allowed'}`}>
              <span>{isFormValid() ? 'Next' : 'Fill Required Fields'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeReservationPage;
