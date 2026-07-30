import React, { useState } from 'react';
import { WorkerProfile, ProduceItem, EquipmentItem, Booking, Language } from '../types';
import { translations } from '../data/translations';
import { X, Calendar, Clock, MapPin, IndianRupee, QrCode, MessageSquareCode, CheckCircle2 } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  item: {
    type: 'service' | 'produce' | 'equipment';
    data: WorkerProfile | ProduceItem | EquipmentItem;
  } | null;
  onConfirmBooking: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  language,
  item,
  onConfirmBooking,
}) => {
  if (!isOpen || !item) return null;

  const t = translations[language];

  // Today's YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [quantity, setQuantity] = useState(
    item.type === 'produce' ? (item.data as ProduceItem).minOrderQty : 1
  );
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'PayOnService'>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Berhampur, Ganjam');

  // Calculate Price
  let unitPrice = 0;
  let titleEn = '';
  let titleOr = '';
  let providerName = '';
  let providerPhone = '';
  let whatsappNumber = '';

  if (item.type === 'service') {
    const w = item.data as WorkerProfile;
    unitPrice = w.dailyRate;
    titleEn = `${w.skillTitleEn} (${w.nameEn})`;
    titleOr = `${w.skillTitleOr} (${w.nameOr})`;
    providerName = w.nameEn;
    providerPhone = w.phone;
    whatsappNumber = w.whatsappNumber;
  } else if (item.type === 'produce') {
    const p = item.data as ProduceItem;
    unitPrice = p.pricePerUnit;
    titleEn = `${p.titleEn} (${quantity} ${p.unit})`;
    titleOr = `${p.titleOr} (${quantity} ${p.unit})`;
    providerName = p.farmerNameEn;
    providerPhone = p.phone;
    whatsappNumber = p.whatsappNumber;
  } else {
    const e = item.data as EquipmentItem;
    unitPrice = e.dailyRate;
    titleEn = `${e.nameEn} Rental (${quantity} Day/s)`;
    titleOr = `${e.nameOr} ଭଡ଼ା (${quantity} ଦିନ)`;
    providerName = e.ownerNameEn;
    providerPhone = e.phone;
    whatsappNumber = e.whatsappNumber;
  }

  const totalPrice = unitPrice * quantity;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || !customerName) return;

    const formattedPhone = customerPhone.replace(/\D/g, '');

    const waText = encodeURIComponent(
      language === 'or'
        ? `*ଗଞ୍ଜାମ ଏକ୍ସପ୍ରେସ୍ ବୁକିଂ ରସିଦ୍*\n\n` +
          `📌 *ସେବା / ସାମଗ୍ରୀ:* ${titleOr}\n` +
          `👤 *ପ୍ରଦାନକାରୀ:* ${providerName}\n` +
          `📅 *ତାରିଖ:* ${date}\n` +
          `⏰ *ସମୟ:* ${timeSlot}\n` +
          `💰 *ମୋଟ ଦେୟ:* ₹${totalPrice} (${paymentMethod})\n` +
          `📍 *ଗ୍ରାହକ:* ${customerName} (${formattedPhone})\n` +
          `🏠 *ଠିକଣା:* ${customerAddress}\n\n` +
          `ଦୟାକରି ଏହି ବୁକିଂ ନିଶ୍ଚିତ କରନ୍ତୁ।`
        : `*GANJAM EXPRESS BOOKING RECEIPT*\n\n` +
          `📌 *Item/Service:* ${titleEn}\n` +
          `👤 *Provider:* ${providerName}\n` +
          `📅 *Date:* ${date}\n` +
          `⏰ *Time Slot:* ${timeSlot}\n` +
          `💰 *Total:* ₹${totalPrice} (${paymentMethod})\n` +
          `📍 *Customer:* ${customerName} (+91 ${formattedPhone})\n` +
          `🏠 *Address:* ${customerAddress}\n\n` +
          `Please confirm this booking.`
    );

    const booking: Booking = {
      id: `bk_${Date.now()}`,
      type: item.type,
      titleEn,
      titleOr,
      providerName,
      providerPhone,
      date,
      timeSlot,
      quantityOrHours: quantity,
      totalPrice,
      status: 'Confirmed',
      paymentMethod,
      customerName,
      customerPhone: formattedPhone,
      customerAddress,
      whatsappMsg: waText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onConfirmBooking(booking);

    // Open WhatsApp
    const waUrl = `https://wa.me/${whatsappNumber}?text=${waText}`;
    window.open(waUrl, '_blank');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg">{t.bookingTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
          {/* Selected Item Card */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-800">
                {item.type === 'service' ? 'Local Service' : item.type === 'produce' ? 'Farm Produce' : 'Equipment Rental'}
              </p>
              <h4 className="font-extrabold text-slate-900 text-sm">
                {language === 'or' ? titleOr : titleEn}
              </h4>
              <p className="text-xs text-slate-600">
                By: <strong className="text-emerald-900">{providerName}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-900">₹{totalPrice}</span>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.selectDate}
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.selectTimeSlot}
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="08:00 AM - 11:00 AM"> Morning (08:00 AM - 11:00 AM)</option>
                <option value="11:00 AM - 02:00 PM"> Noon (11:00 AM - 02:00 PM)</option>
                <option value="02:00 PM - 06:00 PM"> Afternoon (02:00 PM - 06:00 PM)</option>
                <option value="Full Day Work"> Full Day Work (ଦିନ ସାରା)</option>
              </select>
            </div>
          </div>

          {/* Quantity Selector for Produce / Days for Equipment */}
          {item.type !== 'service' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {item.type === 'produce' ? 'Quantity' : 'Number of Days / Hours'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg flex items-center justify-center text-lg"
                >
                  -
                </button>
                <span className="font-mono font-black text-base text-slate-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.yourName} *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Shibani Nahak"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.enterPhone} *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="9861000000"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.yourAddress} *
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. Village: Bada Bazar, Near Police Station, Berhampur"
              rows={2}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.paymentMode}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition ${
                  paymentMethod === 'UPI'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-700" />
                <span>UPI (Google Pay / PhonePe)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition ${
                  paymentMethod === 'COD'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <IndianRupee className="w-5 h-5 text-amber-600" />
                <span>{language === 'or' ? 'କାମ ପରେ ନଗଦ ଦେୟ' : 'Cash After Service'}</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'UPI' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center space-y-1">
              <p className="text-xs font-bold text-amber-900">
                📲 {language === 'or' ? 'UPI ଆଇଡି:' : 'Pay to Ganjam Hub UPI:'}{' '}
                <span className="font-mono text-emerald-800">ganjamexpress@ybl</span>
              </p>
              <p className="text-[11px] text-amber-700">
                {language === 'or' ? 'କାମ ନିଶ୍ଚିତ ହେବା ପରେ ସିଧାସଳଖ UPI ଦ୍ୱାରା ପ୍ରଦାନ କରିପାରିବେ।' : 'Pay directly via Google Pay / PhonePe after order verification.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2"
          >
            <MessageSquareCode className="w-4 h-4 text-amber-300" />
            <span>{t.confirmBooking}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
