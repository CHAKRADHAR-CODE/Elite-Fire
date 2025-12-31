
export enum UserRole {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  pin: string;
  role: UserRole;
  balance: number;
  isBlocked: boolean;
  isDeleted: boolean; // Soft-delete support
  canCreateMatch: boolean;
  totalMatchesPaid: number;
  createdAt: number;
}

export interface MatchPlayer {
  userId: string;
  username: string;
  betAmount: number;
  paid: boolean;
}

export interface Match {
  id: string;
  name: string;
  teamA: MatchPlayer[];
  teamB: MatchPlayer[];
  winningTeam: 'A' | 'B' | null;
  status: 'UNDECIDED' | 'SETTLED';
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'WIN' | 'LOSS' | 'DEPOSIT' | 'WITHDRAWAL' | 'REVERSAL' | 'PAYMENT_CLEAR' | 'ADMIN_ADJUST';
  description: string;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

export interface WalletPoint {
  time: string;
  balance: number;
}
