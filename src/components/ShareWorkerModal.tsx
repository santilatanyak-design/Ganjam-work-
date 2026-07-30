import React, { useState } from 'react';
import { WorkerProfile, Language } from '../types';
import { getWorkerShareDetails, getWorkerShareUrl, updateOgMetaTags } from '../utils/shareUtils';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageSquareCode, 
  Facebook, 
  MapPin, 
  Briefcase, 
  User, 
  ExternalLink,
  Sparkles,
  Award
} from 'lucide-react';

interface ShareWorkerModalProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ShareWorkerModal: React.FC<ShareWorkerModalProps> = ({
  worker,
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen || !worker) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Update OG meta tags on modal open
  updateOgMetaTags(worker, language);

  const name = language === 'or' ? worker.nameOr : worker.nameEn;
  const profession = language === 'or' ? worker.skillTitleOr : worker.skillTitleEn;
  const location = language === 'or' ? worker.locationOr : worker.locationEn;
  
  const shareDetails = getWorkerShareDetails(worker, language);
  const shareUrl = getWorkerShareUrl(worker.id);

  // WhatsApp Share URL
  const waShareMsg = encodeURIComponent(
    `👷‍♂️ *${name}* (${profession})\n📍 *Location:* ${location}, Ganjam, Odisha\n\n🖼️ Photo: ${worker.photoUrl}\n\n🔗 View & Book Profile:\n${shareUrl}`
  );
  const waShareUrl = `https://api.whatsapp.com/send?text=${waShareMsg}`;

  // Facebook Share URL
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareDetails.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareDetails.title,
          text: shareDetails.text,
          url: shareUrl,
        });
      } catch (e) {
        // Ignored if cancelled
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'or' ? 'ଶ୍ରମିକ ପ୍ରୋଫାଇଲ୍ ଶେୟାର କରନ୍ତୁ' : 'Share Worker Profile'}
              </h3>
              <p className="text-[11px] text-emerald-200 font-medium">
                {language === 'or' ? 'ସୋସିଆଲ୍ ମିଡିଆରେ ଗଞ୍ଜାମ କାରିଗରଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ସୂଚନା ଶେୟାର କରନ୍ତୁ' : 'Share worker image, profession & address with others'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1.5 rounded-xl hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Profile Card Summary Preview */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 border-2 border-emerald-100 rounded-2xl p-4 relative overflow-hidden shadow-sm">
            <div className="flex items-start gap-3.5">
              <img
                src={worker.photoUrl}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md flex-shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Artisan
                </span>
                <h4 className="font-extrabold text-slate-900 text-base truncate">{name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{profession}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span className="truncate">{location}, Ganjam</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold text-amber-600">★ {worker.rating} / 5</span>
              <span className="font-extrabold text-emerald-900">₹{worker.dailyRate}/day</span>
            </div>
          </div>

          {/* Direct Social Share Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <MessageSquareCode className="w-4 h-4 text-emerald-200" />
              <span>WhatsApp</span>
            </a>

            <a
              href={fbShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <Facebook className="w-4 h-4 text-blue-100" />
              <span>Facebook</span>
            </a>
          </div>

          {/* Native Web Share Button if supported */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold p-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'or' ? 'ଅନ୍ୟ ଆପ୍ (Web Share API)' : 'More Apps (System Web Share)'}</span>
            </button>
          )}

          {/* Copy Link Section */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {language === 'or' ? 'ପ୍ରୋଫାଇଲ୍ ଡାଇରେକ୍ଟ ଲିଙ୍କ୍:' : 'Direct Profile Link:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700"
              />
              <button
                onClick={handleCopyLink}
                className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 flex-shrink-0 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? (language === 'or' ? 'କପି ହେଲା!' : 'Copied!') : (language === 'or' ? 'ଲିଙ୍କ୍ କପି' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* Copy Full Details Summary */}
          <button
            onClick={handleCopyText}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedText ? (language === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ କପି ହେଲା!' : 'Full Profile Summary Copied!') : (language === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ କପି କରନ୍ତୁ (ଫୋଟୋ, ନାମ, ଠିକଣା)' : 'Copy Full Details (Photo, Name, Profession, Location)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
