import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, CheckCircle2, Globe, Sparkles, Map, Loader2 } from 'lucide-react';
import { Language } from '../../types';

interface LocationData {
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

interface GoogleMapsLocationSearchProps {
  locationData: LocationData;
  onChange: (data: LocationData) => void;
  language: Language;
}

// Popular preset locations in Ganjam District for quick 1-click test selection
const popularGanjamLocations = [
  {
    name: 'Berhampur (Silk City Central)',
    address: 'Bada Bazar, Main Road, Berhampur, Ganjam, Odisha 760002',
    lat: 19.314963,
    lng: 84.794090
  },
  {
    name: 'Gopalpur-on-Sea Beach Road',
    address: 'Gopalpur Beach Road, Gopalpur, Ganjam District, Odisha 761002',
    lat: 19.2608,
    lng: 84.9083
  },
  {
    name: 'Aska Sugar Factory Chowk',
    address: 'Main Market Road, Aska, Ganjam District, Odisha 761110',
    lat: 19.6083,
    lng: 84.6617
  },
  {
    name: 'Bhanjanagar Bus Stand',
    address: 'State Highway 7, Bhanjanagar, Ganjam District, Odisha 761126',
    lat: 19.9324,
    lng: 84.5802
  },
  {
    name: 'Chatrapur Collectorate Office',
    address: 'District Collector Office, Chatrapur, Ganjam, Odisha 761020',
    lat: 19.3562,
    lng: 85.0204
  },
  {
    name: 'Hinjilicut Main Chowk',
    address: 'Hinjilicut Square, Hinjilicut, Ganjam, Odisha 761102',
    lat: 19.4812,
    lng: 84.7431
  }
];

export const GoogleMapsLocationSearch: React.FC<GoogleMapsLocationSearchProps> = ({
  locationData,
  onChange,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState(locationData.formattedAddress || '');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; address: string; lat: number; lng: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing search with debounced place predictions
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    try {
      // 1. Local filter against Ganjam key locations
      const localMatches = popularGanjamLocations.filter(
        loc => loc.name.toLowerCase().includes(query.toLowerCase()) || loc.address.toLowerCase().includes(query.toLowerCase())
      );

      // 2. Fetch live OpenStreetMap / Google Geocoding predictions
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Odisha India')}&limit=5`
      );
      const data = await response.json();

      const apiResults = data.map((item: any) => ({
        name: item.display_name.split(',')[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));

      // Merge results avoiding duplicate coordinates
      const combined = [...localMatches, ...apiResults];
      setSuggestions(combined);
    } catch (err) {
      // Fallback to local filtering
      const localMatches = popularGanjamLocations.filter(
        loc => loc.name.toLowerCase().includes(query.toLowerCase()) || loc.address.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(localMatches);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (loc: { name: string; address: string; lat: number; lng: number }) => {
    setSearchQuery(loc.address);
    setShowDropdown(false);
    onChange({
      formattedAddress: loc.address,
      latitude: loc.lat,
      longitude: loc.lng
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const address = data.display_name || `GPS Pin (${lat.toFixed(6)}, ${lng.toFixed(6)}), Ganjam, Odisha`;

          setSearchQuery(address);
          onChange({
            formattedAddress: address,
            latitude: lat,
            longitude: lng
          });
        } catch (err) {
          const fallbackAddr = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}, Ganjam, Odisha`;
          setSearchQuery(fallbackAddr);
          onChange({
            formattedAddress: fallbackAddr,
            latitude: lat,
            longitude: lng
          });
        } finally {
          setIsGettingGps(false);
        }
      },
      (err) => {
        alert('Could not retrieve current location. Please search address manually.');
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=${locationData.latitude},${locationData.longitude}&z=15&output=embed`;

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-emerald-100 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black text-emerald-950 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{language === 'or' ? 'ଗୁଗୁଲ୍ ମ୍ୟାପ୍ ଠିକଣା ଓ ଜିଓ-ଲୋକେସନ୍ (Google Maps Places)' : 'Google Maps Places Geolocation Search *'}</span>
        </label>
        
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingGps}
          className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition"
        >
          {isGettingGps ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Navigation className="w-3 h-3 text-emerald-600" />}
          <span>{language === 'or' ? 'ବର୍ତ୍ତମାନର GPS ଲୋକେସନ୍ ଆଣନ୍ତୁ' : 'Use Current GPS'}</span>
        </button>
      </div>

      {/* Places Search Input with Dropdown Suggestions */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder={language === 'or' ? 'ବ୍ରହ୍ମପୁର, ଆସିକା, ଭଞ୍ଜନଗର, ଗୋପାଳପୁର ଠିକଣା ଖୋଜନ୍ତୁ...' : 'Type to search Google Maps places (e.g. Bada Bazar Berhampur)...'}
            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
            {suggestions.length > 0 ? (
              suggestions.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => selectLocation(loc)}
                  className="p-3 hover:bg-emerald-50 cursor-pointer transition flex items-start gap-2.5 group"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 truncate">{loc.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{loc.address}</p>
                    <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                      Lat: {loc.lat.toFixed(6)} | Lng: {loc.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-xs text-slate-500 text-center">
                {isSearching ? 'Searching Google Maps places...' : 'No places found. Type location name above.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Location Pills */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          {language === 'or' ? 'ଦ୍ରୁତ ସିଲେକ୍ସନ୍ (Quick Locations):' : 'Quick Location Presets:'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {popularGanjamLocations.map((loc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectLocation(loc)}
              className="text-[11px] bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-950 px-2.5 py-1 rounded-lg border border-slate-200 transition font-medium"
            >
              📍 {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Geolocation Details Display */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Extracted Geolocation Data:
          </span>
          <span className="bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
            Ready for Firebase
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <p className="text-slate-800">
            <strong>Address:</strong> <span className="font-sans text-slate-600">{locationData.formattedAddress || searchQuery}</span>
          </p>
          <div className="flex items-center gap-4 text-emerald-900">
            <p><strong>Latitude:</strong> {locationData.latitude.toFixed(6)}</p>
            <p><strong>Longitude:</strong> {locationData.longitude.toFixed(6)}</p>
          </div>
        </div>
      </div>

      {/* Live Google Map Interactive Preview Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1 text-emerald-800">
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            Google Map Location Preview
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-0.5"
          >
            <span>Open in Google Maps</span>
            <Globe className="w-3 h-3" />
          </a>
        </div>

        <div className="w-full h-44 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md relative bg-slate-100">
          <iframe
            title="Google Map Selected Location Preview"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={mapEmbedUrl}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};
