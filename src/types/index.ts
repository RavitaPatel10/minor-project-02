export type UserRole = 'farmer' | 'consumer' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  mobile: string;
  name: string;
  role: UserRole;
  state: string;
  district: string;
  village?: string;
  address?: string;
  createdAt: string;
}

export interface FarmerProfile {
  userId: string;
  farmerCode: string; // e.g. FMR-HR-1002
  landSizeAcres: number;
  primaryCrop: string;
  kisanCreditCard: string;
  bankAccount: string;
  ifscCode: string;
}

export interface ProcurementCentre {
  id: string;
  name: string;
  code: string; // e.g. KNL-01
  state: string;
  district: string;
  address: string;
  totalCounters: number;
  activeCounters: number;
  avgMinsPerFarmer: number;
  dailyCapacityKg: number;
  currentBookedKg: number;
  openingTime: string;
  closingTime: string;
  contactNumber: string;
  cropsSupported: string[];
}

export interface ProcurementSlot {
  id: string;
  centreId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. 09:00 AM
  endTime: string; // e.g. 11:00 AM
  maxCapacityKg: number;
  bookedCapacityKg: number;
  farmerLimit: number;
  bookedFarmers: number;
  isClosed: boolean;
}

export type BookingStatus =
  | 'SLOT_BOOKED'
  | 'TOKEN_GENERATED'
  | 'CHECKED_IN'
  | 'WEIGHMENT_IN_PROGRESS'
  | 'WEIGHMENT_COMPLETED'
  | 'PROCUREMENT_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SETTLED'
  | 'ABSENT'
  | 'CANCELLED';

export interface Booking {
  id: string;
  bookingCode: string; // e.g. BKG-2026-4412
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  farmerCode: string;
  centreId: string;
  centreName: string;
  centreDistrict: string;
  slotId: string;
  date: string;
  timeSlot: string;
  crop: string;
  expectedQuantityKg: number;
  status: BookingStatus;
  tokenId?: string;
  createdAt: string;
  counterAssigned?: number;
}

export interface Token {
  id: string;
  tokenNumber: string; // e.g. TKN-KNL-104
  bookingId: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  centreName: string;
  crop: string;
  expectedQuantityKg: number;
  date: string;
  generatedAt: string;
  status: 'ACTIVE' | 'PROCESSING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  counterAssigned?: number;
}

export interface QueueRecord {
  id: string;
  tokenId: string;
  tokenNumber: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  centreId: string;
  crop: string;
  expectedQuantityKg: number;
  arrivalTime: string;
  checkedInTime?: string;
  queuePosition: number;
  status: 'WAITING' | 'IN_COUNTER' | 'WEIGHMENT_DONE' | 'ABSENT' | 'DELAYED_GRACE';
  gracePeriodMinutes: number;
  estimatedWaitMinutes: number;
  counterAssigned?: number;
}

export interface WeighmentRecord {
  id: string;
  receiptNumber: string; // e.g. RCP-2026-9041
  tokenId: string;
  tokenNumber: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  centreId: string;
  centreName: string;
  operatorId: string;
  operatorName: string;
  counterNumber: number;
  crop: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  acceptedQuantityKg: number;
  rejectedQuantityKg: number;
  rejectionReason?: string;
  moisturePercentage: number;
  mspRatePerKg: number;
  totalAmount: number;
  timestamp: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  weighmentId: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  bankAccount: string;
  ifscCode: string;
  centreId: string;
  centreName: string;
  crop: string;
  acceptedWeightKg: number;
  mspRatePerKg: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  paymentRefNumber?: string;
  paymentMode: 'PFMS' | 'DBT' | 'NEFT';
  settledAt?: string;
  remarks?: string;
}

export type OrganicStatus = 'VERIFIED_ORGANIC' | 'IN_CONVERSION' | 'NATURAL_FARMING';

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerDistrict: string;
  title: string;
  titleHi?: string;
  category: 'Grains & Pulses' | 'Vegetables' | 'Fresh Fruits' | 'Spices & Herbs' | 'Dairy & Honey' | 'Cold-Pressed Oils';
  description: string;
  pricePerKg: number;
  quantityAvailableKg: number;
  unit: string;
  harvestDate: string;
  organicStatus: OrganicStatus;
  imageUrl: string;
  pickupLocation: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  pricePerKg: number;
  quantityKg: number;
  farmerId: string;
  farmerName: string;
}

export type OrderStatus = 'ORDER_RECEIVED' | 'ACCEPTED' | 'READY_FOR_DISPATCH' | 'DISPATCHED' | 'DELIVERED';

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-2026-784
  consumerId: string;
  consumerName: string;
  consumerMobile: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'SMS_SIMULATED' | 'QUEUE_ALERT' | 'WEIGHMENT_ALERT' | 'PAYMENT_ALERT' | 'ORDER_ALERT';
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
