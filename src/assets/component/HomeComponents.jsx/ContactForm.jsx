import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/Api';
import { Link } from 'react-router-dom';

function ContactForm() {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [shippingType, setShippingType] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [message, setMessage] = useState('');

  // Multi-step form states
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // UI states
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages when form fields change (except after successful submission)
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
  }, [name, email, phoneNumber, message, shippingType, originCountry, destinationCountry, weight, length, height, message]);

  // Validate step 1: Personal Information
  const validateStep1 = () => {
    if (!name.trim() || !email.trim()) {
      setLocalError('Name and Email are required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return false;
    }
    setLocalError('');
    return true;
  };

  // Validate step 2: Shipping Information
  const validateStep2 = () => {
    if (!shippingType.trim()) {
      setLocalError('Please select a shipping type.');
      return false;
    }
    setLocalError('');
    return true;
  };

  // Validate step 3: Item Details
  const validateStep3 = () => {
    if (!message.trim()) {
      setLocalError('Please provide shipping details.');
      return false;
    }
    setLocalError('');
    return true;
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    
    setCurrentStep(currentStep + 1);
    setLocalError('');
    setSuccessMessage('');
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
    setLocalError('');
    setSuccessMessage('');
  };

  // Mutation for submitting the contact form
  const submitContactFormMutation = useMutation({
    mutationFn: async (formData) => {
      // This endpoint is public, as per your backend routes
      const response = await axios.post(`${API_BASE_URL}/contact`, formData);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Your quote request has been submitted successfully! We will contact you soon.');
      setLocalError(''); // Clear any previous errors

      // Clear form fields after successful submission
      setName('');
      setEmail('');
      setPhoneNumber('');
      setMessage('');
      setShippingType('');
      setOriginCountry('');
      setDestinationCountry('');
      setWeight('');
      setLength('');
      setHeight('');
      setCurrentStep(1); // Reset to first step

      // Auto scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to send message. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage(''); // Clear success message on error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors
    setSuccessMessage(''); // Clear previous success messages

    // Trigger the mutation
    submitContactFormMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim() || undefined, // Send undefined if empty
      message: message.trim(),
      shippingType: shippingType.trim() || undefined,
      originCountry: originCountry.trim() || undefined,
      destinationCountry: destinationCountry.trim() || undefined, 
      weight: weight.trim() || undefined, 
      length: length.trim() || undefined, 
      height: height.trim() || undefined,
    });
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="w-full max-w-2xl">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 uppercase tracking-wide">
              Request A Quote
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">Step {currentStep} of {totalSteps}</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 sm:px-8 pt-8">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      currentStep === step
                        ? 'bg-blue-600 text-white scale-110 shadow-lg'
                        : currentStep > step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className="text-xs mt-2 text-center text-gray-600 font-medium">
                    {['Personal', 'Shipping', 'Items', 'Review'][step - 1]}
                  </span>
                  {step < 4 && (
                    <div
                      className={`h-1 w-12 mt-2 transition-all duration-300 ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 sm:px-8 pb-8">
            {localError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                <p className="font-semibold text-sm sm:text-base">{localError}</p>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
                <p className="font-semibold text-sm sm:text-base">{successMessage}</p>
              </div>
            )}

            <form>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      placeholder="Enter your phone number (optional)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Shipping Information</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Type *</label>
                    <select
                      value={shippingType}
                      onChange={(e) => setShippingType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 bg-white"
                      required
                    >
                      <option value="">Select Shipping Type</option>
                      <option value="Air Freight">Air Freight</option>
                      <option value="Sea Freight">Sea Freight</option>
                      <option value="Road Transport">Road Transport</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Origin Country</label>
                      <input
                        type="text"
                        placeholder="Enter origin country"
                        value={originCountry}
                        onChange={(e) => setOriginCountry(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Destination Country</label>
                      <input
                        type="text"
                        placeholder="Enter destination country"
                        value={destinationCountry}
                        onChange={(e) => setDestinationCountry(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Item Details */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Item Details</h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="text"
                        placeholder="Weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Length (cm)</label>
                      <input
                        type="text"
                        placeholder="Length"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                      <input
                        type="text"
                        placeholder="Height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shipping Details <span className="text-blue-600 text-xs font-normal">(List items to ship)</span>
                    </label>
                    <textarea
                      placeholder="Describe all items you want to ship..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows="5"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 placeholder-gray-400 resize-none"
                      required
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Review Your Information</h3>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Personal Info</h4>
                      <p className="text-gray-800"><span className="font-semibold">Name:</span> {name}</p>
                      <p className="text-gray-800"><span className="font-semibold">Email:</span> {email}</p>
                      {phoneNumber && <p className="text-gray-800"><span className="font-semibold">Phone:</span> {phoneNumber}</p>}
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Shipping Info</h4>
                      <p className="text-gray-800"><span className="font-semibold">Type:</span> {shippingType}</p>
                      {originCountry && <p className="text-gray-800"><span className="font-semibold">From:</span> {originCountry}</p>}
                      {destinationCountry && <p className="text-gray-800"><span className="font-semibold">To:</span> {destinationCountry}</p>}
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Item Details</h4>
                      {weight && <p className="text-gray-800"><span className="font-semibold">Weight:</span> {weight} kg</p>}
                      {length && <p className="text-gray-800"><span className="font-semibold">Length:</span> {length} cm</p>}
                      {height && <p className="text-gray-800"><span className="font-semibold">Height:</span> {height} cm</p>}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Details</h4>
                      <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 sm:px-8 pb-8 flex gap-4 justify-between">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
            >
              ← Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 text-sm sm:text-base"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={(e) => handleSubmit(e)}
                disabled={submitContactFormMutation.isPending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {submitContactFormMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Submit ✓'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </section>
  );
}

export default ContactForm;

