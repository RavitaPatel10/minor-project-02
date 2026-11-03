import fs from 'fs';
import path from 'path';
import {
  User,
  FarmerProfile,
  ProcurementCentre,
  ProcurementSlot,
  Booking,
  Token,
  QueueRecord,
  WeighmentRecord,
  PaymentRecord,
  Product,
  Order,
  AppNotification,
  AuditLog
} from '../types/index.ts';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> password (hashed/plain for demo)
  farmerProfiles: FarmerProfile[];
  operatorCentres: Record<string, string>; // operatorId -> centreId
  procurementCentres: ProcurementCentre[];
  procurementSlots: ProcurementSlot[];
  bookings: Booking[];
  tokens: Token[];
  queueRecords: QueueRecord[];
  weighmentRecords: WeighmentRecord[];
  paymentRecords: PaymentRecord[];
  products: Product[];
  orders: Order[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'agriconnect_db.json');

// Initial seed data generator
function createSeedData(): DatabaseSchema {
  const users: User[] = [
    // Farmer 1 (Primary Demo Farmer)
    {
      id: 'usr_farmer_1',
      email: 'ramesh.farmer@agriconnect.in',
      mobile: '+91 98765 43210',
      name: 'Ramesh Patel',
      role: 'farmer',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Taraori',
      address: 'House 42, Main Chauraha, Taraori',
      createdAt: '2026-10-15T08:00:00Z'
    },
    // Farmer 2
    {
      id: 'usr_farmer_2',
      email: 'gurpreet.singh@agriconnect.in',
      mobile: '+91 98123 45671',
      name: 'Gurpreet Singh',
      role: 'farmer',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Nissing',
      address: 'Farm Plot 11, Nissing Road',
      createdAt: '2026-10-18T09:30:00Z'
    },
    // Farmer 3
    {
      id: 'usr_farmer_3',
      email: 'sukhdev.verma@agriconnect.in',
      mobile: '+91 94160 88219',
      name: 'Sukhdev Verma',
      role: 'farmer',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Gharaunda',
      address: 'Kisan Basti, Gharaunda',
      createdAt: '2026-10-20T11:15:00Z'
    },
    // Farmer 4
    {
      id: 'usr_farmer_4',
      email: 'rajesh.kumar@agriconnect.in',
      mobile: '+91 97290 11442',
      name: 'Rajesh Kumar',
      role: 'farmer',
      state: 'Uttar Pradesh',
      district: 'Hapur',
      village: 'Pilkhuwa',
      address: 'Dhanda Farm, Pilkhuwa',
      createdAt: '2026-10-22T07:45:00Z'
    },
    // Farmer 5
    {
      id: 'usr_farmer_5',
      email: 'sunita.devi@agriconnect.in',
      mobile: '+91 99912 33445',
      name: 'Sunita Devi',
      role: 'farmer',
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Sanwer',
      address: 'Gram Sanwer, Sector 4',
      createdAt: '2026-10-23T10:00:00Z'
    },
    // Farmer 6
    {
      id: 'usr_farmer_6',
      email: 'mahendra.choudhary@agriconnect.in',
      mobile: '+91 98260 77119',
      name: 'Mahendra Choudhary',
      role: 'farmer',
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Depalpur',
      address: 'Near Krishak Seva Kendra, Depalpur',
      createdAt: '2026-10-24T12:00:00Z'
    },
    // Farmer 7
    {
      id: 'usr_farmer_7',
      email: 'balram.yadav@agriconnect.in',
      mobile: '+91 94551 22880',
      name: 'Balram Yadav',
      role: 'farmer',
      state: 'Uttar Pradesh',
      district: 'Hapur',
      village: 'Dhaulana',
      address: 'Village Dhaulana, Ward 2',
      createdAt: '2026-10-25T14:20:00Z'
    },
    // Farmer 8
    {
      id: 'usr_farmer_8',
      email: 'devendra.sharma@agriconnect.in',
      mobile: '+91 93100 44556',
      name: 'Devendra Sharma',
      role: 'farmer',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Indri',
      address: 'Green Valley Farm, Indri',
      createdAt: '2026-10-26T08:10:00Z'
    },
    // Farmer 9
    {
      id: 'usr_farmer_9',
      email: 'harishankar.gowda@agriconnect.in',
      mobile: '+91 98450 99881',
      name: 'Harishankar Gowda',
      role: 'farmer',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Nilokheri',
      address: 'Agro Tech Park, Nilokheri',
      createdAt: '2026-10-27T09:00:00Z'
    },
    // Farmer 10
    {
      id: 'usr_farmer_10',
      email: 'pradeep.meena@agriconnect.in',
      mobile: '+91 97112 88990',
      name: 'Pradeep Meena',
      role: 'farmer',
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Mhow',
      address: 'Mhow Cantt Rural, Farm 18',
      createdAt: '2026-10-28T10:30:00Z'
    },

    // Consumer 1 (Primary Demo Consumer)
    {
      id: 'usr_consumer_1',
      email: 'priya.consumer@agriconnect.in',
      mobile: '+91 98980 12345',
      name: 'Priya Sharma',
      role: 'consumer',
      state: 'Delhi',
      district: 'New Delhi',
      village: 'Saket',
      address: 'Flat 402, Green Glen Residency, Saket, New Delhi 110017',
      createdAt: '2026-10-16T10:00:00Z'
    },
    // Consumer 2
    {
      id: 'usr_consumer_2',
      email: 'aravind.consumer@agriconnect.in',
      mobile: '+91 98440 55667',
      name: 'Aravind Swaminathan',
      role: 'consumer',
      state: 'Haryana',
      district: 'Gurugram',
      village: 'DLF Phase 4',
      address: 'Tower B, Pinnacle Heights, Sector 43, Gurugram 122002',
      createdAt: '2026-10-19T14:00:00Z'
    },

    // Operator 1 (Assigned to Karnal Mandi)
    {
      id: 'usr_operator_1',
      email: 'vikram.operator@agriconnect.in',
      mobile: '+91 98111 22334',
      name: 'Vikram Sharma (Karnal APMC)',
      role: 'operator',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Karnal City',
      address: 'APMC Krishi Upaj Mandi Complex, GT Road, Karnal',
      createdAt: '2026-10-01T08:00:00Z'
    },
    // Operator 2 (Assigned to Indore Mandi)
    {
      id: 'usr_operator_2',
      email: 'anita.operator@agriconnect.in',
      mobile: '+91 98222 33445',
      name: 'Anita Rao (Indore Mandi)',
      role: 'operator',
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Indore City',
      address: 'Laxmibai Nagar Mandi Gate 2, Indore',
      createdAt: '2026-10-01T08:00:00Z'
    },

    // Admin
    {
      id: 'usr_admin_1',
      email: 'admin@agriconnect.in',
      mobile: '+91 99999 00001',
      name: 'Dr. Alok Sengupta (State Agriculture Dir.)',
      role: 'admin',
      state: 'National',
      district: 'Headquarters',
      address: 'Department of Agriculture & Farmers Welfare, Krishi Bhawan',
      createdAt: '2026-09-01T08:00:00Z'
    }
  ];

  const passwords: Record<string, string> = {
    usr_farmer_1: 'farmer123',
    usr_farmer_2: 'farmer123',
    usr_farmer_3: 'farmer123',
    usr_farmer_4: 'farmer123',
    usr_farmer_5: 'farmer123',
    usr_farmer_6: 'farmer123',
    usr_farmer_7: 'farmer123',
    usr_farmer_8: 'farmer123',
    usr_farmer_9: 'farmer123',
    usr_farmer_10: 'farmer123',
    usr_consumer_1: 'consumer123',
    usr_consumer_2: 'consumer123',
    usr_operator_1: 'operator123',
    usr_operator_2: 'operator123',
    usr_admin_1: 'admin123'
  };

  const farmerProfiles: FarmerProfile[] = [
    {
      userId: 'usr_farmer_1',
      farmerCode: 'FMR-HR-KNL-1001',
      landSizeAcres: 8.5,
      primaryCrop: 'Wheat (Sharbati & PBW-550)',
      kisanCreditCard: 'KCC-98234-HR',
      bankAccount: 'SBI-88291048291',
      ifscCode: 'SBIN0001234'
    },
    {
      userId: 'usr_farmer_2',
      farmerCode: 'FMR-HR-KNL-1002',
      landSizeAcres: 12.0,
      primaryCrop: 'Basmati Paddy (Pusa 1121)',
      kisanCreditCard: 'KCC-44102-HR',
      bankAccount: 'PNB-48192038102',
      ifscCode: 'PUNB0044100'
    },
    {
      userId: 'usr_farmer_3',
      farmerCode: 'FMR-HR-KNL-1003',
      landSizeAcres: 6.2,
      primaryCrop: 'Mustard (Pusa Bold)',
      kisanCreditCard: 'KCC-33291-HR',
      bankAccount: 'HDFC-50100293819',
      ifscCode: 'HDFC0000123'
    },
    {
      userId: 'usr_farmer_4',
      farmerCode: 'FMR-UP-HPR-2001',
      landSizeAcres: 15.0,
      primaryCrop: 'Sugarcane & Wheat',
      kisanCreditCard: 'KCC-66102-UP',
      bankAccount: 'CANARA-1029384756',
      ifscCode: 'CNRB0001029'
    },
    {
      userId: 'usr_farmer_5',
      farmerCode: 'FMR-MP-IND-3001',
      landSizeAcres: 5.5,
      primaryCrop: 'Soybean & Gram (Chana)',
      kisanCreditCard: 'KCC-77192-MP',
      bankAccount: 'BOI-9928172635',
      ifscCode: 'BKID0009928'
    },
    {
      userId: 'usr_farmer_6',
      farmerCode: 'FMR-MP-IND-3002',
      landSizeAcres: 9.0,
      primaryCrop: 'Wheat & Garlic',
      kisanCreditCard: 'KCC-88219-MP',
      bankAccount: 'SBI-7726152433',
      ifscCode: 'SBIN0009921'
    },
    {
      userId: 'usr_farmer_7',
      farmerCode: 'FMR-UP-HPR-2002',
      landSizeAcres: 7.2,
      primaryCrop: 'Mustard & Millets (Bajra)',
      kisanCreditCard: 'KCC-55291-UP',
      bankAccount: 'BOB-8837192039',
      ifscCode: 'BARB0HAPURX'
    },
    {
      userId: 'usr_farmer_8',
      farmerCode: 'FMR-HR-KNL-1004',
      landSizeAcres: 10.5,
      primaryCrop: 'Organic Wheat',
      kisanCreditCard: 'KCC-11293-HR',
      bankAccount: 'SBI-6627182930',
      ifscCode: 'SBIN0001234'
    },
    {
      userId: 'usr_farmer_9',
      farmerCode: 'FMR-HR-KNL-1005',
      landSizeAcres: 4.8,
      primaryCrop: 'Basmati Paddy',
      kisanCreditCard: 'KCC-99201-HR',
      bankAccount: 'PNB-1122334455',
      ifscCode: 'PUNB0044100'
    },
    {
      userId: 'usr_farmer_10',
      farmerCode: 'FMR-MP-IND-3003',
      landSizeAcres: 14.0,
      primaryCrop: 'Soybean & Organic Pulses',
      kisanCreditCard: 'KCC-33445-MP',
      bankAccount: 'BOI-5566778899',
      ifscCode: 'BKID0009928'
    }
  ];

  const operatorCentres: Record<string, string> = {
    usr_operator_1: 'cen_karnal_01',
    usr_operator_2: 'cen_indore_01'
  };

  const procurementCentres: ProcurementCentre[] = [
    {
      id: 'cen_karnal_01',
      name: 'APMC Krishi Upaj Mandi, Karnal',
      code: 'HR-KNL-01',
      state: 'Haryana',
      district: 'Karnal',
      address: 'Main Grand Trunk Road, Near New Grain Market, Karnal 132001',
      totalCounters: 4,
      activeCounters: 3,
      avgMinsPerFarmer: 12,
      dailyCapacityKg: 50000,
      currentBookedKg: 34200,
      openingTime: '08:00 AM',
      closingTime: '06:00 PM',
      contactNumber: '+91 184 225 6789',
      cropsSupported: ['Wheat', 'Paddy (Basmati)', 'Mustard', 'Barley']
    },
    {
      id: 'cen_hapur_01',
      name: 'Government Grain Procurement Yard, Hapur',
      code: 'UP-HPR-01',
      state: 'Uttar Pradesh',
      district: 'Hapur',
      address: 'Delhi-Garhmukteshwar Highway, Hapur 245101',
      totalCounters: 3,
      activeCounters: 2,
      avgMinsPerFarmer: 15,
      dailyCapacityKg: 40000,
      currentBookedKg: 28500,
      openingTime: '08:30 AM',
      closingTime: '05:30 PM',
      contactNumber: '+91 122 230 4455',
      cropsSupported: ['Wheat', 'Mustard', 'Bajra', 'Sugarcane Jaggery']
    },
    {
      id: 'cen_indore_01',
      name: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      code: 'MP-IND-01',
      state: 'Madhya Pradesh',
      district: 'Indore',
      address: 'Mandi Gate No. 2, Sanwer Road, Indore 452006',
      totalCounters: 5,
      activeCounters: 4,
      avgMinsPerFarmer: 10,
      dailyCapacityKg: 65000,
      currentBookedKg: 42000,
      openingTime: '08:00 AM',
      closingTime: '06:30 PM',
      contactNumber: '+91 731 241 1234',
      cropsSupported: ['Wheat (Sharbati)', 'Soybean', 'Chana (Gram)', 'Garlic']
    }
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const procurementSlots: ProcurementSlot[] = [
    // Today's Slots for Karnal
    {
      id: 'slot_knl_1',
      centreId: 'cen_karnal_01',
      date: todayStr,
      startTime: '08:30 AM',
      endTime: '10:30 AM',
      maxCapacityKg: 12000,
      bookedCapacityKg: 11000,
      farmerLimit: 6,
      bookedFarmers: 5,
      isClosed: false
    },
    {
      id: 'slot_knl_2',
      centreId: 'cen_karnal_01',
      date: todayStr,
      startTime: '10:30 AM',
      endTime: '12:30 PM',
      maxCapacityKg: 12000,
      bookedCapacityKg: 8500,
      farmerLimit: 6,
      bookedFarmers: 4,
      isClosed: false
    },
    {
      id: 'slot_knl_3',
      centreId: 'cen_karnal_01',
      date: todayStr,
      startTime: '01:30 PM',
      endTime: '03:30 PM',
      maxCapacityKg: 14000,
      bookedCapacityKg: 9500,
      farmerLimit: 7,
      bookedFarmers: 4,
      isClosed: false
    },
    {
      id: 'slot_knl_4',
      centreId: 'cen_karnal_01',
      date: todayStr,
      startTime: '03:30 PM',
      endTime: '05:30 PM',
      maxCapacityKg: 12000,
      bookedCapacityKg: 5200,
      farmerLimit: 6,
      bookedFarmers: 2,
      isClosed: false
    },
    // Hapur Slots
    {
      id: 'slot_hpr_1',
      centreId: 'cen_hapur_01',
      date: todayStr,
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      maxCapacityKg: 15000,
      bookedCapacityKg: 14000,
      farmerLimit: 8,
      bookedFarmers: 7,
      isClosed: false
    },
    {
      id: 'slot_hpr_2',
      centreId: 'cen_hapur_01',
      date: todayStr,
      startTime: '11:30 AM',
      endTime: '01:30 PM',
      maxCapacityKg: 15000,
      bookedCapacityKg: 8000,
      farmerLimit: 8,
      bookedFarmers: 4,
      isClosed: false
    },
    // Indore Slots
    {
      id: 'slot_ind_1',
      centreId: 'cen_indore_01',
      date: todayStr,
      startTime: '08:30 AM',
      endTime: '11:00 AM',
      maxCapacityKg: 20000,
      bookedCapacityKg: 18000,
      farmerLimit: 10,
      bookedFarmers: 8,
      isClosed: false
    },
    {
      id: 'slot_ind_2',
      centreId: 'cen_indore_01',
      date: todayStr,
      startTime: '11:30 AM',
      endTime: '02:00 PM',
      maxCapacityKg: 20000,
      bookedCapacityKg: 12000,
      farmerLimit: 10,
      bookedFarmers: 5,
      isClosed: false
    }
  ];

  // 10 Sample bookings showcasing every state of procurement
  const bookings: Booking[] = [
    // 1. Farmer 1 (Ramesh Patel) - Live active token in queue at Karnal
    {
      id: 'bkg_001',
      bookingCode: 'BKG-2026-1001',
      farmerId: 'usr_farmer_1',
      farmerName: 'Ramesh Patel',
      farmerMobile: '+91 98765 43210',
      farmerCode: 'FMR-HR-KNL-1001',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      centreDistrict: 'Karnal',
      slotId: 'slot_knl_2',
      date: todayStr,
      timeSlot: '10:30 AM - 12:30 PM',
      crop: 'Wheat',
      expectedQuantityKg: 2500,
      status: 'CHECKED_IN',
      tokenId: 'tkn_001',
      createdAt: '2026-11-01T14:20:00Z',
      counterAssigned: 2
    },
    // 2. Farmer 2 (Gurpreet) - In counter weighment in progress
    {
      id: 'bkg_002',
      bookingCode: 'BKG-2026-1002',
      farmerId: 'usr_farmer_2',
      farmerName: 'Gurpreet Singh',
      farmerMobile: '+91 98123 45671',
      farmerCode: 'FMR-HR-KNL-1002',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      centreDistrict: 'Karnal',
      slotId: 'slot_knl_1',
      date: todayStr,
      timeSlot: '08:30 AM - 10:30 AM',
      crop: 'Wheat',
      expectedQuantityKg: 3200,
      status: 'WEIGHMENT_IN_PROGRESS',
      tokenId: 'tkn_002',
      createdAt: '2026-11-01T15:00:00Z',
      counterAssigned: 1
    },
    // 3. Farmer 3 (Sukhdev) - Completed weighment, payment pending
    {
      id: 'bkg_003',
      bookingCode: 'BKG-2026-1003',
      farmerId: 'usr_farmer_3',
      farmerName: 'Sukhdev Verma',
      farmerMobile: '+91 94160 88219',
      farmerCode: 'FMR-HR-KNL-1003',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      centreDistrict: 'Karnal',
      slotId: 'slot_knl_1',
      date: todayStr,
      timeSlot: '08:30 AM - 10:30 AM',
      crop: 'Mustard',
      expectedQuantityKg: 1800,
      status: 'WEIGHMENT_COMPLETED',
      tokenId: 'tkn_003',
      createdAt: '2026-11-01T10:00:00Z',
      counterAssigned: 3
    },
    // 4. Farmer 8 (Devendra Sharma) - Ahead in queue at Karnal
    {
      id: 'bkg_004',
      bookingCode: 'BKG-2026-1004',
      farmerId: 'usr_farmer_8',
      farmerName: 'Devendra Sharma',
      farmerMobile: '+91 93100 44556',
      farmerCode: 'FMR-HR-KNL-1004',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      centreDistrict: 'Karnal',
      slotId: 'slot_knl_2',
      date: todayStr,
      timeSlot: '10:30 AM - 12:30 PM',
      crop: 'Wheat',
      expectedQuantityKg: 2000,
      status: 'CHECKED_IN',
      tokenId: 'tkn_004',
      createdAt: '2026-11-01T11:00:00Z',
      counterAssigned: 1
    },
    // 5. Farmer 9 (Harishankar Gowda) - Slot booked, token generated, not yet arrived
    {
      id: 'bkg_005',
      bookingCode: 'BKG-2026-1005',
      farmerId: 'usr_farmer_9',
      farmerName: 'Harishankar Gowda',
      farmerMobile: '+91 98450 99881',
      farmerCode: 'FMR-HR-KNL-1005',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      centreDistrict: 'Karnal',
      slotId: 'slot_knl_3',
      date: todayStr,
      timeSlot: '01:30 PM - 03:30 PM',
      crop: 'Barley',
      expectedQuantityKg: 1500,
      status: 'TOKEN_GENERATED',
      tokenId: 'tkn_005',
      createdAt: '2026-11-01T16:00:00Z'
    },
    // 6. Farmer 4 (Rajesh Kumar - Hapur) - Fully completed & paid
    {
      id: 'bkg_006',
      bookingCode: 'BKG-2026-1006',
      farmerId: 'usr_farmer_4',
      farmerName: 'Rajesh Kumar',
      farmerMobile: '+91 97290 11442',
      farmerCode: 'FMR-UP-HPR-2001',
      centreId: 'cen_hapur_01',
      centreName: 'Government Grain Procurement Yard, Hapur',
      centreDistrict: 'Hapur',
      slotId: 'slot_hpr_1',
      date: todayStr,
      timeSlot: '09:00 AM - 11:00 AM',
      crop: 'Wheat',
      expectedQuantityKg: 4000,
      status: 'PAYMENT_SETTLED',
      tokenId: 'tkn_006',
      createdAt: '2026-10-31T09:00:00Z',
      counterAssigned: 1
    },
    // 7. Farmer 7 (Balram Yadav - Hapur) - Checked in
    {
      id: 'bkg_007',
      bookingCode: 'BKG-2026-1007',
      farmerId: 'usr_farmer_7',
      farmerName: 'Balram Yadav',
      farmerMobile: '+91 94551 22880',
      farmerCode: 'FMR-UP-HPR-2002',
      centreId: 'cen_hapur_01',
      centreName: 'Government Grain Procurement Yard, Hapur',
      centreDistrict: 'Hapur',
      slotId: 'slot_hpr_2',
      date: todayStr,
      timeSlot: '11:30 AM - 01:30 PM',
      crop: 'Mustard',
      expectedQuantityKg: 2200,
      status: 'CHECKED_IN',
      tokenId: 'tkn_007',
      createdAt: '2026-11-01T12:00:00Z',
      counterAssigned: 2
    },
    // 8. Farmer 5 (Sunita Devi - Indore) - Weighment done, payment processing
    {
      id: 'bkg_008',
      bookingCode: 'BKG-2026-1008',
      farmerId: 'usr_farmer_5',
      farmerName: 'Sunita Devi',
      farmerMobile: '+91 99912 33445',
      farmerCode: 'FMR-MP-IND-3001',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      centreDistrict: 'Indore',
      slotId: 'slot_ind_1',
      date: todayStr,
      timeSlot: '08:30 AM - 11:00 AM',
      crop: 'Soybean',
      expectedQuantityKg: 2800,
      status: 'PROCUREMENT_COMPLETED',
      tokenId: 'tkn_008',
      createdAt: '2026-10-31T14:00:00Z',
      counterAssigned: 2
    },
    // 9. Farmer 6 (Mahendra Choudhary - Indore) - In Counter
    {
      id: 'bkg_009',
      bookingCode: 'BKG-2026-1009',
      farmerId: 'usr_farmer_6',
      farmerName: 'Mahendra Choudhary',
      farmerMobile: '+91 98260 77119',
      farmerCode: 'FMR-MP-IND-3002',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      centreDistrict: 'Indore',
      slotId: 'slot_ind_1',
      date: todayStr,
      timeSlot: '08:30 AM - 11:00 AM',
      crop: 'Wheat (Sharbati)',
      expectedQuantityKg: 3500,
      status: 'WEIGHMENT_IN_PROGRESS',
      tokenId: 'tkn_009',
      createdAt: '2026-11-01T08:00:00Z',
      counterAssigned: 1
    },
    // 10. Farmer 10 (Pradeep Meena - Indore) - Token generated
    {
      id: 'bkg_010',
      bookingCode: 'BKG-2026-1010',
      farmerId: 'usr_farmer_10',
      farmerName: 'Pradeep Meena',
      farmerMobile: '+91 97112 88990',
      farmerCode: 'FMR-MP-IND-3003',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      centreDistrict: 'Indore',
      slotId: 'slot_ind_2',
      date: todayStr,
      timeSlot: '11:30 AM - 02:00 PM',
      crop: 'Chana (Gram)',
      expectedQuantityKg: 2100,
      status: 'TOKEN_GENERATED',
      tokenId: 'tkn_010',
      createdAt: '2026-11-01T17:00:00Z'
    }
  ];

  const tokens: Token[] = [
    {
      id: 'tkn_001',
      tokenNumber: 'TKN-KNL-104',
      bookingId: 'bkg_001',
      farmerId: 'usr_farmer_1',
      farmerName: 'Ramesh Patel',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      crop: 'Wheat',
      expectedQuantityKg: 2500,
      date: todayStr,
      generatedAt: '2026-11-01T14:20:00Z',
      status: 'ACTIVE',
      counterAssigned: 2
    },
    {
      id: 'tkn_002',
      tokenNumber: 'TKN-KNL-101',
      bookingId: 'bkg_002',
      farmerId: 'usr_farmer_2',
      farmerName: 'Gurpreet Singh',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      crop: 'Wheat',
      expectedQuantityKg: 3200,
      date: todayStr,
      generatedAt: '2026-11-01T15:00:00Z',
      status: 'PROCESSING',
      counterAssigned: 1
    },
    {
      id: 'tkn_003',
      tokenNumber: 'TKN-KNL-102',
      bookingId: 'bkg_003',
      farmerId: 'usr_farmer_3',
      farmerName: 'Sukhdev Verma',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      crop: 'Mustard',
      expectedQuantityKg: 1800,
      date: todayStr,
      generatedAt: '2026-11-01T10:00:00Z',
      status: 'COMPLETED',
      counterAssigned: 3
    },
    {
      id: 'tkn_004',
      tokenNumber: 'TKN-KNL-103',
      bookingId: 'bkg_004',
      farmerId: 'usr_farmer_8',
      farmerName: 'Devendra Sharma',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      crop: 'Wheat',
      expectedQuantityKg: 2000,
      date: todayStr,
      generatedAt: '2026-11-01T11:00:00Z',
      status: 'ACTIVE',
      counterAssigned: 1
    },
    {
      id: 'tkn_005',
      tokenNumber: 'TKN-KNL-105',
      bookingId: 'bkg_005',
      farmerId: 'usr_farmer_9',
      farmerName: 'Harishankar Gowda',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      crop: 'Barley',
      expectedQuantityKg: 1500,
      date: todayStr,
      generatedAt: '2026-11-01T16:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 'tkn_006',
      tokenNumber: 'TKN-HPR-201',
      bookingId: 'bkg_006',
      farmerId: 'usr_farmer_4',
      farmerName: 'Rajesh Kumar',
      centreId: 'cen_hapur_01',
      centreName: 'Government Grain Procurement Yard, Hapur',
      crop: 'Wheat',
      expectedQuantityKg: 4000,
      date: todayStr,
      generatedAt: '2026-10-31T09:00:00Z',
      status: 'COMPLETED',
      counterAssigned: 1
    },
    {
      id: 'tkn_007',
      tokenNumber: 'TKN-HPR-202',
      bookingId: 'bkg_007',
      farmerId: 'usr_farmer_7',
      farmerName: 'Balram Yadav',
      centreId: 'cen_hapur_01',
      centreName: 'Government Grain Procurement Yard, Hapur',
      crop: 'Mustard',
      expectedQuantityKg: 2200,
      date: todayStr,
      generatedAt: '2026-11-01T12:00:00Z',
      status: 'ACTIVE',
      counterAssigned: 2
    },
    {
      id: 'tkn_008',
      tokenNumber: 'TKN-IND-301',
      bookingId: 'bkg_008',
      farmerId: 'usr_farmer_5',
      farmerName: 'Sunita Devi',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      crop: 'Soybean',
      expectedQuantityKg: 2800,
      date: todayStr,
      generatedAt: '2026-10-31T14:00:00Z',
      status: 'COMPLETED',
      counterAssigned: 2
    },
    {
      id: 'tkn_009',
      tokenNumber: 'TKN-IND-302',
      bookingId: 'bkg_009',
      farmerId: 'usr_farmer_6',
      farmerName: 'Mahendra Choudhary',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      crop: 'Wheat (Sharbati)',
      expectedQuantityKg: 3500,
      date: todayStr,
      generatedAt: '2026-11-01T08:00:00Z',
      status: 'PROCESSING',
      counterAssigned: 1
    },
    {
      id: 'tkn_010',
      tokenNumber: 'TKN-IND-303',
      bookingId: 'bkg_010',
      farmerId: 'usr_farmer_10',
      farmerName: 'Pradeep Meena',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      crop: 'Chana (Gram)',
      expectedQuantityKg: 2100,
      date: todayStr,
      generatedAt: '2026-11-01T17:00:00Z',
      status: 'ACTIVE'
    }
  ];

  // Active queue records for Karnal APMC
  // Formula: Estimated Waiting Time = (Farmers Ahead in Queue * Average Time Per Farmer) / Active Counters
  // At Karnal: activeCounters = 3, avgMinsPerFarmer = 12.
  const queueRecords: QueueRecord[] = [
    {
      id: 'qr_001',
      tokenId: 'tkn_002',
      tokenNumber: 'TKN-KNL-101',
      bookingId: 'bkg_002',
      farmerId: 'usr_farmer_2',
      farmerName: 'Gurpreet Singh',
      farmerMobile: '+91 98123 45671',
      centreId: 'cen_karnal_01',
      crop: 'Wheat',
      expectedQuantityKg: 3200,
      arrivalTime: '08:45 AM',
      checkedInTime: '08:50 AM',
      queuePosition: 0, // currently at counter 1
      status: 'IN_COUNTER',
      gracePeriodMinutes: 0,
      estimatedWaitMinutes: 0,
      counterAssigned: 1
    },
    {
      id: 'qr_002',
      tokenId: 'tkn_004',
      tokenNumber: 'TKN-KNL-103',
      bookingId: 'bkg_004',
      farmerId: 'usr_farmer_8',
      farmerName: 'Devendra Sharma',
      farmerMobile: '+91 93100 44556',
      centreId: 'cen_karnal_01',
      crop: 'Wheat',
      expectedQuantityKg: 2000,
      arrivalTime: '09:10 AM',
      checkedInTime: '09:15 AM',
      queuePosition: 1, // 0 ahead of him among waiting
      status: 'WAITING',
      gracePeriodMinutes: 0,
      estimatedWaitMinutes: 4, // (1 ahead * 12) / 3 = 4 mins
      counterAssigned: 1
    },
    {
      id: 'qr_003',
      tokenId: 'tkn_001',
      tokenNumber: 'TKN-KNL-104',
      bookingId: 'bkg_001',
      farmerId: 'usr_farmer_1',
      farmerName: 'Ramesh Patel',
      farmerMobile: '+91 98765 43210',
      centreId: 'cen_karnal_01',
      crop: 'Wheat',
      expectedQuantityKg: 2500,
      arrivalTime: '09:30 AM',
      checkedInTime: '09:35 AM',
      queuePosition: 2, // 1 waiting ahead of him
      status: 'WAITING',
      gracePeriodMinutes: 20,
      estimatedWaitMinutes: 8, // (2 ahead * 12) / 3 = 8 mins
      counterAssigned: 2
    },
    {
      id: 'qr_004',
      tokenId: 'tkn_005',
      tokenNumber: 'TKN-KNL-105',
      bookingId: 'bkg_005',
      farmerId: 'usr_farmer_9',
      farmerName: 'Harishankar Gowda',
      farmerMobile: '+91 98450 99881',
      centreId: 'cen_karnal_01',
      crop: 'Barley',
      expectedQuantityKg: 1500,
      arrivalTime: '09:55 AM',
      checkedInTime: '10:00 AM',
      queuePosition: 3,
      status: 'WAITING',
      gracePeriodMinutes: 0,
      estimatedWaitMinutes: 12, // (3 ahead * 12) / 3 = 12 mins
      counterAssigned: 3
    }
  ];

  // Official MSP rates for 2026-27 (₹/kg)
  // Wheat: ₹24.25/kg (₹2425/quintal), Mustard: ₹59.50/kg, Soybean: ₹48.92/kg, Chana: ₹56.50/kg, Barley: ₹19.80/kg
  const weighmentRecords: WeighmentRecord[] = [
    {
      id: 'wgh_001',
      receiptNumber: 'RCP-KNL-2026-9001',
      tokenId: 'tkn_003',
      tokenNumber: 'TKN-KNL-102',
      bookingId: 'bkg_003',
      farmerId: 'usr_farmer_3',
      farmerName: 'Sukhdev Verma',
      farmerMobile: '+91 94160 88219',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      operatorId: 'usr_operator_1',
      operatorName: 'Vikram Sharma',
      counterNumber: 3,
      crop: 'Mustard',
      grossWeightKg: 4950,
      tareWeightKg: 3150,
      netWeightKg: 1800,
      acceptedQuantityKg: 1750,
      rejectedQuantityKg: 50,
      rejectionReason: 'Excess moisture & foreign weed seeds (2.7% dockage)',
      moisturePercentage: 8.4,
      mspRatePerKg: 59.50,
      totalAmount: 104125.00,
      timestamp: '2026-11-02T09:20:00Z'
    },
    {
      id: 'wgh_002',
      receiptNumber: 'RCP-HPR-2026-8001',
      tokenId: 'tkn_006',
      tokenNumber: 'TKN-HPR-201',
      bookingId: 'bkg_006',
      farmerId: 'usr_farmer_4',
      farmerName: 'Rajesh Kumar',
      farmerMobile: '+91 97290 11442',
      centreId: 'cen_hapur_01',
      centreName: 'Government Grain Procurement Yard, Hapur',
      operatorId: 'usr_operator_1',
      operatorName: 'Vikram Sharma',
      counterNumber: 1,
      crop: 'Wheat',
      grossWeightKg: 7850,
      tareWeightKg: 3850,
      netWeightKg: 4000,
      acceptedQuantityKg: 3950,
      rejectedQuantityKg: 50,
      rejectionReason: 'Broken and shriveled grains exceeding 3% limit',
      moisturePercentage: 11.2,
      mspRatePerKg: 24.25,
      totalAmount: 95787.50,
      timestamp: '2026-11-02T09:50:00Z'
    },
    {
      id: 'wgh_003',
      receiptNumber: 'RCP-IND-2026-7001',
      tokenId: 'tkn_008',
      tokenNumber: 'TKN-IND-301',
      bookingId: 'bkg_008',
      farmerId: 'usr_farmer_5',
      farmerName: 'Sunita Devi',
      farmerMobile: '+91 99912 33445',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      operatorId: 'usr_operator_2',
      operatorName: 'Anita Rao',
      counterNumber: 2,
      crop: 'Soybean',
      grossWeightKg: 5620,
      tareWeightKg: 2820,
      netWeightKg: 2800,
      acceptedQuantityKg: 2800,
      rejectedQuantityKg: 0,
      moisturePercentage: 10.0,
      mspRatePerKg: 48.92,
      totalAmount: 136976.00,
      timestamp: '2026-11-02T10:15:00Z'
    }
  ];

  const paymentRecords: PaymentRecord[] = [
    {
      id: 'pay_001',
      bookingId: 'bkg_006',
      weighmentId: 'wgh_002',
      farmerId: 'usr_farmer_4',
      farmerName: 'Rajesh Kumar',
      farmerCode: 'FMR-UP-HPR-2001',
      bankAccount: 'CANARA-****4756',
      ifscCode: 'CNRB0001029',
      centreId: 'cen_hapur_01',
      centreName: 'Government Grain Procurement Yard, Hapur',
      crop: 'Wheat',
      acceptedWeightKg: 3950,
      mspRatePerKg: 24.25,
      totalAmount: 95787.50,
      status: 'COMPLETED',
      paymentRefNumber: 'PFMS2026110298124',
      paymentMode: 'PFMS',
      settledAt: '2026-11-02T10:45:00Z',
      remarks: 'Direct Benefit Transfer (DBT) directly credited to Aadhaar linked savings account.'
    },
    {
      id: 'pay_002',
      bookingId: 'bkg_008',
      weighmentId: 'wgh_003',
      farmerId: 'usr_farmer_5',
      farmerName: 'Sunita Devi',
      farmerCode: 'FMR-MP-IND-3001',
      bankAccount: 'BOI-****2635',
      ifscCode: 'BKID0009928',
      centreId: 'cen_indore_01',
      centreName: 'Laxmibai Nagar Krishi Upaj Mandi, Indore',
      crop: 'Soybean',
      acceptedWeightKg: 2800,
      mspRatePerKg: 48.92,
      totalAmount: 136976.00,
      status: 'PROCESSING',
      paymentRefNumber: 'PFMS-QUEUE-88129',
      paymentMode: 'DBT',
      remarks: 'Treasury token generated. Awaiting RBI NEFT batch clearance.'
    },
    {
      id: 'pay_003',
      bookingId: 'bkg_003',
      weighmentId: 'wgh_001',
      farmerId: 'usr_farmer_3',
      farmerName: 'Sukhdev Verma',
      farmerCode: 'FMR-HR-KNL-1003',
      bankAccount: 'HDFC-****3819',
      ifscCode: 'HDFC0000123',
      centreId: 'cen_karnal_01',
      centreName: 'APMC Krishi Upaj Mandi, Karnal',
      crop: 'Mustard',
      acceptedWeightKg: 1750,
      mspRatePerKg: 59.50,
      totalAmount: 104125.00,
      status: 'PENDING',
      paymentMode: 'PFMS',
      remarks: 'Weighment slip signed. Verification submitted to Accounts Officer.'
    }
  ];

  // Organic Farm-To-Home Products
  const products: Product[] = [
    {
      id: 'prd_001',
      farmerId: 'usr_farmer_1',
      farmerName: 'Ramesh Patel',
      farmerVillage: 'Taraori',
      farmerDistrict: 'Karnal',
      title: 'Heritage Sharbati Golden Wheat (Unpolished)',
      titleHi: 'विरासत शरबती गोल्डन गेहूं (अपालिश)',
      category: 'Grains & Pulses',
      description: 'Single-estate heirloom Sharbati wheat grown using Jeevamrit and cow dung compost. Sun-dried, cleaned, zero chemical pesticides. Makes super-soft golden rotis with natural sweetness.',
      pricePerKg: 48,
      quantityAvailableKg: 850,
      unit: 'kg',
      harvestDate: '2026-10-10',
      organicStatus: 'VERIFIED_ORGANIC',
      imageUrl: '/images/products/wheat_sharbati.jpg',
      pickupLocation: 'Taraori Agro Cooperative, Taraori, Karnal',
      isActive: true,
      createdAt: '2026-10-18T10:00:00Z'
    },
    {
      id: 'prd_002',
      farmerId: 'usr_farmer_1',
      farmerName: 'Ramesh Patel',
      farmerVillage: 'Taraori',
      farmerDistrict: 'Karnal',
      title: 'Aged Taraori Basmati Rice (1121 Extra Long)',
      titleHi: 'पुराना तरावड़ी बासमती चावल (1121 लंबा दाना)',
      category: 'Grains & Pulses',
      description: 'Authentic GI-origin Taraori aromatic Basmati rice, naturally aged for 18 months. Exceptional kernel elongation after cooking, delicate floral aroma.',
      pricePerKg: 125,
      quantityAvailableKg: 420,
      unit: 'kg',
      harvestDate: '2026-09-25',
      organicStatus: 'VERIFIED_ORGANIC',
      imageUrl: '/images/products/basmati_rice.jpg',
      pickupLocation: 'Taraori Agro Cooperative, Taraori, Karnal',
      isActive: true,
      createdAt: '2026-10-20T11:00:00Z'
    },
    {
      id: 'prd_003',
      farmerId: 'usr_farmer_2',
      farmerName: 'Gurpreet Singh',
      farmerVillage: 'Nissing',
      farmerDistrict: 'Karnal',
      title: 'Wood-Pressed Kacchi Ghani Mustard Oil',
      titleHi: 'लकड़ी की घानी का शुद्ध सरसों का तेल',
      category: 'Cold-Pressed Oils',
      description: 'Extracted at low temperatures using traditional wooden Kohlu presses. Rich in pungency, natural antioxidants, and omega-3 fatty acids. Unrefined & unfiltered.',
      pricePerKg: 210,
      quantityAvailableKg: 180,
      unit: 'Litre',
      harvestDate: '2026-10-05',
      organicStatus: 'VERIFIED_ORGANIC',
      imageUrl: '/images/products/mustard_oil.jpg',
      pickupLocation: 'Kisan Oil Mills, Nissing Road, Karnal',
      isActive: true,
      createdAt: '2026-10-22T08:30:00Z'
    },
    {
      id: 'prd_004',
      farmerId: 'usr_farmer_5',
      farmerName: 'Sunita Devi',
      farmerVillage: 'Sanwer',
      farmerDistrict: 'Indore',
      title: 'Desi Brown Chana (Chickpeas) - High Protein',
      titleHi: 'देसी चना (काला चना) - उच्च प्रोटीन',
      category: 'Grains & Pulses',
      description: 'Nutrient-rich indigenous brown chana grown in Malwa black soil. Ideal for sprouts, curries, and high-protein athletic diets.',
      pricePerKg: 85,
      quantityAvailableKg: 350,
      unit: 'kg',
      harvestDate: '2026-10-12',
      organicStatus: 'VERIFIED_ORGANIC',
      imageUrl: '/images/products/desi_chana.jpg',
      pickupLocation: 'Gram Sanwer Farmer Collective, Indore',
      isActive: true,
      createdAt: '2026-10-24T09:15:00Z'
    },
    {
      id: 'prd_005',
      farmerId: 'usr_farmer_6',
      farmerName: 'Mahendra Choudhary',
      farmerVillage: 'Depalpur',
      farmerDistrict: 'Indore',
      title: 'Pure Gir Cow A2 Cultured Bilona Ghee',
      titleHi: 'शुद्ध गिर गाय ए2 वैदिक बिलोना घी',
      category: 'Dairy & Honey',
      description: 'Crafted using the ancient 5-step Vedic Bilona method from free-grazing indigenous Gir cows. Granular texture, golden aroma, easy to digest.',
      pricePerKg: 1450,
      quantityAvailableKg: 45,
      unit: 'Litre',
      harvestDate: '2026-10-28',
      organicStatus: 'VERIFIED_ORGANIC',
      imageUrl: '/images/products/a2_ghee.jpg',
      pickupLocation: 'Depalpur Cow Sanctuary, Indore',
      isActive: true,
      createdAt: '2026-10-28T14:00:00Z'
    },
    {
      id: 'prd_006',
      farmerId: 'usr_farmer_4',
      farmerName: 'Rajesh Kumar',
      farmerVillage: 'Pilkhuwa',
      farmerDistrict: 'Hapur',
      title: 'Organic Chemical-Free Sugarcane Jaggery (Gud Cubes)',
      titleHi: 'जैविक रसायनों से मुक्त देसी गुड़ की डली',
      category: 'Spices & Herbs',
      description: 'Slow-simmered sugarcane juice purified naturally with wild bhendi sap. Zero sulfur or chemical bleaches. Rich in iron and minerals.',
      pricePerKg: 75,
      quantityAvailableKg: 500,
      unit: 'kg',
      harvestDate: '2026-10-25',
      organicStatus: 'NATURAL_FARMING',
      imageUrl: '/images/products/jaggery.jpg',
      pickupLocation: 'Pilkhuwa Sugar Yard, Hapur',
      isActive: true,
      createdAt: '2026-10-26T12:00:00Z'
    },
    {
      id: 'prd_007',
      farmerId: 'usr_farmer_3',
      farmerName: 'Sukhdev Verma',
      farmerVillage: 'Gharaunda',
      farmerDistrict: 'Karnal',
      title: 'Stone-Ground Salem Curcumin Turmeric Powder (5.2% Curcumin)',
      titleHi: 'पत्थर-पिसी उच्च करक्यूमिन हल्दी पाउडर',
      category: 'Spices & Herbs',
      description: 'Naturally cultivated rhizomes steamed and ground on traditional stone chakki to preserve volatile medicinal essential oils.',
      pricePerKg: 190,
      quantityAvailableKg: 120,
      unit: 'kg',
      harvestDate: '2026-09-30',
      organicStatus: 'VERIFIED_ORGANIC',
      imageUrl: '/images/products/turmeric.jpg',
      pickupLocation: 'Gharaunda Processing Centre, Karnal',
      isActive: true,
      createdAt: '2026-10-21T15:30:00Z'
    },
    {
      id: 'prd_008',
      farmerId: 'usr_farmer_8',
      farmerName: 'Devendra Sharma',
      farmerVillage: 'Indri',
      farmerDistrict: 'Karnal',
      title: 'Black Wheat (NABI MG) Anthocyanin-Rich Flour',
      titleHi: 'काला गेहूं (एंथोसायनिन युक्त औषधीय आटा)',
      category: 'Grains & Pulses',
      description: 'Developed by National Agri-Food Biotechnology Institute. Rich in natural anthocyanins, zinc, and dietary fiber. Excellent for diabetic wellness.',
      pricePerKg: 70,
      quantityAvailableKg: 280,
      unit: 'kg',
      harvestDate: '2026-10-15',
      organicStatus: 'IN_CONVERSION',
      imageUrl: '/images/products/black_wheat.jpg',
      pickupLocation: 'Indri Biotech Farm, Karnal',
      isActive: true,
      createdAt: '2026-10-23T11:45:00Z'
    }
  ];

  const orders: Order[] = [
    {
      id: 'ord_001',
      orderNumber: 'ORD-2026-781',
      consumerId: 'usr_consumer_1',
      consumerName: 'Priya Sharma',
      consumerMobile: '+91 98980 12345',
      deliveryAddress: 'Flat 402, Green Glen Residency, Saket, New Delhi 110017',
      items: [
        {
          productId: 'prd_001',
          title: 'Heritage Sharbati Golden Wheat (Unpolished)',
          pricePerKg: 48,
          quantityKg: 25,
          farmerId: 'usr_farmer_1',
          farmerName: 'Ramesh Patel'
        },
        {
          productId: 'prd_002',
          title: 'Aged Taraori Basmati Rice (1121 Extra Long)',
          pricePerKg: 125,
          quantityKg: 10,
          farmerId: 'usr_farmer_1',
          farmerName: 'Ramesh Patel'
        }
      ],
      totalAmount: 2450,
      status: 'DISPATCHED',
      createdAt: '2026-10-30T10:15:00Z',
      updatedAt: '2026-11-01T09:30:00Z'
    },
    {
      id: 'ord_002',
      orderNumber: 'ORD-2026-782',
      consumerId: 'usr_consumer_2',
      consumerName: 'Aravind Swaminathan',
      consumerMobile: '+91 98440 55667',
      deliveryAddress: 'Tower B, Pinnacle Heights, Sector 43, Gurugram 122002',
      items: [
        {
          productId: 'prd_005',
          title: 'Pure Gir Cow A2 Cultured Bilona Ghee',
          pricePerKg: 1450,
          quantityKg: 2,
          farmerId: 'usr_farmer_6',
          farmerName: 'Mahendra Choudhary'
        },
        {
          productId: 'prd_003',
          title: 'Wood-Pressed Kacchi Ghani Mustard Oil',
          pricePerKg: 210,
          quantityKg: 5,
          farmerId: 'usr_farmer_2',
          farmerName: 'Gurpreet Singh'
        }
      ],
      totalAmount: 3950,
      status: 'ACCEPTED',
      createdAt: '2026-11-01T14:00:00Z',
      updatedAt: '2026-11-01T15:20:00Z'
    }
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif_001',
      userId: 'usr_farmer_1',
      role: 'farmer',
      title: 'Kisan Alert: Token TKN-KNL-104 Generated',
      message: 'Dear Ramesh Patel, your digital token TKN-KNL-104 for Wheat at Karnal APMC has been registered. Expected slot: 10:30 AM - 12:30 PM. Carry Aadhaar & Bank Passbook.',
      type: 'SMS_SIMULATED',
      read: false,
      timestamp: '2026-11-01T14:20:00Z'
    },
    {
      id: 'notif_002',
      userId: 'usr_farmer_1',
      role: 'farmer',
      title: 'Gate Check-in Confirmed: Counter 2 Assigned',
      message: 'You are verified at Karnal Mandi Gate 1. Current position: #2 in queue. Estimated waiting time: 8 minutes. Please stay near Counter 2.',
      type: 'QUEUE_ALERT',
      read: false,
      timestamp: '2026-11-02T09:35:00Z'
    },
    {
      id: 'notif_003',
      userId: 'usr_farmer_3',
      role: 'farmer',
      title: 'Weighment Completed: Receipt RCP-KNL-2026-9001',
      message: '1750 KG Mustard accepted at MSP ₹59.50/KG. Total ₹1,04,125.00 generated for direct PFMS credit to your HDFC Bank account.',
      type: 'WEIGHMENT_ALERT',
      read: true,
      timestamp: '2026-11-02T09:20:00Z'
    },
    {
      id: 'notif_004',
      userId: 'usr_farmer_4',
      role: 'farmer',
      title: 'DBT Payment Settled: ₹95,787.50 Credited',
      message: 'Government procurement payment of ₹95,787.50 via PFMS ref PFMS2026110298124 successfully cleared to your Canara Bank account.',
      type: 'PAYMENT_ALERT',
      read: true,
      timestamp: '2026-11-02T10:45:00Z'
    },
    {
      id: 'notif_005',
      userId: 'usr_farmer_1',
      role: 'farmer',
      title: 'New Organic Store Order #ORD-2026-781',
      message: 'Customer Priya Sharma ordered 25kg Sharbati Wheat + 10kg Basmati Rice (₹2,450.00). Ready for dispatch.',
      type: 'ORDER_ALERT',
      read: true,
      timestamp: '2026-10-30T10:15:00Z'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log_001',
      userId: 'usr_operator_1',
      userName: 'Vikram Sharma',
      role: 'operator',
      action: 'GATE_CHECKIN',
      details: 'Farmer Ramesh Patel (TKN-KNL-104) verified at Counter 2 check-in booth.',
      timestamp: '2026-11-02T09:35:00Z'
    },
    {
      id: 'log_002',
      userId: 'usr_operator_1',
      userName: 'Vikram Sharma',
      role: 'operator',
      action: 'WEIGHMENT_SLIP_ISSUED',
      details: 'Issued digital receipt RCP-KNL-2026-9001 for Farmer Sukhdev Verma. Net 1800kg, accepted 1750kg.',
      timestamp: '2026-11-02T09:20:00Z'
    },
    {
      id: 'log_003',
      userId: 'usr_operator_1',
      userName: 'Vikram Sharma',
      role: 'operator',
      action: 'PAYMENT_REFERENCE_LOGGED',
      details: 'Recorded PFMS ref PFMS2026110298124 for payment #pay_001.',
      timestamp: '2026-11-02T10:45:00Z'
    }
  ];

  return {
    users,
    passwords,
    farmerProfiles,
    operatorCentres,
    procurementCentres,
    procurementSlots,
    bookings,
    tokens,
    queueRecords,
    weighmentRecords,
    paymentRecords,
    products,
    orders,
    notifications,
    auditLogs
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing DB file, seeding new database:', e);
    }
    const seed = createSeedData();
    this.persist(seed);
    return seed;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist DB to file:', e);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public save() {
    this.persist();
  }

  // --- Dynamic Queue Formula ---
  // Estimated Waiting Time = (Farmers Ahead in Queue * Average Time Per Farmer) / Active Counters
  public recalculateQueue(centreId: string) {
    const centre = this.data.procurementCentres.find(c => c.id === centreId);
    if (!centre) return;

    const activeCounters = Math.max(1, centre.activeCounters);
    const avgMins = centre.avgMinsPerFarmer || 12;

    // Filter queue records for this centre that are waiting
    const waitingRecords = this.data.queueRecords.filter(
      qr => qr.centreId === centreId && qr.status === 'WAITING'
    );

    // Sort by arrival/checkin time
    waitingRecords.sort((a, b) => {
      return a.queuePosition - b.queuePosition;
    });

    waitingRecords.forEach((rec, index) => {
      rec.queuePosition = index + 1;
      // Formula: (Farmers Ahead in Queue * Average Time Per Farmer) / Active Counters
      const farmersAhead = index; // 0 for the first waiting person
      rec.estimatedWaitMinutes = Math.round((farmersAhead * avgMins) / activeCounters);
    });

    this.save();
  }

  public logAudit(userId: string, userName: string, role: any, action: string, details: string) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
    this.save();
  }
}

export const db = new Database();
