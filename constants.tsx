
import { User, UserRole } from './types';

export const ADMIN_USER: User = {
  id: 'admin-001',
  username: 'Admin',
  email: 'admin@gmail.com',
  pin: '444488',
  role: UserRole.ADMIN,
  balance: 0,
  isBlocked: false,
  isDeleted: false,
  canCreateMatch: true,
  totalMatchesPaid: 0,
  createdAt: Date.now()
};

export const INITIAL_USERS: User[] = [
  ADMIN_USER,
  {
    id: 'user-001',
    username: 'PLAYER_ONE',
    email: 'player1@gmail.com',
    pin: '123456',
    role: UserRole.PLAYER,
    balance: 500,
    isBlocked: false,
    isDeleted: false,
    canCreateMatch: false,
    totalMatchesPaid: 10,
    createdAt: Date.now()
  },
  {
    id: 'user-002',
    username: 'STORM_RIDER',
    email: 'storm@gmail.com',
    pin: '111111',
    role: UserRole.PLAYER,
    balance: -200,
    isBlocked: false,
    isDeleted: false,
    canCreateMatch: true,
    totalMatchesPaid: 5,
    createdAt: Date.now()
  }
];

export const COLORS = {
  primary: '#ff4d00', // Blaze Orange
  secondary: '#00d4ff', // Cyan
  background: '#0a0a0c',
  card: '#151518',
  success: '#00e676',
  danger: '#ff1744',
  warning: '#ffea00'
};
