import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, Loader2, XCircle } from 'lucide-react';
import { Language } from '../../types';
import { uploadPhotoToFirebaseStorage } from '../../lib/firebase';

interface PhotoUploadInputProps {
  value: string;
  onChange: (urlOrData: string) => void;
  label?: string;
  language?: Language;
  presetType?: 'worker' | 'produce' | 'equipment';
}

export const PhotoUploadInput: React.FC<PhotoUploadInputProps> = ({
  value,
  onChange,
  label = 'Worker Profile Photo (Upload or Paste URL)',
  language = 'or',
  presetType = 'worker'
}) => {
  const [urlInput, setUrlInput] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal state if parent value changes externally
  useEffect(() => {
    setUrlInput(value || '');
    setImageError(false);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setUrlInput(newVal);
    setImageError(false);
    // Live update to parent so preview and state update instantly
    onChange(newVal);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'or' ? 'ଫାଇଲ୍ ଆକାର ୫MB ରୁ କମ୍ ହେବା ଆବଶ୍ୟକ।' : 'File size must be under 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const photoUrl = await uploadPhotoToFirebaseStorage(file, `${presetType}_photos`);
      setUrlInput(photoUrl);
      setImageError(false);
      onChange(photoUrl);
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPreset = (url: string) => {
    setUrlInput(url);
    setImageError(false);
    onChange(url);
  };

  // Curated sample photos
  const presets = {
    worker: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=80'
    ],
    produce: [
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1557844352-761f2565b576?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598170845058-12ef4a654c60?w=500&auto=format&fit=crop&q=80'
    ],
    equipment: [
      'https://images.unsplash.com/photo-1592861956559-35755837c4d3?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530267981608-bc341907f123?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80'
    ]
  };

  const previewImage = urlInput.trim() || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-emerald-100 shadow-xs">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black text-emerald-950 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>{label} *</span>
        </label>
        {urlInput.trim() && (
          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-700" />
            {language === 'or' ? 'ଲିଙ୍କ୍ ପ୍ରାପ୍ତ ହୋଇଛି' : 'URL Ready'}
          </span>
        )}
      </div>

      {/* Live Preview & Direct URL Input Container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Instant Live Image Preview Box */}
        <div className="sm:col-span-1">
          <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm bg-slate-900 group flex items-center justify-center">
            <img
              src={previewImage}
              alt="Live Worker Photo Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
            {imageError && (
              <div className="absolute inset-0 bg-slate-900/90 text-amber-300 p-2 text-center text-[10px] flex flex-col items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400 mb-1" />
                <span>Invalid image URL</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1 bg-slate-950/80 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
              LIVE PREVIEW
            </div>
          </div>
        </div>

        {/* Highly Visible Photo URL Text Input Field */}
        <div className="sm:col-span-2 space-y-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'or' ? 'ଫୋଟୋ URL ଲିଙ୍କ୍ ପାଷ୍ଟ କରନ୍ତୁ (Paste Direct Image Link):' : 'Photo URL (Direct Image Link):'}</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 border-2 border-emerald-200 focus:border-emerald-600 rounded-xl pl-3 pr-8 py-2.5 text-xs text-slate-900 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-xs"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('');
                    onChange('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-xs font-bold"
                  title="Clear URL"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {language === 'or'
                ? 'ପାଷ୍ଟ କରନ୍ତୁ ଯେକୌଣସି Image URL — ଉପରେ ସଙ୍ଗେ ସଙ୍ଗେ ଫୋଟୋ ପ୍ରିଭ୍ୟୁ ହେବ।'
                : 'Paste any direct image link — live preview updates instantly above.'}
            </p>
          </div>

          {/* Alternative File Upload & Preset Options */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{language === 'or' ? 'ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ' : 'Upload Local File'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Preset Stock Sample Images */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
          {language === 'or' ? 'ଦ୍ରୁତ ଉଦାହରଣ ଫୋଟୋ ବାଛନ୍ତୁ (Quick Presets):' : 'Or Select Quick Sample Photo:'}
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {presets[presetType].map((imgUrl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectPreset(imgUrl)}
              className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${
                urlInput === imgUrl ? 'border-amber-400 ring-2 ring-emerald-600 scale-105' : 'border-slate-200 hover:border-emerald-500'
              }`}
            >
              <img src={imgUrl} alt="Sample" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
