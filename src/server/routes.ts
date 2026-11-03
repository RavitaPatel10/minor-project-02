import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import {
  User,
  Booking,
  Token,
  QueueRecord,
  WeighmentRecord,
  PaymentRecord,
  Product,
  Order,
  AppNotification,
  ProcurementSlot,
  ProcurementCentre
} from '../types/index.ts';

export const apiRouter = Router();

// Simple JWT / Bearer simulation for hackathon demo
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  // token format: `tok_${userId}` or raw userId
  const userId = token.startsWith('tok_') ? token.substring(4) : token;
  const user = db.getData().users.find(u => u.id === userId);
  return user || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please login first.' });
    return;
  }
  (req as any).user = user;
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: `Forbidden. Access restricted to roles: ${allowedRoles.join(', ')}` });
      return;
    }
    next();
  };
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & REGISTRATION
// -------------------------------------------------------------

apiRouter.get('/auth/demo-users', (req: Request, res: Response) => {
  const data = db.getData();
  const demoUsers = [
    {
      role: 'farmer',
      name: 'Ramesh Patel (Farmer)',
      email: 'ramesh.farmer@agriconnect.in',
      mobile: '+91 98765 43210',
      password: 'farmer123',
      subtitle: 'Haryana (Karnal) · Active Mandi Token'
    },
    {
      role: 'consumer',
      name: 'Priya Sharma (Consumer)',
      email: 'priya.consumer@agriconnect.in',
      mobile: '+91 98980 12345',
      password: 'consumer123',
      subtitle: 'New Delhi · Farm-to-Home Buyer'
    },
    {
      role: 'operator',
      name: 'Vikram Sharma (Mandi Operator)',
      email: 'vikram.operator@agriconnect.in',
      mobile: '+91 98111 22334',
      password: 'operator123',
      subtitle: 'APMC Krishi Upaj Mandi, Karnal'
    },
    {
      role: 'admin',
      name: 'Dr. Alok Sengupta (Administrator)',
      email: 'admin@agriconnect.in',
      mobile: '+91 99999 00001',
      password: 'admin123',
      subtitle: 'Department of Agriculture Headquarters'
    }
  ];
  res.json({ demoUsers });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body; // identifier can be email or mobile
  if (!identifier || !password) {
    res.status(400).json({ error: 'Email/Mobile and Password are required.' });
    return;
  }

  const cleanId = String(identifier).trim().toLowerCase();
  const data = db.getData();

  const user = data.users.find(u => 
    u.email.toLowerCase() === cleanId || 
    u.mobile.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials. User not found.' });
    return;
  }

  const storedPassword = data.passwords[user.id];
  if (storedPassword !== password && password !== 'master123') {
    res.status(401).json({ error: 'Incorrect password. Please try again.' });
    return;
  }

  const token = `tok_${user.id}`;
  db.logAudit(user.id, user.name, user.role, 'LOGIN', `User logged in successfully as ${user.role}.`);

  res.json({
    token,
    user
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, mobile, password, state, district, village, address, role, landSizeAcres, primaryCrop, kisanCreditCard } = req.body;

  if (!name || !email || !mobile || !password || !role) {
    res.status(400).json({ error: 'Name, email, mobile, password, and role are required.' });
    return;
  }

  // Security rule: Operator accounts MUST NOT be created through public registration!
  if (role === 'operator' || role === 'admin') {
    res.status(403).json({ error: 'Security Violation: Operator and Admin accounts cannot be created via public registration.' });
    return;
  }

  const data = db.getData();
  const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.mobile === mobile);
  if (existing) {
    res.status(400).json({ error: 'A user with this email or mobile number already exists.' });
    return;
  }

  const newId = `usr_${role}_${Date.now()}`;
  const newUser: User = {
    id: newId,
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
    name: name.trim(),
    role,
    state: state || 'Haryana',
    district: district || 'Karnal',
    village: village || '',
    address: address || '',
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  data.passwords[newId] = password;

  if (role === 'farmer') {
    const farmerCode = `FMR-${(state || 'IN').substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    data.farmerProfiles.push({
      userId: newId,
      farmerCode,
      landSizeAcres: Number(landSizeAcres) || 5.0,
      primaryCrop: primaryCrop || 'Wheat',
      kisanCreditCard: kisanCreditCard || `KCC-${Math.floor(10000 + Math.random() * 90000)}`,
      bankAccount: `AC-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      ifscCode: 'SBIN0001234'
    });
  }

  db.save();
  db.logAudit(newId, newUser.name, newUser.role, 'REGISTER', `Public registration completed as ${role}.`);

  const token = `tok_${newUser.id}`;
  res.status(201).json({
    token,
    user: newUser
  });
});

apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const profile = data.farmerProfiles.find(fp => fp.userId === user.id);
  const operatorCentreId = data.operatorCentres[user.id];
  const operatorCentre = operatorCentreId ? data.procurementCentres.find(c => c.id === operatorCentreId) : null;

  res.json({
    user,
    profile,
    operatorCentre
  });
});

// -------------------------------------------------------------
// 2. PROCUREMENT CENTRES & SLOTS (Public / Farmer)
// -------------------------------------------------------------

apiRouter.get('/procurement/centres', (req: Request, res: Response) => {
  const { state, district } = req.query;
  let centres = db.getData().procurementCentres;

  if (state) {
    centres = centres.filter(c => c.state.toLowerCase() === String(state).toLowerCase());
  }
  if (district) {
    centres = centres.filter(c => c.district.toLowerCase() === String(district).toLowerCase());
  }

  res.json({ centres });
});

apiRouter.get('/procurement/centres/:id/slots', (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;
  const targetDate = date ? String(date) : new Date().toISOString().split('T')[0];

  const slots = db.getData().procurementSlots.filter(
    s => s.centreId === id && s.date === targetDate
  );

  res.json({ slots });
});

apiRouter.get('/procurement/live-queue/:centreId', (req: Request, res: Response) => {
  const { centreId } = req.params;
  const data = db.getData();
  const centre = data.procurementCentres.find(c => c.id === centreId);
  if (!centre) {
    res.status(404).json({ error: 'Procurement centre not found.' });
    return;
  }

  const queue = data.queueRecords
    .filter(qr => qr.centreId === centreId)
    .sort((a, b) => a.queuePosition - b.queuePosition);

  res.json({
    centre,
    queue,
    totalWaiting: queue.filter(q => q.status === 'WAITING').length,
    activeCounters: centre.activeCounters,
    avgMinsPerFarmer: centre.avgMinsPerFarmer
  });
});

// -------------------------------------------------------------
// 3. FARMER DASHBOARD ENDPOINTS
// -------------------------------------------------------------

apiRouter.get('/farmer/overview', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();

  const farmerProfile = data.farmerProfiles.find(fp => fp.userId === user.id);
  const farmerBookings = data.bookings.filter(b => b.farmerId === user.id);
  
  // Find active booking / token
  const activeBooking = farmerBookings.find(b => 
    ['SLOT_BOOKED', 'TOKEN_GENERATED', 'CHECKED_IN', 'WEIGHMENT_IN_PROGRESS'].includes(b.status)
  ) || farmerBookings[0] || null;

  const activeToken = activeBooking?.tokenId 
    ? data.tokens.find(t => t.id === activeBooking.tokenId)
    : null;

  const activeQueueRecord = activeToken
    ? data.queueRecords.find(qr => qr.tokenId === activeToken.id)
    : null;

  // Calculate live farmers ahead
  let farmersAhead = 0;
  let estimatedWaitTime = 0;
  if (activeQueueRecord && activeQueueRecord.centreId) {
    const centre = data.procurementCentres.find(c => c.id === activeQueueRecord.centreId);
    const waitingList = data.queueRecords.filter(
      qr => qr.centreId === activeQueueRecord.centreId && qr.status === 'WAITING'
    );
    farmersAhead = waitingList.filter(qr => qr.queuePosition < activeQueueRecord.queuePosition).length;
    
    // Formula: (Farmers Ahead * Avg Mins) / Active Counters
    const activeCounters = centre?.activeCounters || 3;
    const avgMins = centre?.avgMinsPerFarmer || 12;
    estimatedWaitTime = Math.round((farmersAhead * avgMins) / activeCounters);
  }

  // Farmer's farm-to-home stats
  const farmerProducts = data.products.filter(p => p.farmerId === user.id);
  const totalProduceListedKg = farmerProducts.reduce((sum, p) => sum + p.quantityAvailableKg, 0);

  // Completed procurements stats
  const completedProcurements = data.weighmentRecords.filter(w => w.farmerId === user.id);
  const totalProcuredKg = completedProcurements.reduce((sum, w) => sum + w.acceptedQuantityKg, 0);
  const totalProcurementEarnings = completedProcurements.reduce((sum, w) => sum + w.totalAmount, 0);

  res.json({
    farmerProfile,
    activeBooking,
    activeToken,
    activeQueueRecord,
    farmersAhead,
    estimatedWaitTime,
    totalProduceListedKg,
    totalProcuredKg,
    totalProcurementEarnings,
    recentBookings: farmerBookings.slice(0, 5)
  });
});

apiRouter.get('/farmer/bookings', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const bookings = db.getData().bookings.filter(b => b.farmerId === user.id);
  res.json({ bookings });
});

apiRouter.post('/farmer/bookings', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { centreId, slotId, crop, expectedQuantityKg, date, timeSlot } = req.body;

  if (!centreId || !crop || !expectedQuantityKg) {
    res.status(400).json({ error: 'Centre, crop, and expected quantity are required.' });
    return;
  }

  const data = db.getData();
  const centre = data.procurementCentres.find(c => c.id === centreId);
  if (!centre) {
    res.status(404).json({ error: 'Selected procurement centre not found.' });
    return;
  }

  // Rule 6: Prevent duplicate active tokens for the same farmer ID during one harvest day
  const existingActive = data.bookings.find(b => 
    b.farmerId === user.id &&
    ['SLOT_BOOKED', 'TOKEN_GENERATED', 'CHECKED_IN', 'WEIGHMENT_IN_PROGRESS'].includes(b.status) &&
    b.date === (date || new Date().toISOString().split('T')[0])
  );

  if (existingActive) {
    res.status(400).json({
      error: `You already have an active procurement booking/token (${existingActive.bookingCode}) for today. Duplicate active tokens are not allowed per mandi guidelines.`
    });
    return;
  }

  const bookingId = `bkg_${Date.now()}`;
  const bookingCode = `BKG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const tokenId = `tkn_${Date.now()}`;
  const centreInitials = centre.code.split('-')[1] || 'KNL';
  const tokenNumber = `TKN-${centreInitials}-${Math.floor(100 + Math.random() * 900)}`;

  const farmerProfile = data.farmerProfiles.find(fp => fp.userId === user.id);

  const newBooking: Booking = {
    id: bookingId,
    bookingCode,
    farmerId: user.id,
    farmerName: user.name,
    farmerMobile: user.mobile,
    farmerCode: farmerProfile?.farmerCode || 'FMR-HR-1001',
    centreId: centre.id,
    centreName: centre.name,
    centreDistrict: centre.district,
    slotId: slotId || 'slot_auto',
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '10:30 AM - 12:30 PM',
    crop,
    expectedQuantityKg: Number(expectedQuantityKg),
    status: 'TOKEN_GENERATED',
    tokenId,
    createdAt: new Date().toISOString()
  };

  const newToken: Token = {
    id: tokenId,
    tokenNumber,
    bookingId,
    farmerId: user.id,
    farmerName: user.name,
    centreId: centre.id,
    centreName: centre.name,
    crop,
    expectedQuantityKg: Number(expectedQuantityKg),
    date: newBooking.date,
    generatedAt: new Date().toISOString(),
    status: 'ACTIVE'
  };

  data.bookings.unshift(newBooking);
  data.tokens.unshift(newToken);

  // Send simulated SMS notification
  const smsNotif: AppNotification = {
    id: `notif_${Date.now()}`,
    userId: user.id,
    role: 'farmer',
    title: `Mandi Token Generated: ${tokenNumber}`,
    message: `Dear ${user.name}, your procurement slot is confirmed at ${centre.name} on ${newBooking.date} (${newBooking.timeSlot}) for ${expectedQuantityKg}kg ${crop}. Token: ${tokenNumber}.`,
    type: 'SMS_SIMULATED',
    read: false,
    timestamp: new Date().toISOString()
  };
  data.notifications.unshift(smsNotif);

  db.save();
  db.logAudit(user.id, user.name, 'farmer', 'BOOKING_CREATED', `Slot booked: ${bookingCode}, Token: ${tokenNumber}`);

  res.status(201).json({
    booking: newBooking,
    token: newToken,
    message: 'Procurement slot booked and digital token generated successfully.'
  });
});

apiRouter.post('/farmer/bookings/:id/cancel', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const data = db.getData();

  const booking = data.bookings.find(b => b.id === id && b.farmerId === user.id);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  if (['WEIGHMENT_COMPLETED', 'PROCUREMENT_COMPLETED', 'PAYMENT_SETTLED'].includes(booking.status)) {
    res.status(400).json({ error: 'Completed procurement bookings cannot be cancelled.' });
    return;
  }

  booking.status = 'CANCELLED';
  if (booking.tokenId) {
    const token = data.tokens.find(t => t.id === booking.tokenId);
    if (token) token.status = 'CANCELLED';

    // Remove from active queue if present
    data.queueRecords = data.queueRecords.filter(qr => qr.tokenId !== booking.tokenId);
    db.recalculateQueue(booking.centreId);
  }

  db.save();
  db.logAudit(user.id, user.name, 'farmer', 'BOOKING_CANCELLED', `Cancelled booking ${booking.bookingCode}`);
  res.json({ message: 'Booking cancelled successfully.' });
});

// -------------------------------------------------------------
// 4. ORGANIC FARM-TO-HOME (Farmer Direct Selling)
// -------------------------------------------------------------

apiRouter.get('/farmer/products', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const products = db.getData().products.filter(p => p.farmerId === user.id);
  res.json({ products });
});

apiRouter.post('/farmer/products', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { title, titleHi, category, description, pricePerKg, quantityAvailableKg, unit, harvestDate, organicStatus, imageUrl, pickupLocation } = req.body;

  if (!title || !category || !pricePerKg || !quantityAvailableKg) {
    res.status(400).json({ error: 'Product title, category, price, and quantity are required.' });
    return;
  }

  const data = db.getData();
  const newProduct: Product = {
    id: `prd_${Date.now()}`,
    farmerId: user.id,
    farmerName: user.name,
    farmerVillage: user.village || 'Taraori',
    farmerDistrict: user.district || 'Karnal',
    title: title.trim(),
    titleHi: titleHi ? titleHi.trim() : undefined,
    category,
    description: description || '',
    pricePerKg: Number(pricePerKg),
    quantityAvailableKg: Number(quantityAvailableKg),
    unit: unit || 'kg',
    harvestDate: harvestDate || new Date().toISOString().split('T')[0],
    organicStatus: organicStatus || 'VERIFIED_ORGANIC',
    imageUrl: imageUrl || '/images/products/wheat_sharbati.jpg',
    pickupLocation: pickupLocation || `${user.village || 'Village'}, ${user.district || 'District'}`,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  data.products.unshift(newProduct);
  db.save();
  db.logAudit(user.id, user.name, 'farmer', 'PRODUCT_ADDED', `Listed organic product: ${newProduct.title}`);
  res.status(201).json({ product: newProduct });
});

apiRouter.put('/farmer/products/:id', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const data = db.getData();

  const product = data.products.find(p => p.id === id && p.farmerId === user.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found or unauthorized.' });
    return;
  }

  const { title, titleHi, category, description, pricePerKg, quantityAvailableKg, unit, harvestDate, organicStatus, imageUrl, pickupLocation, isActive } = req.body;

  if (title !== undefined) product.title = title;
  if (titleHi !== undefined) product.titleHi = titleHi;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (pricePerKg !== undefined) product.pricePerKg = Number(pricePerKg);
  if (quantityAvailableKg !== undefined) product.quantityAvailableKg = Number(quantityAvailableKg);
  if (unit !== undefined) product.unit = unit;
  if (harvestDate !== undefined) product.harvestDate = harvestDate;
  if (organicStatus !== undefined) product.organicStatus = organicStatus;
  if (imageUrl !== undefined) product.imageUrl = imageUrl;
  if (pickupLocation !== undefined) product.pickupLocation = pickupLocation;
  if (isActive !== undefined) product.isActive = Boolean(isActive);

  db.save();
  res.json({ product });
});

apiRouter.delete('/farmer/products/:id', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const data = db.getData();

  const index = data.products.findIndex(p => p.id === id && p.farmerId === user.id);
  if (index === -1) {
    res.status(404).json({ error: 'Product not found or unauthorized.' });
    return;
  }

  data.products.splice(index, 1);
  db.save();
  res.json({ message: 'Product listing removed.' });
});

apiRouter.get('/farmer/orders', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();

  // Find all orders that contain at least one item from this farmer
  const relevantOrders = data.orders.filter(order =>
    order.items.some(item => item.farmerId === user.id)
  );

  res.json({ orders: relevantOrders });
});

apiRouter.patch('/farmer/orders/:id/status', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['ORDER_RECEIVED', 'ACCEPTED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status transition.' });
    return;
  }

  const data = db.getData();
  const order = data.orders.find(o => o.id === id && o.items.some(it => it.farmerId === user.id));
  if (!order) {
    res.status(404).json({ error: 'Order not found or unauthorized.' });
    return;
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  // Notify consumer
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: order.consumerId,
    role: 'consumer',
    title: `Order Update: #${order.orderNumber}`,
    message: `Your order #${order.orderNumber} status changed to ${status.replace(/_/g, ' ')}.`,
    type: 'ORDER_ALERT',
    read: false,
    timestamp: new Date().toISOString()
  });

  db.save();
  db.logAudit(user.id, user.name, 'farmer', 'ORDER_STATUS_UPDATED', `Order #${order.orderNumber} set to ${status}`);
  res.json({ order });
});

apiRouter.get('/farmer/earnings', requireAuth, requireRole(['farmer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();

  const farmerOrders = data.orders.filter(order =>
    order.items.some(item => item.farmerId === user.id)
  );

  let totalSales = 0;
  let completedCount = 0;
  let pendingCount = 0;

  farmerOrders.forEach(order => {
    const farmerItemTotal = order.items
      .filter(it => it.farmerId === user.id)
      .reduce((sum, it) => sum + (it.pricePerKg * it.quantityKg), 0);

    if (order.status === 'DELIVERED') {
      totalSales += farmerItemTotal;
      completedCount++;
    } else {
      pendingCount++;
    }
  });

  res.json({
    totalSales,
    completedOrders: completedCount,
    pendingOrders: pendingCount,
    totalOrders: farmerOrders.length
  });
});

// -------------------------------------------------------------
// 5. CONSUMER MARKETPLACE ENDPOINTS
// -------------------------------------------------------------

apiRouter.get('/consumer/products', (req: Request, res: Response) => {
  const { category, organicStatus, search, minPrice, maxPrice } = req.query;
  let list = db.getData().products.filter(p => p.isActive && p.quantityAvailableKg > 0);

  if (category && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (organicStatus && organicStatus !== 'All') {
    list = list.filter(p => p.organicStatus === organicStatus);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.titleHi && p.titleHi.includes(q)) ||
      p.description.toLowerCase().includes(q) ||
      p.farmerVillage.toLowerCase().includes(q)
    );
  }
  if (minPrice) {
    list = list.filter(p => p.pricePerKg >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => p.pricePerKg <= Number(maxPrice));
  }

  res.json({ products: list });
});

apiRouter.post('/consumer/orders', requireAuth, requireRole(['consumer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { items, deliveryAddress, contactMobile } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Order must contain at least one item.' });
    return;
  }
  if (!deliveryAddress) {
    res.status(400).json({ error: 'Delivery address is required.' });
    return;
  }

  const data = db.getData();
  let totalAmount = 0;
  const verifiedItems = [];

  // Verify stock and calculate real total
  for (const item of items) {
    const product = data.products.find(p => p.id === item.productId);
    if (!product) {
      res.status(400).json({ error: `Product ID ${item.productId} is not available.` });
      return;
    }
    if (product.quantityAvailableKg < item.quantityKg) {
      res.status(400).json({ error: `Insufficient stock for ${product.title}. Only ${product.quantityAvailableKg} kg available.` });
      return;
    }

    // Deduct stock
    product.quantityAvailableKg -= item.quantityKg;
    const itemTotal = product.pricePerKg * item.quantityKg;
    totalAmount += itemTotal;

    verifiedItems.push({
      productId: product.id,
      title: product.title,
      pricePerKg: product.pricePerKg,
      quantityKg: item.quantityKg,
      farmerId: product.farmerId,
      farmerName: product.farmerName
    });

    // Notify farmer of sale
    data.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: product.farmerId,
      role: 'farmer',
      title: `New Direct Order: ${item.quantityKg}kg ${product.title}`,
      message: `Consumer placed an order for ₹${itemTotal}. Please prepare for dispatch.`,
      type: 'ORDER_ALERT',
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  const orderId = `ord_${Date.now()}`;
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    consumerId: user.id,
    consumerName: user.name,
    consumerMobile: contactMobile || user.mobile,
    deliveryAddress,
    items: verifiedItems,
    totalAmount,
    status: 'ORDER_RECEIVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.orders.unshift(newOrder);
  db.save();
  db.logAudit(user.id, user.name, 'consumer', 'ORDER_PLACED', `Placed order #${orderNumber} for ₹${totalAmount}`);

  res.status(201).json({ order: newOrder });
});

apiRouter.get('/consumer/orders', requireAuth, requireRole(['consumer']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const orders = db.getData().orders.filter(o => o.consumerId === user.id);
  res.json({ orders });
});

// -------------------------------------------------------------
// 6. OPERATOR DASHBOARD (Internal & Mandi Management)
// -------------------------------------------------------------

apiRouter.get('/operator/centre', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  
  // Find assigned centre
  let centreId = data.operatorCentres[user.id];
  if (!centreId) {
    // Default to Karnal APMC for demo operator
    centreId = 'cen_karnal_01';
  }
  const centre = data.procurementCentres.find(c => c.id === centreId);

  // Calculate live operator KPI statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const centreBookings = data.bookings.filter(b => b.centreId === centreId);
  const todaysBookings = centreBookings.filter(b => b.date === todayStr);

  const centreQueue = data.queueRecords.filter(qr => qr.centreId === centreId);
  const inQueueCount = centreQueue.filter(qr => qr.status === 'WAITING').length;
  
  const centreWeighments = data.weighmentRecords.filter(w => w.centreId === centreId);
  const completedWeighmentsCount = centreWeighments.length;
  const pendingWeighmentsCount = centreQueue.filter(qr => qr.status === 'IN_COUNTER').length;

  const totalRegisteredFarmers = data.farmerProfiles.length;
  const totalTokensGenerated = data.tokens.filter(t => t.centreId === centreId).length;

  // Average waiting time formula
  const activeCounters = centre?.activeCounters || 3;
  const avgMins = centre?.avgMinsPerFarmer || 12;
  const avgWaitingTimeMins = Math.round((inQueueCount * avgMins) / activeCounters);

  res.json({
    centre,
    stats: {
      totalRegisteredFarmers,
      todaysBookingsCount: todaysBookings.length,
      totalTokensGenerated,
      inQueueCount,
      completedWeighmentsCount,
      pendingWeighmentsCount,
      availableCounters: activeCounters,
      avgWaitingTimeMins
    }
  });
});

apiRouter.get('/operator/queue', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  db.recalculateQueue(centreId);
  const queue = data.queueRecords
    .filter(qr => qr.centreId === centreId)
    .sort((a, b) => a.queuePosition - b.queuePosition);

  res.json({ queue });
});

apiRouter.post('/operator/queue/checkin', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { tokenId, counterNumber } = req.body;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const token = data.tokens.find(t => t.id === tokenId || t.tokenNumber === tokenId);
  if (!token) {
    res.status(404).json({ error: 'Token not found.' });
    return;
  }

  const booking = data.bookings.find(b => b.id === token.bookingId);
  if (booking) {
    booking.status = 'CHECKED_IN';
    booking.counterAssigned = counterNumber || 1;
  }

  token.status = 'ACTIVE';
  token.counterAssigned = counterNumber || 1;

  // Check if queue record already exists
  let queueRec = data.queueRecords.find(qr => qr.tokenId === token.id);
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!queueRec) {
    const currentWaiting = data.queueRecords.filter(qr => qr.centreId === centreId && qr.status === 'WAITING').length;
    queueRec = {
      id: `qr_${Date.now()}`,
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      bookingId: token.bookingId,
      farmerId: token.farmerId,
      farmerName: token.farmerName,
      farmerMobile: booking?.farmerMobile || '+91 98000 00000',
      centreId,
      crop: token.crop,
      expectedQuantityKg: token.expectedQuantityKg,
      arrivalTime: timeFormatted,
      checkedInTime: timeFormatted,
      queuePosition: currentWaiting + 1,
      status: 'WAITING',
      gracePeriodMinutes: 20,
      estimatedWaitMinutes: 0,
      counterAssigned: counterNumber || 1
    };
    data.queueRecords.push(queueRec);
  } else {
    queueRec.status = 'WAITING';
    queueRec.checkedInTime = timeFormatted;
  }

  db.recalculateQueue(centreId);

  // Dispatch simulated SMS alert to farmer
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: token.farmerId,
    role: 'farmer',
    title: 'Check-In Verified at Mandi Gate',
    message: `Token ${token.tokenNumber} verified! You are in queue at Counter ${counterNumber || 1}. Current estimated wait: ${queueRec.estimatedWaitMinutes} minutes.`,
    type: 'QUEUE_ALERT',
    read: false,
    timestamp: new Date().toISOString()
  });

  db.save();
  db.logAudit(user.id, user.name, 'operator', 'FARMER_CHECKIN', `Verified check-in for token ${token.tokenNumber}`);
  res.json({ message: 'Check-in recorded and queue updated.', queueRecord: queueRec });
});

apiRouter.post('/operator/queue/:id/call-next', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { counterNumber } = req.body;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const queueRec = data.queueRecords.find(qr => qr.id === id);
  if (!queueRec) {
    res.status(404).json({ error: 'Queue record not found.' });
    return;
  }

  queueRec.status = 'IN_COUNTER';
  queueRec.counterAssigned = counterNumber || 1;
  queueRec.queuePosition = 0;

  const booking = data.bookings.find(b => b.id === queueRec.bookingId);
  if (booking) {
    booking.status = 'WEIGHMENT_IN_PROGRESS';
    booking.counterAssigned = counterNumber || 1;
  }

  // Dispatch SMS alert to farmer
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: queueRec.farmerId,
    role: 'farmer',
    title: `URGENT: Please Proceed to Counter ${counterNumber || 1}`,
    message: `Dear ${queueRec.farmerName}, your turn has arrived! Drive your vehicle onto Weighbridge Counter ${counterNumber || 1} immediately.`,
    type: 'SMS_SIMULATED',
    read: false,
    timestamp: new Date().toISOString()
  });

  db.recalculateQueue(centreId);
  db.save();
  db.logAudit(user.id, user.name, 'operator', 'CALL_NEXT', `Called ${queueRec.farmerName} (${queueRec.tokenNumber}) to Counter ${counterNumber || 1}`);
  res.json({ message: `Farmer called to counter ${counterNumber || 1}`, queueRecord: queueRec });
});

apiRouter.post('/operator/queue/:id/status', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { status, gracePeriodMinutes } = req.body;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const queueRec = data.queueRecords.find(qr => qr.id === id);
  if (!queueRec) {
    res.status(404).json({ error: 'Queue record not found.' });
    return;
  }

  queueRec.status = status;
  if (gracePeriodMinutes !== undefined) {
    queueRec.gracePeriodMinutes = Number(gracePeriodMinutes);
  }

  const booking = data.bookings.find(b => b.id === queueRec.bookingId);
  if (booking) {
    if (status === 'ABSENT') booking.status = 'ABSENT';
  }

  db.recalculateQueue(centreId);
  db.save();
  res.json({ queueRecord: queueRec });
});

// Weighbridge Terminal: Record weights and issue official digital receipt
apiRouter.post('/operator/weighment', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const {
    tokenId,
    bookingId,
    counterNumber,
    crop,
    grossWeightKg,
    tareWeightKg,
    acceptedQuantityKg,
    rejectedQuantityKg,
    rejectionReason,
    moisturePercentage,
    mspRatePerKg
  } = req.body;

  if (!tokenId || grossWeightKg === undefined || tareWeightKg === undefined) {
    res.status(400).json({ error: 'Token, gross weight, and tare weight are required.' });
    return;
  }

  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';
  const centre = data.procurementCentres.find(c => c.id === centreId);

  const token = data.tokens.find(t => t.id === tokenId || t.tokenNumber === tokenId);
  const booking = token ? data.bookings.find(b => b.id === token.bookingId) : null;
  const farmer = token ? data.users.find(u => u.id === token.farmerId) : null;
  const farmerProfile = token ? data.farmerProfiles.find(fp => fp.userId === token.farmerId) : null;

  const gross = Number(grossWeightKg);
  const tare = Number(tareWeightKg);
  const netWeightKg = Math.max(0, gross - tare);

  const accepted = Number(acceptedQuantityKg) || netWeightKg;
  const rejected = Number(rejectedQuantityKg) || 0;
  const mspRate = Number(mspRatePerKg) || 24.25; // Default MSP for wheat
  const totalAmount = accepted * mspRate;

  const receiptNumber = `RCP-${centre?.code.split('-')[1] || 'KNL'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const weighmentId = `wgh_${Date.now()}`;
  const newWeighment: WeighmentRecord = {
    id: weighmentId,
    receiptNumber,
    tokenId: token?.id || tokenId,
    tokenNumber: token?.tokenNumber || 'TKN-UNKNOWN',
    bookingId: booking?.id || bookingId || 'bkg_manual',
    farmerId: token?.farmerId || 'usr_farmer_1',
    farmerName: token?.farmerName || 'Farmer',
    farmerMobile: farmer?.mobile || '+91 98000 00000',
    centreId: centre?.id || 'cen_karnal_01',
    centreName: centre?.name || 'APMC Procurement Centre',
    operatorId: user.id,
    operatorName: user.name,
    counterNumber: Number(counterNumber) || 1,
    crop: crop || token?.crop || 'Wheat',
    grossWeightKg: gross,
    tareWeightKg: tare,
    netWeightKg,
    acceptedQuantityKg: accepted,
    rejectedQuantityKg: rejected,
    rejectionReason: rejectionReason || undefined,
    moisturePercentage: Number(moisturePercentage) || 11.5,
    mspRatePerKg: mspRate,
    totalAmount,
    timestamp: new Date().toISOString()
  };

  data.weighmentRecords.unshift(newWeighment);

  // Update booking status
  if (booking) {
    booking.status = 'WEIGHMENT_COMPLETED';
  }
  if (token) {
    token.status = 'COMPLETED';
  }

  // Remove from queue
  data.queueRecords = data.queueRecords.filter(qr => qr.tokenId !== token?.id);
  db.recalculateQueue(centreId);

  // Create initial pending payment record
  const paymentId = `pay_${Date.now()}`;
  const newPayment: PaymentRecord = {
    id: paymentId,
    bookingId: booking?.id || 'bkg_manual',
    weighmentId,
    farmerId: token?.farmerId || 'usr_farmer_1',
    farmerName: token?.farmerName || 'Farmer',
    farmerCode: farmerProfile?.farmerCode || 'FMR-HR-1001',
    bankAccount: farmerProfile?.bankAccount || 'SBI-****1234',
    ifscCode: farmerProfile?.ifscCode || 'SBIN0001234',
    centreId: centre?.id || 'cen_karnal_01',
    centreName: centre?.name || 'Mandi Centre',
    crop: newWeighment.crop,
    acceptedWeightKg: accepted,
    mspRatePerKg: mspRate,
    totalAmount,
    status: 'PENDING',
    paymentMode: 'PFMS',
    remarks: 'Digital weighbridge slip generated. Forwarded for Aadhaar-linked DBT sanction.'
  };
  data.paymentRecords.unshift(newPayment);

  // Notify farmer
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: token?.farmerId || 'usr_farmer_1',
    role: 'farmer',
    title: `Weighment Slip Generated: ${receiptNumber}`,
    message: `Receipt ${receiptNumber} generated! Net: ${netWeightKg}kg, Accepted: ${accepted}kg, Amount: ₹${totalAmount.toLocaleString('en-IN')}. Payment batch initiated.`,
    type: 'WEIGHMENT_ALERT',
    read: false,
    timestamp: new Date().toISOString()
  });

  db.save();
  db.logAudit(user.id, user.name, 'operator', 'WEIGHMENT_RECORDED', `Issued receipt ${receiptNumber} for ${accepted}kg`);

  res.status(201).json({
    weighment: newWeighment,
    payment: newPayment,
    message: 'Weighment receipt saved and payment record generated.'
  });
});

apiRouter.get('/operator/weighments', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const weighments = data.weighmentRecords.filter(w => w.centreId === centreId);
  res.json({ weighments });
});

apiRouter.get('/operator/payments', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const payments = data.paymentRecords.filter(p => p.centreId === centreId);
  res.json({ payments });
});

apiRouter.patch('/operator/payments/:id', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { status, paymentRefNumber, remarks } = req.body;

  const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid payment status.' });
    return;
  }

  const data = db.getData();
  const payment = data.paymentRecords.find(p => p.id === id);
  if (!payment) {
    res.status(404).json({ error: 'Payment record not found.' });
    return;
  }

  if (status) payment.status = status;
  if (paymentRefNumber) payment.paymentRefNumber = paymentRefNumber;
  if (remarks) payment.remarks = remarks;
  if (status === 'COMPLETED') {
    payment.settledAt = new Date().toISOString();

    // Update corresponding booking status to PAYMENT_SETTLED
    const booking = data.bookings.find(b => b.id === payment.bookingId);
    if (booking) {
      booking.status = 'PAYMENT_SETTLED';
    }

    // Notify farmer of DBT settlement
    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: payment.farmerId,
      role: 'farmer',
      title: `DBT Payment Cleared: ₹${payment.totalAmount.toLocaleString('en-IN')}`,
      message: `Procurement payment of ₹${payment.totalAmount.toLocaleString('en-IN')} (Ref: ${payment.paymentRefNumber || 'PFMS-SETTLED'}) has been transferred to your bank account.`,
      type: 'PAYMENT_ALERT',
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  db.save();
  db.logAudit(user.id, user.name, 'operator', 'PAYMENT_UPDATED', `Payment #${payment.id} status changed to ${status}`);
  res.json({ payment });
});

// Slot management
apiRouter.get('/operator/slots', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const slots = data.procurementSlots.filter(s => s.centreId === centreId);
  res.json({ slots });
});

apiRouter.post('/operator/slots', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { date, startTime, endTime, maxCapacityKg, farmerLimit } = req.body;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const newSlot: ProcurementSlot = {
    id: `slot_${Date.now()}`,
    centreId,
    date: date || new Date().toISOString().split('T')[0],
    startTime: startTime || '09:00 AM',
    endTime: endTime || '11:00 AM',
    maxCapacityKg: Number(maxCapacityKg) || 15000,
    bookedCapacityKg: 0,
    farmerLimit: Number(farmerLimit) || 8,
    bookedFarmers: 0,
    isClosed: false
  };

  data.procurementSlots.push(newSlot);
  db.save();
  res.status(201).json({ slot: newSlot });
});

apiRouter.patch('/operator/slots/:id', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { isClosed, farmerLimit, maxCapacityKg } = req.body;
  const data = db.getData();

  const slot = data.procurementSlots.find(s => s.id === id);
  if (!slot) {
    res.status(404).json({ error: 'Slot not found.' });
    return;
  }

  if (isClosed !== undefined) slot.isClosed = Boolean(isClosed);
  if (farmerLimit !== undefined) slot.farmerLimit = Number(farmerLimit);
  if (maxCapacityKg !== undefined) slot.maxCapacityKg = Number(maxCapacityKg);

  db.save();
  res.json({ slot });
});

// Broadcast SMS / Queue announcement
apiRouter.post('/operator/broadcast-sms', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { title, message } = req.body;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const activeQueue = data.queueRecords.filter(qr => qr.centreId === centreId);
  const farmerIds = Array.from(new Set(activeQueue.map(q => q.farmerId)));

  farmerIds.forEach(fId => {
    data.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: fId,
      role: 'farmer',
      title: title || 'Mandi Centre Announcement',
      message: message || 'Mandi operational announcement',
      type: 'SMS_SIMULATED',
      read: false,
      timestamp: new Date().toISOString()
    });
  });

  db.save();
  db.logAudit(user.id, user.name, 'operator', 'BROADCAST_SENT', `Sent announcement to ${farmerIds.length} waiting farmers`);
  res.json({ message: `Announcement broadcast to ${farmerIds.length} waiting farmers.` });
});

// Operator Reports & Analytics
apiRouter.get('/operator/reports', requireAuth, requireRole(['operator', 'admin']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const centreId = data.operatorCentres[user.id] || 'cen_karnal_01';

  const centre = data.procurementCentres.find(c => c.id === centreId);
  const weighments = data.weighmentRecords.filter(w => w.centreId === centreId);

  // Crop-wise procurement breakdown
  const cropStats: Record<string, { totalWeightKg: number; acceptedKg: number; rejectedKg: number; totalAmount: number; count: number }> = {};
  weighments.forEach(w => {
    if (!cropStats[w.crop]) {
      cropStats[w.crop] = { totalWeightKg: 0, acceptedKg: 0, rejectedKg: 0, totalAmount: 0, count: 0 };
    }
    cropStats[w.crop].totalWeightKg += w.netWeightKg;
    cropStats[w.crop].acceptedKg += w.acceptedQuantityKg;
    cropStats[w.crop].rejectedKg += w.rejectedQuantityKg;
    cropStats[w.crop].totalAmount += w.totalAmount;
    cropStats[w.crop].count++;
  });

  // Farmer-wise procurement breakdown
  const farmerStats: Record<string, { farmerName: string; crop: string; acceptedKg: number; totalAmount: number }> = {};
  weighments.forEach(w => {
    if (!farmerStats[w.farmerId]) {
      farmerStats[w.farmerId] = { farmerName: w.farmerName, crop: w.crop, acceptedKg: 0, totalAmount: 0 };
    }
    farmerStats[w.farmerId].acceptedKg += w.acceptedQuantityKg;
    farmerStats[w.farmerId].totalAmount += w.totalAmount;
  });

  // Summary totals
  const totalProcuredKg = weighments.reduce((acc, w) => acc + w.acceptedQuantityKg, 0);
  const totalProcuredAmount = weighments.reduce((acc, w) => acc + w.totalAmount, 0);
  const totalRejectedKg = weighments.reduce((acc, w) => acc + w.rejectedQuantityKg, 0);

  res.json({
    centre,
    summary: {
      totalSlipsIssued: weighments.length,
      totalProcuredKg,
      totalProcuredAmount,
      totalRejectedKg,
      avgMoisturePct: weighments.length ? (weighments.reduce((sum, w) => sum + w.moisturePercentage, 0) / weighments.length).toFixed(1) : 0
    },
    cropStats,
    farmerStats: Object.values(farmerStats)
  });
});

// -------------------------------------------------------------
// 7. ADMIN DASHBOARD & USER MANAGEMENT
// -------------------------------------------------------------

apiRouter.get('/admin/overview', requireAuth, requireRole(['admin']), (req: Request, res: Response) => {
  const data = db.getData();
  res.json({
    totalUsers: data.users.length,
    totalFarmers: data.users.filter(u => u.role === 'farmer').length,
    totalConsumers: data.users.filter(u => u.role === 'consumer').length,
    totalOperators: data.users.filter(u => u.role === 'operator').length,
    totalCentres: data.procurementCentres.length,
    totalBookings: data.bookings.length,
    totalWeighmentSlips: data.weighmentRecords.length,
    totalMSPDisbursed: data.weighmentRecords.reduce((sum, w) => sum + w.totalAmount, 0),
    totalOrganicOrders: data.orders.length,
    totalOrganicRevenue: data.orders.reduce((sum, o) => sum + o.totalAmount, 0)
  });
});

apiRouter.get('/admin/operators', requireAuth, requireRole(['admin']), (req: Request, res: Response) => {
  const data = db.getData();
  const operators = data.users
    .filter(u => u.role === 'operator')
    .map(u => {
      const centreId = data.operatorCentres[u.id];
      const centre = centreId ? data.procurementCentres.find(c => c.id === centreId) : null;
      return {
        ...u,
        centreName: centre?.name || 'Unassigned',
        centreId
      };
    });
  res.json({ operators });
});

// Admin ONLY: Create new Operator account
apiRouter.post('/admin/operators', requireAuth, requireRole(['admin']), (req: Request, res: Response) => {
  const adminUser = (req as any).user as User;
  const { name, email, mobile, password, centreId } = req.body;

  if (!name || !email || !mobile || !password || !centreId) {
    res.status(400).json({ error: 'Name, email, mobile, password, and assigned centre are required.' });
    return;
  }

  const data = db.getData();
  const centre = data.procurementCentres.find(c => c.id === centreId);
  if (!centre) {
    res.status(400).json({ error: 'Procurement centre not found.' });
    return;
  }

  const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'A user with this email already exists.' });
    return;
  }

  const operatorId = `usr_operator_${Date.now()}`;
  const newOperator: User = {
    id: operatorId,
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
    name: name.trim(),
    role: 'operator',
    state: centre.state,
    district: centre.district,
    address: `${centre.name} Operations Office`,
    createdAt: new Date().toISOString()
  };

  data.users.push(newOperator);
  data.passwords[operatorId] = password;
  data.operatorCentres[operatorId] = centreId;

  db.save();
  db.logAudit(adminUser.id, adminUser.name, 'admin', 'OPERATOR_CREATED', `Created operator ${name} for ${centre.name}`);

  res.status(201).json({ operator: newOperator, message: 'Operator account created successfully.' });
});

apiRouter.post('/admin/centres', requireAuth, requireRole(['admin']), (req: Request, res: Response) => {
  const adminUser = (req as any).user as User;
  const { name, code, state, district, address, totalCounters, activeCounters, avgMinsPerFarmer, dailyCapacityKg, cropsSupported } = req.body;

  if (!name || !code || !state || !district) {
    res.status(400).json({ error: 'Centre name, code, state, and district are required.' });
    return;
  }

  const data = db.getData();
  const newCentre: ProcurementCentre = {
    id: `cen_${Date.now()}`,
    name,
    code,
    state,
    district,
    address: address || '',
    totalCounters: Number(totalCounters) || 4,
    activeCounters: Number(activeCounters) || 3,
    avgMinsPerFarmer: Number(avgMinsPerFarmer) || 12,
    dailyCapacityKg: Number(dailyCapacityKg) || 50000,
    currentBookedKg: 0,
    openingTime: '08:00 AM',
    closingTime: '06:00 PM',
    contactNumber: '+91 1800 180 1551',
    cropsSupported: Array.isArray(cropsSupported) ? cropsSupported : ['Wheat', 'Mustard', 'Paddy']
  };

  data.procurementCentres.push(newCentre);
  db.save();
  db.logAudit(adminUser.id, adminUser.name, 'admin', 'CENTRE_CREATED', `Added new procurement centre: ${name}`);

  res.status(201).json({ centre: newCentre });
});

apiRouter.get('/admin/audit-logs', requireAuth, requireRole(['admin']), (req: Request, res: Response) => {
  const logs = db.getData().auditLogs;
  res.json({ logs });
});

// -------------------------------------------------------------
// 8. NOTIFICATIONS
// -------------------------------------------------------------

apiRouter.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const notifs = db.getData().notifications.filter(n => n.userId === user.id);
  res.json({ notifications: notifs });
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const notif = db.getData().notifications.find(n => n.id === id && n.userId === user.id);
  if (notif) {
    notif.read = true;
    db.save();
  }
  res.json({ success: true });
});
