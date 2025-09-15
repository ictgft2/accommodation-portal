import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronDown, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const readJSON = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

const ROOMS_KEY = 'reservation.selectedRoomId';
const BOOKING_KEY = 'reservation.bookingInfo';

const defaultData = {
  userId: '',
  roomCode: '',
  firstName: '', lastName: '', gender: '', email: '',
  phoneNumber: '', countryCode: '+234', townCity: '', country: '', adults: '', children: '', checkIn: '', checkOut: '',
  nextOfKinName: '', nextOfKinPhone: '', nextOfKinCountryCode: '+234', nextOfKinTownCity: '', nextOfKinCountry: '', remark: ''
};

const required = ['firstName','lastName','gender','phoneNumber','townCity','country','adults','checkIn','checkOut','nextOfKinName','nextOfKinPhone','nextOfKinTownCity','nextOfKinCountry'];

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const storedBooking = readJSON(BOOKING_KEY, {});
  const storedRoomId = (() => { try { return localStorage.getItem(ROOMS_KEY) || ''; } catch { return ''; }})();
  const [data, setData] = useState({ ...defaultData, ...storedBooking, roomCode: storedRoomId });
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef(null);

  const steps = [
    { id: 'booking', name: 'Booking Info', active: false, completed: true },
    { id: 'room', name: 'Choose Room', active: false, completed: true },
    { id: 'confirmation', name: 'Confirmation', active: true, completed: false },
    { id: 'payment', name: 'Payment', active: false, completed: false }
  ];

  const onChange = e => {
    const { name, value } = e.target;
    setData(d => ({ ...d, [name]: value }));
  };
  const onBlur = e => setTouched(t => ({ ...t, [e.target.name]: true }));

  const fieldError = (n) => {
    if (!required.includes(n)) return '';
    if (!data[n] || String(data[n]).trim() === '') return 'Required';
    if (n === 'checkOut' && data.checkIn && data.checkOut && data.checkOut < data.checkIn) return 'Must be after check in';
    return '';
  };
  const isValid = () => required.every(r => fieldError(r) === '');

  // auto-persist
  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem(BOOKING_KEY, JSON.stringify(data)); } catch {} }, 250);
    return () => clearTimeout(t);
  }, [data]);

  const goPrevious = () => navigate('/reservations/choose-room');
  const goNext = () => {
    setAttempted(true);
    if (isValid()) {
      try { localStorage.setItem('reservation.confirmed','1'); } catch {}
      navigate('/reservations/payment');
    } else {
      setTimeout(() => {
        const firstErr = formRef.current?.querySelector('[data-error="true"]');
        firstErr && firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  };

  const inputCls = (name) => `w-full px-4 py-3 border rounded-lg outline-none transition-colors bg-red-50 focus:ring-2 focus:ring-red-300 ${fieldError(name) && (touched[name] || attempted) ? 'border-red-600' : 'border-red-300 focus:border-red-500'}`;

  return (
    <div className="min-h-screen">
      <header className="relative h-48 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/comp.png')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-between h-full px-8">
          <button onClick={goPrevious} className="text-white hover:text-gray-300 transition-colors" aria-label="Previous step">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-white font-serif">Make Reservation</h1>
          <img src="/assets/images/ft-logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
      </header>

      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center space-x-8 py-4">
            {steps.map(step => (
              <div key={step.id} className={`text-lg font-medium ${step.active ? 'text-red-600 border-b-2 border-red-600 pb-2' : step.completed ? 'text-green-600' : 'text-gray-400'}`}>{step.name}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8" ref={formRef}>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input name="userId" value={data.userId} onChange={onChange} onBlur={onBlur} placeholder="User ID" className={inputCls('userId')} />
            </div>
            {/* Room Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
              <input name="roomCode" value={data.roomCode} onChange={onChange} onBlur={onBlur} placeholder="Room Code" className={inputCls('roomCode')} />
            </div>
            {/* First/Last */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
              <input name="firstName" value={data.firstName} onChange={onChange} onBlur={onBlur} placeholder="First name" data-error={!!fieldError('firstName') && (touched.firstName || attempted)} aria-invalid={!!fieldError('firstName')} className={inputCls('firstName')} />
              {fieldError('firstName') && (touched.firstName || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('firstName')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
              <input name="lastName" value={data.lastName} onChange={onChange} onBlur={onBlur} placeholder="Last name" data-error={!!fieldError('lastName') && (touched.lastName || attempted)} aria-invalid={!!fieldError('lastName')} className={inputCls('lastName')} />
              {fieldError('lastName') && (touched.lastName || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('lastName')}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input name="email" type="email" value={data.email} onChange={onChange} onBlur={onBlur} placeholder="Your registered email address" className={inputCls('email')} />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex gap-2">
                <input name="countryCode" value={data.countryCode} onChange={onChange} onBlur={onBlur} placeholder="+234" className="w-20 px-3 py-3 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-500 border-gray-300" />
                <input name="phoneNumber" value={data.phoneNumber} onChange={onChange} onBlur={onBlur} placeholder="(239) 555-0108" data-error={!!fieldError('phoneNumber') && (touched.phoneNumber || attempted)} aria-invalid={!!fieldError('phoneNumber')} className={inputCls('phoneNumber')} />
              </div>
              {fieldError('phoneNumber') && (touched.phoneNumber || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('phoneNumber')}</p>}
            </div>
            {/* Town / Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Town/City</label>
              <input name="townCity" value={data.townCity} onChange={onChange} onBlur={onBlur} placeholder="Town / City" data-error={!!fieldError('townCity') && (touched.townCity || attempted)} aria-invalid={!!fieldError('townCity')} className={inputCls('townCity')} />
              {fieldError('townCity') && (touched.townCity || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('townCity')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input name="country" value={data.country} onChange={onChange} onBlur={onBlur} placeholder="Country" data-error={!!fieldError('country') && (touched.country || attempted)} aria-invalid={!!fieldError('country')} className={inputCls('country')} />
              {fieldError('country') && (touched.country || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('country')}</p>}
            </div>
            {/* Adults / Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
              <div className="relative">
                <select name="adults" value={data.adults} onChange={onChange} onBlur={onBlur} data-error={!!fieldError('adults') && (touched.adults || attempted)} aria-invalid={!!fieldError('adults')} className={inputCls('adults')}>
                  <option value="">Select</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {fieldError('adults') && (touched.adults || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('adults')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
              <div className="relative">
                <select name="children" value={data.children} onChange={onChange} onBlur={onBlur} className={inputCls('children')}>
                  <option value="">Select</option>
                  {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check in</label>
              <div className="relative">
                <input type="date" name="checkIn" value={data.checkIn} onChange={onChange} onBlur={onBlur} data-error={!!fieldError('checkIn') && (touched.checkIn || attempted)} aria-invalid={!!fieldError('checkIn')} className={inputCls('checkIn')} />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600 pointer-events-none" />
              </div>
              {fieldError('checkIn') && (touched.checkIn || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('checkIn')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check out</label>
              <div className="relative">
                <input type="date" name="checkOut" min={data.checkIn || undefined} value={data.checkOut} onChange={onChange} onBlur={onBlur} data-error={!!fieldError('checkOut') && (touched.checkOut || attempted)} aria-invalid={!!fieldError('checkOut')} className={inputCls('checkOut')} />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600 pointer-events-none" />
              </div>
              {fieldError('checkOut') && (touched.checkOut || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('checkOut')}</p>}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-6 flex items-center gap-2"><span>Next of Kin information</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input name="nextOfKinName" value={data.nextOfKinName} onChange={onChange} onBlur={onBlur} placeholder="Next of Kin (full name)" data-error={!!fieldError('nextOfKinName') && (touched.nextOfKinName || attempted)} aria-invalid={!!fieldError('nextOfKinName')} className={inputCls('nextOfKinName')} />
                {fieldError('nextOfKinName') && (touched.nextOfKinName || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('nextOfKinName')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <input name="nextOfKinCountryCode" value={data.nextOfKinCountryCode} onChange={onChange} onBlur={onBlur} placeholder="+234" className="w-20 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-500" />
                  <input name="nextOfKinPhone" value={data.nextOfKinPhone} onChange={onChange} onBlur={onBlur} placeholder="(801) 122-3344" data-error={!!fieldError('nextOfKinPhone') && (touched.nextOfKinPhone || attempted)} aria-invalid={!!fieldError('nextOfKinPhone')} className={inputCls('nextOfKinPhone')} />
                </div>
                {fieldError('nextOfKinPhone') && (touched.nextOfKinPhone || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('nextOfKinPhone')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Town/City</label>
                <input name="nextOfKinTownCity" value={data.nextOfKinTownCity} onChange={onChange} onBlur={onBlur} placeholder="Town" data-error={!!fieldError('nextOfKinTownCity') && (touched.nextOfKinTownCity || attempted)} aria-invalid={!!fieldError('nextOfKinTownCity')} className={inputCls('nextOfKinTownCity')} />
                {fieldError('nextOfKinTownCity') && (touched.nextOfKinTownCity || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('nextOfKinTownCity')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input name="nextOfKinCountry" value={data.nextOfKinCountry} onChange={onChange} onBlur={onBlur} placeholder="Country" data-error={!!fieldError('nextOfKinCountry') && (touched.nextOfKinCountry || attempted)} aria-invalid={!!fieldError('nextOfKinCountry')} className={inputCls('nextOfKinCountry')} />
                {fieldError('nextOfKinCountry') && (touched.nextOfKinCountry || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('nextOfKinCountry')}</p>}
              </div>
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
              <textarea name="remark" value={data.remark} onChange={onChange} rows={4} placeholder="Additional information or special requests..." className="w-full px-4 py-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-red-50 border-red-300 resize-none" />
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button onClick={goPrevious} className="flex items-center space-x-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>
            <button onClick={goNext} disabled={!isValid()} className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-colors ${isValid() ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-300 text-white cursor-not-allowed'}`}>
              <span>{isValid() ? 'Next' : 'Fix Errors'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
