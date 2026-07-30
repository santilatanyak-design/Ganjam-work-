import React, { useState } from 'react';
import { ProduceItem, EquipmentItem, Language, AgriCategory } from '../../types';
import { translations } from '../../data/translations';
import { X, Sprout, Tractor, Plus, Leaf, MapPin } from 'lucide-react';
import { ganjamTehsils } from '../../data/mockData';

interface AddProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddProduce: (produce: ProduceItem) => void;
  onAddEquipment: (equipment: EquipmentItem) => void;
}

export const AddProduceModal: React.FC<AddProduceModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddProduce,
  onAddEquipment,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const [listingType, setListingType] = useState<'produce' | 'equipment'>('produce');

  // Produce State
  const [titleEn, setTitleEn] = useState('');
  const [titleOr, setTitleOr] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Berhampur');
  const [category, setCategory] = useState<AgriCategory>('vegetables');
  const [pricePerUnit, setPricePerUnit] = useState(30);
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'piece' | 'bag' | 'jar'>('kg');
  const [minOrderQty, setMinOrderQty] = useState(5);
  const [availableQty, setAvailableQty] = useState(100);
  const [isOrganic, setIsOrganic] = useState(true);
  const [descOr, setDescOr] = useState('');

  // Equipment State
  const [eqNameEn, setEqNameEn] = useState('');
  const [eqNameOr, setEqNameOr] = useState('');
  const [hourlyRate, setHourlyRate] = useState(450);
  const [dailyRate, setDailyRate] = useState(3000);
  const [withOperator, setWithOperator] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    const cleanWa = phone.replace(/\D/g, '');
    const wa = cleanWa.startsWith('91') ? cleanWa : `91${cleanWa}`;

    if (listingType === 'produce') {
      if (!titleEn) return;
      const newProduce: ProduceItem = {
        id: `p_${Date.now()}`,
        titleEn,
        titleOr: titleOr || titleEn,
        farmerNameEn: farmerName || 'Ganjam Farmer',
        farmerNameOr: farmerName || 'ଗଞ୍ଜାମ ଚାଷୀ',
        phone: `+91${cleanWa}`,
        whatsappNumber: wa,
        locationEn: `${location} (Ganjam)`,
        locationOr: `${location} (ଗଞ୍ଜାମ)`,
        category,
        pricePerUnit: Number(pricePerUnit),
        unit,
        minOrderQty: Number(minOrderQty),
        availableQty: Number(availableQty),
        imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=500",
        descriptionEn: "Fresh local produce harvested directly from farm.",
        descriptionOr: descOr || "ଖେତରୁ ସିଧାସଳଖ ତୋଳାଯାଇଥିବା ତାଜା ଫସଲ।",
        isOrganic
      };
      onAddProduce(newProduce);
    } else {
      if (!eqNameEn) return;
      const newEquipment: EquipmentItem = {
        id: `e_${Date.now()}`,
        nameEn: eqNameEn,
        nameOr: eqNameOr || eqNameEn,
        category: 'tractor',
        ownerNameEn: farmerName || 'Equipment Owner',
        ownerNameOr: farmerName || 'ମେସିନ୍ ମାଲିକ',
        phone: `+91${cleanWa}`,
        whatsappNumber: wa,
        locationEn: `${location} (Ganjam)`,
        locationOr: `${location} (ଗଞ୍ଜାମ)`,
        hourlyRate: Number(hourlyRate),
        dailyRate: Number(dailyRate),
        withOperator,
        imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=500",
        specsEn: "Heavy duty machinery available for farm work.",
        specsOr: "ଜମି କାମ ପାଇଁ ଚାଷ ମେସିନ୍ ଉପଲବ୍ଧ।",
        isAvailable: true
      };
      onAddEquipment(newEquipment);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <Sprout className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg">{t.addProduceTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Toggle Type */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setListingType('produce')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                listingType === 'produce'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>{language === 'or' ? 'ଫସଲ / ସାମଗ୍ରୀ' : 'Farm Produce'}</span>
            </button>

            <button
              type="button"
              onClick={() => setListingType('equipment')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                listingType === 'equipment'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>{language === 'or' ? 'କୃଷି ମେସିନ୍/ଟ୍ରାକ୍ଟର' : 'Machinery Rental'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'or' ? 'ଆପଣଙ୍କ ନାମ' : 'Your Name'} *
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Gouranga Panda"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9861000000"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.locationTehsil}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {ganjamTehsils.map((tehsil) => (
                <option key={tehsil} value={tehsil}>
                  {tehsil}
                </option>
              ))}
            </select>
          </div>

          {listingType === 'produce' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Crop Name (English) *
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Fresh Green Brinjal"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ଫସଲର ନାମ (ଓଡ଼ିଆରେ)
                  </label>
                  <input
                    type="text"
                    value={titleOr}
                    onChange={(e) => setTitleOr(e.target.value)}
                    placeholder="ଉଦାହରଣ: ତାଜା ସବୁଜ ବାଇଗଣ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AgriCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="vegetables">{t.catVeg}</option>
                    <option value="grains_rice">{t.catGrains}</option>
                    <option value="fruits">{t.catFruits}</option>
                    <option value="cashew_nuts">{t.catCashew}</option>
                    <option value="homemade">{t.catHomemade}</option>
                    <option value="seeds_fertilizer">{t.catSeeds}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="kg">per kg</option>
                    <option value="quintal">per quintal</option>
                    <option value="piece">per piece</option>
                    <option value="bag">per bag</option>
                    <option value="jar">per jar</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  id="organic"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="organic" className="text-xs font-bold text-emerald-900 cursor-pointer">
                  {language === 'or' ? 'ଏହା ଜୈବିକ ଫାର୍ମ ଫସଲ (୧୦୦% Organic)' : '100% Organic Farm Produce'}
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Machinery Name (English) *
                  </label>
                  <input
                    type="text"
                    value={eqNameEn}
                    onChange={(e) => setEqNameEn(e.target.value)}
                    placeholder="e.g. Swaraj 744 FE Tractor"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ମେସିନର ନାମ (ଓଡ଼ିଆରେ)
                  </label>
                  <input
                    type="text"
                    value={eqNameOr}
                    onChange={(e) => setEqNameOr(e.target.value)}
                    placeholder="ଉଦାହରଣ: ସ୍ୱରାଜ ଟ୍ରାକ୍ଟର ଓ ରୋଟାଭେଟର"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hourly Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition text-sm shadow-md"
          >
            {language === 'or' ? 'ତାଲିକାଭୁକ୍ତ କରନ୍ତୁ' : 'Submit Mandi Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};
