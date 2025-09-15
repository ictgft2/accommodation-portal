import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMakeReservation = async () => {
    setIsSubmitting(true);
    
    // Simulate navigation or API call
    setTimeout(() => {
      console.log('Navigate to reservations');
      setIsSubmitting(false);
    }, 2000);
  };

  const handleSignUp = () => {
    navigate('/signup');
    console.log('Navigate to sign up');
  };

  const handleLogin = () => {
   navigate('/login');
    console.log('Navigate to login');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        
      {/* Header */}
      <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 lg:-ml-8 xl:-ml-24">
                <img 
                    src="assets/images/winners-logo.png" 
                    alt="Winners Portal Logo" 
                    className="w-12 h-12 lg:w-16 lg:h-16 xl:w-18 xl:h-18 object-contain"
                />
                
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end space-x-3 lg:space-x-7 lg:-mr-4 xl:-mr-20">
              <button 
              onClick={handleLogin}
              className="px-4 py-2 lg:px-6 lg:py-2.5 text-sm lg:text-base text-gray-700 hover:text-primary-600 font-medium border border-gray-300 rounded-lg hover:border-primary-300 transition-colors duration-200">
                Log in
              </button>
              <button 
              onClick={handleSignUp}
              className="px-4 py-2 lg:px-6 lg:py-2.5 text-sm lg:text-base bg-accent-yellow hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors duration-200 shadow-sm">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Background Image with Overlay */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/images/accomdn-banner.png')`
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

      {/* Hero Section */}
      <main className="relative">
        

        {/* Hero Content */}
        <div className="relative z-10 min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-primary-500 mb-6 lg:mb-8 leading-tight font-serif">
              <span className="block">Winner's</span>
              <span className="block">Accommodation</span>
              <span className="block">Portal</span>
            </h1>

            {/* CTA Button */}
            <div className="mt-8 lg:mt-12">
              <button
              type="button"
              onClick={handleMakeReservation}
              disabled={isSubmitting}
              className={`group bg-accent-red hover:bg-red-600 text-white text-lg lg:text-xl font-semibold px-8 py-4 lg:px-12 lg:py-5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>{isSubmitting ? 'Loading...' : 'Make Reservations'}</span>
                {!isSubmitting && (
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                )}
              </span>
            </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="text-center">
            <p className="text-sm lg:text-base text-gray-300">
              © 2025 Winners Accommodation Portal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
