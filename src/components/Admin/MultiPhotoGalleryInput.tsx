import React, { useRef, useState } from 'react';
import { Upload, Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Language } from '../../types';
import { uploadPhotoToFirebaseStorage } from '../../lib/firebase';

interface MultiPhotoGalleryInputProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  language?: Language;
  maxPhotos?: number;
}

export const MultiPhotoGalleryInput: React.FC<MultiPhotoGalleryInputProps> = ({
  photos = [],
  onChange,
  language = 'or',
  maxPhotos = 5
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Ensure there's at least 1 photo slot if empty
  const photoList = photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'];

  const handleUrlChange = (index: number, newUrl: string) => {
    const updated = [...photoList];
    updated[index] = newUrl;
    onChange(updated);
  };

  const handleAddPhotoSlot = () => {
    if (photoList.length < maxPhotos) {
      const presets = [
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80'
      ];
      const nextPreset = presets[(photoList.length - 1) % presets.length];
      onChange([...photoList, nextPreset]);
    }
  };

  const handleRemovePhotoSlot = (index: number) => {
    if (photoList.length === 1) {
      // Don't leave completely empty, reset first
      onChange(['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80']);
      return;
    }
    const updated = photoList.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIndex(index);
      const photoUrl = await uploadPhotoToFirebaseStorage(file, 'worker_photos');
      const updated = [...photoList];
      updated[index] = photoUrl;
      onChange(updated);
    } catch (err) {
      console.error('File upload error:', err);
      alert(language === 'or' ? 'ଅପଲୋଡ୍ ବିଫଳ ହେଲା। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const samplePresets = [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-200">
      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
        <label className="block text-xs font-black text-emerald-950 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'or'
              ? `କାରିଗର ଫୋଟୋ ଗ୍ୟାଲେରୀ (Worker Gallery - Up to ${maxPhotos} Photos)`
              : `Worker Gallery Photos (Up to ${maxPhotos} Photos)`}
          </span>
        </label>

        <span className="text-[10px] bg-emerald-800 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
          {photoList.filter((p) => p.trim()).length} / {maxPhotos} {language === 'or' ? 'ଫୋଟୋ' : 'Photos'}
        </span>
      </div>

      <p className="text-[11px] text-slate-600 font-medium">
        {language === 'or'
          ? 'ପ୍ରଥମ ଫୋଟୋ ହେଉଛି Main Logo/Profile Photo (1:1 Aspect Ratio)। ବାକି ଫୋଟୋଗୁଡ଼ିକ କାମର Sample Gallery ଭାବେ ଗ୍ରାହକଙ୍କୁ ଦେଖାଯିବ।'
          : 'Photo #1 is used as the Main Logo (1:1 aspect ratio). Additional photos will form the work sample gallery slider for customers.'}
      </p>

      {/* Photo Inputs List */}
      <div className="space-y-3">
        {photoList.map((url, idx) => (
          <div
            key={idx}
            className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-center gap-3"
          >
            {/* Thumbnail Preview in 1:1 Aspect Ratio */}
            <div className="relative w-20 h-20 sm:w-20 sm:h-20 aspect-square rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 flex-shrink-0">
              <img
                src={url.trim() || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover aspect-square"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute bottom-1 left-1 bg-slate-950/80 text-amber-300 font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                {idx === 0 ? 'LOGO (1:1)' : `#${idx + 1}`}
              </span>
            </div>

            {/* URL Input & Controls */}
            <div className="flex-grow w-full space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-emerald-600" />
                  {idx === 0
                    ? language === 'or' ? '1. ମୁଖ୍ୟ ଲୋଗୋ / ଫୋଟୋ URL (Main Logo URL):' : '1. Main Logo / Profile Photo URL *'
                    : language === 'or' ? `${idx + 1}. କାମର ନମୁନା ଫୋଟୋ URL (Work Sample #${idx + 1}):` : `${idx + 1}. Work Sample Photo #${idx + 1} URL`}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemovePhotoSlot(idx)}
                  className="text-red-600 hover:text-red-800 text-[11px] font-bold flex items-center gap-0.5 hover:bg-red-50 px-1.5 py-0.5 rounded transition"
                  title="Remove photo slot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'or' ? 'ହଟାନ୍ତୁ' : 'Remove'}</span>
                </button>
              </div>

              {/* Direct Photo URL Text Field */}
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(idx, e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-emerald-300 rounded-lg pl-2.5 pr-8 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
                {url && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* File Upload Button for this photo */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  disabled={uploadingIndex === idx}
                  onClick={() => fileInputRefs.current[idx]?.click()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 transition"
                >
                  {uploadingIndex === idx ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  <span>{language === 'or' ? 'ଫୋଟୋ ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ' : 'Upload File'}</span>
                </button>

                <input
                  ref={(el) => (fileInputRefs.current[idx] = el)}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(idx, e)}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Photo Button */}
      {photoList.length < maxPhotos && (
        <button
          type="button"
          onClick={handleAddPhotoSlot}
          className="w-full bg-white hover:bg-emerald-100/60 border-2 border-dashed border-emerald-400 text-emerald-900 font-extrabold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'or'
              ? `+ ଆଉ ଏକ ଫୋଟୋ ଯୋଡ଼ନ୍ତୁ (Add Photo #${photoList.length + 1})`
              : `+ Add New Photo (#${photoList.length + 1} of ${maxPhotos})`}
          </span>
        </button>
      )}

      {/* Quick Sample Presets */}
      <div className="pt-2 border-t border-emerald-200">
        <span className="text-[10px] font-extrabold text-emerald-950 block mb-1">
          {language === 'or' ? 'ଶୀଘ୍ର ଫୋଟୋ ଚୟନ ପାଇଁ ଉଦାହରଣ ଫୋଟୋ (Quick Presets):' : 'Click to append a sample photo:'}
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {samplePresets.map((presetUrl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (photoList.length < maxPhotos) {
                  onChange([...photoList, presetUrl]);
                } else {
                  // Replace last
                  const copy = [...photoList];
                  copy[copy.length - 1] = presetUrl;
                  onChange(copy);
                }
              }}
              className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-300 hover:border-emerald-600 hover:scale-105 transition flex-shrink-0"
            >
              <img src={presetUrl} alt="Sample" className="w-full h-full object-cover aspect-square" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
