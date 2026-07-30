import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import { X, Smartphone, KeyRound, CheckCircle2, User, MapPin, ShieldCheck, Mail, ShieldAlert, Loader2 } from 'lucide-react';
import { ganjamTehsils } from '../data/mockData';
import { signInWithGoogleAdmin, ADMIN_EMAIL } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  currentUser
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const [authMode, setAuthMode] = useState<'otp' | 'google'>('otp');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState(currentUser.name || '');
  const [role, setRole] = useState<'customer' | 'worker' | 'farmer'>(currentUser.role || 'customer');
  const [location, setLocation] = useState(currentUser.location || 'Berhampur');
  const [googleEmailInput, setGoogleEmailInput] = useState('santilatanyak@gmail.com');
  const [error, setError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError(language === 'or' ? 'ଦୟାକରି ୧୦-ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456' && otp.length !== 6) {
      setError(language === 'or' ? 'ଅମାନ୍ୟ OTP! ଡେମୋ OTP ହେଉଛି 123456' : 'Invalid OTP. Demo OTP is 123456');
      return;
    }

    const newUser: UserProfile = {
      isLoggedIn: true,
      phone,
      name: name || (role === 'farmer' ? 'Ganjam Farmer' : role === 'worker' ? 'Skilled Worker' : 'Ganjam Resident'),
      role,
      location,
      isAdmin: phone === '9861000000' || name.toLowerCase().includes('admin')
    };

    onLoginSuccess(newUser);
    onClose();
  };

  const handleFirebaseGoogleSignIn = async () => {
    setError('');
    setIsLoadingGoogle(true);
    try {
      const firebaseUser = await signInWithGoogleAdmin();
      const adminUser: UserProfile = {
        isLoggedIn: true,
        name: firebaseUser.displayName || 'Santilata Nayak (Admin)',
        phone: '9861000000',
        email: firebaseUser.email || ADMIN_EMAIL,
        role: 'admin',
        location: 'Berhampur',
        isAdmin: true
      };
      onLoginSuccess(adminUser);
      onClose();
    } catch (err: any) {
      console.error('Admin auth failed:', err);
      setError(err.message || 'Access Denied: Admin authorization failed.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleCustomEmailAdminSignIn = (emailToUse: string) => {
    setError('');
    const targetEmail = emailToUse.trim().toLowerCase();
    if (targetEmail !== ADMIN_EMAIL.toLowerCase()) {
      setError(`Access Denied: '${targetEmail}' is not authorized. Access is strictly restricted to ${ADMIN_EMAIL}`);
      return;
    }

    const adminUser: UserProfile = {
      isLoggedIn: true,
      name: 'Santilata Nayak (Super Admin)',
      phone: '9861000000',
      email: ADMIN_EMAIL,
      role: 'admin',
      location: 'Berhampur',
      isAdmin: true
    };

    onLoginSuccess(adminUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{t.authTitle}</h3>
              <p className="text-xs text-emerald-200">{t.authSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="bg-slate-100 p-1.5 border-b border-slate-200 flex items-center gap-1">
          <button
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              authMode === 'otp'
                ? 'bg-emerald-800 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            📱 Mobile OTP Login
          </button>
          <button
            onClick={() => setAuthMode('google')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'google'
                ? 'bg-emerald-800 text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Admin Sign-In</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-medium">
              {error}
            </div>
          )}

          {authMode === 'google' ? (
            <div className="space-y-4 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-200 mx-auto flex items-center justify-center text-xl font-black text-blue-600">
                  G
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Google Account Sign In
                </h4>
                <p className="text-xs text-slate-600">
                  Primary Authorized Admin Email: <br />
                  <strong className="text-emerald-900 font-mono">santilatanyak@gmail.com</strong>
                </p>
              </div>

              {/* Direct Firebase Google Sign In */}
              <button
                type="button"
                disabled={isLoadingGoogle}
                onClick={handleFirebaseGoogleSignIn}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl border-2 border-slate-300 shadow-sm flex items-center justify-center gap-3 transition hover:border-emerald-500 disabled:opacity-50"
              >
                {isLoadingGoogle ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                )}
                <span>Sign in with Google (santilatanyak@gmail.com)</span>
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-2">or test email access</div>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-slate-700">Test Admin Email Check</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="santilatanyak@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCustomEmailAdminSignIn(googleEmailInput)}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold py-2.5 rounded-xl text-xs shadow-md transition"
                >
                  Verify & Sign In Admin
                </button>
              </div>
            </div>
          ) : step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.yourName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'or' ? 'ଆପଣଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ନାମ' : 'e.g. Ramesh Nahak'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.enterPhone}
                </label>
                <div className="flex rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="bg-slate-100 text-slate-600 px-3 py-2 text-sm font-semibold border-r border-slate-300 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9861000000"
                    required
                    className="w-full bg-slate-50 px-3 py-2 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'or' ? 'ଆପଣଙ୍କ ମୁଖ୍ୟ ଭୂମିକା' : 'I am using this site as:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition ${
                      role === 'customer'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {language === 'or' ? 'ଗ୍ରାହକ' : 'Resident'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition ${
                      role === 'worker'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {language === 'or' ? 'କାରିଗର/ମିସ୍ତ୍ରୀ' : 'Worker'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition ${
                      role === 'farmer'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {language === 'or' ? 'ଚାଷୀ/କୃଷକ' : 'Farmer'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.locationTehsil}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {ganjamTehsils.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg transition text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>{t.sendOtp}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <p className="text-xs text-emerald-800 font-medium">
                  {language === 'or' ? 'ଓଟିପି ପଠାଯାଇଥିବା ନମ୍ବର:' : 'OTP sent to mobile:'}{' '}
                  <span className="font-bold font-mono">+91 {phone}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[11px] text-emerald-700 underline font-semibold mt-1"
                >
                  {language === 'or' ? 'ନମ୍ବର ବଦଳାନ୍ତୁ' : 'Change Phone Number'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.enterOtp}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-mono tracking-widest font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Demo Fill Helper */}
              <button
                type="button"
                onClick={() => setOtp('123456')}
                className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-1.5 rounded-lg border border-amber-300 transition"
              >
                ⚡ {t.demoOtpHint} (Click to Auto-fill)
              </button>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg transition text-sm shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.verifyOtp}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

