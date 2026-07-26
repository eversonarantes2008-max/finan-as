import { User, AccountItem, STANDARD_ACCOUNT_NAMES } from '../types';

const STORAGE_KEYS = {
  USERS: 'pwa_contas_users_v1',
  CURRENT_USER: 'pwa_contas_session_v1',
  USER_DATA_PREFIX: 'pwa_contas_data_', // + userId
};

export const MASTER_CREDENTIALS = {
  email: 'everson.arantes.2008@gmail.com',
  password: 'Prideday13@',
};

/**
 * Initializes localStorage with Master user and requested default users if missing.
 */
export function initializeStorage(): void {
  const users = getUsers();
  let updated = false;

  const masterExists = users.some(
    (u) => u.email.toLowerCase() === MASTER_CREDENTIALS.email.toLowerCase()
  );

  if (!masterExists) {
    const masterUser: User = {
      id: 'master-001',
      email: MASTER_CREDENTIALS.email,
      passwordHash: MASTER_CREDENTIALS.password,
      status: 'approved',
      role: 'master',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    };
    users.push(masterUser);
    updated = true;
  }

  // Pre-approved user requested by administrator
  const requestedEmail = 'jhonatas332@gmail.com';
  const jhonatasExists = users.some(
    (u) => u.email.toLowerCase() === requestedEmail.toLowerCase()
  );

  if (!jhonatasExists) {
    const jhonatasUser: User = {
      id: 'usr-jhonatas-332',
      email: requestedEmail,
      passwordHash: 'Mariageilda@1',
      status: 'approved',
      role: 'user',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    };
    users.push(jhonatasUser);
    updated = true;
  } else {
    // Ensure password and approved status are updated if existing
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === requestedEmail.toLowerCase());
    if (existingIndex !== -1 && (users[existingIndex].status !== 'approved' || users[existingIndex].passwordHash !== 'Mariageilda@1')) {
      users[existingIndex].status = 'approved';
      users[existingIndex].passwordHash = 'Mariageilda@1';
      users[existingIndex].approvedAt = users[existingIndex].approvedAt || new Date().toISOString();
      updated = true;
    }
  }

  if (updated) {
    saveUsers(users);
  }
}

export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
}

export function getCurrentUserSession(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

export function setCurrentUserSession(user: User | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

/**
 * Creates default accounts list for a new month or fresh store.
 */
export function createDefaultAccountsList(): AccountItem[] {
  return STANDARD_ACCOUNT_NAMES.map((name, idx) => ({
    id: `default-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    amount: 0,
    isPaid: false,
    isDefault: true,
    dueDay: idx < 7 ? 5 : 20, // Day 5 for services/utilities, Day 20 for housing/cars
    createdAt: new Date().toISOString(),
  }));
}

/**
 * Gets user's account items for a given monthKey (Format "YYYY-MM").
 * If the monthKey does not exist yet, initializes with default 13 accounts!
 */
export function getUserAccountsForMonth(userId: string, monthKey: string): AccountItem[] {
  try {
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`;
    const rawData = localStorage.getItem(key);
    const store: Record<string, AccountItem[]> = rawData ? JSON.parse(rawData) : {};

    if (!store[monthKey] || store[monthKey].length === 0) {
      // Check if there is a previous month to copy custom account structure from (with amounts reset to 0 & unpaid)
      const existingMonths = Object.keys(store).sort();
      let template: AccountItem[] = createDefaultAccountsList();

      if (existingMonths.length > 0) {
        const lastMonth = existingMonths[existingMonths.length - 1];
        const lastMonthAccounts = store[lastMonth] || [];
        
        // Retain default + custom account structure, but reset payment state
        template = lastMonthAccounts.map((item, idx) => ({
          ...item,
          id: `${item.isDefault ? 'def' : 'cust'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          isPaid: false,
          dueDay: item.dueDay || (idx < 7 ? 5 : 20),
        }));
      }

      store[monthKey] = template;
      localStorage.setItem(key, JSON.stringify(store));
    }

    // Ensure all returned items have a valid dueDay (migration for existing data)
    const list = store[monthKey].map((item, idx) => ({
      ...item,
      dueDay: item.dueDay || (idx < 7 ? 5 : 20),
    }));

    return list;
  } catch (err) {
    console.error('Error fetching user accounts for month:', err);
    return createDefaultAccountsList();
  }
}

/**
 * Saves user's account items for a specific monthKey.
 */
export function saveUserAccountsForMonth(
  userId: string,
  monthKey: string,
  accounts: AccountItem[]
): void {
  try {
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`;
    const rawData = localStorage.getItem(key);
    const store: Record<string, AccountItem[]> = rawData ? JSON.parse(rawData) : {};

    store[monthKey] = accounts;
    localStorage.setItem(key, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving user accounts for month:', err);
  }
}

/**
 * Resets all payments for a month (sets isPaid to false).
 */
export function resetPaidStatusForMonth(userId: string, monthKey: string): AccountItem[] {
  const current = getUserAccountsForMonth(userId, monthKey);
  const resetList = current.map((item) => ({ ...item, isPaid: false }));
  saveUserAccountsForMonth(userId, monthKey, resetList);
  return resetList;
}

/**
 * Gets formatted month list (e.g., ["2026-07", "2026-08", "2026-06"])
 */
export function getAvailableMonthsForUser(userId: string): string[] {
  try {
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`;
    const rawData = localStorage.getItem(key);
    const store: Record<string, AccountItem[]> = rawData ? JSON.parse(rawData) : {};
    const months = Object.keys(store);

    const currentMonthKey = getCurrentMonthKey();
    if (!months.includes(currentMonthKey)) {
      months.push(currentMonthKey);
    }
    return months.sort().reverse();
  } catch (err) {
    return [getCurrentMonthKey()];
  }
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthName(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const monthName = date.toLocaleString('pt-BR', { month: 'long' });
  const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalized} de ${year}`;
}
