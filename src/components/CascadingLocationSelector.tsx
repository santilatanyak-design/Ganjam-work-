import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Home, Hash, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import ganjamData from '../data/ganjamLocations.json';

export interface LocationSelection {
  blockEn: string;
  blockOr: string;
  villageEn: string;
  villageOr: string;
  pincode: string;
  formattedLocationEn: string;
  formattedLocationOr: string;
}

interface CascadingLocationSelectorProps {
  selectedBlock?: string;
  selectedVillage?: string;
  selectedPincode?: string;
  onChange: (selection: LocationSelection) => void;
  language: Language;
  className?: string;
}

export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  selectedBlock = '',
  selectedVillage = '',
  selectedPincode = '',
  onChange,
  language,
  className = ''
}) => {
  const [blockId, setBlockId] = useState<string>('');
  const [villageId, setVillageId] = useState<string>('');
  const [pincode, setPincode] = useState<string>(selectedPincode);

  // Initialize from initial values if provided
  useEffect(() => {
    if (selectedBlock) {
      const matchBlock = ganjamData.blocks.find(
        (b) => b.nameEn.toLowerCase() === selectedBlock.toLowerCase() || b.id === selectedBlock
      );
      if (matchBlock) {
        setBlockId(matchBlock.id);
        if (selectedVillage) {
          const matchVillage = matchBlock.villages.find(
            (v) => v.nameEn.toLowerCase() === selectedVillage.toLowerCase() || v.id === selectedVillage
          );
          if (matchVillage) {
            setVillageId(matchVillage.id);
            setPincode(matchVillage.pincode);
          }
        }
      }
    }
  }, [selectedBlock, selectedVillage]);

  // Current selected block object
  const currentBlock = ganjamData.blocks.find((b) => b.id === blockId);
  // Current available villages array
  const availableVillages = currentBlock ? currentBlock.villages : [];
  // Current selected village object
  const currentVillage = availableVillages.find((v) => v.id === villageId);

  // Handle Block change
  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlockId = e.target.value;
    setBlockId(newBlockId);
    setVillageId('');
    setPincode('');

    const bObj = ganjamData.blocks.find((b) => b.id === newBlockId);

    if (bObj) {
      onChange({
        blockEn: bObj.nameEn,
        blockOr: bObj.nameOr,
        villageEn: '',
        villageOr: '',
        pincode: '',
        formattedLocationEn: `${bObj.nameEn} Block, Ganjam`,
        formattedLocationOr: `${bObj.nameOr} ବ୍ଲକ୍, ଗଞ୍ଜାମ`
      });
    } else {
      onChange({
        blockEn: '',
        blockOr: '',
        villageEn: '',
        villageOr: '',
        pincode: '',
        formattedLocationEn: '',
        formattedLocationOr: ''
      });
    }
  };

  // Handle Village change -> auto fills pincode
  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVillageId = e.target.value;
    setVillageId(newVillageId);

    if (currentBlock) {
      const vObj = currentBlock.villages.find((v) => v.id === newVillageId);
      if (vObj) {
        setPincode(vObj.pincode);
        onChange({
          blockEn: currentBlock.nameEn,
          blockOr: currentBlock.nameOr,
          villageEn: vObj.nameEn,
          villageOr: vObj.nameOr,
          pincode: vObj.pincode,
          formattedLocationEn: `${vObj.nameEn}, ${currentBlock.nameEn} Block - ${vObj.pincode}`,
          formattedLocationOr: `${vObj.nameOr}, ${currentBlock.nameOr} ବ୍ଲକ୍ - ${vObj.pincode}`
        });
      }
    }
  };

  return (
    <div className={`space-y-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 ${className}`}>
      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
        <label className="block text-xs font-black text-emerald-950 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'or'
              ? 'ବ୍ଲକ୍, ଗ୍ରାମ ଓ ପିନ୍-କୋଡ୍ (Hierarchical Location Selector)'
              : 'Block, Village & Pincode Selector'}
          </span>
        </label>
        <span className="text-[10px] bg-emerald-700 text-amber-300 font-bold px-2 py-0.5 rounded-full shadow-xs">
          {language === 'or' ? 'ଗଞ୍ଜାମ ଜିଲ୍ଲା' : 'Ganjam District'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Step 1: Block Dropdown */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. {language === 'or' ? 'ବ୍ଲକ୍ ଚୟନ (Select Block)' : 'Select Block *'}</span>
          </label>
          <select
            value={blockId}
            onChange={handleBlockChange}
            className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-xs"
          >
            <option value="">{language === 'or' ? '-- ବ୍ଲକ୍ ବାଛନ୍ତୁ --' : '-- Choose Block --'}</option>
            {ganjamData.blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {language === 'or' ? `${b.nameOr} (${b.nameEn})` : `${b.nameEn} (${b.nameOr})`}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Village Dropdown (Cascading based on Block selection) */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. {language === 'or' ? 'ଗାଁ / ଗ୍ରାମ (Select Village)' : 'Select Village *'}</span>
          </label>
          <select
            value={villageId}
            onChange={handleVillageChange}
            disabled={!blockId}
            className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
          >
            <option value="">
              {!blockId
                ? language === 'or' ? 'ପ୍ରଥମେ ବ୍ଲକ୍ ବାଛନ୍ତୁ' : 'First choose a Block'
                : language === 'or' ? '-- ଗ୍ରାମ ବାଛନ୍ତୁ --' : '-- Choose Village --'}
            </option>
            {availableVillages.map((v) => (
              <option key={v.id} value={v.id}>
                {language === 'or' ? `${v.nameOr} (${v.nameEn})` : `${v.nameEn} (${v.nameOr})`}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Auto-Filled Pincode Field */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. {language === 'or' ? 'ପିନ୍ କୋଡ୍ (Pincode - Auto)' : 'Pincode (Auto)'}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={pincode}
              placeholder={language === 'or' ? 'ସ୍ୱୟଂଚାଳିତ' : 'Auto-filled'}
              className="w-full bg-emerald-100/80 border border-emerald-300 rounded-xl px-2.5 py-2 text-xs font-mono font-black text-emerald-950 focus:outline-none cursor-not-allowed shadow-xs"
            />
            {pincode && (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 absolute right-2.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>
      </div>

      {/* Selected Location Summary Banner */}
      {currentBlock && currentVillage && (
        <div className="bg-emerald-800 text-amber-300 rounded-xl p-2.5 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-white">
                {language === 'or' ? currentVillage.nameOr : currentVillage.nameEn}
              </span>
              <span className="text-emerald-200">
                , {language === 'or' ? `${currentBlock.nameOr} ବ୍ଲକ୍` : `${currentBlock.nameEn} Block`}
              </span>
            </div>
          </div>
          <span className="bg-amber-400 text-slate-950 font-black font-mono text-[11px] px-2 py-0.5 rounded-lg">
            PIN: {pincode}
          </span>
        </div>
      )}
    </div>
  );
};
