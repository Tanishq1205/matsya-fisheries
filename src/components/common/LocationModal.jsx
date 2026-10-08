import React, { useState } from 'react';
import { MapPin, Navigation, Search, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useLocationStore } from '../../store/useLocationStore';
import { supabase } from '../../lib/supabaseClient';

export default function LocationModal() {
  const { isLocationModalOpen, closeLocationModal, location, setLocation } = useLocationStore();
  const [pincodeInput, setPincodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  if (!isLocationModalOpen) return null;

  const verifyAndSavePincode = async (inputPin) => {
    const cleanPin = inputPin.trim();

    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid 6-digit Mumbai pincode.',
      });
      return;
    }

    setIsVerifying(true);
    setStatusMessage({ type: 'info', text: 'Checking database...' });

    try {
      const { data, error } = await supabase
        .from('pincodes')
        .select('*')
        .eq('pincode', cleanPin)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const areaName = data.area || data.area_name || `Mumbai (${cleanPin})`;
        const verifiedLocation = {
          area: areaName,
          pincode: cleanPin,
          city: 'Mumbai',
        };
        setLocation(verifiedLocation);
        setStatusMessage({
          type: 'success',
          text: `⚡ Express Dock-to-Door delivery available for ${cleanPin}!`,
        });
        setTimeout(() => {
          closeLocationModal();
          setStatusMessage(null);
          setPincodeInput('');
        }, 1200);
      } else {
        // Fallback for Mumbai range check
        const isMumbaiPin = cleanPin.startsWith('400');
        if (isMumbaiPin) {
          const verifiedLocation = {
            area: `Mumbai (${cleanPin})`,
            pincode: cleanPin,
            city: 'Mumbai',
          };
          setLocation(verifiedLocation);
          setStatusMessage({
            type: 'success',
            text: `⚡ Delivery available across Mumbai (${cleanPin})!`,
          });
          setTimeout(() => {
            closeLocationModal();
            setStatusMessage(null);
            setPincodeInput('');
          }, 1200);
        } else {
          setStatusMessage({
            type: 'error',
            text: `Sorry, delivery is currently not available for pincode ${cleanPin}.`,
          });
        }
      }
    } catch (err) {
      console.error('Supabase pincode query error:', err);
      if (cleanPin.startsWith('400')) {
        const verifiedLocation = {
          area: `Mumbai (${cleanPin})`,
          pincode: cleanPin,
          city: 'Mumbai',
        };
        setLocation(verifiedLocation);
        setStatusMessage({
          type: 'success',
          text: `⚡ Serviceable Mumbai area confirmed (${cleanPin})!`,
        });
        setTimeout(() => {
          closeLocationModal();
          setStatusMessage(null);
          setPincodeInput('');
        }, 1200);
      } else {
        setStatusMessage({
          type: 'error',
          text: 'We currently deliver across Mumbai (400xxx).',
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGpsLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage({
        type: 'error',
        text: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setIsDetectingGps(true);
    setStatusMessage({ type: 'info', text: 'Detecting GPS location...' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detected = {
          area: 'GPS Location',
          pincode: location?.pincode || '400089',
          city: 'Mumbai',
          lat: latitude,
          lng: longitude,
        };
        setLocation(detected);
        setIsDetectingGps(false);
        setStatusMessage({
          type: 'success',
          text: '⚡ GPS Location set successfully!',
        });
        setTimeout(() => {
          closeLocationModal();
          setStatusMessage(null);
        }, 1000);
      },
      (error) => {
        setIsDetectingGps(false);
        setStatusMessage({
          type: 'error',
          text: 'Could not fetch GPS. Please enter your 6-digit pincode.',
        });
      },
      { timeout: 8000 }
    );
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
                {location?.area || 'Tilak Nagar, Chembur'} ({location?.pincode || '400089'})
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-[#6EE7A8]/15 border border-[#6EE7A8]/30 text-[#6EE7A8] px-2.5 py-0.5 rounded-full font-bold shrink-0">
            Active
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

        {/* GPS Location Button */}
        <button
          type="button"
          onClick={handleGpsLocation}
          disabled={isDetectingGps}
          className="w-full mt-3 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-[#D5C582] transition-all cursor-pointer"
        >
          <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
          <span>{isDetectingGps ? 'Detecting GPS...' : 'Use Current GPS Location'}</span>
        </button>

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