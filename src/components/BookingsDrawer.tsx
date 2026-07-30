import React from 'react';
import { Booking, Language } from '../types';
import { translations } from '../data/translations';
import { X, ShoppingBag, Calendar, Clock, MapPin, MessageSquareCode, CheckCircle2 } from 'lucide-react';

interface BookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
}

export const BookingsDrawer: React.FC<BookingsDrawerProps> = ({
  isOpen,
  onClose,
  language,
  bookings,
  onCancelBooking,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base sm:text-lg">{t.myBookings}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 overflow-y-auto space-y-3">
          {bookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">
                {language === 'or' ? 'ଆପଣଙ୍କର କୌଣସି ସକ୍ରିୟ ବୁକିଂ ବା ଅର୍ଡର ନାହିଁ।' : 'You have no active bookings or produce orders yet.'}
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 relative shadow-sm hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                      {b.type === 'service' ? 'Local Service' : b.type === 'produce' ? 'Farm Produce' : 'Equipment Rental'}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                      {language === 'or' ? b.titleOr : b.titleEn}
                    </h4>
                  </div>
                  <span className="font-black text-emerald-900 text-base">₹{b.totalPrice}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                  <p>👤 <strong>{language === 'or' ? 'ପ୍ରଦାନକାରୀ:' : 'Provider:'}</strong> {b.providerName}</p>
                  <p>📅 <strong>{language === 'or' ? 'ତାରିଖ:' : 'Date:'}</strong> {b.date} ({b.timeSlot})</p>
                  <p>📍 <strong>{language === 'or' ? 'ଠିକଣା:' : 'Address:'}</strong> {b.customerAddress}</p>
                  <p>💳 <strong>{language === 'or' ? 'ପେମେଣ୍ଟ:' : 'Payment:'}</strong> {b.paymentMethod}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={`https://wa.me/?text=${b.whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5 text-emerald-200" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                  >
                    {language === 'or' ? 'ବାତିଲ୍ କରନ୍ତୁ' : 'Cancel'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
