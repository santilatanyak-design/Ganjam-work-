import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X } from 'lucide-react';
import { Language } from '../../types';

interface WorkerPhotoGalleryProps {
  photos?: string[];
  mainPhotoUrl: string;
  workerName: string;
  language?: Language;
  compact?: boolean;
}

export const WorkerPhotoGallery: React.FC<WorkerPhotoGalleryProps> = ({
  photos = [],
  mainPhotoUrl,
  workerName,
  language = 'or',
  compact = false
}) => {
  // Combine photos array, ensuring mainPhotoUrl is included first if photos array is empty or missing it
  const galleryList = Array.from(
    new Set([mainPhotoUrl, ...(photos || [])].filter((p) => p && p.trim().length > 0))
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentPhoto = galleryList[activeIndex] || mainPhotoUrl;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? galleryList.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === galleryList.length - 1 ? 0 : prev + 1));
  };

  if (compact) {
    // Compact View for WorkerCard
    return (
      <div className="space-y-2 my-2">
        {/* Work Sample Thumbnails Grid (Up to 5) */}
        {galleryList.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-emerald-600" />
                {language === 'or' ? 'କାମର ନମୁନା ଫୋଟୋଗୁଡ଼ିକ (Work Samples):' : 'Work Sample Photos:'}
              </span>
              <span className="text-emerald-800 font-bold">{galleryList.length} Photos</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
              {galleryList.slice(0, 5).map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-transform active:scale-95 ${
                    activeIndex === idx ? 'border-amber-400 ring-2 ring-emerald-600 scale-105' : 'border-slate-200 hover:border-emerald-400'
                  }`}
                  style={{ aspectRatio: '1 / 1' }}
                  title={`View work photo ${idx + 1}`}
                >
                  <img
                    src={photo}
                    alt={`${workerName} sample ${idx + 1}`}
                    className="w-full h-full object-cover aspect-square"
                    style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
                  />
                  {idx === 0 && (
                    <span className="absolute top-0 left-0 bg-emerald-800 text-amber-300 text-[7px] font-black px-1 rounded-br">
                      LOGO
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox Modal for Compact Card click */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
          >
            <div
              className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-2 border-b border-slate-800 text-white">
                <span className="text-xs font-bold text-amber-300">
                  {workerName} - {language === 'or' ? 'କାମର ନମୁନା' : 'Work Sample'} #{activeIndex + 1} / {galleryList.length}
                </span>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-square w-full my-2 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={currentPhoto}
                  alt="Work Sample"
                  className="w-full h-full object-contain aspect-square"
                  style={{ aspectRatio: '1 / 1', objectFit: 'contain' }}
                />

                {galleryList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-900 text-amber-300 p-2 rounded-full shadow-lg border border-slate-700"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-900 text-amber-300 p-2 rounded-full shadow-lg border border-slate-700"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed Modal View Gallery
  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'or'
              ? `କାରିଗରଙ୍କ କାମର ନମୁନା ଫୋଟୋ (${galleryList.length} Photos)`
              : `Work Samples & Gallery (${galleryList.length} Photos)`}
          </span>
        </h4>
        <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
          Photo {activeIndex + 1} of {galleryList.length}
        </span>
      </div>

      {/* Main Large Gallery Carousel View */}
      <div className="relative w-full aspect-square max-h-72 sm:max-h-80 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-md group">
        <img
          src={currentPhoto}
          alt={`${workerName} work sample ${activeIndex + 1}`}
          className="w-full h-full object-cover aspect-square"
          style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
        />

        {/* Carousel Prev/Next Overlay Buttons */}
        {galleryList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-emerald-800 text-amber-300 p-2.5 rounded-full shadow-lg border border-slate-700 transition active:scale-90"
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-emerald-800 text-amber-300 p-2.5 rounded-full shadow-lg border border-slate-700 transition active:scale-90"
              title="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-3 right-3 bg-slate-950/80 text-amber-300 p-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 opacity-90 group-hover:opacity-100 transition"
        >
          <Maximize2 className="w-4 h-4" />
          <span>{language === 'or' ? 'ବଡ଼ କରି ଦେଖନ୍ତୁ' : 'Full Screen'}</span>
        </button>
      </div>

      {/* 5 Thumbnails Bar */}
      {galleryList.length > 1 && (
        <div className="grid grid-cols-5 gap-2 pt-1">
          {galleryList.map((photoUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 transition active:scale-95 ${
                activeIndex === idx
                  ? 'border-amber-400 ring-2 ring-emerald-600 scale-105 shadow-md'
                  : 'border-slate-300 hover:border-emerald-400 opacity-70 hover:opacity-100'
              }`}
              style={{ aspectRatio: '1 / 1' }}
            >
              <img
                src={photoUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover aspect-square"
                style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
              />
              {idx === 0 && (
                <span className="absolute top-0 left-0 bg-emerald-900 text-amber-300 text-[8px] font-black px-1 py-0.5 rounded-br">
                  LOGO
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 p-3 shadow-2xl space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 text-white">
              <span className="text-sm font-black text-amber-300">
                {workerName} - {language === 'or' ? 'କାମର ନମୁନା' : 'Work Sample'} #{activeIndex + 1} of {galleryList.length}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
              <img
                src={currentPhoto}
                alt="Fullscreen Work Sample"
                className="w-full h-full object-contain aspect-square"
                style={{ aspectRatio: '1 / 1', objectFit: 'contain' }}
              />

              {galleryList.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-900 text-amber-300 p-3 rounded-full shadow-lg border border-slate-700"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-900 text-amber-300 p-3 rounded-full shadow-lg border border-slate-700"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
