
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import { stateService } from './services/stateService';
import { 
  Trophy, 
  Wallet, 
  History, 
  Users, 
  Bell, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  UserCog,
  FileText,
  AlertTriangle,
  Menu,
  X,
  Lock,
  Flame,
  Target,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TeamBuilder from './pages/TeamBuilder';
import MatchResults from './pages/MatchResults';
import WalletPage from './pages/WalletPage';
import UserManagement from './pages/UserManagement';
import DebtorsPage from './pages/DebtorsPage';
import NotificationPage from './pages/NotificationPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MatchHistory from './pages/MatchHistory';

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-widest border border-transparent ${
        isActive 
        ? 'bg-[#ff4d00] text-white shadow-[0_0_20px_rgba(255,77,0,0.5)] border-[#ff4d00]/30' 
        : 'text-gray-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`${isActive ? 'text-white' : 'text-gray-500'}`}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

const TacticalToast: React.FC<{ message: string, onClose: () => void }> = ({ message, onClose }) => (
  <motion.div 
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 300, opacity: 0 }}
    className="fixed bottom-10 right-10 z-[200] bg-black/80 backdrop-blur-2xl border-l-4 border-[#ff4d00] p-6 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm"
  >
    <div className="bg-[#ff4d00]/20 p-2 rounded-lg text-[#ff4d00]">
      <Zap size={20} className="animate-pulse" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-[#ff4d00] uppercase tracking-[0.2em] mb-1">Incoming Signal</p>
      <p className="text-xs text-white font-bold leading-snug">{message}</p>
    </div>
    <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const AppContent: React.FC<{ currentUser: User, setCurrentUser: (u: User | null) => void }> = ({ currentUser, setCurrentUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [lastNotifCount, setLastNotifCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await stateService.getNotifications(currentUser.id);
        const newCount = notifications.length;
        setUnreadCount(notifications.filter(n => !n.isRead).length);
        
        // Show toast for new notifications if not initial load
        if (lastNotifCount > 0 && newCount > lastNotifCount) {
          setActiveToast(notifications[0].message);
          setTimeout(() => setActiveToast(null), 5000);
        }
        setLastNotifCount(newCount);
      } catch (e) {
        console.error("Signal Sync Failure", e);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser.id, lastNotifCount]);

  const handleLogout = () => {
    localStorage.removeItem('efb_current_user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gaming-gradient">
      <AnimatePresence>
        {activeToast && <TacticalToast message={activeToast} onClose={() => setActiveToast(null)} />}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-black/90 backdrop-blur-xl sticky top-0 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Flame className="text-[#ff4d00]" size={24} />
          <h1 className="font-gaming font-black text-lg text-white italic">ELITE FIRE</h1>
        </div>
        <Link to="/notifications" className="relative p-2 text-gray-400">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#ff4d00] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 glass-panel transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-10">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ff4d00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                <Flame className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-gaming font-black text-xl leading-none text-white tracking-tighter italic">ELITE FIRE</h1>
                <span className="text-[8px] tracking-[0.4em] text-[#ff4d00] font-black uppercase">SIGNAL v5.2</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2.5 overflow-y-auto pr-2 custom-scrollbar">
            <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="GRID HUB" onClick={() => setIsSidebarOpen(false)} />
            
            {(currentUser.role === UserRole.ADMIN || currentUser.canCreateMatch) && (
              <SidebarLink to="/team-builder" icon={<PlusCircle size={18} />} label="SQUAD BUILDER" onClick={() => setIsSidebarOpen(false)} />
            )}
            
            <SidebarLink to="/match-results" icon={<Target size={18} />} label="BATTLE RESULTS" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/match-history" icon={<History size={18} />} label="COMBAT LOGS" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/leaderboard" icon={<Trophy size={18} />} label="RANKINGS" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/wallet" icon={<Wallet size={18} />} label="GRID WALLET" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/notifications" icon={
              <div className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff4d00] w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,77,0,1)]"></span>
                )}
              </div>
            } label="NOTIFICATIONS" onClick={() => setIsSidebarOpen(false)} />

            {currentUser.role === UserRole.ADMIN && (
              <>
                <div className="pt-10 pb-4">
                  <span className="px-6 text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">High Command</span>
                </div>
                <SidebarLink to="/admin/users" icon={<UserCog size={18} />} label="OPERATIVE TERMINAL" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/admin/debtors" icon={<FileText size={18} />} label="CREDIT AUDIT" onClick={() => setIsSidebarOpen(false)} />
              </>
            )}
          </nav>

          <div className="mt-auto pt-10 border-t border-white/5">
            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl mb-6 border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center font-black text-xl text-[#ff4d00] shadow-inner">
                {currentUser.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate uppercase font-gaming">{currentUser.username}</p>
                <p className="text-[9px] text-gray-500 font-black tracking-widest uppercase">{currentUser.role === UserRole.ADMIN ? 'COMMANDER' : 'OPERATIVE'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20"
            >
              <LogOut size={18} />
              <span>LOGOUT SESSION</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
        {/* Top Header Desktop */}
        <div className="hidden md:flex items-center justify-between mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-4xl font-gaming font-black text-white italic tracking-tighter">BATTLEFIELD STATUS: <span className="text-[#ff4d00] animate-pulse">ACTIVE</span></h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-3">GRID SYNCHRONIZED • WELCOME BACK {currentUser.username.toUpperCase()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass-panel px-10 py-5 rounded-3xl border border-white/10 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff4d00]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Wallet className="text-[#ff4d00]" size={28} />
              <div>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">GRID CREDITS</p>
                <p className={`text-2xl font-gaming font-black ${currentUser.balance >= 0 ? 'text-white' : 'text-red-500'}`}>
                  ₹{currentUser.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard user={currentUser} />} />
          <Route path="/team-builder" element={(currentUser.role === UserRole.ADMIN || currentUser.canCreateMatch) ? <TeamBuilder /> : <Navigate to="/" />} />
          <Route path="/match-results" element={<MatchResults user={currentUser} />} />
          <Route path="/match-history" element={<MatchHistory user={currentUser} />} />
          <Route path="/leaderboard" element={<LeaderboardPage user={currentUser} />} />
          <Route path="/wallet" element={<WalletPage user={currentUser} />} />
          <Route path="/notifications" element={<NotificationPage user={currentUser} />} />
          <Route path="/admin/users" element={currentUser.role === UserRole.ADMIN ? <UserManagement /> : <Navigate to="/" />} />
          <Route path="/admin/debtors" element={currentUser.role === UserRole.ADMIN ? <DebtorsPage /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      const savedUser = localStorage.getItem('efb_current_user');
      if (savedUser) {
        try {
          const stored = JSON.parse(savedUser);
          const u = await stateService.getUserById(stored.id);
          if (u) {
            if (u.isBlocked) {
              alert('ACCESS DENIED: Signal Termination - Account blocked by Command.');
              localStorage.removeItem('efb_current_user');
              setCurrentUser(null);
            } else {
              setCurrentUser(u);
            }
          }
        } catch (e) {
          console.error("Initial Sync Failure", e);
        }
      }
      setInitializing(false);
    };
    syncUser();
  }, []);

  if (initializing) {
    return (
      <div className="h-screen bg-[#030508] flex flex-col items-center justify-center gap-6">
        <Zap className="text-[#ff4d00] animate-pulse" size={48} />
        <p className="font-gaming text-xs tracking-widest text-[#ff4d00]">SYNCHRONIZING WITH GRID COMMAND...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      {!currentUser ? (
        <LoginPage onLogin={setCurrentUser} />
      ) : (
        <AppContent currentUser={currentUser} setCurrentUser={setCurrentUser} />
      )}
    </HashRouter>
  );
};

export default App;
