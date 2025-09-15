import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Keys used by previous steps
const BOOKING_KEY = 'reservation.bookingInfo';
const ROOM_KEY = 'reservation.selectedRoomId';

// (Temporary) room price map – in real app fetch from backend
const ROOM_PRICES = {
	// example nightly rates (₦)
	'101': 10000,
	'102': 10000,
	'103': 10000,
	'201': 15000,
	'202': 15000,
	'203': 15000,
	'301': 25000,
	'302': 25000,
	'303': 25000
};

const readJSON = (k, fallback) => {
	try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

const formatCurrency = (n) => `₦${Number(n || 0).toLocaleString()}`;

const diffNights = (start, end) => {
	if (!start || !end) return 0;
	const s = new Date(start);
	const e = new Date(end);
	const ms = e.getTime() - s.getTime();
	return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
};

const PaymentPage = () => {
	const navigate = useNavigate();
	const formRef = useRef(null);

	// Prefill from previous steps
	const booking = readJSON(BOOKING_KEY, {});
	const roomCode = (() => { try { return localStorage.getItem(ROOM_KEY) || ''; } catch { return ''; } })();

	const nights = diffNights(booking.checkIn, booking.checkOut) || 5; // fallback to 5 like mockup
	const nightlyRate = ROOM_PRICES[roomCode] || 10000; // fallback rate
	const subtotal = nights * nightlyRate;
	const vat = Math.round(subtotal * 0.05); // 5%
	const total = subtotal + vat;

	const [cardData, setCardData] = useState({
		cardName: '',
		cardNumber: '',
		expiry: '',
		cvv: ''
	});
	const [touched, setTouched] = useState({});
	const [attempted, setAttempted] = useState(false);

	const onChange = (e) => {
		const { name, value } = e.target;
		setCardData(d => ({ ...d, [name]: value }));
	};
	const onBlur = (e) => setTouched(t => ({ ...t, [e.target.name]: true }));

	// Basic validations (placeholder – integrate payment SDK later)
	const validators = {
		cardName: v => v.trim() ? '' : 'Required',
		cardNumber: v => /^\d{12,19}$/.test(v.replace(/\s+/g,'')) ? '' : 'Enter 12-19 digits',
		expiry: v => /^(0[1-9]|1[0-2])\/(\d{2})$/.test(v) ? '' : 'MM/YY',
		cvv: v => /^\d{3,4}$/.test(v) ? '' : '3-4 digits'
	};
	const fieldError = (n) => validators[n](cardData[n] || '');
	const isValid = () => Object.keys(validators).every(k => fieldError(k) === '');

	const steps = [
		{ id: 'booking', name: 'Booking Info', active: false, completed: true },
		{ id: 'room', name: 'Choose Room', active: false, completed: true },
		{ id: 'confirmation', name: 'Confirmation', active: false, completed: true },
		{ id: 'payment', name: 'Payment', active: true, completed: false }
	];

	const inputBase = 'w-full px-4 py-3 border rounded-lg outline-none transition-colors bg-red-50 focus:ring-2 focus:ring-red-300';
	const stylize = (err, name) => `${inputBase} ${err && (touched[name] || attempted) ? 'border-red-600' : 'border-red-300 focus:border-red-500'}`;

	const goPrevious = () => navigate('/reservations/confirmation');
	const handleSubmit = (e) => {
		e.preventDefault();
		setAttempted(true);
		if (isValid()) {
			// Placeholder: save to localStorage (never store real card data in production!)
			try { localStorage.setItem('reservation.paymentMeta', JSON.stringify({
				last4: cardData.cardNumber.slice(-4),
				total
			})); } catch {}
			// Navigate or display placeholder confirmation
			alert('Payment details captured locally (demo). Integrate real gateway next.');
			// navigate('/dashboard'); // placeholder future route
		} else {
			setTimeout(() => {
				const firstErr = formRef.current?.querySelector('[data-error="true"]');
				firstErr && firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}, 0);
		}
	};

	// Auto-format card number groups of 4
	useEffect(() => {
		setCardData(d => {
			const digits = d.cardNumber.replace(/\D/g,'').slice(0,19);
			const grouped = digits.replace(/(.{4})/g,'$1 ').trim();
			return d.cardNumber === grouped ? d : { ...d, cardNumber: grouped };
		});
	}, [cardData.cardNumber]);

	return (
		<div className="min-h-screen">
			{/* Hero Header */}
			<header className="relative h-48 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/comp.png')" }}>
				<div className="absolute inset-0 bg-black/60" />
				<div className="relative z-10 flex items-center justify-between h-full px-6 md:px-8">
					<button onClick={goPrevious} className="text-white hover:text-gray-300" aria-label="Previous step">
						<ChevronLeft size={26} />
					</button>
					<h1 className="text-2xl md:text-4xl font-bold text-white font-serif">Make Reservation</h1>
					<img src="/assets/images/ft-logo.png" alt="Logo" className="w-12 h-12 object-contain" />
				</div>
			</header>

			{/* Steps */}
			<div className="bg-white shadow-sm">
				<div className="max-w-6xl mx-auto px-6 md:px-8">
					<div className="flex flex-wrap gap-6 py-4">
						{steps.map(step => (
							<div key={step.id} className={`text-sm md:text-lg font-medium ${step.active ? 'text-red-600 border-b-2 border-red-600 pb-1' : step.completed ? 'text-green-600' : 'text-gray-400'}`}>{step.name}</div>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<main className="max-w-6xl mx-auto px-6 md:px-8 py-8" ref={formRef}>
				<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 md:p-8" noValidate>
					{/* Booking Recap Fields */}
					<div className="space-y-6 mb-8">
						{/* Room Code - Full Width */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
							<input value={roomCode} readOnly placeholder="Room Code" className="w-full px-4 py-3 border rounded-lg bg-red-50 border-red-300 text-gray-700" />
						</div>
						
						{/* Check in/out - Side by side with calendar inputs */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Check in</label>
								<input 
									type="date" 
									value={booking.checkIn || ''} 
									readOnly 
									className="w-full px-4 py-3 border rounded-lg bg-red-50 border-red-300 text-gray-700" 
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Check out</label>
								<input 
									type="date" 
									value={booking.checkOut || ''} 
									readOnly 
									className="w-full px-4 py-3 border rounded-lg bg-red-50 border-red-300 text-gray-700" 
								/>
							</div>
						</div>
						
						{/* Names - Side by side */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
								<input value={booking.firstName || ''} readOnly className="w-full px-4 py-3 border rounded-lg bg-red-50 border-red-300 text-gray-700" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
								<input value={booking.lastName || ''} readOnly className="w-full px-4 py-3 border rounded-lg bg-red-50 border-red-300 text-gray-700" />
							</div>
						</div>
					</div>

					{/* Payment Section */}
					<div className="mt-2">
						<div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-6">
							<h3 className="text-lg font-semibold text-gray-800 flex-1">Payment Information</h3>
							{/* Card brand placeholders */}
							<div className="flex items-center gap-3 mt-3 md:mt-0">
								{['amex','mastercard','visa','verve'].map(b => (
									<span key={b} className="px-2 py-1 text-[10px] uppercase font-semibold tracking-wide bg-blue-50 text-blue-700 border border-blue-200 rounded">
										{b}
									</span>
								))}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Name on card *</label>
								<input name="cardName" value={cardData.cardName} onChange={onChange} onBlur={onBlur} placeholder="Name on card" data-error={!!fieldError('cardName') && (touched.cardName || attempted)} aria-invalid={!!fieldError('cardName')} className={stylize(fieldError('cardName'), 'cardName')} />
								{fieldError('cardName') && (touched.cardName || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('cardName')}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Expiration (MM/YY) *</label>
								<input name="expiry" value={cardData.expiry} onChange={onChange} onBlur={onBlur} placeholder="00/00" maxLength={5} data-error={!!fieldError('expiry') && (touched.expiry || attempted)} aria-invalid={!!fieldError('expiry')} className={stylize(fieldError('expiry'), 'expiry')} />
								{fieldError('expiry') && (touched.expiry || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('expiry')}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Card number *</label>
								<input name="cardNumber" value={cardData.cardNumber} onChange={onChange} onBlur={onBlur} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="off" data-error={!!fieldError('cardNumber') && (touched.cardNumber || attempted)} aria-invalid={!!fieldError('cardNumber')} className={stylize(fieldError('cardNumber'), 'cardNumber')} />
								{fieldError('cardNumber') && (touched.cardNumber || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('cardNumber')}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
								<input name="cvv" value={cardData.cvv} onChange={onChange} onBlur={onBlur} placeholder="000" inputMode="numeric" maxLength={4} data-error={!!fieldError('cvv') && (touched.cvv || attempted)} aria-invalid={!!fieldError('cvv')} className={stylize(fieldError('cvv'), 'cvv')} />
								{fieldError('cvv') && (touched.cvv || attempted) && <p className="text-xs text-red-600 mt-1">{fieldError('cvv')}</p>}
							</div>
						</div>
					</div>

					{/* Summary */}
					<div className="mt-4 max-w-md text-sm text-gray-700">
						<div className="flex justify-between py-1">
							<span className="font-medium">Standard Room</span>
							<span>{nights} x {formatCurrency(nightlyRate)}</span>
						</div>
						<div className="flex justify-between py-1 border-t border-gray-200 mt-1">
							<span>Subtotal</span>
							<span>{formatCurrency(subtotal)}</span>
						</div>
						<div className="flex justify-between py-1 border-t border-gray-200">
							<span>VAT 5%</span>
							<span>{formatCurrency(vat)}</span>
						</div>
						<div className="flex justify-between py-1 border-t border-gray-300 font-semibold">
							<span>Amount in total</span>
							<span>{formatCurrency(total)}</span>
						</div>
					</div>

					{/* Action */}
						<div className="flex flex-col sm:flex-row justify-end gap-4 pt-10">
							<button type="button" onClick={goPrevious} className="px-8 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Previous</button>
							<button type="submit" disabled={!isValid()} className={`px-10 py-3 rounded-lg font-semibold text-white transition-colors ${isValid() ? 'bg-red-700 hover:bg-red-800' : 'bg-red-300 cursor-not-allowed'}`}>Confirm Payment</button>
						</div>
				</form>
			</main>
		</div>
	);
};

export default PaymentPage;

