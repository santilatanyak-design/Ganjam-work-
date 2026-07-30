import React, { useState } from 'react';
import { WorkerProfile, Language, ServiceCategory } from '../../types';
import { translations } from '../../data/translations';
import { X, UserPlus, MapPin, Phone, Briefcase, IndianRupee } from 'lucide-react';
import { CascadingLocationSelector, LocationSelection } from '../CascadingLocationSelector';

interface RegisterWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddWorker: (worker: WorkerProfile) => void;
}

export const RegisterWorkerModal: React.FC<RegisterWorkerModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddWorker,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const [nameEn, setNameEn] = useState('');
  const [nameOr, setNameOr] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('electrician');
  const [skillTitleEn, setSkillTitleEn] = useState('');
  const [skillTitleOr, setSkillTitleOr] = useState('');
  const [phone, setPhone] = useState('');
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({
    blockEn: 'Bhanjanagar',
    blockOr: 'ଭଞ୍ଜନଗର',
    villageEn: 'Bhanjanagar',
    villageOr: 'ଭଞ୍ଜନଗର',
    pincode: '761126',
    formattedLocationEn: 'Bhanjanagar, Bhanjanagar Block - 761126',
    formattedLocationOr: 'ଭଞ୍ଜନଗର, ଭଞ୍ଜନଗର ବ୍ଲକ୍ - 761126'
  });
  const [dailyRate, setDailyRate] = useState(500);
  const [hourlyRate, setHourlyRate] = useState(100);
  const [experienceYears, setExperienceYears] = useState(5);
  const [bioEn, setBioEn] = useState('');
  const [bioOr, setBioOr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !phone) return;

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const cleanWa = phone.replace(/\D/g, '');

    const newWorker: WorkerProfile = {
      id: `w_${Date.now()}`,
      nameEn,
      nameOr: nameOr || nameEn,
      category,
      skillTitleEn: skillTitleEn || 'Skilled Service Worker',
      skillTitleOr: skillTitleOr || 'ଦକ୍ଷ ମିସ୍ତ୍ରୀ',
      phone: formattedPhone,
      whatsappNumber: cleanWa.startsWith('91') ? cleanWa : `91${cleanWa}`,
      locationEn: locationSelection.formattedLocationEn || 'Bhanjanagar, Bhanjanagar Block - 761126',
      locationOr: locationSelection.formattedLocationOr || 'ଭଞ୍ଜନଗର, ଭଞ୍ଜନଗର ବ୍ଲକ୍ - 761126',
      photoUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400",
      rating: 5.0,
      reviewCount: 1,
      dailyRate: Number(dailyRate),
      hourlyRate: Number(hourlyRate),
      experienceYears: Number(experienceYears),
      isVerified: true,
      languagesSpoken: ["Odia", "Hindi"],
      bioEn: bioEn || "Local skilled provider in Ganjam.",
      bioOr: bioOr || "ଗଞ୍ଜାମର ଦକ୍ଷ କାରିଗର।",
      isAvailable: true,
      reviews: []
    };

    onAddWorker(newWorker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg">{t.registerWorkerTitle}</h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Name in English *
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Krushna Chandra Behera"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ନାମ (ଓଡ଼ିଆରେ)
              </label>
              <input
                type="text"
                value={nameOr}
                onChange={(e) => setNameOr(e.target.value)}
                placeholder="ଉଦାହରଣ: କୃଷ୍ଣ ଚନ୍ଦ୍ର ବେହେରା"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.selectCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="electrician">{t.catElectrician}</option>
                <option value="plumber">{t.catPlumber}</option>
                <option value="carpenter">{t.catCarpenter}</option>
                <option value="painter">{t.catPainter}</option>
                <option value="laborer">{t.catLaborer}</option>
                <option value="mechanic">{t.catMechanic}</option>
                <option value="mason">{t.catMason}</option>
                <option value="ac_appliance">{t.catAcAppliance}</option>
                <option value="driver">{t.catDriver}</option>
              </select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skill Title (English)
              </label>
              <input
                type="text"
                value={skillTitleEn}
                onChange={(e) => setSkillTitleEn(e.target.value)}
                placeholder="e.g. Master Plumber & Motor Expert"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                କାମର ଶୀର୍ଷକ (ଓଡ଼ିଆ)
              </label>
              <input
                type="text"
                value={skillTitleOr}
                onChange={(e) => setSkillTitleOr(e.target.value)}
                placeholder="ଉଦାହରଣ: ପ୍ଲମ୍ବର ଓ ମୋଟର ମିସ୍ତ୍ରୀ"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cascading Block, Village, Pincode Location Selector */}
          <CascadingLocationSelector
            onChange={(sel) => setLocationSelection(sel)}
            language={language}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Rate (₹)
              </label>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Experience (Yrs)
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description / ଅଭିଜ୍ଞତା ବିବରଣୀ
            </label>
            <textarea
              value={bioOr}
              onChange={(e) => setBioOr(e.target.value)}
              placeholder="ଆପଣ କେଉଁ କେଉଁ କାମ କରନ୍ତି ଓ କେତେ ବର୍ଷର ଅଭିଜ୍ଞତା ରହିଛି..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition text-sm shadow-md"
          >
            {language === 'or' ? 'ପ୍ରୋଫାଇଲ୍ ଯୋଡ଼ନ୍ତୁ' : 'Submit Worker Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};
