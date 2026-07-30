import React from 'react';
import { EquipmentItem, Language } from '../../types';
import { translations } from '../../data/translations';
import { MapPin, Tractor, MessageSquareCode, Calendar, CheckCircle } from 'lucide-react';

interface EquipmentCardProps {
  equipment: EquipmentItem;
  language: Language;
  onBookEquipment: (equipment: EquipmentItem) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  language,
  onBookEquipment,
}) => {
  const t = translations[language];

  // WhatsApp Rent Inquiry
  const waMsg = encodeURIComponent(
    language === 'or'
      ? `ନମସ୍କାର ${equipment.ownerNameOr}, ମୁଁ ଗଞ୍ଜାମ କୃଷି ମଣ୍ଡିରୁ ଆପଣଙ୍କ ${equipment.nameOr} ଭଡ଼ାରେ ନେବାକୁ ଚାହୁଁଛି।`
      : `Hello ${equipment.ownerNameEn}, I saw your ${equipment.nameEn} listed on Ganjam Agri Rental and want to inquire for rental booking.`
  );
  const waUrl = `https://wa.me/${equipment.whatsappNumber}?text=${waMsg}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Image & Rates */}
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={equipment.imageUrl}
            alt={equipment.nameEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {equipment.withOperator && (
            <span className="absolute top-2.5 left-2.5 bg-emerald-800 text-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-amber-400/30">
              <CheckCircle className="w-3 h-3 text-amber-400" />
              <span>{t.withOperatorIncluded}</span>
            </span>
          )}

          <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow border border-amber-400/30">
            ₹{equipment.hourlyRate} <span className="text-[10px] font-normal text-white">{t.perHour}</span> / ₹{equipment.dailyRate} <span className="text-[10px] font-normal text-white">{t.perDay}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
            {language === 'or' ? equipment.nameOr : equipment.nameEn}
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-emerald-800">
              🚜 {language === 'or' ? equipment.ownerNameOr : equipment.ownerNameEn}
            </span>
            <div className="flex items-center text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 mr-1" />
              <span className="truncate max-w-[120px]">
                {language === 'or' ? equipment.locationOr : equipment.locationEn}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
            {language === 'or' ? equipment.specsOr : equipment.specsEn}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <MessageSquareCode className="w-3.5 h-3.5 text-emerald-200" />
          <span>{t.bookWhatsApp}</span>
        </a>

        <button
          onClick={() => onBookEquipment(equipment)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t.rentNow}</span>
        </button>
      </div>
    </div>
  );
};
