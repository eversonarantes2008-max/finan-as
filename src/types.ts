export type UserRole = 'master' | 'user';
export type UserStatus = 'pending' | 'approved' | 'denied';

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Plaintext or hashed for simulation
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  approvedAt?: string;
}

export interface AccountItem {
  id: string;
  name: string;
  amount: number; // In BRL (e.g. 150.50)
  isPaid: boolean;
  isDefault: boolean; // True for the 13 standard accounts
  dueDay: 5 | 20; // Due day: 5 or 20
  createdAt: string;
  dueDate?: string;
  category?: string;
}

export interface MonthlyAccountsData {
  monthYear: string; // Format: "YYYY-MM" (e.g. "2026-07")
  accounts: AccountItem[];
}

export interface UserAccountStore {
  userId: string;
  months: Record<string, AccountItem[]>; // monthKey -> accounts list
}

export const STANDARD_ACCOUNT_NAMES = [
  'Água',
  'Luz',
  'Telefone 1',
  'Telefone 2',
  'Telefone 3',
  'Telefone 4',
  'Internet',
  'Carro 1',
  'Carro 2',
  'Seguro Carro 1',
  'Seguro Carro 2',
  'Apartamento',
  'Evolução de Obras'
] as const;
