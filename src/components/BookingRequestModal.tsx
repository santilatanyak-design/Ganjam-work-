import React, { useState } from 'react';
import { WorkerProfile, Language } from '../types';
import { translations } from '../data/translations';
import { ganjamTehsils } from '../data/mockData';
import { GoogleMapsLocationSearch } from './Admin/GoogleMapsLocationSearch';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck,
  PhoneCall,
  MessageSquareCode,
  Map
} from 'lucide-react';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerProfile | null;
  actionType: 'call' | 'whatsapp' | 'booking';
  language: Language;
  initialUserData?: {
    name?: string;
    phone?: string;
    location?: string;
  };
  onRequestSubmitted: (newRequest: any) => void;
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  isOpen,
  onClose,
  worker,
  actionType,
  language,
  initialUserData,
  onRequestSubmitted
}) => {
  if (!isOpen || !worker) return null;

  const t = translations[language];

  // Form Field States
  const [customerName, setCustomerName] = useState(initialUserData?.name || '');
  const [customerPhone, setCustomerPhone] = useState(initialUserData?.phone || '');
  const [block, setBlock] = useState('Berhampur Sadar');
  const [panchayat, setPanchayat] = useState('Bada Bazar');
  const [pincode, setPincode] = useState('760002');
  
  // Location Data State for Google Maps / GPS
  const [locationData, setLocationData] = useState({
    formattedAddress: worker.formattedAddress || 'Bada Bazar, Berhampur, Ganjam, Odisha 760002',
    latitude: worker.latitude || 19.314963,
    longitude: worker.longitude || 84.794090
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = () => {
    setSubmittedStatus(false);
    setValidationError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError(language === 'or' ? 'ଦୟାକରି ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ (Please enter your name)' : 'Please enter your full name.');
      return;
    }

    const cleanedPhone = customerPhone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setValidationError(language === 'or' ? 'ଦୟାକରି ସଠିକ୍ ୧୦ ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!block.trim()) {
      setValidationError(language === 'or' ? 'ଦୟାକରି ଆପଣଙ୍କ ବ୍ଲକ୍ ଚୟନ କରନ୍ତୁ' : 'Please select your Block / Tehsil.');
      return;
    }

    if (!panchayat.trim()) {
      setValidationError(language === 'or' ? 'ଦୟାକରି ଆପଣଙ୍କ ପଞ୍ଚାୟତ / ଗ୍ରାମ ନାମ ଦିଅନ୍ତୁ' : 'Please enter your Panchayat or Village.');
      return;
    }

    const cleanedPincode = pincode.replace(/\D/g, '');
    if (!cleanedPincode || cleanedPincode.length < 6) {
      setValidationError(language === 'or' ? 'ଦୟାକରି ସଠିକ୍ ୬ ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍‌କୋଡ୍ ଦିଅନ୍ତୁ' : 'Please enter a valid 6-digit Pincode.');
      return;
    }

    setIsSubmitting(true);

    const docId = `bk_${Date.now()}`;
    const newRequestData = {
      id: docId,
      type: 'service',
      workerId: worker.id,
      workerName: worker.nameEn,
      workerNameOr: worker.nameOr,
      workerPhone: worker.phone,
      workerWhatsapp: worker.whatsappNumber,
      workerCategory: worker.category,
      skillTitleEn: worker.skillTitleEn,
      skillTitleOr: worker.skillTitleOr,
      providerName: worker.nameEn,
      providerPhone: worker.phone,
      
      // Customer Details
      customerName: customerName.trim(),
      customerPhone: cleanedPhone,
      block: block.trim(),
      panchayat: panchayat.trim(),
      pincode: cleanedPincode,
      customerAddress: `${panchayat.trim()}, Block: ${block.trim()}, Ganjam - ${cleanedPincode}`,
      
      // Auto-location & Map details
      formattedAddress: locationData.formattedAddress,
      latitude: locationData.latitude,
      longitude: locationData.longitude,

      status: 'pending',
      requestedAction: actionType,
      titleEn: `Contact Request: ${worker.skillTitleEn} (${worker.nameEn})`,
      titleOr: `ସମ୍ପର୍କ ଅନୁରୋଧ: ${worker.skillTitleOr} (${worker.nameOr})`,
      totalPrice: worker.dailyRate,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      timestamp: Date.now()
    };

    try {
      // Save directly to Firebase Firestore
      await setDoc(doc(db, 'bookings', docId), newRequestData);
      console.log('Booking contact request saved to Firestore:', newRequestData);
    } catch (err) {
      console.warn('Firestore booking request save warning:', err);
    }

    onRequestSubmitted(newRequestData);
    setIsSubmitting(false);
    setSubmittedStatus(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between sticky top-0 z-20 border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md">
              {actionType === 'call' ? (
                <PhoneCall className="w-5 h-5 text-slate-950" />
              ) : (
                <MessageSquareCode className="w-5 h-5 text-slate-950" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {language === 'or' ? 'ବୁକିଂ ଓ ସମ୍ପର୍କ ଅନୁରୋଧ ଫର୍ମ' : 'Booking & Contact Request Form'}
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                {language === 'or' ? 'ଆଡମିନ୍ ଅନୁମୋଦନ ପରେ କଲ୍ / WhatsApp ଅନଲକ୍ ହେବ' : 'Requires Admin Approval to Unlock Contact'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-emerald-300 hover:text-white p-1.5 rounded-xl hover:bg-emerald-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submittedStatus ? (
          /* Confirmation Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto border-4 border-amber-200 animate-bounce">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Status: Pending Admin Approval
              </span>
              <h4 className="font-black text-xl text-slate-900 pt-2">
                {language === 'or' ? 'ଆପଣଙ୍କ ଅନୁରୋଧ ସଫଳତାର ସହ ପଠାଗଲା!' : 'Request Submitted Successfully!'}
              </h4>
              <p className="text-sm font-bold text-amber-800 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 mt-2">
                {language === 'or'
                  ? 'ଆପଣଙ୍କ ଅନୁରୋଧ ଆଡମିନ୍ ଅନୁମୋଦନ ପାଇଁ ପେଣ୍ଡିଂ ଅଛି। (Your request is pending admin approval.)'
                  : 'Your request is pending admin approval.'}
              </p>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {language === 'or'
                ? 'ପ୍ରଶାସନ ଦ୍ୱାରା ଅନୁମୋଦନ ହେବା ପରେ, ସିଧାସଳଖ ଶ୍ରମିକଙ୍କ ସହ କଥା ହେବା ପାଇଁ "Call Now" ଏବଂ "WhatsApp" ବଟନ୍ ଅନଲକ୍ (Unlocked) ହୋଇଯିବ।'
                : 'Once approved by the admin, the Call and WhatsApp buttons will be unlocked automatically in real-time.'}
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5 font-medium">
              <p className="text-slate-500 font-bold uppercase text-[10px]">Submitted Request Details:</p>
              <p className="text-slate-900">👤 <strong>Customer Name:</strong> {customerName}</p>
              <p className="text-slate-900">📞 <strong>Mobile:</strong> +91 {customerPhone}</p>
              <p className="text-slate-900">📍 <strong>Location:</strong> {panchayat}, {block}, Ganjam ({pincode})</p>
              <p className="text-emerald-800 font-bold">🛠️ <strong>Target Worker:</strong> {worker.nameEn} ({worker.skillTitleEn})</p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black py-3 rounded-2xl transition text-sm shadow-md"
            >
              {language === 'or' ? 'ଠିକ୍ ଅଛି (Got It)' : 'Got It & Close'}
            </button>
          </div>
        ) : (
          /* Form Input Screen with Flex Column and Fixed/Sticky Footer */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            
            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Inline Validation Warning Banner */}
              {validationError && (
                <div className="bg-red-50 border-2 border-red-300 p-3 rounded-2xl text-xs font-bold text-red-700 flex items-center justify-between gap-2 animate-shake">
                  <span>⚠️ {validationError}</span>
                  <button
                    type="button"
                    onClick={() => setValidationError(null)}
                    className="text-red-500 hover:text-red-900 text-xs p-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* Target Worker Banner */}
              <div className="bg-emerald-50 border-2 border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.photoUrl}
                    alt={worker.nameEn}
                    className="w-12 h-12 aspect-square rounded-xl object-cover border border-emerald-300 shadow-sm"
                    style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
                  />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
                      {language === 'or' ? 'ଚୟନିତ କାରିଗର / ଶ୍ରମିକ' : 'Target Worker Profile'}
                    </p>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {language === 'or' ? worker.nameOr : worker.nameEn}
                    </h4>
                    <p className="text-xs text-emerald-900 font-semibold">
                      {language === 'or' ? worker.skillTitleOr : worker.skillTitleEn}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-extrabold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg">
                    ₹{worker.dailyRate} / day
                  </span>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'or' ? 'ଆପଣଙ୍କ ନାମ (Name) *' : 'Your Full Name *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Santilata Nayak"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'or' ? 'ମୋବାଇଲ୍ ନମ୍ବର (Mobile) *' : 'Mobile Number *'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9861000000"
                    maxLength={10}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Block, Panchayat & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'or' ? 'ବ୍ଲକ୍ (Block) *' : 'Block / Tehsil *'}</span>
                  </label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {ganjamTehsils.map((tItem, idx) => (
                      <option key={idx} value={tItem}>
                        {tItem}
                      </option>
                    ))}
                    <option value="Berhampur Sadar">Berhampur Sadar (ବ୍ରହ୍ମପୁର)</option>
                    <option value="Hinjilicut">Hinjilicut (ହିଞ୍ଜିଳିକାଟୁ)</option>
                    <option value="Aska">Aska (ଆସିକା)</option>
                    <option value="Bhanjanagar">Bhanjanagar (ଭଞ୍ଜନଗର)</option>
                    <option value="Chatrapur">Chatrapur (ଛତ୍ରପୁର)</option>
                    <option value="Gopalpur">Gopalpur (ଗୋପାଳପୁର)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'or' ? 'ପଞ୍ଚାୟତ / ଗ୍ରାମ *' : 'Panchayat / Village *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={panchayat}
                    onChange={(e) => setPanchayat(e.target.value)}
                    placeholder="e.g. Bada Bazar"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'or' ? 'ପିନ୍‌କୋଡ୍ (Pincode) *' : 'Pincode *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="760002"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Google Maps Geolocation & Location Search with Map Embed */}
              <GoogleMapsLocationSearch
                locationData={locationData}
                onChange={(data) => setLocationData(data)}
                language={language}
              />

              {/* Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  {language === 'or'
                    ? 'ସୁରକ୍ଷା ପାଇଁ ଆପଣଙ୍କ ଅନୁରୋଧ ଗଞ୍ଜାମ ପ୍ରଶାସନ ନିକଟକୁ ଯିବ। ଆଡମିନ୍ ଅନୁମୋଦନ କଲା ପରେ ସିଧାସଳଖ କଲ୍ ଓ WhatsApp ସୁବିଧା ଅନଲକ୍ ହେବ।'
                    : 'For security and verification, your request will be sent to Ganjam Admin for approval. The Call & WhatsApp buttons will unlock immediately upon approval.'}
                </p>
              </div>

            </div>

            {/* Sticky / Fixed Bottom Footer with Cancel & Submit Buttons */}
            <div className="sticky bottom-0 z-20 bg-slate-50 border-t border-slate-200 p-3.5 sm:p-4 flex items-center justify-between gap-3 shrink-0 shadow-lg">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-xs sm:text-sm transition flex items-center gap-1.5"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>{language === 'or' ? 'କ୍ୟାନ୍ସେଲ୍ (Cancel)' : 'Cancel'}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-amber-300 font-black py-3 px-4 rounded-2xl transition text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>{language === 'or' ? 'ସବମିଟ୍ (Submit)' : 'Submit Request'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
