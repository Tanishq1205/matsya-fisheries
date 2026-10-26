import { useState } from 'react';
import { MapPin, Search, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useLocationStore } from '../../store/useLocationStore';
import { getDeliveryQuote } from '../../services/deliveryService';

export default function LocationModal() {
  const { isLocationModalOpen, closeLocationModal, location, setLocation } = useLocationStore();
  const [pincodeInput, setPincodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }

  if (!isLocationModalOpen) return null;

  const verifyAndSavePincode = async (inputPin) => {
    const pin = inputPin.trim();
    if (!/^\d{6}$/.test(pin)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid 6-digit PIN code.' });
      return;
    }
    setIsVerifying(true);
    setStatusMessage({ type: 'info', text: 'Checking delivery availability...' });
    try {
      const quote = await getDeliveryQuote(pin);
      if (!quote) {
        setStatusMessage({ type: 'error', text: `Delivery is currently unavailable for ${pin}.` });
        return;
      }
      setLocation({ area: `Mumbai (${pin})`, pincode: pin, city: 'Mumbai' });
      closeLocationModal();
      setStatusMessage(null);
      setPincodeInput('');
    } catch {
      setStatusMessage({ type: 'error', text: 'Unable to check delivery availability. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyAndSavePincode(pincodeInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D184D]/70 backdrop-blur-md animate-in fade-in duration-200 font-['Sora',sans-serif] select-none">
      <div className="relative w-full max-w-md bg-[#1D184D] border-2 border-[#D5C582] rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-[#FAF7EE]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D5C582]/15 border border-[#D5C582]/30 flex items-center justify-center text-[#D5C582]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FAF7EE] uppercase tracking-wider">
                Select Delivery Location
              </h3>
              <p className="text-[11px] text-[#FAF7EE]/60 font-medium">
                Mumbai Dock-to-Door Serviceable Zones
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              closeLocationModal();
              setStatusMessage(null);
            }}
            className="p-1.5 rounded-full text-[#FAF7EE]/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Location Display */}
        <div className="mt-4 p-3.5 bg-[#100D2D] border border-white/10 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <MapPin className="w-4 h-4 text-[#C2542D] shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-bold text-[#D5C582] uppercase tracking-wider block">
                Current Location
              </span>
              <p className="text-xs font-bold text-[#FAF7EE] truncate">
                {location?.pincode ? `${location.area || 'Delivery area'} (${location.pincode})` : 'Choose your PIN code'}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-[#6EE7A8]/15 border border-[#6EE7A8]/30 text-[#6EE7A8] px-2.5 py-0.5 rounded-full font-bold shrink-0">
            {location?.pincode ? 'Selected' : 'Not selected'}
          </span>
        </div>

        {/* Enter Pincode Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#FAF7EE]/70 block">
            Enter 6-Digit Mumbai Pincode
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAF7EE]/40" />
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 400089, 400028..."
                className="w-full pl-10 pr-3 py-2.5 bg-[#100D2D] border border-white/10 rounded-xl text-xs sm:text-sm text-[#FAF7EE] placeholder-[#FAF7EE]/40 focus:outline-none focus:border-[#D5C582] transition-colors font-bold tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || pincodeInput.length !== 6}
              className="px-4 py-2.5 rounded-xl bg-[#D5C582] hover:bg-[#c5b572] disabled:opacity-40 text-[#1D184D] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking</span>
                </>
              ) : (
                <span>Verify</span>
              )}
            </button>
          </div>
        </form>


        {/* Verification Feedback Banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-[#6EE7A8]/10 border-[#6EE7A8]/30 text-[#6EE7A8]'
                : statusMessage.type === 'info'
                ? 'bg-[#D5C582]/10 border-[#D5C582]/30 text-[#D5C582]'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : statusMessage.type === 'info' ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

      </div>
    </div>
  );
}