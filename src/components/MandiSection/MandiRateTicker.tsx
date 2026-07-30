import React, { useState } from 'react';
import { MandiRate, Language } from '../../types';
import { translations } from '../../data/translations';
import { TrendingUp, TrendingDown, Minus, Search, Store, Clock, RefreshCw } from 'lucide-react';

interface MandiRateTickerProps {
  rates: MandiRate[];
  language: Language;
}

export const MandiRateTicker: React.FC<MandiRateTickerProps> = ({
  rates,
  language,
}) => {
  const t = translations[language];
  const [filterQuery, setFilterQuery] = useState('');

  const filteredRates = rates.filter((r) => {
    const q = filterQuery.toLowerCase();
    return (
      r.cropEn.toLowerCase().includes(q) ||
      r.cropOr.includes(q) ||
      r.marketEn.toLowerCase().includes(q) ||
      r.marketOr.includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
      {/* Title & Refresh Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>{t.ratesTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">{t.ratesSub}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={language === 'or' ? 'ଫସଲ କିମ୍ବା ହାଟ ଖୋଜନ୍ତୁ...' : 'Filter by crop or mandi...'}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-700" />
            <span>{t.lastUpdated}</span>
          </span>
        </div>
      </div>

      {/* Rates Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-950 text-emerald-100 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4 rounded-tl-xl">{language === 'or' ? 'ଫସଲ / ସାମଗ୍ରୀ' : 'Crop / Commodity'}</th>
              <th className="py-3 px-4">{t.marketName}</th>
              <th className="py-3 px-4">{t.modalPrice}</th>
              <th className="py-3 px-4">{t.priceRange}</th>
              <th className="py-3 px-4 rounded-tr-xl">{language === 'or' ? 'ଟ୍ରେଣ୍ଡ (ବଦଳ)' : 'Trend'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {filteredRates.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                  {language === 'or' ? 'କୌଣସି ଦର ମିଳିଲା ନାହିଁ।' : 'No commodity rates found matching search.'}
                </td>
              </tr>
            ) : (
              filteredRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                  {/* Crop Name */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    {language === 'or' ? rate.cropOr : rate.cropEn}
                  </td>

                  {/* Market */}
                  <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span>{language === 'or' ? rate.marketOr : rate.marketEn}</span>
                  </td>

                  {/* Modal Price */}
                  <td className="py-3.5 px-4 font-black text-emerald-900 text-sm">
                    ₹{rate.modalPrice.toLocaleString()}
                    <span className="text-[10px] text-slate-400 font-normal block">/ {rate.unit}</span>
                  </td>

                  {/* Price Range */}
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    ₹{rate.minPrice.toLocaleString()} - ₹{rate.maxPrice.toLocaleString()}
                  </td>

                  {/* Trend Badge */}
                  <td className="py-3.5 px-4">
                    {rate.trend === 'up' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        <TrendingUp className="w-3 h-3 text-emerald-700" />
                        +₹{rate.changeAmount}
                      </span>
                    )}
                    {rate.trend === 'down' && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        <TrendingDown className="w-3 h-3 text-red-600" />
                        -₹{Math.abs(rate.changeAmount)}
                      </span>
                    )}
                    {rate.trend === 'stable' && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                        <Minus className="w-3 h-3 text-slate-500" />
                        {language === 'or' ? 'ସ୍ଥିର' : 'Stable'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
