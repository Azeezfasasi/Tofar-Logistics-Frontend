import React from 'react';
import { User, ExternalLink } from 'lucide-react';
import cta1 from '../../images/cta1.jpg';
import { Link } from 'react-router-dom';

const ReachDestinationCTA = () => {
  const imageUrl = cta1;
  
  return (
    // Outer container: responsive padding and centering
    <div className="flex justify-center p-4 sm:p-8 md:p-12 font-['Inter'] bg-gray-50">
      
      {/* Main Card/Section Container: Max width for readability and desktop layout */}
      <div className="max-w-6xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Grid Layout: 2 columns on medium screens and above */}
        <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
          
          {/* Left Side: Image Section */}
          <div className="w-full h-80 md:h-full">
            <img
              src={imageUrl}
              alt="Professional looking driver standing by a car while checking his phone."
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Right Side: Text and Buttons Section */}
          <div className="p-8 md:p-0 md:pr-10">
            
            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Reach Your Destination 100% Sure and Safe
            </h2>
            
            {/* Separator / Accent Line */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
              <div className="w-4 h-1 bg-blue-300 rounded-full ml-1"></div>
            </div>

            {/* Subtext / Description */}
            <p className="text-gray-700 text-base sm:text-lg mb-8">
              We will take care of your cargo and deliver them safe and on time.
            </p>

            {/* Action Buttons Container */}
            <div className="flex flex-col gap-4">
              <Link to="/app/requestquote" className="flex items-center justify-center space-x-3 w-full sm:w-80 py-3.5 px-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-lg rounded-full shadow-lg transition duration-200">
                <span>REQUEST QUOTE</span>
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReachDestinationCTA;
