import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, resetBookingStatus } from '../../features/booking/bookingSlice';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedShow, selectedSeats, isSuccess, isError, message, isLoading } = useSelector((state) => state.booking);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [validationErrors, setValidationErrors] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error("Seat lock expired! Please select seats again.");
      navigate('/');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(resetBookingStatus());
    }
    if (isSuccess) {
      dispatch(resetBookingStatus());
      navigate('/checkout/success');
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  if (!selectedShow || selectedSeats.length === 0) {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-[#F9FAFB]">
        <p className="text-gray-500 mb-4">No booking details found.</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-4 py-2 rounded">Go Home</button>
      </div>
    );
  }

  const ticketCost = selectedShow.price * selectedSeats.length;
  const bookingFee = 20;
  const totalAmount = ticketCost + bookingFee;

  const validateForm = () => {
    const errors = {};
    if (!cardName.trim()) {
      errors.cardName = 'Name on card is required';
    }
    
    // Strip spaces for length check
    const rawCardNum = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(rawCardNum)) {
      errors.cardNumber = 'Card number must be 16 digits';
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      errors.expiry = 'Expiry must be in MM/YY format';
    } else {
      const [month, year] = expiry.split('/');
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear() % 100;

      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiry = 'Card has expired';
      }
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompletePayment = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the payment form');
      return;
    }
    
    const rawCardNum = cardNumber.replace(/\s+/g, '');

    const bookingData = {
      showId: selectedShow._id,
      seats: selectedSeats,
      cardNumber: rawCardNum, // sending for backend simulation
    };
    
    dispatch(createBooking(bookingData));
  };

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-[#F9FAFB]">
      
      {/* Header and Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(-1)}>
              <ChevronLeft color="#1f2937" size={20} />
              <span className="text-gray-900 text-[14px] font-medium">Back</span>
            </div>
            <span className="text-gray-500 text-[14px] font-medium cursor-pointer" onClick={() => navigate('/')}>Cancel</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-primary rounded-full mb-6"></div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[24px] font-bold text-gray-900">Checkout</h1>
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[13px] font-bold text-red-600">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Summary */}
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">Summary</h2>
          <div className="mb-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[15px] text-gray-800">{selectedSeats.length}x Tickets</span>
              <span className="text-[15px] text-gray-900 font-medium">₹{ticketCost}</span>
            </div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-[15px] text-gray-800">Booking Fee</span>
              <span className="text-[15px] text-gray-900 font-medium">₹{bookingFee}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-[18px] font-bold text-gray-900">Total</span>
              <span className="text-[18px] font-bold text-gray-900">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="px-5 mt-6 pb-6">
          <h2 className="text-[18px] font-bold text-gray-900 mb-6">Choose payment method</h2>
          
          {/* Payment Methods */}
          <div className="flex items-center space-x-8 mb-8">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="radio" name="payment" className="w-5 h-5 text-primary bg-white border-primary focus:ring-primary accent-primary" defaultChecked />
              <span className="text-[15px] text-gray-900 font-medium">Credit/Debit Card</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="radio" name="payment" className="w-5 h-5 text-primary bg-white border-gray-300 focus:ring-primary accent-primary" />
              <span className="text-[15px] text-gray-900 font-medium">Mobile Wallet</span>
            </label>
          </div>

          {/* Card Form */}
          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-[14px] text-gray-900 mb-2">Name on card</label>
              <input 
                type="text" 
                placeholder="Name on card" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className={`w-full bg-white border ${validationErrors.cardName ? 'border-red-500' : 'border-gray-200'} rounded-md py-3 px-3 outline-none text-[15px] text-gray-800 placeholder-gray-400 focus:border-primary transition-colors shadow-sm`}
              />
              {validationErrors.cardName && <span className="text-red-500 text-[12px] mt-1 block">{validationErrors.cardName}</span>}
            </div>
            <div>
              <label className="block text-[14px] text-gray-900 mb-2">Card number</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className={`w-full bg-white border ${validationErrors.cardNumber ? 'border-red-500' : 'border-gray-200'} rounded-md py-3 px-3 outline-none text-[15px] text-gray-800 placeholder-gray-400 focus:border-primary transition-colors shadow-sm`}
              />
              {validationErrors.cardNumber && <span className="text-red-500 text-[12px] mt-1 block">{validationErrors.cardNumber}</span>}
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-[14px] text-gray-900 mb-2">Expiry date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className={`w-full bg-white border ${validationErrors.expiry ? 'border-red-500' : 'border-gray-200'} rounded-md py-3 px-3 outline-none text-[15px] text-gray-800 placeholder-gray-400 focus:border-primary transition-colors shadow-sm`}
                />
                {validationErrors.expiry && <span className="text-red-500 text-[12px] mt-1 block">{validationErrors.expiry}</span>}
              </div>
              <div className="flex-1">
                <label className="block text-[14px] text-gray-900 mb-2">CVC/CVV</label>
                <input 
                  type="text" 
                  placeholder="CVC" 
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className={`w-full bg-white border ${validationErrors.cvv ? 'border-red-500' : 'border-gray-200'} rounded-md py-3 px-3 outline-none text-[15px] text-gray-800 placeholder-gray-400 focus:border-primary transition-colors shadow-sm`}
                />
                {validationErrors.cvv && <span className="text-red-500 text-[12px] mt-1 block">{validationErrors.cvv}</span>}
              </div>
            </div>
          </div>

          {/* Save Checkbox */}
          <label className="flex items-center space-x-3 cursor-pointer mb-8">
            <input type="checkbox" className="w-5 h-5 rounded border-primary text-primary accent-primary" />
            <span className="text-[14px] text-gray-800">Save payment details for the next purchase</span>
          </label>

          {/* Action Button */}
          <button 
            onClick={handleCompletePayment}
            disabled={isLoading}
            className="w-full bg-primary text-white py-3.5 rounded-lg font-medium text-[15px] shadow-sm active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

