import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Data ------------------------------------------------------------------
const ROOMS = [
  { id: 101, type: 'Standard Suite', price: 6000, capacity: 2, period: '/Night', images: ['/assets/images/101a.jpeg','/assets/images/101b.jpeg','/assets/images/101c.jpeg','/assets/images/101d.jpeg'], description: 'A simple, serene room designed for personal reflection and rest.', amenities: ['Free WiFi','Restaurant','Swimming Pool','Laundry','Easy Checkout'] },
  { id: 201, type: 'Executive Suite', price: 15000, capacity: 3, period: '/Night', images: ['/assets/images/201a.jpeg','/assets/images/201b.jpeg','/assets/images/201c.jpeg','/assets/images/201d.jpeg'], description: 'Spacious suite with executive workspace and premium finish.', amenities: ['Free WiFi','Restaurant','Laundry','Easy Checkout'] },
  { id: 301, type: 'Exquisite Suite', price: 25000, capacity: 5, period: '/Night', images: ['/assets/images/301a.jpg','/assets/images/301b.jpg','/assets/images/301c.jpg'], description: 'Luxury suite featuring elegant decor and lounge area.', amenities: ['Free WiFi','Restaurant','Swimming Pool','Laundry','Easy Checkout'] },
  // duplicates for fuller grid
  { id: 102, type: 'Standard Suite', price: 6000, capacity: 2, period: '/Night', images: ['/assets/images/102a.jpg','/assets/images/102b.jpeg','/assets/images/102c.jpg','/assets/images/102d.jpg'], description: 'Comfort-focused standard suite.', amenities: ['Free WiFi','Laundry','Easy Checkout'] },
  { id: 202, type: 'Executive Suite', price: 15000, capacity: 3, period: '/Night', images: ['/assets/images/202a.jpg','/assets/images/202b.jpg','/assets/images/202c.jpeg','/assets/images/202d.jpg'], description: 'Executive comfort and style.', amenities: ['Free WiFi','Restaurant','Laundry'] },
  { id: 302, type: 'Exquisite Suite', price: 25000, capacity: 5, period: '/Night', images: ['/assets/images/302a.jpg','/assets/images/302b.jpg','/assets/images/302c.jpg','/assets/images/302d.jpg'], description: 'Premium comfort and luxury.', amenities: ['Restaurant','Swimming Pool','Laundry'] },
  { id: 103, type: 'Standard Suite', price: 6000, capacity: 2, period: '/Night', images: ['/assets/images/103a.jpg','/assets/images/103b.jpeg','/assets/images/103c.jpeg','/assets/images/103d.jpeg'], description: 'Serene, minimal, and comfortable.', amenities: ['Free WiFi','Easy Checkout'] },
  { id: 203, type: 'Executive Suite', price: 15000, capacity: 3, period: '/Night', images: ['/assets/images/203a.jpg','/assets/images/203b.jpeg','/assets/images/203c.jpeg','/assets/images/203d.jpeg'], description: 'Executive suite with workspace.', amenities: ['Free WiFi','Restaurant'] },
  { id: 303, type: 'Exquisite Suite', price: 25000, capacity: 5, period: '/Night', images: ['/assets/images/303a.jpg','/assets/images/303b.jpg','/assets/images/303c.jpg','/assets/images/303d.jpg'], description: 'Top-tier suite for distinguished guests.', amenities: ['Restaurant','Swimming Pool','Laundry'] }
];

const AMENITY_ICONS = {
  'Free WiFi': '📶',
  'Restaurant': '🍽️',
  'Swimming Pool': '🏊‍♂️',
  'Laundry': '🧺',
  'Easy Checkout': '✅'
};

// Helpers ----------------------------------------------------------------
const currencyFormat = (n) => `₦${n.toLocaleString()}`;

// Component --------------------------------------------------------------
const ChooseRoomPage = () => {
  const navigate = useNavigate();
  const steps = [
    { id: 'booking', name: 'Booking Info', active: false, completed: true },
    { id: 'room', name: 'Choose Room', active: true, completed: false },
    { id: 'confirmation', name: 'Confirmation', active: false, completed: false },
    { id: 'payment', name: 'Payment', active: false, completed: false }
  ];

  const [selectedRoom, setSelectedRoom] = useState(null); // id
  const [showModal, setShowModal] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [showAllSimilar, setShowAllSimilar] = useState(false);
  const modalRef = useRef(null);

  const currentRoom = ROOMS.find(r => r.id === selectedRoom) || null;
  const similarRooms = currentRoom ? ROOMS.filter(r => r.type === currentRoom.type && r.id !== currentRoom.id) : [];
  const displayedSimilar = showAllSimilar ? similarRooms : similarRooms.slice(0,3);

  const openModalForRoom = (roomId) => {
    setSelectedRoom(roomId);
    setMainImageIndex(0);
    setShowAllSimilar(false);
    setShowModal(true);
  };

  const handleBookNow = (roomId) => {
    setSelectedRoom(roomId);
    try { localStorage.setItem('reservation.selectedRoomId', String(roomId)); } catch {}
    setShowModal(false);
    navigate('/reservations/confirmation');
  };

  const handleNext = () => {
    if (selectedRoom) {
      try { localStorage.setItem('reservation.selectedRoomId', String(selectedRoom)); } catch {}
      navigate('/reservations/confirmation');
    }
  };
  const handlePrevious = () => navigate('/reservations/booking-info');

  const closeModal = useCallback(() => setShowModal(false), []);

  // scroll lock
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  // ESC close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeModal]);

  // Focus first interactive element when modal opens
  useEffect(() => {
    if (showModal && modalRef.current) {
      const btn = modalRef.current.querySelector('button');
      btn && btn.focus();
    }
  }, [showModal]);

  const nextImage = () => currentRoom && setMainImageIndex(i => (i + 1) % currentRoom.images.length);
  const prevImage = () => currentRoom && setMainImageIndex(i => (i - 1 + currentRoom.images.length) % currentRoom.images.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header className="relative h-48 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/comp.png')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-between h-full px-6 md:px-10">
          <button onClick={handlePrevious} className="text-white hover:text-gray-300 p-2 rounded" aria-label="Go Back">
            <ChevronLeft size={28} />
          </button>
            <h1 className="text-2xl md:text-4xl font-bold text-white font-serif text-center">Make Reservation</h1>
          <img src="/assets/images/ft-logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
      </header>

      {/* Steps */}
      <section className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-wrap gap-6 py-4">
            {steps.map(step => (
              <div key={step.id} className={`text-sm md:text-lg font-medium ${step.active ? 'text-red-600 border-b-2 border-red-600 pb-1' : step.completed ? 'text-green-600' : 'text-gray-400'}`}>{step.name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <main className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {ROOMS.map(room => (
              <div key={room.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <button
                  onClick={() => openModalForRoom(room.id)}
                  className="relative h-44 bg-gray-100 group"
                  aria-label={`See details of ${room.type}`}
                >
                  <img
                    src={room.images[0]}
                    alt={room.type}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTYgMTZoMjg4djE0OEgxNnoiIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iLjMiLz48cGF0aCBkPSJNNzIgNzJjMCA0LjQgMy42IDggOCA4aDE2MGM0LjQgMCA4LTMuNiA4LThzLTMuNi04LTgtOEg4MGMtNC40IDAtOCAzLjYtOCA4em0xNiA0OGMwLTQuNCAzLjYtOCA4LThIMjI0YzQuNCAwIDggMy42IDggOHMtMy42IDgtOCA4SDk2Yy00LjQgMC04LTMuNi04LTh6IiBmaWxsPSIjQ0NEMkQ2Ii8+PC9zdmc+'; }}
                  />
                </button>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-base font-semibold text-gray-800">{room.type}</h3>
                  <p className="text-xs text-gray-500">Room {room.id}</p>
                  <p className="text-[11px] text-gray-400 mt-1 mb-3">Accommodates {room.capacity} {room.capacity > 1 ? 'persons' : 'person'}</p>
                  <div className="mt-auto flex items-baseline gap-1 mb-4">
                    <span className="text-xl font-bold text-gray-900">{currencyFormat(room.price)}</span>
                    <span className="text-xs text-gray-500">{room.period}</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleBookNow(room.id)}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${selectedRoom === room.id ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >{selectedRoom === room.id ? 'Selected' : 'Book Now'}</button>
                    <button
                      onClick={() => openModalForRoom(room.id)}
                      className="flex-1 py-2 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
            <button onClick={handlePrevious} className="flex items-center gap-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto">
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedRoom}
              className={`flex items-center justify-center gap-2 px-10 py-3 rounded-lg font-semibold w-full sm:w-auto ${selectedRoom ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && currentRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true" aria-label={`${currentRoom.type} details`}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
          <div ref={modalRef} className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl p-5 md:p-8 flex flex-col max-h-[90vh] overflow-hidden">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close">
              <X size={26} />
            </button>
            <button onClick={closeModal} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
              <ChevronLeft size={22} /> Back
            </button>

            <div className="overflow-y-auto pr-2 custom-scrollbar">
              <h2 className="text-center font-bold text-xl md:text-2xl text-gray-900 mb-4 mt-6 md:mt-2">{currentRoom.type}</h2>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Images */}
                <div className="flex-1 lg:flex-[0.58] flex flex-col md:flex-row gap-4">
                  <div className="flex md:flex-col gap-3 md:overflow-y-auto overflow-x-auto md:w-24 order-2 md:order-1 md:h-64">
                    {currentRoom.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-20 md:w-full md:h-20 rounded-lg overflow-hidden border ${idx === mainImageIndex ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${currentRoom.type} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNNDAgNDBsMjAgMjAgMjAtMjAiIHN0cm9rZT0iI0JDQkNCRCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=='; }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="relative flex-1 order-1 md:order-2">
                    <img
                      src={currentRoom.images[mainImageIndex]}
                      alt={currentRoom.type}
                      className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-xl"
                      onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4='; }}
                    />
                    {currentRoom.images.length > 1 && (
                      <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1" aria-label="Previous image">
                          <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1" aria-label="Next image">
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Details */}
                <div className="flex-1 lg:flex-[0.42] flex flex-col gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">About</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{currentRoom.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-medium">Maximum Persons:</span>
                    <span className="font-semibold">{currentRoom.capacity}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Amenities</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {currentRoom.amenities.map(am => (
                        <div key={am} className="flex items-center gap-1 text-gray-600">
                          <span className="text-lg leading-none">{AMENITY_ICONS[am] || '✔️'}</span>
                          <span className="text-xs md:text-sm">{am}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{currencyFormat(currentRoom.price)}</span>
                    <span className="text-sm text-gray-500 ml-2">per Night</span>
                  </div>
                  <button onClick={() => handleBookNow(currentRoom.id)} className="mt-4 w-full py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors">
                    Pay Now
                  </button>
                </div>
              </div>

              {similarRooms.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base md:text-lg font-semibold text-gray-800">Similar Rooms</span>
                    <button onClick={() => setShowAllSimilar(v => !v)} className="text-blue-700 text-xs md:text-sm font-medium hover:underline">
                      {showAllSimilar ? 'Collapse' : 'View all'}
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                    {displayedSimilar.map(sim => (
                      <div key={sim.id} onClick={() => openModalForRoom(sim.id)} className="min-w-[220px] bg-white rounded-lg shadow border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition flex flex-col">
                        <img src={sim.images[0]} alt={sim.type} className="w-full h-24 object-cover rounded mb-2" onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4='; }} />
                        <div className="font-semibold text-gray-800 text-sm mb-1 truncate">{sim.type}</div>
                        <div className="text-[11px] text-gray-500 mb-1">Room {sim.id}</div>
                        <div className="text-[11px] text-gray-400 mb-2">Accommodates {sim.capacity} {sim.capacity > 1 ? 'persons' : 'person'}</div>
                        <div className="text-sm font-bold text-gray-900">{currencyFormat(sim.price)}<span className="text-[10px] text-gray-500">/Night</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseRoomPage;
