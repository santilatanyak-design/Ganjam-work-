import React from 'react';
import { ProduceItem, Language } from '../../types';
import { translations } from '../../data/translations';
import { MapPin, ShoppingBag, MessageSquareCode, Leaf } from 'lucide-react';

interface ProduceCardProps {
  produce: ProduceItem;
  language: Language;
  onOrderNow: (produce: ProduceItem) => void;
}

export const ProduceCard: React.FC<ProduceCardProps> = ({
  produce,
  language,
  onOrderNow,
}) => {
  const t = translations[language];

  // WhatsApp Order message
  const waMsg = encodeURIComponent(
    language === 'or'
      ? `ନମସ୍କାର ${produce.farmerNameOr}, ମୁଁ ଗଞ୍ଜାମ ମଣ୍ଡିରୁ ଆପଣଙ୍କ ${produce.titleOr} (ଦର ₹${produce.pricePerUnit}/${produce.unit}) କିଣିବାକୁ ଚାହୁଁଛି।`
      : `Hello ${produce.farmerNameEn}, I want to order your ${produce.titleEn} (Price: ₹${produce.pricePerUnit}/${produce.unit}) listed on Ganjam Mandi.`
  );
  const waUrl = `https://wa.me/${produce.whatsappNumber}?text=${waMsg}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Image & Badges */}
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={produce.imageUrl}
            alt={produce.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {produce.isOrganic && (
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Leaf className="w-3 h-3 text-amber-300" />
                <span>{t.organicBadge}</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 font-black text-sm px-2.5 py-1 rounded-xl shadow border border-amber-400/30">
            ₹{produce.pricePerUnit} <span className="text-xs font-normal text-white">/ {produce.unit}</span>
          </div>
        </div>

        {/* Info Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
            {language === 'or' ? produce.titleOr : produce.titleEn}
          </h3>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-emerald-800">
              🌾 {language === 'or' ? produce.farmerNameOr : produce.farmerNameEn}
            </span>
            <div className="flex items-center text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 mr-1" />
              <span className="truncate max-w-[120px]">
                {language === 'or' ? produce.locationOr : produce.locationEn}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {language === 'or' ? produce.descriptionOr : produce.descriptionEn}
          </p>

          <div className="flex items-center justify-between text-[11px] bg-emerald-50 p-2 rounded-lg text-emerald-900 font-medium">
            <span>{t.minOrder}: <strong>{produce.minOrderQty} {produce.unit}</strong></span>
            <span>{language === 'or' ? 'ଉପଲବ୍ଧ:' : 'In Stock:'} <strong>{produce.availableQty} {produce.unit}</strong></span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <MessageSquareCode className="w-3.5 h-3.5 text-emerald-200" />
          <span>{t.whatsappOrder}</span>
        </a>

        <button
          onClick={() => onOrderNow(produce)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t.buyDirect}</span>
        </button>
      </div>
    </div>
  );
};
