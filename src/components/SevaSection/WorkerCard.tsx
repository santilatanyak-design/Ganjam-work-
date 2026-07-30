import React from 'react';
import { WorkerProfile, Language } from '../../types';
import { translations } from '../../data/translations';
import { WorkerPhotoGallery } from './WorkerPhotoGallery';
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  PhoneCall, 
  MessageSquareCode, 
  Clock, 
  Award,
  ChevronRight,
  ShieldCheck,
  Share2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Unlock,
  Lock
} from 'lucide-react';

interface WorkerCardProps {
  worker: WorkerProfile;
  language: Language;
  onSelectWorker: (worker: WorkerProfile) => void;
  onBookNow: (worker: WorkerProfile) => void;
  onShareWorker: (worker: WorkerProfile) => void;
  bookingStatus?: 'approved' | 'pending' | 'rejected' | 'none';
  onRequestContact?: (worker: WorkerProfile, action: 'call' | 'whatsapp') => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  language,
  onSelectWorker,
  onBookNow,
  onShareWorker,
  bookingStatus = 'none',
  onRequestContact
}) => {
  const t = translations[language];

  // Status check (default to approved if not specified)
  const isRejected = worker.approvalStatus === 'rejected';
  const isApproved = worker.approvalStatus === 'approved' || !worker.approvalStatus;

  // Generate WhatsApp Direct Link
  const waMsg = encodeURIComponent(
    language === 'or'
      ? `ନମସ୍କାର ${worker.nameOr}, ମୁଁ ଗଞ୍ଜାମ ଏକ୍ସପ୍ରେସ୍‌ରୁ ଆପଣଙ୍କ ${worker.skillTitleOr} କାମ ବିଷୟରେ ଜାଣି ବୁକିଂ କରିବାକୁ ଚାହୁଁଛି।`
      : `Hello ${worker.nameEn}, I saw your service profile on Ganjam Express and want to book your ${worker.skillTitleEn} services.`
  );
  const waUrl = `https://wa.me/${worker.whatsappNumber}?text=${waMsg}`;

  const isContactUnlocked = bookingStatus === 'approved';
  const isContactPending = bookingStatus === 'pending';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    if (!isContactUnlocked) {
      e.preventDefault();
      if (onRequestContact) {
        onRequestContact(worker, 'whatsapp');
      }
    }
  };

  const handleCallClick = (e: React.MouseEvent) => {
    if (!isContactUnlocked) {
      e.preventDefault();
      if (onRequestContact) {
        onRequestContact(worker, 'call');
      }
    }
  };

  return (
    <div className={`bg-white rounded-2xl border-2 ${isRejected ? 'border-red-400 bg-red-50/20 shadow-md' : 'border-slate-200/80 shadow-sm hover:shadow-xl'} transition-all duration-200 flex flex-col justify-between overflow-hidden group relative`}>
      
      {/* Prominent Verification Status Banner */}
      {isRejected ? (
        <div className="bg-red-600 text-white px-3.5 py-1.5 flex items-center justify-between gap-1 shadow-md">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-widest text-white">
            <XCircle className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>REJECTED</span>
          </div>
          <span className="text-[10px] font-extrabold bg-red-900/80 text-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {language === 'or' ? 'ଅସ୍ୱୀକୃତ' : 'WARNING SIGNAL'}
          </span>
        </div>
      ) : (
        <div className="bg-emerald-800 text-white px-3.5 py-1.5 flex items-center justify-between gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-widest text-amber-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>APPROVED</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {language === 'or' ? 'ସମ୍ମତି ପ୍ରାପ୍ତ' : 'VERIFIED PRO'}
          </span>
        </div>
      )}

      {/* Top Card Body */}
      <div className="p-5">
        {/* Header: Photo, Name & Share Button */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-grow">
            <div className="relative flex-shrink-0">
              <img
                src={worker.photoUrl}
                alt={worker.nameEn}
                className={`w-16 h-16 aspect-square rounded-2xl object-cover border-2 ${isRejected ? 'border-red-400 grayscale-30' : 'border-emerald-100'} shadow-sm group-hover:scale-105 transition-transform`}
                style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
              />
              {isApproved && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full border-2 border-white" title={t.verified}>
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              )}
              {isRejected && (
                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-0.5 rounded-full border-2 border-white" title="Rejected Profile">
                  <XCircle className="w-3.5 h-3.5 text-amber-300" />
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h3 className="font-extrabold text-slate-900 text-base leading-snug truncate">
                  {language === 'or' ? worker.nameOr : worker.nameEn}
                </h3>
                {worker.isTopRated && isApproved && (
                  <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                    ★ {t.topRated}
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-emerald-800 line-clamp-1">
                {language === 'or' ? worker.skillTitleOr : worker.skillTitleEn}
              </p>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{worker.rating}</span>
                  <span className="text-slate-400 font-normal ml-1">({worker.reviewCount})</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center text-slate-500">
                  <Award className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span>{worker.experienceYears} {t.experience}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Share Button on Header */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareWorker(worker);
            }}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200/80 shadow-sm transition active:scale-95 flex items-center justify-center flex-shrink-0"
            title={language === 'or' ? 'ଶ୍ରମିକ ପ୍ରୋଫାଇଲ୍ ଶେୟାର କରନ୍ତୁ' : 'Share Worker Profile'}
          >
            <Share2 className="w-4 h-4 text-emerald-800" />
          </button>
        </div>

        {/* Location & Rates */}
        <div className={`p-3 rounded-xl space-y-1.5 my-3 border ${isRejected ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center text-xs text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 mr-1.5 flex-shrink-0" />
            <span className="truncate">{language === 'or' ? worker.locationOr : worker.locationEn}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="text-slate-500">{t.dailyRateLabel}:</span>
            <span className="font-extrabold text-emerald-900 text-sm">
              ₹{worker.dailyRate} <span className="text-[11px] font-normal text-slate-500">{t.perDay}</span>
            </span>
          </div>
        </div>

        {/* Short Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {language === 'or' ? worker.bioOr : worker.bioEn}
        </p>

        {/* 5-Photo Work Samples Gallery */}
        <WorkerPhotoGallery
          photos={worker.photos}
          mainPhotoUrl={worker.photoUrl}
          workerName={language === 'or' ? worker.nameOr : worker.nameEn}
          language={language}
          compact={true}
        />
      </div>

      {/* Card Action Footer */}
      <div className="bg-slate-50/80 p-3 border-t border-slate-100 space-y-2">
        {/* Direct Action Row: WhatsApp & Call */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={isContactUnlocked ? waUrl : '#'}
            target={isContactUnlocked ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className={`flex items-center justify-center gap-1.5 ${
              isContactUnlocked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : isContactPending
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                : 'bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold'
            } py-2 px-2 rounded-xl text-xs shadow-sm transition active:scale-95`}
          >
            {isContactUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-amber-300" />
            ) : isContactPending ? (
              <Clock className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-300" />
            )}
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span className="truncate">
              {isContactUnlocked
                ? 'WhatsApp'
                : isContactPending
                ? (language === 'or' ? 'ପେଣ୍ଡିଂ...' : 'Pending')
                : (language === 'or' ? 'ଅନୁରୋଧ କରନ୍ତୁ' : 'Request WA')}
            </span>
          </a>

          <a
            href={isContactUnlocked ? `tel:${worker.phone}` : '#'}
            onClick={handleCallClick}
            className={`flex items-center justify-center gap-1.5 ${
              isContactUnlocked
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : isContactPending
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-white font-bold'
            } py-2 px-2 rounded-xl text-xs transition active:scale-95`}
          >
            {isContactUnlocked ? (
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            ) : isContactPending ? (
              <Clock className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="truncate">
              {isContactUnlocked
                ? t.callNow
                : isContactPending
                ? (language === 'or' ? 'ପେଣ୍ଡିଂ...' : 'Pending')
                : (language === 'or' ? 'କଲ୍ ଅନୁରୋଧ' : 'Request Call')}
            </span>
          </a>
        </div>

        {/* View Profile & Share Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectWorker(worker)}
            className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition"
          >
            <span>{t.viewProfile}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => onShareWorker(worker)}
            className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
            title={language === 'or' ? 'ଶେୟାର କରନ୍ତୁ' : 'Share Worker Details'}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'or' ? 'ଶେୟାର' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
