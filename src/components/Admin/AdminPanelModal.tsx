import React, { useState } from 'react';
import {
  Language,
  WorkerProfile,
  ProduceItem,
  EquipmentItem,
  MandiRate,
  Booking,
  UserProfile,
  ServiceCategory,
  AgriCategory
} from '../../types';
import { translations } from '../../data/translations';
import { PhotoUploadInput } from './PhotoUploadInput';
import { MultiPhotoGalleryInput } from './MultiPhotoGalleryInput';
import { GoogleMapsLocationSearch } from './GoogleMapsLocationSearch';
import { CascadingLocationSelector, LocationSelection } from '../CascadingLocationSelector';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Plus,
  Users,
  Sprout,
  Tractor,
  TrendingUp,
  ShoppingBag,
  Image as ImageIcon,
  PhoneCall,
  MessageSquareCode,
  Sparkles,
  Lock,
  LogOut,
  Mail,
  Search,
  Filter,
  Check,
  Award,
  Loader2
} from 'lucide-react';
import { ganjamTehsils } from '../../data/mockData';
import { doc, setDoc } from 'firebase/firestore';
import { db, signInWithGoogleAdmin, ADMIN_EMAIL } from '../../lib/firebase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: UserProfile;
  workers: WorkerProfile[];
  setWorkers: React.Dispatch<React.SetStateAction<WorkerProfile[]>>;
  produce: ProduceItem[];
  setProduce: React.Dispatch<React.SetStateAction<ProduceItem[]>>;
  equipment: EquipmentItem[];
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentItem[]>>;
  mandiRates: MandiRate[];
  setMandiRates: React.Dispatch<React.SetStateAction<MandiRate[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  onLogoutAdmin: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  language,
  user,
  workers,
  setWorkers,
  produce,
  setProduce,
  equipment,
  setEquipment,
  mandiRates,
  setMandiRates,
  bookings,
  setBookings,
  onLogoutAdmin
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  // Access Control: Strictly restrict admin access ONLY to santilatanyak@gmail.com
  const isAuthorizedAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
    (user.isAdmin && (!user.email || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()));

  if (!isAuthorizedAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Access Denied</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Admin access is strictly restricted to <strong className="font-mono text-red-700 bg-red-50 px-1 py-0.5 rounded">{ADMIN_EMAIL}</strong>.
            Your logged-in account (<span className="font-mono text-slate-800">{user.email || user.phone || 'Guest'}</span>) is not authorized.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={async () => {
                try {
                  await signInWithGoogleAdmin();
                  window.location.reload();
                } catch (err: any) {
                  alert(err.message || 'Access Denied');
                }
              }}
              className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
            >
              Sign In with {ADMIN_EMAIL}
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'workers' | 'produce' | 'equipment' | 'rates' | 'orders' | 'photos'>('orders');

  // Search & Filter state inside Admin Panel
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Editing Item States
  const [editingWorker, setEditingWorker] = useState<WorkerProfile | null>(null);
  const [editingProduce, setEditingProduce] = useState<ProduceItem | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
  const [editingRate, setEditingRate] = useState<MandiRate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Creating New Item States
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [isAddingProduce, setIsAddingProduce] = useState(false);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [isAddingRate, setIsAddingRate] = useState(false);

  // New Worker Form State
  const [newWorker, setNewWorker] = useState<Partial<WorkerProfile>>({
    nameEn: '',
    nameOr: '',
    category: 'electrician',
    skillTitleEn: '',
    skillTitleOr: '',
    phone: '',
    whatsappNumber: '',
    locationEn: 'Berhampur',
    locationOr: 'ବ୍ରହ୍ମପୁର',
    formattedAddress: 'Bada Bazar, Main Road, Berhampur, Ganjam, Odisha 760002',
    latitude: 19.314963,
    longitude: 84.794090,
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'],
    dailyRate: 600,
    hourlyRate: 100,
    experienceYears: 5,
    isVerified: true,
    bioEn: 'Experienced technician in Ganjam.',
    bioOr: 'ଗଞ୍ଜାମର ଅଭିଜ୍ଞ ମିସ୍ତ୍ରୀ।',
    languagesSpoken: ['Odia', 'Hindi'],
    reviews: []
  });

  // New Mandi Rate Form State
  const [newRate, setNewRate] = useState<Partial<MandiRate>>({
    cropEn: '',
    cropOr: '',
    marketEn: 'Berhampur Mandi',
    marketOr: 'ବ୍ରହ୍ମପୁର ମଣ୍ଡି',
    minPrice: 1500,
    maxPrice: 2200,
    modalPrice: 1950,
    unit: 'Quintal',
    trend: 'up',
    changeAmount: 50,
    updatedAt: new Date().toLocaleDateString()
  });

  // Handlers for Worker Status (Approve / Reject / Delete)
  const handleWorkerStatusChange = async (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    // 1. Local state update
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, approvalStatus: newStatus } : w))
    );

    // 2. Persist status and approvalStatus to Firebase Firestore database
    try {
      const workerRef = doc(db, 'workers', id);
      await setDoc(workerRef, { approvalStatus: newStatus, status: newStatus }, { merge: true });
      console.log(`Firebase status updated for worker ${id}: ${newStatus}`);
    } catch (err) {
      console.warn('Firestore worker status update error:', err);
    }
  };

  const handleDeleteWorker = (id: string) => {
    if (confirm(language === 'or' ? 'ଆପଣ ଏହି ଶ୍ରମିକ ପ୍ରୋଫାଇଲ୍ ଡିଲିଟ୍ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?' : 'Are you sure you want to delete this worker profile?')) {
      setWorkers((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const handleSaveEditedWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    const galleryPhotos = editingWorker.photos && editingWorker.photos.length > 0
      ? editingWorker.photos
      : [editingWorker.photoUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'];
    const updatedWorker: WorkerProfile = {
      ...editingWorker,
      photoUrl: galleryPhotos[0] || editingWorker.photoUrl,
      photos: galleryPhotos
    };

    try {
      await setDoc(doc(db, 'workers', updatedWorker.id), updatedWorker, { merge: true });
      console.log('Worker edits persisted to Firebase Firestore:', updatedWorker);
    } catch (err) {
      console.warn('Firestore worker edit persistence error:', err);
    }

    setWorkers((prev) => prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)));
    setEditingWorker(null);
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.nameEn || !newWorker.phone) return;
    const galleryPhotos = newWorker.photos && newWorker.photos.length > 0
      ? newWorker.photos
      : [newWorker.photoUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'];

    const workerToAdd: WorkerProfile = {
      id: `w_adm_${Date.now()}`,
      nameEn: newWorker.nameEn || 'Ganjam Pro',
      nameOr: newWorker.nameOr || newWorker.nameEn || 'ଗଞ୍ଜାମ କାରିଗର',
      category: (newWorker.category as ServiceCategory) || 'electrician',
      skillTitleEn: newWorker.skillTitleEn || 'Skilled Professional',
      skillTitleOr: newWorker.skillTitleOr || 'ଦକ୍ଷ ମିସ୍ତ୍ରୀ',
      phone: newWorker.phone,
      whatsappNumber: newWorker.whatsappNumber || newWorker.phone,
      locationEn: newWorker.locationEn || 'Berhampur',
      locationOr: newWorker.locationOr || 'ବ୍ରହ୍ମପୁର',
      formattedAddress: newWorker.formattedAddress || 'Bada Bazar, Main Road, Berhampur, Ganjam, Odisha 760002',
      latitude: newWorker.latitude ?? 19.314963,
      longitude: newWorker.longitude ?? 84.794090,
      photoUrl: galleryPhotos[0],
      photos: galleryPhotos,
      rating: 5.0,
      reviewCount: 1,
      dailyRate: Number(newWorker.dailyRate) || 500,
      hourlyRate: Number(newWorker.hourlyRate) || 80,
      experienceYears: Number(newWorker.experienceYears) || 3,
      isVerified: true,
      isTopRated: true,
      languagesSpoken: ['Odia'],
      bioEn: newWorker.bioEn || '',
      bioOr: newWorker.bioOr || '',
      isAvailable: true,
      reviews: [],
      approvalStatus: 'approved'
    };

    // Save exact user & location details into Firebase Firestore collection
    try {
      await setDoc(doc(db, 'workers', workerToAdd.id), workerToAdd);
      console.log('Worker profile persisted to Firebase Firestore:', workerToAdd);
    } catch (err) {
      console.warn('Firestore worker persistence notice:', err);
    }

    setWorkers((prev) => [workerToAdd, ...prev]);
    setIsAddingWorker(false);
  };

  // Handlers for Produce (Approve / Reject / Delete / Save)
  const handleProduceStatusChange = (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    setProduce((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approvalStatus: newStatus } : p))
    );
  };

  const handleSaveEditedProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduce) return;
    setIsSaving(true);

    try {
      const updatedProduce: ProduceItem = {
        ...editingProduce,
        imageUrl: editingProduce.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80',
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'produce', updatedProduce.id), updatedProduce, { merge: true });
      console.log('Produce listing updated in Firestore:', updatedProduce);

      setProduce((prev) => prev.map((p) => (p.id === updatedProduce.id ? updatedProduce : p)));
      setEditingProduce(null);
    } catch (err) {
      console.warn('Firestore produce update error:', err);
      alert(language === 'or' ? 'ସଂଶୋଧନ ସଂରକ୍ଷଣ ହୋଇପାରିଲା ନାହିଁ । ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ ।' : 'Failed to save produce changes to Firestore. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduce = (id: string) => {
    if (confirm(language === 'or' ? 'ଏହି ଫସଲ ତାଲିକା ଡିଲିଟ୍ କରିବେ କି?' : 'Delete this produce listing?')) {
      setProduce((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Handlers for Equipment (Approve / Reject / Delete / Save)
  const handleEquipmentStatusChange = (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, approvalStatus: newStatus } : e))
    );
  };

  const handleSaveEditedEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;
    setIsSaving(true);

    try {
      const updatedEquipment: EquipmentItem = {
        ...editingEquipment,
        imageUrl: editingEquipment.imageUrl || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80',
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'equipments', updatedEquipment.id), updatedEquipment, { merge: true });
      console.log('Equipment listing updated in Firestore:', updatedEquipment);

      setEquipment((prev) => prev.map((e) => (e.id === updatedEquipment.id ? updatedEquipment : e)));
      setEditingEquipment(null);
    } catch (err) {
      console.warn('Firestore equipment update error:', err);
      alert(language === 'or' ? 'ସଂଶୋଧନ ସଂରକ୍ଷଣ ହୋଇପାରିଲା ନାହିଁ । ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ ।' : 'Failed to save equipment changes to Firestore. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm(language === 'or' ? 'ଏହି ମେସିନ୍ ତାଲିକା ଡିଲିଟ୍ କରିବେ କି?' : 'Delete this equipment listing?')) {
      setEquipment((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Handlers for Mandi Rates
  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;
    setMandiRates((prev) => prev.map((r) => (r.id === editingRate.id ? editingRate : r)));
    setEditingRate(null);
  };

  const handleCreateRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRate.cropEn || !newRate.modalPrice) return;
    const rateToAdd: MandiRate = {
      id: `m_adm_${Date.now()}`,
      cropEn: newRate.cropEn || 'Crop',
      cropOr: newRate.cropOr || newRate.cropEn || 'ଫସଲ',
      marketEn: newRate.marketEn || 'Berhampur Mandi',
      marketOr: newRate.marketOr || 'ବ୍ରହ୍ମପୁର ମଣ୍ଡି',
      minPrice: Number(newRate.minPrice) || 1000,
      maxPrice: Number(newRate.maxPrice) || 2000,
      modalPrice: Number(newRate.modalPrice) || 1500,
      unit: newRate.unit || 'Quintal',
      trend: (newRate.trend as 'up' | 'down' | 'stable') || 'up',
      changeAmount: Number(newRate.changeAmount) || 0,
      updatedAt: 'Just Now'
    };
    setMandiRates((prev) => [rateToAdd, ...prev]);
    setIsAddingRate(false);
  };

  const handleDeleteRate = (id: string) => {
    setMandiRates((prev) => prev.filter((r) => r.id !== id));
  };

  // Order Management (Approve / Confirm / Reject / Complete / Delete)
  const handleBookingStatusChange = async (
    id: string,
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'approved' | 'pending' | 'rejected'
  ) => {
    const normalizedStatus = (status === 'Confirmed' || status === 'approved') 
      ? 'approved' 
      : (status === 'Cancelled' || status === 'rejected') 
      ? 'rejected' 
      : status.toLowerCase();

    setBookings((prev) =>
      prev.map((b: any) => (b.id === id ? { ...b, status: normalizedStatus } : b))
    );

    try {
      await setDoc(doc(db, 'bookings', id), { status: normalizedStatus, updatedAt: new Date().toISOString() }, { merge: true });
      console.log(`Booking ${id} status updated in Firestore to ${normalizedStatus}`);
    } catch (err) {
      console.warn('Firestore booking status update notice:', err);
    }
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm(language === 'or' ? 'ଏହି ଅର୍ଡର ରେକର୍ଡ ହଟାଇବେ କି?' : 'Delete order record?')) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white">
                  {language === 'or' ? 'ଗଞ୍ଜାମ ପ୍ରଶାସନିକ କଣ୍ଟ୍ରୋଲ୍ ପ୍ୟାନେଲ୍' : 'Ganjam Master Admin Control Panel'}
                </h3>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-medium flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>Logged in as: <strong>{user.email || 'santilatanyak@gmail.com'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogoutAdmin}
              className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs border border-emerald-600 transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'or' ? 'ଲଗ୍‌ଆଉଟ୍' : 'Exit Admin'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-emerald-300 hover:text-white p-1.5 rounded-xl hover:bg-emerald-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quick Summary Dashboard Bar */}
        <div className="bg-emerald-950 px-4 py-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-white border-b border-emerald-800 flex-shrink-0">
          <div className="bg-emerald-900/80 p-2 rounded-xl border border-emerald-700/60 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Workers</p>
              <p className="text-xs font-black">{workers.length}</p>
            </div>
          </div>

          <div className="bg-emerald-900/80 p-2 rounded-xl border border-emerald-700/60 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Produce</p>
              <p className="text-xs font-black">{produce.length}</p>
            </div>
          </div>

          <div className="bg-emerald-900/80 p-2 rounded-xl border border-emerald-700/60 flex items-center gap-2">
            <Tractor className="w-4 h-4 text-amber-300" />
            <div>
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Equipment</p>
              <p className="text-xs font-black">{equipment.length}</p>
            </div>
          </div>

          <div className="bg-emerald-900/80 p-2 rounded-xl border border-emerald-700/60 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <div>
              <p className="text-[10px] text-emerald-300 uppercase font-bold">Mandi Rates</p>
              <p className="text-xs font-black">{mandiRates.length}</p>
            </div>
          </div>

          <div className="bg-amber-400 text-slate-950 p-2 rounded-xl flex items-center gap-2 col-span-2 sm:col-span-1">
            <ShoppingBag className="w-4 h-4 text-slate-950" />
            <div>
              <p className="text-[10px] uppercase font-black">All Bookings</p>
              <p className="text-xs font-black">{bookings.length} Orders</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            onClick={() => setAdminTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition ${
              adminTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{language === 'or' ? 'ଅର୍ଡର ଓ ବୁକିଂ ନିୟନ୍ତ୍ରଣ' : 'Orders & Bookings'} ({bookings.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('workers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition ${
              adminTab === 'workers'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'or' ? 'ମିସ୍ତ୍ରୀ ଓ ଶ୍ରମିକ ନିୟନ୍ତ୍ରଣ' : 'Worker Profiles'} ({workers.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('produce')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition ${
              adminTab === 'produce'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{language === 'or' ? 'ଫସଲ ମଣ୍ଡି ତାଲିକା' : 'Farm Produce'} ({produce.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('equipment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition ${
              adminTab === 'equipment'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>{language === 'or' ? 'ଟ୍ରାକ୍ଟର ଓ ଯନ୍ତ୍ରପାତି' : 'Machinery Rentals'} ({equipment.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('rates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition ${
              adminTab === 'rates'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'or' ? 'ହାଟ ଦର ପରିଚାଳନା' : 'Mandi Rates Ticker'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-slate-50">
          {/* TAB 1: ORDERS & BOOKINGS CONTROL */}
          {adminTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    {language === 'or' ? 'ସମସ୍ତ ଗ୍ରାହକ ଅର୍ଡର ଓ ବୁକିଂ ତାଲିକା' : 'All Customer Orders & Service Requests'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'or' ? 'ଅର୍ଡର ଅନୁମୋଦନ, ବାତିଲ୍ କିମ୍ବା ସମ୍ପୂର୍ଣ୍ଣ ସ୍ଥିତି ବଦଳାନ୍ତୁ।' : 'Approve, Reject, or Mark orders as Completed.'}
                  </p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">No orders or bookings placed yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b: any) => {
                    const isAppr = b.status === 'approved' || b.status === 'Confirmed';
                    const isRej = b.status === 'rejected' || b.status === 'Cancelled';
                    const isPend = b.status === 'pending' || b.status === 'Pending' || !b.status;

                    return (
                      <div
                        key={b.id}
                        className={`bg-white border-2 ${
                          isPend
                            ? 'border-amber-300 bg-amber-50/10'
                            : isAppr
                            ? 'border-emerald-300 bg-emerald-50/10'
                            : 'border-slate-200'
                        } rounded-2xl p-4 shadow-sm space-y-3 hover:shadow-md transition`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                                #{b.id}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isAppr
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : isRej
                                    ? 'bg-red-100 text-red-900 border border-red-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                }`}
                              >
                                {isAppr ? '✓ APPROVED' : isRej ? '✕ REJECTED' : '⏳ PENDING APPROVAL'}
                              </span>
                            </div>
                            <h5 className="font-black text-slate-900 text-sm mt-1">
                              {language === 'or' ? (b.titleOr || b.titleEn) : (b.titleEn || b.titleOr)}
                            </h5>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black text-emerald-900">₹{b.totalPrice || 500}</span>
                            <p className="text-[10px] text-slate-400 font-medium">{b.createdAt}</p>
                          </div>
                        </div>

                        {/* Customer & Location Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <div className="space-y-1">
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">User / Customer Info</p>
                            <p className="font-extrabold text-slate-900">👤 {b.customerName}</p>
                            <p className="font-mono text-slate-700 font-bold">📞 Mobile: +91 {b.customerPhone}</p>
                            <p className="text-slate-800">
                              <strong>Block:</strong> {b.block || 'Berhampur Sadar'} | <strong>Panchayat:</strong> {b.panchayat || 'Bada Bazar'}
                            </p>
                            <p className="text-slate-800">
                              <strong>Pincode:</strong> {b.pincode || '760002'}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Map Geolocation & Target Worker</p>
                            <p className="font-extrabold text-emerald-900">🛠️ Worker: {b.workerName || b.providerName || 'Service Provider'}</p>
                            {b.formattedAddress && (
                              <p className="text-slate-600 line-clamp-2">📍 {b.formattedAddress}</p>
                            )}
                            {b.latitude && b.longitude && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <span>🗺️ View Google Maps Pin ({b.latitude.toFixed(4)}, {b.longitude.toFixed(4)})</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Admin Quick Action Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleBookingStatusChange(b.id, 'approved')}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm ${
                                isAppr
                                  ? 'bg-emerald-800 text-amber-300 ring-2 ring-emerald-400'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>{language === 'or' ? 'ଅନୁମୋଦନ କରନ୍ତୁ (Approve)' : 'Approve Request'}</span>
                            </button>

                            <button
                              onClick={() => handleBookingStatusChange(b.id, 'rejected')}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                                isRej
                                  ? 'bg-red-800 text-white ring-2 ring-red-400'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                            >
                              <XCircle className="w-4 h-4 text-amber-300" />
                              <span>{language === 'or' ? 'ଅସ୍ୱୀକାର କରନ୍ତୁ (Reject)' : 'Reject Request'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/91${b.customerPhone}?text=Hello%20${encodeURIComponent(b.customerName)},%20regarding%20your%20contact%20request%20on%20Ganjam%20Express.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
                            >
                              <MessageSquareCode className="w-3.5 h-3.5 text-emerald-700" />
                              <span>WhatsApp Customer</span>
                            </a>

                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-xl hover:bg-red-50 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORKER PROFILES CONTROL */}
          {adminTab === 'workers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    {language === 'or' ? 'ସମସ୍ତ ଶ୍ରମିକ ଓ ମିସ୍ତ୍ରୀ ପ୍ରୋଫାଇଲ୍' : 'All Worker & Skilled Artisan Profiles'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'or' ? 'ପ୍ରୋଫାଇଲ୍ ସଂଶୋଧନ, ଯାଞ୍ଚ ଅନୁମୋଦନ କିମ୍ବା ନୂତନ କାରିଗର ଯୋଡ଼ନ୍ତୁ।' : 'Edit profiles, upload photo URLs, approve, or add new workers.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingWorker(true)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'or' ? '+ ନୂତନ ଶ୍ରମିକ ଯୋଡ଼ନ୍ତୁ' : '+ Add New Worker'}</span>
                </button>
              </div>

              {/* Add New Worker Form Drawer / Box */}
              {isAddingWorker && (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <h5 className="font-black text-emerald-950 text-sm">
                      {language === 'or' ? 'ନୂତନ ଶ୍ରମିକ ପ୍ରୋଫାଇଲ୍ ତିଆରି କରନ୍ତୁ' : 'Create New Worker Profile'}
                    </h5>
                    <button onClick={() => setIsAddingWorker(false)} className="text-emerald-800 hover:text-emerald-950">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateWorker} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Name (English)</label>
                      <input
                        type="text"
                        required
                        value={newWorker.nameEn || ''}
                        onChange={(e) => setNewWorker({ ...newWorker, nameEn: e.target.value })}
                        placeholder="e.g. Laxman Gouda"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Name (Odia)</label>
                      <input
                        type="text"
                        value={newWorker.nameOr || ''}
                        onChange={(e) => setNewWorker({ ...newWorker, nameOr: e.target.value })}
                        placeholder="ଲକ୍ଷ୍ମଣ ଗୌଡ଼"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={newWorker.category || 'electrician'}
                        onChange={(e) => setNewWorker({ ...newWorker, category: e.target.value as ServiceCategory })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        <option value="electrician">⚡ Electrician</option>
                        <option value="plumber">🚰 Plumber</option>
                        <option value="carpenter">🪚 Carpenter</option>
                        <option value="painter">🎨 Painter</option>
                        <option value="laborer">🌾 Farm Laborer</option>
                        <option value="mechanic">🔧 Mechanic</option>
                        <option value="mason">🧱 Mason / Builder</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Skill Title (English / Odia)</label>
                      <input
                        type="text"
                        value={newWorker.skillTitleEn || ''}
                        onChange={(e) => setNewWorker({ ...newWorker, skillTitleEn: e.target.value, skillTitleOr: e.target.value })}
                        placeholder="Senior House Wiring Expert"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        required
                        value={newWorker.phone || ''}
                        onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value, whatsappNumber: e.target.value })}
                        placeholder="9861234567"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <CascadingLocationSelector
                        onChange={(sel) => {
                          setNewWorker({
                            ...newWorker,
                            locationEn: sel.formattedLocationEn || newWorker.locationEn,
                            locationOr: sel.formattedLocationOr || newWorker.locationOr,
                            formattedAddress: sel.formattedLocationEn || newWorker.formattedAddress
                          });
                        }}
                        language={language}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <GoogleMapsLocationSearch
                        locationData={{
                          formattedAddress: newWorker.formattedAddress || 'Bada Bazar, Main Road, Berhampur, Ganjam, Odisha 760002',
                          latitude: newWorker.latitude ?? 19.314963,
                          longitude: newWorker.longitude ?? 84.794090
                        }}
                        onChange={(geoData) => {
                          setNewWorker({
                            ...newWorker,
                            formattedAddress: geoData.formattedAddress,
                            latitude: geoData.latitude,
                            longitude: geoData.longitude,
                            locationEn: geoData.formattedAddress.split(',')[0] || newWorker.locationEn
                          });
                        }}
                        language={language}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <MultiPhotoGalleryInput
                        photos={newWorker.photos || (newWorker.photoUrl ? [newWorker.photoUrl] : [])}
                        onChange={(pArr) => setNewWorker({ ...newWorker, photos: pArr, photoUrl: pArr[0] || '' })}
                        language={language}
                        maxPhotos={5}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Daily Rate (₹)</label>
                      <input
                        type="number"
                        value={newWorker.dailyRate || 600}
                        onChange={(e) => setNewWorker({ ...newWorker, dailyRate: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Rate (₹)</label>
                      <input
                        type="number"
                        value={newWorker.hourlyRate || 100}
                        onChange={(e) => setNewWorker({ ...newWorker, hourlyRate: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingWorker(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black px-6 py-2 rounded-xl text-xs shadow-md"
                      >
                        Save & Publish Worker
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Workers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workers.map((w) => (
                  <div
                    key={w.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3 hover:border-emerald-300 transition"
                  >
                    <img
                      src={w.photoUrl}
                      alt={w.nameEn}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />

                    <div className="flex-grow space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-sm">{w.nameEn} ({w.nameOr})</h5>
                          <p className="text-xs text-emerald-800 font-semibold">{w.skillTitleEn}</p>
                        </div>
                        <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                          ₹{w.dailyRate}/day
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        📍 {w.formattedAddress || w.locationEn} • 📞 {w.phone} • {w.experienceYears} yrs exp
                      </p>
                      {w.latitude && w.longitude && (
                        <p className="text-[10px] text-emerald-800 font-mono flex items-center gap-1">
                          <span>Map Pin:</span>
                          <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Lat: {w.latitude.toFixed(4)}, Lng: {w.longitude.toFixed(4)}
                          </span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleWorkerStatusChange(w.id, 'approved')}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              w.approvalStatus !== 'rejected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            ✓ Approved
                          </button>
                          <button
                            onClick={() => handleWorkerStatusChange(w.id, 'rejected')}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              w.approvalStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            ✕ Reject
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingWorker(w)}
                            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWorker(w.id)}
                            className="text-xs text-red-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCE MARKETPLACE CONTROL */}
          {adminTab === 'produce' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    {language === 'or' ? 'କୃଷକ ଫସଲ ଓ ପନିପରିବା ମଣ୍ଡି ତାଲିକା' : 'Farmer Crop & Produce Listings'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'or' ? 'ମଣ୍ଡି ସାମଗ୍ରୀର ଦର, ଫୋଟୋ ଓ ବିବରଣୀ ସଂଶୋଧନ କରନ୍ତୁ।' : 'Edit prices, photos, and stock quantities for all produce.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {produce.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-300 transition flex flex-col"
                  >
                    <div className="h-32 relative bg-slate-100">
                      <img src={p.imageUrl} alt={p.titleEn} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                        ₹{p.pricePerUnit} / {p.unit}
                      </span>
                    </div>

                    <div className="p-3 space-y-1.5 flex-grow">
                      <h5 className="font-black text-slate-900 text-sm">{p.titleEn} ({p.titleOr})</h5>
                      <p className="text-xs text-slate-600">👤 Farmer: {p.farmerNameEn} • 📍 {p.locationEn}</p>
                      <p className="text-xs text-slate-500">📞 +91 {p.phone} • Qty: {p.availableQty} {p.unit}s</p>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProduce(p)}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {language === 'or' ? 'ସଂଶୋଧନ' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduce(p.id)}
                          className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {language === 'or' ? 'ଲିଭାନ୍ତୁ' : 'Delete'}
                        </button>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Active Listing
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MACHINERY RENTALS CONTROL */}
          {adminTab === 'equipment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    {language === 'or' ? 'ଟ୍ରାକ୍ଟର ଓ କୃଷି ମେସିନ୍ ଭଡ଼ା ନିୟନ୍ତ୍ରଣ' : 'Tractor & Farm Equipment Rental Directory'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage tractor, harvester, and tiller rental availability in Ganjam.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-3 space-y-2"
                  >
                    <img src={eq.imageUrl} alt={eq.nameEn} className="w-full h-32 object-cover rounded-xl" />
                    <h5 className="font-black text-slate-900 text-sm">{eq.nameEn} ({eq.nameOr})</h5>
                    <p className="text-xs text-slate-600">👤 Owner: {eq.ownerNameEn} • 📍 {eq.locationEn}</p>
                    <p className="text-xs font-extrabold text-emerald-900">₹{eq.hourlyRate}/hr • ₹{eq.dailyRate}/day</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingEquipment(eq)}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {language === 'or' ? 'ସଂଶୋଧନ' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(eq.id)}
                          className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {language === 'or' ? 'ଲିଭାନ୍ତୁ' : 'Delete'}
                        </button>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        {eq.withOperator ? (language === 'or' ? 'ଅପରେଟର ସହିତ' : 'Operator Included') : (language === 'or' ? 'କେବଳ ମେସିନ୍' : 'Machine Only')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MANDI RATES CONTROL */}
          {adminTab === 'rates' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    {language === 'or' ? 'ଗଞ୍ଜାମ ହାଟ ଦର ନିୟନ୍ତ୍ରଣ' : 'Ganjam Wholesale Mandi Rates Control'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Update daily prices for Paddy, Brinjal, Cashew, Chilli, Vegetables.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingRate(true)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Commodity Rate</span>
                </button>
              </div>

              {/* Add New Rate Form */}
              {isAddingRate && (
                <form onSubmit={handleCreateRate} className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3">
                  <h5 className="font-black text-amber-950 text-sm">Add Commodity Rate</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Crop Name (English e.g. Paddy)"
                      required
                      value={newRate.cropEn || ''}
                      onChange={(e) => setNewRate({ ...newRate, cropEn: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Crop Name (Odia e.g. ଧାନ)"
                      value={newRate.cropOr || ''}
                      onChange={(e) => setNewRate({ ...newRate, cropOr: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <select
                      value={newRate.marketEn || 'Berhampur Mandi'}
                      onChange={(e) => setNewRate({ ...newRate, marketEn: e.target.value, marketOr: e.target.value })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    >
                      <option value="Berhampur Mandi">Berhampur Mandi</option>
                      <option value="Aska Mandi">Aska Mandi</option>
                      <option value="Bhanjanagar Mandi">Bhanjanagar Mandi</option>
                      <option value="Hinjilicut Mandi">Hinjilicut Mandi</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Modal Price (₹)"
                      required
                      value={newRate.modalPrice || ''}
                      onChange={(e) => setNewRate({ ...newRate, modalPrice: Number(e.target.value) })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />

                    <input
                      type="number"
                      placeholder="Min Price (₹)"
                      value={newRate.minPrice || ''}
                      onChange={(e) => setNewRate({ ...newRate, minPrice: Number(e.target.value) })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />

                    <input
                      type="number"
                      placeholder="Max Price (₹)"
                      value={newRate.maxPrice || ''}
                      onChange={(e) => setNewRate({ ...newRate, maxPrice: Number(e.target.value) })}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingRate(false)}
                      className="bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                    >
                      Save Rate
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Commodity / Crop</th>
                      <th className="p-3">Mandi / Market</th>
                      <th className="p-3">Modal Price</th>
                      <th className="p-3">Range (Min - Max)</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mandiRates.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 font-medium">
                        <td className="p-3 font-extrabold text-slate-900">{r.cropEn} ({r.cropOr})</td>
                        <td className="p-3 text-slate-600">{r.marketEn}</td>
                        <td className="p-3 font-black text-emerald-900 text-sm">₹{r.modalPrice} / {r.unit}</td>
                        <td className="p-3 text-slate-600">₹{r.minPrice} - ₹{r.maxPrice}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteRate(r.id)}
                            className="text-red-600 hover:underline font-bold text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Worker Modal Overlay */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-extrabold text-slate-900">Edit Worker Profile</h4>
              <button onClick={() => setEditingWorker(null)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Name (English)</label>
                <input
                  type="text"
                  value={editingWorker.nameEn}
                  onChange={(e) => setEditingWorker({ ...editingWorker, nameEn: e.target.value })}
                  className="w-full bg-slate-50 border p-2 text-xs rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Name (Odia)</label>
                <input
                  type="text"
                  value={editingWorker.nameOr}
                  onChange={(e) => setEditingWorker({ ...editingWorker, nameOr: e.target.value })}
                  className="w-full bg-slate-50 border p-2 text-xs rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <MultiPhotoGalleryInput
                  photos={editingWorker.photos || (editingWorker.photoUrl ? [editingWorker.photoUrl] : [])}
                  onChange={(pArr) => setEditingWorker({ ...editingWorker, photos: pArr, photoUrl: pArr[0] || '' })}
                  language={language}
                  maxPhotos={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={editingWorker.dailyRate}
                    onChange={(e) => setEditingWorker({ ...editingWorker, dailyRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border p-2 text-xs rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={editingWorker.hourlyRate}
                    onChange={(e) => setEditingWorker({ ...editingWorker, hourlyRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border p-2 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Produce Modal Overlay */}
      {editingProduce && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-700" />
                  <span>{language === 'or' ? 'ଫସଲ / ମଣ୍ଡି ସାମଗ୍ରୀ ସଂଶୋଧନ' : 'Edit Crop & Produce Listing'}</span>
                </h4>
                <p className="text-xs text-slate-500 font-mono">ID: {editingProduce.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduce(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form wrapping body and sticky bottom footer */}
            <form onSubmit={handleSaveEditedProduce} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingProduce.titleEn}
                      onChange={(e) => setEditingProduce({ ...editingProduce, titleEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title (Odia)</label>
                    <input
                      type="text"
                      value={editingProduce.titleOr}
                      onChange={(e) => setEditingProduce({ ...editingProduce, titleOr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Organic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={editingProduce.category}
                      onChange={(e) => setEditingProduce({ ...editingProduce, category: e.target.value as AgriCategory })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                    >
                      <option value="vegetables">Vegetables (ପନିପରିବା)</option>
                      <option value="grains_rice">Grains & Paddy (ଧାନ ଓ ଶସ୍ୟ)</option>
                      <option value="fruits">Fruits (ଫଳ)</option>
                      <option value="cashew_nuts">Cashew Nuts (କାଜୁ)</option>
                      <option value="homemade">Homemade / Spices (ଗୃହଜାତ / ମସଲା)</option>
                      <option value="seeds_fertilizer">Seeds & Fertilizers (ମଞ୍ଜି ଓ ଖତ)</option>
                    </select>
                  </div>

                  <div className="pt-2 sm:pt-5">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 w-full">
                      <input
                        type="checkbox"
                        checked={editingProduce.isOrganic || false}
                        onChange={(e) => setEditingProduce({ ...editingProduce, isOrganic: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-bold text-emerald-950">100% Organic Certified (ଜୈବିକ)</span>
                    </label>
                  </div>
                </div>

                {/* Price & Unit & Qty */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduce.pricePerUnit}
                      onChange={(e) => setEditingProduce({ ...editingProduce, pricePerUnit: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-extrabold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit</label>
                    <select
                      value={editingProduce.unit}
                      onChange={(e) => setEditingProduce({ ...editingProduce, unit: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                    >
                      <option value="kg">per kg</option>
                      <option value="quintal">per quintal</option>
                      <option value="piece">per piece</option>
                      <option value="bag">per bag</option>
                      <option value="jar">per jar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Qty</label>
                    <input
                      type="number"
                      value={editingProduce.availableQty}
                      onChange={(e) => setEditingProduce({ ...editingProduce, availableQty: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Farmer Name (English)</label>
                    <input
                      type="text"
                      value={editingProduce.farmerNameEn}
                      onChange={(e) => setEditingProduce({ ...editingProduce, farmerNameEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Farmer Name (Odia)</label>
                    <input
                      type="text"
                      value={editingProduce.farmerNameOr}
                      onChange={(e) => setEditingProduce({ ...editingProduce, farmerNameOr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={editingProduce.phone}
                      onChange={(e) => setEditingProduce({ ...editingProduce, phone: e.target.value, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location (e.g. Aska Road, Berhampur)</label>
                    <input
                      type="text"
                      value={editingProduce.locationEn}
                      onChange={(e) => setEditingProduce({ ...editingProduce, locationEn: e.target.value, locationOr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Photo Field with Upload & URL Preview */}
                <PhotoUploadInput
                  value={editingProduce.imageUrl || ''}
                  onChange={(url) => setEditingProduce({ ...editingProduce, imageUrl: url })}
                  label="Crop Photo (Upload File or Paste Image URL)"
                  presetType="produce"
                  language={language}
                />

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                  <textarea
                    rows={2}
                    value={editingProduce.descriptionEn}
                    onChange={(e) => setEditingProduce({ ...editingProduce, descriptionEn: e.target.value, descriptionOr: e.target.value })}
                    placeholder="Fresh produce details..."
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Bottom Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 shadow-lg z-10">
                <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline-block">
                  {language === 'or' ? 'ଫାୟାରବେସ୍ ଡାଟାବେସରେ ସଂରକ୍ଷିତ ହେବ' : 'Persists directly to Firebase Firestore'}
                </span>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingProduce(null)}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                  >
                    {language === 'or' ? 'ବାତିଲ୍ କରନ୍ତୁ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-amber-300 font-black px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin text-amber-300" />
                        <span>{language === 'or' ? 'ସଂରକ୍ଷଣ ହେଉଛି...' : 'Saving Changes...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5 text-amber-300" />
                        <span>{language === 'or' ? 'ସଂଶୋଧନ ସଂରକ୍ଷଣ କରନ୍ତୁ' : 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal Overlay */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Tractor className="w-5 h-5 text-emerald-700" />
                  <span>{language === 'or' ? 'ଟ୍ରାକ୍ଟର ଓ କୃଷି ମେସିନ୍ ସଂଶୋଧନ' : 'Edit Tractor & Equipment Listing'}</span>
                </h4>
                <p className="text-xs text-slate-500 font-mono">ID: {editingEquipment.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEquipment(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form wrapping body and sticky bottom footer */}
            <form onSubmit={handleSaveEditedEquipment} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Equipment Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingEquipment.nameEn}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, nameEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Equipment Name (Odia)</label>
                    <input
                      type="text"
                      value={editingEquipment.nameOr}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, nameOr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Operator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={editingEquipment.category}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                    >
                      <option value="tractor">Tractor (ଟ୍ରାକ୍ଟର)</option>
                      <option value="harvester">Paddy Harvester (ଧାନ କଟା ମେସିନ୍)</option>
                      <option value="tiller">Power Tiller (ପାୱାର ଟିଲର)</option>
                      <option value="thresher">Thresher (ମାଡ଼ି ମେସିନ୍)</option>
                      <option value="pump">Water Pump (ପାଣି ପମ୍ପ)</option>
                    </select>
                  </div>

                  <div className="pt-2 sm:pt-5">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 w-full">
                      <input
                        type="checkbox"
                        checked={editingEquipment.withOperator}
                        onChange={(e) => setEditingEquipment({ ...editingEquipment, withOperator: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-bold text-amber-950">Operator Driver Included (ଡ୍ରାଇଭର ସହିତ)</span>
                    </label>
                  </div>
                </div>

                {/* Rates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hourly Rate (₹/hr) *</label>
                    <input
                      type="number"
                      required
                      value={editingEquipment.hourlyRate}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, hourlyRate: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-extrabold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daily Rate (₹/day) *</label>
                    <input
                      type="number"
                      required
                      value={editingEquipment.dailyRate}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, dailyRate: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-extrabold text-emerald-900"
                    />
                  </div>
                </div>

                {/* Owner Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Owner Name (English)</label>
                    <input
                      type="text"
                      value={editingEquipment.ownerNameEn}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, ownerNameEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Owner Name (Odia)</label>
                    <input
                      type="text"
                      value={editingEquipment.ownerNameOr}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, ownerNameOr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={editingEquipment.phone}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, phone: e.target.value, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location (e.g. Hinjilicut, Ganjam)</label>
                    <input
                      type="text"
                      value={editingEquipment.locationEn}
                      onChange={(e) => setEditingEquipment({ ...editingEquipment, locationEn: e.target.value, locationOr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Photo Field with Upload & URL Preview */}
                <PhotoUploadInput
                  value={editingEquipment.imageUrl || ''}
                  onChange={(url) => setEditingEquipment({ ...editingEquipment, imageUrl: url })}
                  label="Equipment Photo (Upload File or Paste Image URL)"
                  presetType="equipment"
                  language={language}
                />

                {/* Specs */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specifications / Features</label>
                  <textarea
                    rows={2}
                    value={editingEquipment.specsEn}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, specsEn: e.target.value, specsOr: e.target.value })}
                    placeholder="Horsepower, attachments, condition..."
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Bottom Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 shadow-lg z-10">
                <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline-block">
                  {language === 'or' ? 'ଫାୟାରବେସ୍ ଡାଟାବେସରେ ସଂରକ୍ଷିତ ହେବ' : 'Persists directly to Firebase Firestore'}
                </span>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingEquipment(null)}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                  >
                    {language === 'or' ? 'ବାତିଲ୍ କରନ୍ତୁ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-amber-300 font-black px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin text-amber-300" />
                        <span>{language === 'or' ? 'ସଂରକ୍ଷଣ ହେଉଛି...' : 'Saving Changes...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5 text-amber-300" />
                        <span>{language === 'or' ? 'ସଂଶୋଧନ ସଂରକ୍ଷଣ କରନ୍ତୁ' : 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
