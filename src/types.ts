export type Language = 'en' | 'or';

export type ActiveTab = 'services' | 'mandi' | 'rentals' | 'mandi-rates';

export type ServiceCategory = 
  | 'electrician' 
  | 'plumber' 
  | 'carpenter' 
  | 'painter' 
  | 'laborer' 
  | 'mechanic' 
  | 'mason' 
  | 'ac_appliance' 
  | 'driver';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  workerId: string;
}

export interface WorkerProfile {
  id: string;
  nameEn: string;
  nameOr: string;
  category: ServiceCategory;
  skillTitleEn: string;
  skillTitleOr: string;
  phone: string;
  whatsappNumber: string;
  locationEn: string;
  locationOr: string;
  photoUrl: string;
  photos?: string[];
  rating: number;
  reviewCount: number;
  dailyRate: number;
  hourlyRate: number;
  experienceYears: number;
  isVerified: boolean;
  isTopRated?: boolean;
  languagesSpoken: string[];
  bioEn: string;
  bioOr: string;
  isAvailable: boolean;
  reviews: Review[];
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
}

export type AgriCategory = 
  | 'vegetables' 
  | 'grains_rice' 
  | 'fruits' 
  | 'cashew_nuts' 
  | 'homemade' 
  | 'seeds_fertilizer';

export interface ProduceItem {
  id: string;
  titleEn: string;
  titleOr: string;
  farmerNameEn: string;
  farmerNameOr: string;
  phone: string;
  whatsappNumber: string;
  locationEn: string;
  locationOr: string;
  category: AgriCategory;
  pricePerUnit: number;
  unit: 'kg' | 'quintal' | 'piece' | 'bag' | 'jar';
  minOrderQty: number;
  availableQty: number;
  imageUrl: string;
  descriptionEn: string;
  descriptionOr: string;
  isOrganic?: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export interface EquipmentItem {
  id: string;
  nameEn: string;
  nameOr: string;
  category: 'tractor' | 'harvester' | 'tiller' | 'thresher' | 'pump';
  ownerNameEn: string;
  ownerNameOr: string;
  phone: string;
  whatsappNumber: string;
  locationEn: string;
  locationOr: string;
  hourlyRate: number;
  dailyRate: number;
  withOperator: boolean;
  imageUrl: string;
  specsEn: string;
  specsOr: string;
  isAvailable: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export interface MandiRate {
  id: string;
  cropEn: string;
  cropOr: string;
  marketEn: string; // e.g. Berhampur Mandi, Aska Mandi, Bhanjanagar Mandi
  marketOr: string;
  minPrice: number; // per quintal
  maxPrice: number;
  modalPrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changeAmount: number;
  updatedAt: string;
}

export interface Booking {
  id: string;
  type: 'service' | 'produce' | 'equipment';
  titleEn: string;
  titleOr: string;
  providerName: string;
  providerPhone: string;
  date: string;
  timeSlot?: string;
  quantityOrHours?: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  paymentMethod: 'UPI' | 'COD' | 'PayOnService';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  whatsappMsg: string;
  createdAt: string;
}

export interface UserProfile {
  isLoggedIn: boolean;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'worker' | 'farmer' | 'admin';
  location: string;
  isAdmin?: boolean;
}
