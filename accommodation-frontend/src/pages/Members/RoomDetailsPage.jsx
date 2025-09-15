import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  Bed, 
  Wifi, 
  AirVent, 
  Tv, 
  Coffee,
  Car,
  Utensils,
  Star,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Camera,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const RoomDetailsPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setTimeout(() => {
        setRoom({
          id: roomId || '101',
          number: '101',
          name: 'Standard Room A',
          building: {
            id: 1,
            name: 'Block A',
            address: '123 Church Street, Lagos'
          },
          type: 'Standard',
          capacity: 4,
          size: '25 sqm',
          floor: 1,
          status: 'Available',
          pricePerNight: 15000,
          description: 'A comfortable and well-furnished standard room perfect for small groups. Features modern amenities and a peaceful environment ideal for retreats and conferences.',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: AirVent, name: 'Air Conditioning' },
            { icon: Tv, name: 'Television' },
            { icon: Coffee, name: 'Coffee Maker' },
            { icon: Car, name: 'Parking' },
            { icon: Utensils, name: 'Mini Fridge' }
          ],
          images: [
            '/assets/images/101a.jpeg',
            '/assets/images/101b.jpeg',
            '/assets/images/101c.jpeg',
            '/assets/images/101d.jpeg'
          ],
          currentOccupant: {
            name: 'Pastor John Adebayo',
            email: 'john.adebayo@email.com',
            phone: '+234 801 234 5678',
            checkIn: '2025-01-10',
            checkOut: '2025-01-20',
            serviceUnit: 'Men\'s Ministry',
            role: 'Pastor'
          },
          recentBookings: [
            {
              id: 1,
              guestName: 'Youth Ministry',
              checkIn: '2024-12-15',
              checkOut: '2024-12-18',
              status: 'Completed',
              rating: 5,
              review: 'Excellent facilities and very clean. Perfect for our youth retreat.'
            },
            {
              id: 2,
              guestName: 'Women\'s Fellowship',
              checkIn: '2024-11-20',
              checkOut: '2024-11-22',
              status: 'Completed',
              rating: 4,
              review: 'Good room with all necessary amenities. Would book again.'
            },
            {
              id: 3,
              guestName: 'Pastor David',
              checkIn: '2024-10-05',
              checkOut: '2024-10-07',
              status: 'Completed',
              rating: 5,
              review: 'Very comfortable stay. Everything was perfect.'
            }
          ],
          reviews: {
            average: 4.7,
            total: 23,
            breakdown: {
              5: 15,
              4: 6,
              3: 2,
              2: 0,
              1: 0
            }
          },
          maintenanceHistory: [
            {
              id: 1,
              date: '2024-12-01',
              type: 'Routine Cleaning',
              description: 'Deep cleaning and sanitization',
              status: 'Completed'
            },
            {
              id: 2,
              date: '2024-11-15',
              type: 'Maintenance',
              description: 'Air conditioning service',
              status: 'Completed'
            }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchRoomDetails();
  }, [roomId]);

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-3 py-1 text-sm font-semibold rounded-full";
    switch (status) {
      case 'Available':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Occupied':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Maintenance':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Out of Order':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Occupied':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'Maintenance':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Out of Order':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const BookingModal = () => {
    const [bookingData, setBookingData] = useState({
      checkIn: '',
      checkOut: '',
      guests: 1,
      purpose: '',
      specialRequests: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle booking submission
      console.log('Booking submitted:', bookingData);
      setShowBookingModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Book Room {room.number}</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests *
                </label>
                <select
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  {Array.from({ length: room.capacity }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Guest{i + 1 > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Stay *
                </label>
                <input
                  type="text"
                  value={bookingData.purpose}
                  onChange={(e) => setBookingData({...bookingData, purpose: e.target.value})}
                  placeholder="e.g., Conference, Retreat, Meeting"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                  rows={2}
                  placeholder="Any special requirements or requests..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price per night:</span>
                  <span className="text-lg font-bold text-gray-800">{formatCurrency(room.pricePerNight)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Request Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Room Details">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!room) {
    return (
      <AdminLayout title="Room Details">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Room not found</h3>
          <p className="text-gray-600">The room you're looking for doesn't exist or has been removed.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Room ${room.number}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Room {room.number} - {room.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-gray-600">{room.building.name}</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(room.status)}
                      <span className={getStatusBadge(room.status)}>
                        {room.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(room.pricePerNight)}</div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">{room.capacity} guests</span>
                </div>
                <div className="flex items-center">
                  <Bed className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">{room.type}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-700">{room.size}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-700">Floor {room.floor}</span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Photos</h3>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={room.images[activeImageIndex]}
                    alt={`Room ${room.number} - ${activeImageIndex + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {room.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative rounded-lg overflow-hidden ${
                        activeImageIndex === index ? 'ring-2 ring-red-500' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Room ${room.number} - ${index + 1}`}
                        className="w-full h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description and Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">About this room</h3>
              <p className="text-gray-700 mb-6">{room.description}</p>
              
              <h4 className="text-md font-semibold text-gray-800 mb-3">Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <amenity.icon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Reviews</h3>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {renderStars(Math.round(room.reviews.average))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {room.reviews.average} ({room.reviews.total} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {room.recentBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{booking.guestName}</p>
                        <p className="text-xs text-gray-500">{booking.checkIn} - {booking.checkOut}</p>
                      </div>
                      <div className="flex">
                        {renderStars(booking.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{booking.review}</p>
                  </div>
                ))}
              </div>

              <button className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium">
                View all reviews
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {room.status === 'Available' && (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Request Booking
                  </button>
                )}
                
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  View Availability
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Current Occupant */}
            {room.currentOccupant && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Occupant</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{room.currentOccupant.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {room.currentOccupant.role}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{room.currentOccupant.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{room.currentOccupant.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      {room.currentOccupant.checkIn} - {room.currentOccupant.checkOut}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Building Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Building Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">{room.building.name}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-700">{room.building.address}</span>
                </div>
              </div>
            </div>

            {/* Recent Maintenance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Maintenance</h3>
              <div className="space-y-3">
                {room.maintenanceHistory.slice(0, 2).map((maintenance) => (
                  <div key={maintenance.id} className="text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-700">{maintenance.type}</span>
                      <span className="text-xs text-gray-500">{maintenance.date}</span>
                    </div>
                    <p className="text-gray-600">{maintenance.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && <BookingModal />}
    </AdminLayout>
  );
};

export default RoomDetailsPage;
