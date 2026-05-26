import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'mock_db.json');

// Helper to initialize or read the mock database file
const readDB = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      const initialData = { users: [], invoices: [], subscriptions: [] };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data || '{"users":[],"invoices":[],"subscriptions":[]}');
  } catch (err) {
    console.error('Error reading mock DB file:', err);
    return { users: [], invoices: [], subscriptions: [] };
  }
};

// Helper to write to the mock database file
const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to mock DB file:', err);
  }
};

const dbFallback = {
  // --- USERS ---
  findUserByEmail: (email) => {
    const db = readDB();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  
  findUserById: (id) => {
    const db = readDB();
    return db.users.find((u) => u._id === id);
  },
  
  createUser: (userData) => {
    const db = readDB();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const isMatchedAdmin = userData.email && userData.email.toLowerCase() === adminEmail;

    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...userData,
      themePreference: userData.themePreference || 'system',
      defaultCurrency: userData.defaultCurrency || 'USD',
      plan: userData.plan || 'free',
      isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
      verificationToken: userData.verificationToken || null,
      role: userData.role || (isMatchedAdmin ? 'admin' : 'user'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  },

  updateUser: (id, updateData) => {
    const db = readDB();
    const index = db.users.findIndex((u) => u._id === id);
    if (index !== -1) {
      db.users[index] = {
        ...db.users[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      writeDB(db);
      return db.users[index];
    }
    return null;
  },

  // --- INVOICES ---
  findInvoicesByUser: (userId) => {
    const db = readDB();
    return db.invoices
      .filter((inv) => inv.user === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  findInvoiceById: (id) => {
    const db = readDB();
    return db.invoices.find((inv) => inv._id === id);
  },

  createInvoice: (invoiceData, userId) => {
    const db = readDB();
    
    // Auto-calculate subtotal & total
    let calculatedSubtotal = 0;
    const lineItems = (invoiceData.lineItems || []).map((item) => {
      const amount = (item.quantity || 1) * (item.rate || 0);
      calculatedSubtotal += amount;
      return { ...item, amount };
    });

    if (lineItems.length === 0) {
      calculatedSubtotal = invoiceData.projectPrice || 0;
    }

    // Generate Invoice Number
    const userInvoicesCount = db.invoices.filter((inv) => inv.user === userId).length;
    const nextNum = String(userInvoicesCount + 1).padStart(5, '0');
    const invoiceNumber = `INV-${nextNum}`;

    const newInvoice = {
      _id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...invoiceData,
      user: userId,
      invoiceNumber,
      lineItems,
      subtotal: calculatedSubtotal,
      totalAmount: calculatedSubtotal,
      status: invoiceData.status || 'draft',
      issueDate: invoiceData.issueDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.invoices.unshift(newInvoice);
    writeDB(db);
    return newInvoice;
  },

  updateInvoice: (id, updateData) => {
    const db = readDB();
    const index = db.invoices.findIndex((inv) => inv._id === id);
    if (index !== -1) {
      const currentInvoice = db.invoices[index];
      
      // Update values
      const mergedInvoice = {
        ...currentInvoice,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Recalculate if lineItems are updated
      if (updateData.lineItems) {
        let calculatedSubtotal = 0;
        mergedInvoice.lineItems = updateData.lineItems.map((item) => {
          const amount = (item.quantity || 1) * (item.rate || 0);
          calculatedSubtotal += amount;
          return { ...item, amount };
        });
        mergedInvoice.subtotal = calculatedSubtotal;
        mergedInvoice.totalAmount = calculatedSubtotal;
      }

      db.invoices[index] = mergedInvoice;
      writeDB(db);
      return mergedInvoice;
    }
    return null;
  },

  deleteInvoice: (id) => {
    const db = readDB();
    const filtered = db.invoices.filter((inv) => inv._id !== id);
    db.invoices = filtered;
    writeDB(db);
    return true;
  },

  // --- SUBSCRIPTIONS ---
  findSubscriptionByUser: (userId) => {
    const db = readDB();
    return db.subscriptions.find((sub) => sub.user === userId);
  },

  updateSubscription: (userId, subData) => {
    const db = readDB();
    const index = db.subscriptions.findIndex((sub) => sub.user === userId);
    
    if (index !== -1) {
      db.subscriptions[index] = {
        ...db.subscriptions[index],
        ...subData,
        updatedAt: new Date().toISOString(),
      };
      writeDB(db);
      return db.subscriptions[index];
    } else {
      const newSub = {
        _id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user: userId,
        stripeSubscriptionId: `sub_mock_${Math.random().toString(36).substring(2, 10)}`,
        status: 'active',
        plan: 'free',
        cancelAtPeriodEnd: false,
        ...subData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.subscriptions.push(newSub);
      writeDB(db);
      return newSub;
    }
  },
  
  findUserByToken: (token) => {
    const db = readDB();
    return db.users.find((u) => u.verificationToken === token);
  },

  verifyUser: (id) => {
    const db = readDB();
    const index = db.users.findIndex((u) => u._id === id);
    if (index !== -1) {
      db.users[index].isVerified = true;
      db.users[index].verificationToken = null;
      writeDB(db);
      return db.users[index];
    }
    return null;
  },

  deleteUser: (id) => {
    const db = readDB();
    const index = db.users.findIndex((u) => u._id === id);
    if (index !== -1) {
      db.users.splice(index, 1);
      // Clean up user's invoices & subscriptions
      db.invoices = db.invoices.filter((inv) => inv.user !== id);
      const subIndex = db.subscriptions.findIndex((sub) => sub.user === id);
      if (subIndex !== -1) {
        db.subscriptions.splice(subIndex, 1);
      }
      writeDB(db);
      return true;
    }
    return false;
  },

  getAllUsers: () => {
    const db = readDB();
    return db.users.map(({ password, ...u }) => u);
  },
};

export default dbFallback;
