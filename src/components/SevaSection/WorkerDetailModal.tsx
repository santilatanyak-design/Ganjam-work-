import React, { useState } from 'react';
import { WorkerProfile, Language, Review } from '../../types';
import { translations } from '../../data/translations';
import { WorkerPhotoGallery } from './WorkerPhotoGallery';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Award, 
  Calendar, 
  Clock, 
  Send,
  UserCheck,
  Share2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Unlock,
  Lock
} from 'lucide-react';

interface WorkerDetailModalProps {
  worker: WorkerProfile | null;
  onClose: () => void;
  language: Language;
  onAddReview: (workerId: string, review: Omit<Review, 'id' | 'workerId' | 'date'>) => void;
  onOpenBooking: (worker: WorkerProfile) => void;
  onShareWorker: (worker: WorkerProfile) => void;
  bookingStatus?: 'approved' | 'pending' | 'rejected' | 'none';
  onRequestContact?: (worker: WorkerProfile, action: 'call' | 'whatsapp') => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  onClose,
  language,
  onAddReview,
  onOpenBooking,
  onShareWorker,
  bookingStatus = 'none',
  onRequestContact
}) => {
  if (!worker) return null;

  const t = translations[language];
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  const isRejected = worker.approvalStatus === 'rejected';
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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName || !newComment) return;

    onAddReview(worker.id, {
      userName: newReviewerName,
      rating: newRating,
      comment: newComment
    });

    setSubmittedMessage(
      language === 'or' ? 'ମତାମତ ପୋଷ୍ଟ ହୋଇଗଲା! ଧନ୍ୟବାଦ।' : 'Review posted successfully! Thank you.'
    );
    setNewReviewerName('');
    setNewComment('');
    setTimeout(() => setSubmittedMessage(''), 3000);
  };

  const waMsg = encodeURIComponent(
    language === 'or'
      ? `ନମସ୍କାର ${worker.nameOr}, ମୁଁ ଗଞ୍ଜାମ ଏକ୍ସପ୍ରେସ୍‌ରୁ ଆପଣଙ୍କ ${worker.skillTitleOr} କାମ ବିଷୟରେ ଜାଣି ବୁକିଂ କରିବାକୁ ଚାହୁଁଛି।`
      : `Hello ${worker.nameEn}, I saw your profile on Ganjam Express and want to book your ${worker.skillTitleEn} service.`
  );
  const waUrl = `https://wa.me/${worker.whatsappNumber}?text=${waMsg}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Prominent Admin Status Banner */}
        {isRejected ? (
          <div className="bg-red-600 text-white p-3 font-black text-xs sm:text-sm uppercase flex items-center justify-between tracking-widest border-b-2 border-red-800 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-300 animate-pulse flex-shrink-0" />
              <span>STATUS: REJECTED (ADMIN WARNING SIGNAL)</span>
            </div>
            <span className="bg-red-950 text-amber-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-extrabold border border-red-500">
              NOT VERIFIED
            </span>
          </div>
        ) : (
          <div className="bg-emerald-800 text-white p-2.5 font-black text-xs uppercase flex items-center justify-between tracking-wider border-b border-emerald-950 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>STATUS: APPROVED</span>
            </div>
            <span className="bg-emerald-950 text-emerald-200 text-[10px] px-2 py-0.5 rounded-md font-extrabold border border-emerald-700">
              OFFICIALLY VERIFIED PRO
            </span>
          </div>
        )}

        {/* Header */}
        <div className={`${isRejected ? 'bg-red-950' : 'bg-emerald-900'} text-white p-5 flex items-start justify-between sticky top-0 z-10`}>
          <div className="flex items-center gap-3">
            <img
              src={worker.photoUrl}
              alt={worker.nameEn}
              className={`w-14 h-14 aspect-square rounded-2xl object-cover border-2 ${isRejected ? 'border-red-400' : 'border-emerald-300'}`}
              style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
            />
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>{language === 'or' ? worker.nameOr : worker.nameEn}</span>
                {!isRejected && worker.isVerified && (
                  <CheckCircle className="w-4 h-4 text-amber-400" title={t.verified} />
                )}
                {isRejected && (
                  <XCircle className="w-4 h-4 text-red-400" title="Rejected Profile" />
                )}
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                {language === 'or' ? worker.skillTitleOr : worker.skillTitleEn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShareWorker(worker)}
              className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-600 transition"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'or' ? 'ଶେୟାର' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-emerald-300 hover:text-white p-1.5 rounded-xl hover:bg-emerald-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{t.rating}</p>
              <p className="text-sm font-black text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                ★ {worker.rating} <span className="text-xs text-slate-400 font-normal">({worker.reviewCount})</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{t.experience}</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{worker.experienceYears} Years</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{t.dailyRateLabel}</p>
              <p className="text-sm font-black text-emerald-800 mt-0.5">₹{worker.dailyRate}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{t.hourlyRateLabel}</p>
              <p className="text-sm font-black text-emerald-800 mt-0.5">₹{worker.hourlyRate}</p>
            </div>
          </div>

          {/* Location & Languages */}
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>
                <strong>{t.locationTehsil}:</strong> {language === 'or' ? worker.locationOr : worker.locationEn}
              </span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                <strong>{language === 'or' ? 'କୁହାଯାଉଥିବା ଭାଷା:' : 'Languages Spoken:'}</strong>{' '}
                {worker.languagesSpoken.join(', ')}
              </span>
            </div>
          </div>

          {/* Detailed Bio */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">
              {language === 'or' ? 'କାରିଗରଙ୍କ ବିଷୟରେ:' : 'About Service Provider:'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {language === 'or' ? worker.bioOr : worker.bioEn}
            </p>
          </div>

          {/* 5-Photo Gallery Carousel */}
          <WorkerPhotoGallery
            photos={worker.photos}
            mainPhotoUrl={worker.photoUrl}
            workerName={language === 'or' ? worker.nameOr : worker.nameEn}
            language={language}
            compact={false}
          />

          {/* Action Call-to-Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href={isContactUnlocked ? waUrl : '#'}
              target={isContactUnlocked ? '_blank' : '_self'}
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className={`${
                isContactUnlocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : isContactPending
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold'
              } font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition`}
            >
              {isContactUnlocked ? (
                <Unlock className="w-4 h-4 text-amber-300" />
              ) : isContactPending ? (
                <Clock className="w-4 h-4 text-slate-950 animate-pulse" />
              ) : (
                <Lock className="w-4 h-4 text-amber-300" />
              )}
              <MessageSquare className="w-4 h-4" />
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
              className={`${
                isContactUnlocked
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : isContactPending
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-white font-bold'
              } font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition`}
            >
              {isContactUnlocked ? (
                <Phone className="w-4 h-4 text-amber-400" />
              ) : isContactPending ? (
                <Clock className="w-4 h-4 text-slate-950 animate-pulse" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400" />
              )}
              <span className="truncate">
                {isContactUnlocked
                  ? t.callNow
                  : isContactPending
                  ? (language === 'or' ? 'ପେଣ୍ଡିଂ...' : 'Pending')
                  : (language === 'or' ? 'କଲ୍ ଅନୁରୋଧ' : 'Request Call')}
              </span>
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenBooking(worker);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.bookNow}</span>
            </button>

            <button
              onClick={() => onShareWorker(worker)}
              className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'or' ? 'ଶେୟାର' : 'Share'}</span>
            </button>
          </div>

          {/* Customer Reviews Section */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>{language === 'or' ? 'ଗ୍ରାହକ ମତାମତ ଓ ରେଟିଂ' : 'Customer Reviews'} ({worker.reviews.length})</span>
            </h4>

            {submittedMessage && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 font-semibold">
                {submittedMessage}
              </div>
            )}

            {/* List Reviews */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {worker.reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {language === 'or' ? 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ମତାମତ ନାହିଁ। ପ୍ରଥମ ମତାମତ ଦିଅନ୍ତୁ!' : 'No reviews yet. Be the first to review!'}
                </p>
              ) : (
                worker.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{rev.userName}</span>
                      <span className="text-amber-500 font-bold">★ {rev.rating}/5</span>
                    </div>
                    <p className="text-xs text-slate-600">{rev.comment}</p>
                    <p className="text-[10px] text-slate-400">{rev.date}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h5 className="font-bold text-xs text-slate-800">{t.writeReview}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newReviewerName}
                  onChange={(e) => setNewReviewerName(e.target.value)}
                  placeholder={language === 'or' ? 'ଆପଣଙ୍କ ନାମ' : 'Your Name'}
                  required
                  className="bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-amber-600"
                >
                  <option value={5}>★★★★★ (5/5)</option>
                  <option value={4}>★★★★☆ (4/5)</option>
                  <option value={3}>★★★☆☆ (3/5)</option>
                </select>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'or' ? 'ଆପଣଙ୍କର ଅଭିଜ୍ଞତା ଓ କାମ ସମ୍ପର୍କରେ ଲେଖନ୍ତୁ...' : 'Write your feedback about the worker...'}
                rows={2}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'or' ? 'ମତାମତ ପୋଷ୍ଟ କରନ୍ତୁ' : 'Submit Review'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
