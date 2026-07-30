import React, { useState, useEffect } from 'react';
import { 
  Language, 
  ActiveTab, 
  WorkerProfile, 
  ProduceItem, 
  EquipmentItem, 
  MandiRate, 
  Booking, 
  UserProfile,
  ServiceCategory,
  AgriCategory,
  Review
} from './types';
import { translations } from './data/translations';
import { initialWorkers, initialProduce, initialEquipment, initialMandiRates, ganjamTehsils } from './data/mockData';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { WorkerCard } from './components/SevaSection/WorkerCard';
import { WorkerDetailModal } from './components/SevaSection/WorkerDetailModal';
import { RegisterWorkerModal } from './components/SevaSection/RegisterWorkerModal';
import { ProduceCard } from './components/MandiSection/ProduceCard';
import { EquipmentCard } from './components/MandiSection/EquipmentCard';
import { MandiRateTicker } from './components/MandiSection/MandiRateTicker';
import { AddProduceModal } from './components/MandiSection/AddProduceModal';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { BookingsDrawer } from './components/BookingsDrawer';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { ShareWorkerModal } from './components/ShareWorkerModal';
import { BookingRequestModal } from './components/BookingRequestModal';
import { triggerWebShare, updateOgMetaTags } from './utils/shareUtils';
import { db } from './lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Wrench, 
  Sprout, 
  Tractor, 
  TrendingUp, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquareCode, 
  Sparkles, 
  Users, 
  ShoppingBag,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function App() {
  // Global State with localStorage backing
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('ganjam_lang') as Language) || 'or'; // Default Odia for Ganjam
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [serviceCategory, setServiceCategory] = useState<string>('all');
  const [agriCategory, setAgriCategory] = useState<string>('all');

  // Data Collections
  const [workers, setWorkers] = useState<WorkerProfile[]>(() => {
    const saved = localStorage.getItem('ganjam_workers');
    return saved ? JSON.parse(saved) : initialWorkers;
  });

  const [produce, setProduce] = useState<ProduceItem[]>(() => {
    const saved = localStorage.getItem('ganjam_produce');
    return saved ? JSON.parse(saved) : initialProduce;
  });

  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => {
    const saved = localStorage.getItem('ganjam_equipment');
    return saved ? JSON.parse(saved) : initialEquipment;
  });

  const [mandiRates, setMandiRates] = useState<MandiRate[]>(initialMandiRates);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('ganjam_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ganjam_user');
    return saved ? JSON.parse(saved) : {
      isLoggedIn: true,
      name: 'Santilata Nayak',
      email: 'santilatanyak@gmail.com',
      phone: '9861000000',
      role: 'admin',
      location: 'Berhampur',
      isAdmin: true
    };
  });

  // Modals state
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [shareWorker, setShareWorker] = useState<WorkerProfile | null>(null);
  const [isRegisterWorkerOpen, setIsRegisterWorkerOpen] = useState(false);
  const [isAddProduceOpen, setIsAddProduceOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);

  // Contact Request Approval Modal State
  const [contactRequestModalWorker, setContactRequestModalWorker] = useState<{
    worker: WorkerProfile;
    action: 'call' | 'whatsapp';
  } | null>(null);

  // Helper to determine booking contact approval status for a worker
  const getWorkerBookingStatus = (workerId: string): 'approved' | 'pending' | 'rejected' | 'none' => {
    const found = bookings.find((b: any) => b.workerId === workerId || b.id.includes(workerId));
    if (!found) return 'none';
    if (found.status === 'approved' || found.status === 'Confirmed') return 'approved';
    if (found.status === 'rejected' || found.status === 'Cancelled') return 'rejected';
    if (found.status === 'pending' || found.status === 'Pending') return 'pending';
    return 'none';
  };

  const handleRequestContact = (worker: WorkerProfile, action: 'call' | 'whatsapp') => {
    const status = getWorkerBookingStatus(worker.id);
    if (status === 'approved') {
      if (action === 'call') {
        window.location.href = `tel:${worker.phone}`;
      } else {
        const waMsg = encodeURIComponent(
          language === 'or'
            ? `ନମସ୍କାର ${worker.nameOr}, ମୁଁ ଗଞ୍ଜାମ ଏକ୍ସପ୍ରେସ୍‌ରୁ ଆପଣଙ୍କ ${worker.skillTitleOr} କାମ ବିଷୟରେ ଜାଣି ବୁକିଂ କରିବାକୁ ଚାହୁଁଛି।`
            : `Hello ${worker.nameEn}, I saw your profile on Ganjam Express and want to book your services.`
        );
        window.open(`https://wa.me/${worker.whatsappNumber}?text=${waMsg}`, '_blank');
      }
    } else {
      setContactRequestModalWorker({ worker, action });
    }
  };

  // Real-time Firebase Firestore listener for Bookings & Contact Requests
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        if (!snapshot.empty) {
          const fsBookingsMap = new Map<string, any>();
          snapshot.docs.forEach((docSnap) => {
            fsBookingsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          });

          setBookings((prevBookings) => {
            const updated = prevBookings.map((b) => {
              if (fsBookingsMap.has(b.id)) {
                return { ...b, ...fsBookingsMap.get(b.id) };
              }
              return b;
            });

            fsBookingsMap.forEach((fsData, id) => {
              if (!updated.some((b) => b.id === id)) {
                updated.unshift(fsData);
              }
            });

            return updated;
          });
        }
      }, (err) => console.warn('Firestore bookings listener notice:', err));

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore bookings setup notice:', e);
    }
  }, []);

  // Auto detect shared worker profile from URL params (?worker=w1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workerId = params.get('worker') || params.get('shareWorker');
    if (workerId) {
      const found = workers.find((w) => w.id === workerId);
      if (found) {
        setSelectedWorker(found);
        updateOgMetaTags(found, language);
      }
    }
  }, [workers, language]);

  const handleShareWorker = async (w: WorkerProfile) => {
    updateOgMetaTags(w, language);
    const sharedNatively = await triggerWebShare(w, language);
    if (!sharedNatively) {
      setShareWorker(w);
    }
  };

  // Booking Modal State
  const [bookingItem, setBookingItem] = useState<{
    type: 'service' | 'produce' | 'equipment';
    data: WorkerProfile | ProduceItem | EquipmentItem;
  } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ganjam_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ganjam_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('ganjam_produce', JSON.stringify(produce));
  }, [produce]);

  useEffect(() => {
    localStorage.setItem('ganjam_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('ganjam_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('ganjam_user', JSON.stringify(user));
  }, [user]);

  // Real-time Firebase Firestore listener for Worker Status Updates & Database Synchronization
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'workers'), (snapshot) => {
        if (!snapshot.empty) {
          const firestoreWorkersMap = new Map<string, any>();
          snapshot.docs.forEach((docSnap) => {
            firestoreWorkersMap.set(docSnap.id, docSnap.data());
          });

          setWorkers((prevWorkers) => {
            // Update status / approvalStatus for existing workers, or add new ones
            const updated = prevWorkers.map((w) => {
              if (firestoreWorkersMap.has(w.id)) {
                const fsData = firestoreWorkersMap.get(w.id);
                return {
                  ...w,
                  approvalStatus: fsData.approvalStatus || fsData.status || w.approvalStatus,
                  ...fsData
                };
              }
              return w;
            });

            // Also include any new workers added directly to Firestore
            firestoreWorkersMap.forEach((fsData, id) => {
              if (!updated.some((w) => w.id === id)) {
                updated.unshift({
                  id,
                  nameEn: fsData.nameEn || 'Worker',
                  nameOr: fsData.nameOr || 'ଶ୍ରମିକ',
                  category: fsData.category || 'electrician',
                  skillTitleEn: fsData.skillTitleEn || 'Technician',
                  skillTitleOr: fsData.skillTitleOr || 'ମିସ୍ତ୍ରୀ',
                  phone: fsData.phone || '',
                  whatsappNumber: fsData.whatsappNumber || fsData.phone || '',
                  locationEn: fsData.locationEn || 'Berhampur',
                  locationOr: fsData.locationOr || 'ବ୍ରହ୍ମପୁର',
                  photoUrl: fsData.photoUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
                  rating: fsData.rating || 5.0,
                  reviewCount: fsData.reviewCount || 1,
                  dailyRate: fsData.dailyRate || 500,
                  hourlyRate: fsData.hourlyRate || 100,
                  experienceYears: fsData.experienceYears || 5,
                  bioEn: fsData.bioEn || 'Skilled local service provider.',
                  bioOr: fsData.bioOr || 'ଦକ୍ଷ ସ୍ଥାନୀୟ କାରିଗର।',
                  languagesSpoken: fsData.languagesSpoken || ['Odia', 'Hindi'],
                  isVerified: true,
                  isTopRated: true,
                  reviews: fsData.reviews || [],
                  approvalStatus: fsData.approvalStatus || fsData.status || 'approved'
                });
              }
            });

            return updated;
          });
        }
      }, (err) => {
        console.warn('Firestore snapshot listener warning:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore initialization warning:', e);
    }
  }, []);

  // Real-time Firebase Firestore listener for Produce Listings & Database Synchronization
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'produce'), (snapshot) => {
        if (!snapshot.empty) {
          const fsProduceMap = new Map<string, any>();
          snapshot.docs.forEach((docSnap) => {
            fsProduceMap.set(docSnap.id, docSnap.data());
          });

          setProduce((prevProduce) => {
            const updated = prevProduce.map((p) => {
              if (fsProduceMap.has(p.id)) {
                return { ...p, ...fsProduceMap.get(p.id) };
              }
              return p;
            });

            fsProduceMap.forEach((fsData, id) => {
              if (!updated.some((p) => p.id === id)) {
                updated.unshift({ id, ...fsData } as ProduceItem);
              }
            });

            return updated;
          });
        }
      }, (err) => console.warn('Firestore produce listener warning:', err));

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore produce listener init warning:', e);
    }
  }, []);

  // Real-time Firebase Firestore listener for Equipment Rentals & Database Synchronization
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'equipments'), (snapshot) => {
        if (!snapshot.empty) {
          const fsEquipMap = new Map<string, any>();
          snapshot.docs.forEach((docSnap) => {
            fsEquipMap.set(docSnap.id, docSnap.data());
          });

          setEquipment((prevEquipment) => {
            const updated = prevEquipment.map((eq) => {
              if (fsEquipMap.has(eq.id)) {
                return { ...eq, ...fsEquipMap.get(eq.id) };
              }
              return eq;
            });

            fsEquipMap.forEach((fsData, id) => {
              if (!updated.some((eq) => eq.id === id)) {
                updated.unshift({ id, ...fsData } as EquipmentItem);
              }
            });

            return updated;
          });
        }
      }, (err) => console.warn('Firestore equipment listener warning:', err));

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore equipment listener init warning:', e);
    }
  }, []);

  const t = translations[language];

  // Handler functions
  const handleAddWorker = (newWorker: WorkerProfile) => {
    setWorkers((prev) => [newWorker, ...prev]);
  };

  const handleAddProduce = (newProduce: ProduceItem) => {
    setProduce((prev) => [newProduce, ...prev]);
  };

  const handleAddEquipment = (newEquipment: EquipmentItem) => {
    setEquipment((prev) => [newEquipment, ...prev]);
  };

  const handleAddReview = (workerId: string, reviewData: Omit<Review, 'id' | 'workerId' | 'date'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `r_${Date.now()}`,
      workerId,
      date: new Date().toISOString().split('T')[0]
    };

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const updatedReviews = [newRev, ...w.reviews];
          const avgRating = Number(
            (
              updatedReviews.reduce((acc, r) => acc + r.rating, 0) /
              updatedReviews.length
            ).toFixed(1)
          );
          return {
            ...w,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: avgRating
          };
        }
        return w;
      })
    );

    if (selectedWorker && selectedWorker.id === workerId) {
      setSelectedWorker((prev) => {
        if (!prev) return null;
        const updated = [newRev, ...prev.reviews];
        const avg = Number(
          (updated.reduce((a, r) => a + r.rating, 0) / updated.length).toFixed(1)
        );
        return {
          ...prev,
          reviews: updated,
          reviewCount: updated.length,
          rating: avg
        };
      });
    }
  };

  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  // Filters calculation
  const filteredWorkers = workers.filter((w) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      w.nameEn.toLowerCase().includes(q) ||
      w.nameOr.includes(q) ||
      w.skillTitleEn.toLowerCase().includes(q) ||
      w.skillTitleOr.includes(q) ||
      w.category.includes(q) ||
      w.locationEn.toLowerCase().includes(q) ||
      w.locationOr.includes(q);

    const matchesTehsil = !selectedTehsil || w.locationEn.toLowerCase().includes(selectedTehsil.toLowerCase());
    const matchesCategory = serviceCategory === 'all' || w.category === serviceCategory;

    return matchesSearch && matchesTehsil && matchesCategory;
  });

  const filteredProduce = produce.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.titleEn.toLowerCase().includes(q) ||
      p.titleOr.includes(q) ||
      p.farmerNameEn.toLowerCase().includes(q) ||
      p.farmerNameOr.includes(q) ||
      p.locationEn.toLowerCase().includes(q) ||
      p.locationOr.includes(q);

    const matchesTehsil = !selectedTehsil || p.locationEn.toLowerCase().includes(selectedTehsil.toLowerCase());
    const matchesCategory = agriCategory === 'all' || p.category === agriCategory;

    return matchesSearch && matchesTehsil && matchesCategory;
  });

  const filteredEquipment = equipment.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      e.nameEn.toLowerCase().includes(q) ||
      e.nameOr.includes(q) ||
      e.ownerNameEn.toLowerCase().includes(q) ||
      e.ownerNameOr.includes(q) ||
      e.locationEn.toLowerCase().includes(q) ||
      e.locationOr.includes(q);

    const matchesTehsil = !selectedTehsil || e.locationEn.toLowerCase().includes(selectedTehsil.toLowerCase());

    return matchesSearch && matchesTehsil;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 sm:pb-10 selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
        bookingCount={bookings.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTehsil={selectedTehsil}
        onTehsilChange={setSelectedTehsil}
        onOpenRegisterWorker={() => setIsRegisterWorkerOpen(true)}
        onOpenAddProduce={() => setIsAddProduceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Card / Highlights */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/60">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              {language === 'or' ? 'ଗଞ୍ଜାମ ଜିଲ୍ଲାର ନିଜସ୍ୱ ପ୍ଲାଟଫର୍ମ' : 'Ganjam Local Network'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-emerald-50 leading-tight">
              {activeTab === 'services' && (language === 'or' ? 'ମିସ୍ତ୍ରୀ, କାରିଗର ଓ ଶ୍ରମିକଙ୍କୁ ସିଧାସଳଖ ବୁକ୍ କରନ୍ତୁ' : 'Book Local Electricians, Plumbers & Laborers Direct')}
              {activeTab === 'mandi' && (language === 'or' ? 'ଚାଷୀଙ୍କଠାରୁ ସିଧାସଳଖ ତାଜା ଫସଲ ଓ ପନିପରିବା କିଣନ୍ତୁ' : 'Buy Fresh Crops & Vegetables Direct from Ganjam Farmers')}
              {activeTab === 'rentals' && (language === 'or' ? 'ଚାଷ ଜମି ପାଇଁ ଟ୍ରାକ୍ଟର ଓ ହାର୍ଭେଷ୍ଟର୍ ଭଡ଼ାରେ ନିଅନ୍ତୁ' : 'Rent Tractors & Harvesters by Date/Hour for Field Work')}
              {activeTab === 'mandi-rates' && (language === 'or' ? 'ବ୍ରହ୍ମପୁର, ଆସିକା ଓ ଭଞ୍ଜନଗର ହାଟର ଆଜିର ସଠିକ୍ ଦର' : 'Verified Daily Wholesale Mandi Commodity Rates in Ganjam')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-medium">
              {language === 'or' 
                ? 'କୌଣସି ମଧ୍ୟସ୍ଥି ନାହିଁ। ସିଧାସଳଖ WhatsApp କିମ୍ବା Phone Call ଦ୍ୱାରା ଯୋଗାଯୋଗ କରନ୍ତୁ।' 
                : 'Zero middleman commission. Direct WhatsApp booking and phone connection for all residents & farmers in Ganjam.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsAiOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span>{t.aiAssistantBtn}</span>
              </button>

              <button
                onClick={() => setIsRegisterWorkerOpen(true)}
                className="bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm border border-emerald-600 transition"
              >
                {t.addService}
              </button>
            </div>
          </div>

          {/* Background Decorative Badges */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* TAB 1: LOCAL SERVICES DIRECTORY */}
        {activeTab === 'services' && (
          <section className="space-y-6">
            {/* Category Filter Pills */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setServiceCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'all'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.catAll}
                </button>
                <button
                  onClick={() => setServiceCategory('electrician')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'electrician'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ⚡ {t.catElectrician}
                </button>
                <button
                  onClick={() => setServiceCategory('plumber')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'plumber'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🚰 {t.catPlumber}
                </button>
                <button
                  onClick={() => setServiceCategory('carpenter')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'carpenter'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🪚 {t.catCarpenter}
                </button>
                <button
                  onClick={() => setServiceCategory('painter')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'painter'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🎨 {t.catPainter}
                </button>
                <button
                  onClick={() => setServiceCategory('laborer')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'laborer'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌾 {t.catLaborer}
                </button>
                <button
                  onClick={() => setServiceCategory('mechanic')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'mechanic'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🔧 {t.catMechanic}
                </button>
                <button
                  onClick={() => setServiceCategory('mason')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    serviceCategory === 'mason'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🧱 {t.catMason}
                </button>
              </div>
            </div>

            {/* Title Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{t.servicesTitle}</h2>
                <p className="text-xs text-slate-500 font-medium">{t.servicesSub}</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {filteredWorkers.length} {language === 'or' ? 'ଜଣ ମିସ୍ତ୍ରୀ' : 'Workers Available'}
              </span>
            </div>

            {/* Workers Grid */}
            {filteredWorkers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-600 font-bold text-sm">{t.noWorkersFound}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setServiceCategory('all');
                    setSelectedTehsil('');
                  }}
                  className="text-xs font-bold text-emerald-800 underline"
                >
                  {language === 'or' ? 'ସମସ୍ତ ଫିଲ୍ଟର୍ ହଟାନ୍ତୁ' : 'Clear All Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    language={language}
                    onSelectWorker={setSelectedWorker}
                    onBookNow={(w) =>
                      setBookingItem({ type: 'service', data: w })
                    }
                    onShareWorker={handleShareWorker}
                    bookingStatus={getWorkerBookingStatus(worker.id)}
                    onRequestContact={handleRequestContact}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: AGRI & LOCAL MANDI MARKETPLACE */}
        {activeTab === 'mandi' && (
          <section className="space-y-6">
            {/* Agri Categories */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setAgriCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition ${
                    agriCategory === 'all'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.catAll}
                </button>
                <button
                  onClick={() => setAgriCategory('vegetables')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    agriCategory === 'vegetables'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🍆 {t.catVeg}
                </button>
                <button
                  onClick={() => setAgriCategory('grains_rice')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    agriCategory === 'grains_rice'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌾 {t.catGrains}
                </button>
                <button
                  onClick={() => setAgriCategory('cashew_nuts')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    agriCategory === 'cashew_nuts'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🥜 {t.catCashew}
                </button>
                <button
                  onClick={() => setAgriCategory('homemade')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                    agriCategory === 'homemade'
                      ? 'bg-emerald-800 text-amber-300 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🥭 {t.catHomemade}
                </button>
              </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{t.mandiTitle}</h2>
                <p className="text-xs text-slate-500 font-medium">{t.mandiSub}</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {filteredProduce.length} {language === 'or' ? 'ଟି ଫସଲ ସାମଗ୍ରୀ' : 'Items Listed'}
              </span>
            </div>

            {/* Produce Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProduce.map((p) => (
                <ProduceCard
                  key={p.id}
                  produce={p}
                  language={language}
                  onOrderNow={(item) =>
                    setBookingItem({ type: 'produce', data: item })
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: MACHINERY & TRACTOR RENTALS */}
        {activeTab === 'rentals' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{t.rentalTitle}</h2>
                <p className="text-xs text-slate-500 font-medium">{t.rentalSub}</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {filteredEquipment.length} {language === 'or' ? 'ଟି ମେସିନ୍ ଉପଲବ୍ଧ' : 'Machines Listed'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEquipment.map((eq) => (
                <EquipmentCard
                  key={eq.id}
                  equipment={eq}
                  language={language}
                  onBookEquipment={(item) =>
                    setBookingItem({ type: 'equipment', data: item })
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: LIVE MANDI RATES */}
        {activeTab === 'mandi-rates' && (
          <section className="space-y-6">
            <MandiRateTicker rates={mandiRates} language={language} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-800 mt-12 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h3 className="font-extrabold text-white text-base">{t.appTitle}</h3>
            <p className="text-xs text-emerald-300/80 mt-0.5">{t.footerMsg}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-emerald-300">
            <button onClick={() => setLanguage('or')} className={language === 'or' ? 'text-amber-300 font-bold' : ''}>
              ଓଡ଼ିଆ
            </button>
            <span>•</span>
            <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-amber-300 font-bold' : ''}>
              English
            </button>
            <span>•</span>
            <span>Ganjam, Odisha, India</span>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Modals & Drawers */}
      <WorkerDetailModal
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
        language={language}
        onAddReview={handleAddReview}
        onOpenBooking={(w) => setBookingItem({ type: 'service', data: w })}
        onShareWorker={handleShareWorker}
        bookingStatus={selectedWorker ? getWorkerBookingStatus(selectedWorker.id) : 'none'}
        onRequestContact={handleRequestContact}
      />

      <BookingRequestModal
        isOpen={!!contactRequestModalWorker}
        onClose={() => setContactRequestModalWorker(null)}
        worker={contactRequestModalWorker?.worker || null}
        actionType={contactRequestModalWorker?.action || 'call'}
        language={language}
        initialUserData={{
          name: user.name,
          phone: user.phone
        }}
        onRequestSubmitted={(newRequest) => {
          setBookings((prev) => [newRequest, ...prev]);
        }}
      />

      <ShareWorkerModal
        worker={shareWorker}
        isOpen={!!shareWorker}
        onClose={() => setShareWorker(null)}
        language={language}
      />

      <RegisterWorkerModal
        isOpen={isRegisterWorkerOpen}
        onClose={() => setIsRegisterWorkerOpen(false)}
        language={language}
        onAddWorker={handleAddWorker}
      />

      <AddProduceModal
        isOpen={isAddProduceOpen}
        onClose={() => setIsAddProduceOpen(false)}
        language={language}
        onAddProduce={handleAddProduce}
        onAddEquipment={handleAddEquipment}
      />

      <BookingModal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        language={language}
        item={bookingItem}
        onConfirmBooking={handleConfirmBooking}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        onLoginSuccess={setUser}
        currentUser={user}
      />

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        language={language}
      />

      <BookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        language={language}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        user={user}
        workers={workers}
        setWorkers={setWorkers}
        produce={produce}
        setProduce={setProduce}
        equipment={equipment}
        setEquipment={setEquipment}
        mandiRates={mandiRates}
        setMandiRates={setMandiRates}
        bookings={bookings}
        setBookings={setBookings}
        onLogoutAdmin={() => {
          setUser({ isLoggedIn: false, name: '', phone: '', role: 'customer', location: 'Berhampur', isAdmin: false });
          setIsAdminOpen(false);
        }}
      />
    </div>
  );
}
