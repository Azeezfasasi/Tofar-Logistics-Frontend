import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';
import truckload from '../../images/truckload.jpg';
import { Link } from 'react-router-dom';

const ReachDestinationCTA = () => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = truckload;
  
  return (
    <div className="flex justify-center py-8 sm:py-16 md:py-20 font-['Inter'] bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Main Card Container */}
      <div className="max-w-6xl w-full mx-4 sm:mx-6 md:mx-0">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
          {/* Decorative gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-transparent"></div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Left Side: Image with Overlay */}
            <div className="relative h-64 sm:h-80 md:h-full overflow-hidden">
              <img
                src={imageUrl}
                alt="Professional logistics driver ensuring safe cargo delivery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Right Side: Content Section */}
            <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
              
              {/* Pre-headline Badge */}
              <div className="inline-flex items-center gap-2 mb-4 w-fit">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Trusted Logistics Partner</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                Reach Your Destination
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 mt-2">
                  100% Safe & Reliable
                </span>
              </h2>
              
              {/* Decorative Line */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
                <div className="h-0.5 w-6 bg-blue-300 rounded-full"></div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed font-light">
                We take pride in delivering your cargo with utmost care and precision. Every package is treated with the professionalism and attention it deserves, ensuring timely and secure delivery.
              </p>

              {/* Features List */}
              <div className="grid grid-cols-1 gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Real-time tracking & updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Fully insured shipments</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Professional handling guaranteed</span>
                </div>
              </div>

              {/* CTA Button */}
              <div>
                <Link
                  to="/app/requestquote"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base sm:text-lg rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 group/btn"
                >
                  <span>Get Your Quote</span>
                  <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </Link>
              </div>

              {/* Supporting text */}
              <p className="text-gray-500 text-xs sm:text-sm mt-6">
                📞 Available 24/7 | 💬 Live chat support | ✉️ info@tofarcargo.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReachDestinationCTA;
