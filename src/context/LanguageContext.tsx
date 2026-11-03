import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Common
    app_title: 'Smart Agriculture Connect',
    app_tagline: 'Transparent Government Procurement & Direct Organic Farm-to-Home Marketplace',
    welcome: 'Welcome',
    logout: 'Logout',
    role_farmer: 'Farmer',
    role_consumer: 'Consumer',
    role_operator: 'Procurement Operator',
    role_admin: 'Mandi Administrator',
    kisan_id: 'Farmer ID',
    district: 'District',
    state: 'State',
    village: 'Village',
    save: 'Save',
    cancel: 'Cancel',
    status: 'Status',
    actions: 'Actions',
    date: 'Date',
    time: 'Time',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    all: 'All',

    // Stats
    stat_upcoming_booking: 'Upcoming Booking',
    stat_active_token: 'Active Token',
    stat_waiting_time: 'Est. Waiting Time',
    stat_produce_listed: 'Total Produce Listed',
    stat_completed_procurement: 'Procurement Done',
    minutes: 'mins',
    kg: 'KG',
    quintal: 'Quintals',

    // Procurement Assistant
    procurement_title: 'Smart Procurement Assistant',
    procurement_subtitle: 'Book mandi slots, generate digital tokens, and skip long mandi waiting lines',
    find_centre: 'Find Procurement Centre',
    select_state: 'Select State',
    select_district: 'Select District',
    select_centre: 'Select Procurement Centre',
    available_counters: 'Active Counters',
    daily_capacity: 'Daily Capacity',
    book_slot_button: 'Book Procurement Slot',
    select_crop: 'Select Crop',
    expected_qty: 'Expected Quantity (KG)',
    select_date: 'Select Preferred Date',
    select_slot: 'Select Time Slot',
    confirm_booking: 'Confirm Mandi Slot',

    // Token & Live Queue
    token_details: 'Digital Mandi Token',
    token_number: 'Token Number',
    farmers_ahead: 'Farmers Ahead in Queue',
    queue_status: 'Queue Status',
    counter_assigned: 'Assigned Counter',
    grace_period: 'Transport Grace Period',
    stage_slot_booked: 'Slot Booked',
    stage_token_gen: 'Token Generated',
    stage_checked_in: 'Checked In at Gate',
    stage_weighment_prog: 'Weighment in Progress',
    stage_weighment_done: 'Weighment Completed',
    stage_procurement_done: 'Procurement Approved',
    stage_payment_pending: 'Payment Processing',
    stage_payment_settled: 'DBT Payment Settled',

    // Organic Farm to Home
    farm_to_home_title: 'Organic Farm-to-Home Marketplace',
    farm_to_home_subtitle: 'Sell your chemical-free harvests directly to households with zero middlemen',
    add_product: 'Add New Product',
    my_products: 'My Listed Harvests',
    orders_received: 'Orders Received',
    earnings_dashboard: 'Earnings & Sales',
    product_name: 'Product Name',
    category: 'Category',
    price_per_kg: 'Price (₹ / KG)',
    available_qty: 'Available Quantity (KG)',
    harvest_date: 'Harvest Date',
    organic_status: 'Organic Certification',
    pickup_address: 'Pickup Address',
    total_sales: 'Total Direct Sales',
    completed_orders: 'Completed Orders',
    pending_orders: 'Pending Dispatch',

    // Consumer Marketplace
    consumer_browse: 'Fresh Harvests Directly From Local Farmers',
    cart: 'Cart',
    checkout: 'Proceed to Checkout',
    order_history: 'My Orders',
    verified_organic: 'Verified Organic',
    natural_farming: 'Natural / Zero-Budget',
    in_conversion: 'In Organic Conversion',
    farmer_name: 'Farmer',
    from_village: 'Grown in',
    view_details: 'View Harvest Details',
    add_to_cart: 'Add to Cart',
    items_in_cart: 'Items in Cart',
    total_amount: 'Total Amount',
    place_order: 'Confirm & Place Order',
    delivery_address: 'Delivery Address',
    contact_phone: 'Contact Phone',

    // Operator Dashboard
    operator_overview: 'Mandi Operational Overview',
    live_queue_mgmt: 'Live Queue Terminal',
    weighbridge_terminal: 'Digital Weighbridge & Moisture Lab',
    slot_capacity_mgmt: 'Slot & Capacity Management',
    payment_mgmt: 'DBT Payment Clearance',
    reports_analytics: 'Procurement Reports & Analytics',
    verify_checkin: 'Verify Gate Check-In',
    call_next_farmer: 'Call Next to Counter',
    gross_weight: 'Gross Weight (Vehicle + Crop)',
    tare_weight: 'Tare Weight (Empty Vehicle)',
    net_weight: 'Net Weight',
    accepted_qty: 'Accepted Quantity',
    rejected_qty: 'Rejected Quantity',
    rejection_reason: 'Reason for Rejection / Dockage',
    moisture_pct: 'Moisture Percentage (%)',
    msp_rate: 'Official MSP Rate (₹/KG)',
    issue_receipt: 'Generate Official Weighment Receipt',
    download_slip: 'Print Weighment Slip',
    broadcast_sms: 'Broadcast SMS Alert',

    // Low connectivity
    offline_notice: 'Offline Mode: Displaying locally cached data. Bookings will sync once connection resumes.',
    online_status: 'Live Connected'
  },
  hi: {
    // Brand & Common
    app_title: 'स्मार्ट कृषि कनेक्ट',
    app_tagline: 'पारदर्शी सरकारी खरीद व किसानों का सीधा जैविक खेत-से-घर बाज़ार',
    welcome: 'नमस्ते',
    logout: 'लॉगआउट',
    role_farmer: 'किसान भाई',
    role_consumer: 'उपभोक्ता / ग्राहक',
    role_operator: 'मंडी ऑपरेटर',
    role_admin: 'कृषि प्रशासक',
    kisan_id: 'किसान आईडी',
    district: 'जिला',
    state: 'राज्य',
    village: 'गांव',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    status: 'स्थिति',
    actions: 'कार्यवाही',
    date: 'तारीख',
    time: 'समय',
    refresh: 'ताज़ा करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    all: 'सभी',

    // Stats
    stat_upcoming_booking: 'आगामी बुकिंग',
    stat_active_token: 'सक्रिय टोकन',
    stat_waiting_time: 'अनुमानित प्रतीक्षा समय',
    stat_produce_listed: 'सूचीबद्ध कुल उपज',
    stat_completed_procurement: 'सरकारी खरीद संपन्न',
    minutes: 'मिनट',
    kg: 'कि.ग्रा.',
    quintal: 'क्विंटल',

    // Procurement Assistant
    procurement_title: 'स्मार्ट खरीद सहायक (मंडी बुकिंग)',
    procurement_subtitle: 'मंडी का स्लॉट बुक करें, डिजिटल टोकन प्राप्त करें और लंबी कतारों से छुटकारा पाएं',
    find_centre: 'सरकारी खरीद केंद्र खोजें',
    select_state: 'राज्य चुनें',
    select_district: 'जिला चुनें',
    select_centre: 'खरीद केंद्र / मंडी चुनें',
    available_counters: 'सक्रिय धर्मकांटा काउंटर',
    daily_capacity: 'दैनिक खरीद क्षमता',
    book_slot_button: 'खरीद स्लॉट बुक करें',
    select_crop: 'फसल का चयन करें',
    expected_qty: 'अनुमानित मात्रा (किलोग्राम में)',
    select_date: 'सुविधाजनक तारीख चुनें',
    select_slot: 'समय स्लॉट चुनें',
    confirm_booking: 'बुकिंग सुनिश्चित करें',

    // Token & Live Queue
    token_details: 'डिजिटल मंडी टोकन',
    token_number: 'टोकन संख्या',
    farmers_ahead: 'कतार में आपसे आगे किसान',
    queue_status: 'कतार की वर्तमान स्थिति',
    counter_assigned: 'आबंटित काउंटर',
    grace_period: 'वाहन देरी रियायत समय (ग्रेस)',
    stage_slot_booked: 'स्लॉट बुक हो गया',
    stage_token_gen: 'टोकन जारी',
    stage_checked_in: 'गेट पर आमद दर्ज',
    stage_weighment_prog: 'तौल जारी है',
    stage_weighment_done: 'तौल कार्य संपन्न',
    stage_procurement_done: 'खरीद स्वीकृत',
    stage_payment_pending: 'भुगतान प्रक्रियाधीन',
    stage_payment_settled: 'डीबीटी बैंक खाते में जमा',

    // Organic Farm to Home
    farm_to_home_title: 'जैविक खेत-से-घर सीधा बाज़ार',
    farm_to_home_subtitle: 'बिना बिचौलियों के अपनी रसायन-मुक्त शुद्ध उपज सीधे ग्राहकों को बेचें',
    add_product: 'नया उत्पाद जोड़ें',
    my_products: 'मेरी सूचीबद्ध उपज',
    orders_received: 'प्राप्त आर्डर',
    earnings_dashboard: 'कुल कमाई व बिक्री',
    product_name: 'उपज का नाम',
    category: 'श्रेणी',
    price_per_kg: 'मूल्य (₹ प्रति कि.ग्रा.)',
    available_qty: 'उपलब्ध मात्रा (कि.ग्रा.)',
    harvest_date: 'फसल कटाई की तिथि',
    organic_status: 'जैविक प्रमाणन प्रकार',
    pickup_address: 'पिकअप स्थान / पता',
    total_sales: 'कुल सीधी बिक्री',
    completed_orders: 'सफल आर्डर',
    pending_orders: 'डिस्पैच हेतु शेष',

    // Consumer Marketplace
    consumer_browse: 'सीधे स्थानीय किसानों के खेतों से ताजा उपज',
    cart: 'टोकरी (कार्ट)',
    checkout: 'ऑर्डर करें',
    order_history: 'मेरे पूर्व आर्डर',
    verified_organic: 'प्रमाणित जैविक',
    natural_farming: 'प्राकृतिक खेती',
    in_conversion: 'परिवर्तनशील जैविक',
    farmer_name: 'किसान',
    from_village: 'उत्पादन स्थल',
    view_details: 'उपज विवरण देखें',
    add_to_cart: 'कार्ट में डालें',
    items_in_cart: 'कार्ट में वस्तुएं',
    total_amount: 'कुल भुगतान राशि',
    place_order: 'ऑर्डर पक्का करें',
    delivery_address: 'डिलीवरी का पता',
    contact_phone: 'संपर्क मोबाइल',

    // Operator Dashboard
    operator_overview: 'मंडी परिचालन अवलोकन',
    live_queue_mgmt: 'लाइव कतार प्रबंधन',
    weighbridge_terminal: 'डिजिटल धर्मकांटा व लैब टर्मिनल',
    slot_capacity_mgmt: 'स्लॉट व क्षमता प्रबंधन',
    payment_mgmt: 'डीबीटी भुगतान निस्तारण',
    reports_analytics: 'खरीद रिपोर्ट्स व विश्लेषण',
    verify_checkin: 'गेट पर किसान आमद सत्यापित करें',
    call_next_farmer: 'अगले किसान को काउंटर पर बुलाएं',
    gross_weight: 'सकल वजन (वाहन + फसल)',
    tare_weight: 'खाली वाहन वजन (टार)',
    net_weight: 'शुद्ध फसल वजन',
    accepted_qty: 'स्वीकृत मात्रा',
    rejected_qty: 'अस्वीकृत मात्रा',
    rejection_reason: 'अस्वीकृति या कटौती का कारण',
    moisture_pct: 'नमी प्रतिशत (%)',
    msp_rate: 'सरकारी एमएसपी दर (₹/किग्रा)',
    issue_receipt: 'डिजिटल तौल पर्ची जारी करें',
    download_slip: 'तौल पर्ची प्रिंट करें',
    broadcast_sms: 'कतारबद्ध किसानों को एसएमएस भेजें',

    // Low connectivity
    offline_notice: 'ऑफलाइन मोड: लोकल डेटा प्रदर्शित हो रहा है। इंटरनेट आने पर स्वतः सिंक होगा।',
    online_status: 'लाइव कनेक्टेड'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('agri_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agri_lang', lang);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language][key] || defaultText || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
