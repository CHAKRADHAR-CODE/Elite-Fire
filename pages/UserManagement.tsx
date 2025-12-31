
import React, { useState, useEffect } from 'react';
import { stateService } from '../services/stateService';
import { User, UserRole } from '../types';
import { Trash2, Ban, Unlock, Key, ShieldCheck, UserPlus, Search, Eye, EyeOff, Mail, Zap, Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState<{ userId: string, username: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({ username: '', email: '', pin: '', role: UserRole.PLAYER });
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const savedUser = localStorage.getItem('efb_current_user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  const refreshUsers = async () => {
    try {
      const data = await stateService.getUsers(true);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const toggleBlock = async (id: string, blocked: boolean) => {
    try {
      await stateService.updateUser(id, { isBlocked: !blocked });
      await refreshUsers();
    } catch (e) {
      alert("Terminal Sync Failure.");
    }
  };

  const handleAdjustBalance = async (type: 'ADD' | 'SUB') => {
    if (!showWalletModal) return;
    const finalAmount = type === 'ADD' ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);
    try {
      await stateService.adminAdjustBalance(currentUser.id, showWalletModal.userId, finalAmount, adjustReason || 'Command Adjustment');
      setShowWalletModal(null);
      setAdjustAmount(0);
      setAdjustReason('');
      await refreshUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('CRITICAL PROTOCOL: Purge unit from grid? This action is permanent.')) {
      try {
        await stateService.deleteUser(id);
        await refreshUsers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const togglePermission = async (id: string, current: boolean) => {
    try {
      await stateService.updateUser(id, { canCreateMatch: !current });
      await refreshUsers();
    } catch (e) {
      alert("Permission Sync Failure.");
    }
  };

  const resetPin = async (id: string) => {
    const pin = prompt('SECURITY OVERRIDE: Enter new 6-digit PIN:');
    if (pin && /^\d{6}$/.test(pin) && currentUser) {
      try {
        await stateService.resetPassword(currentUser.id, id, pin);
        await refreshUsers();
        alert('SIGNAL RECONFIGURED.');
      } catch (e) {
        alert("PIN Override Failed.");
      }
    } else if (pin) {
      alert('INVALID PIN FORMAT.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toUpperCase().includes(searchTerm.toUpperCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center gap-4">
        <Zap className="text-[#00f2ea] animate-pulse" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">SCANNING OPERATIVE GRID...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-gaming font-black text-white uppercase tracking-tighter italic">Operative Terminal</h1>
          <p className="text-[#00f2ea] text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-60">High Command Grid Controls</p>
        </div>
        <div className="flex items-center gap-5">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,242,234,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)} 
            className="flex items-center gap-3 bg-[#00f2ea] text-black px-8 py-4 rounded-2xl font-gaming font-black text-xs hover:bg-[#00d4cc] transition-all shadow-lg shadow-[#00f2ea]/20 uppercase tracking-widest"
          >
            <UserPlus size={18} /> Deploy Recruit
          </motion.button>
        </div>
      </div>

      <div className="relative group max-w-xl">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00f2ea] transition-colors">
          <Search size={22} />
        </div>
        <input 
          type="text" 
          placeholder="SCAN UNIT SIGNATURE..."
          className="w-full bg-[#0b0e14] border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-xs text-white focus:outline-none focus:border-[#00f2ea] transition-all font-gaming uppercase tracking-widest placeholder:opacity-20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map(u => (
            <motion.div 
              layout 
              key={u.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-8 rounded-[40px] bg-[#0b0e14]/60 backdrop-blur-xl border transition-all ${u.isDeleted ? 'opacity-20 grayscale' : 'border-white/10 hover:border-white/20 shadow-2xl'} ${u.isBlocked ? 'border-red-500/30' : ''}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-3xl ${u.isBlocked ? 'bg-red-500/10 text-red-500' : 'bg-[#00f2ea]/10 text-[#00f2ea]'}`}>
                    {u.username[0]}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-5">
                      <h4 className="text-2xl font-bold text-white uppercase tracking-tight font-tech">{u.username}</h4>
                      {u.role === UserRole.ADMIN && <span className="text-[9px] bg-[#00f2ea]/20 text-[#00f2ea] px-3 py-1 rounded-full border border-[#00f2ea]/40 font-black uppercase tracking-widest">COMMANDER</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Mail size={14} className="text-[#00f2ea]" /> {u.email}</span>
                      <button onClick={() => setShowPins({...showPins, [u.id]: !showPins[u.id]})} className="hover:text-[#00f2ea] transition-all flex items-center gap-2">
                        {showPins[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        PIN: {showPins[u.id] ? u.pin : '......'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div 
                    onClick={() => !u.isDeleted && setShowWalletModal({ userId: u.id, username: u.username })}
                    className="bg-black/60 p-5 rounded-3xl border border-white/5 text-right min-w-[160px] cursor-pointer hover:border-[#00f2ea]/50 transition-all group"
                  >
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1 flex items-center justify-end gap-2">
                      SIGNAL STRENGTH <Wallet size={10} className="group-hover:text-[#00f2ea]" />
                    </p>
                    <p className={`text-2xl font-gaming font-black ${u.balance >= 0 ? 'text-[#00f2ea]' : 'text-red-400'}`}>₹{u.balance.toFixed(2)}</p>
                  </div>

                  {!u.isDeleted && (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => togglePermission(u.id, u.canCreateMatch)}
                        className={`p-5 rounded-3xl transition-all border ${u.canCreateMatch ? 'bg-[#00f2ea]/20 text-[#00f2ea] border-[#00f2ea]/40' : 'bg-white/5 text-gray-500 border-white/10'}`}
                        title="Grant Squad Leader Permissions"
                      >
                        <ShieldCheck size={24} />
                      </button>
                      <button 
                        onClick={() => resetPin(u.id)} 
                        className="p-5 rounded-3xl bg-white/5 text-gray-500 hover:text-[#00f2ea] border border-white/10 transition-all"
                        title="Reset Security PIN"
                      >
                        <Key size={24} />
                      </button>
                      <button 
                        onClick={() => toggleBlock(u.id, u.isBlocked)} 
                        className={`p-5 rounded-3xl transition-all ${u.isBlocked ? 'bg-[#00f2ea] text-black shadow-lg shadow-[#00f2ea]/40' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}
                      >
                        {u.isBlocked ? <Unlock size={24} /> : <Ban size={24} />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-5 rounded-3xl bg-white/5 text-gray-700 hover:text-red-600 border border-white/10 transition-colors">
                        <Trash2 size={24} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Credit/Debit Matrix Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-[#0b0e14] border-2 border-[#00f2ea]/20 rounded-[60px] p-12 w-full max-w-lg shadow-[0_0_120px_rgba(0,242,234,0.15)]"
            >
              <h2 className="text-3xl font-gaming font-black text-white mb-10 uppercase tracking-tighter italic flex items-center gap-4">
                <Wallet className="text-[#00f2ea]" /> Wallet Matrix: {showWalletModal.username}
              </h2>
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 focus-within:border-[#00f2ea] transition-all">
                  <p className="text-[10px] text-gray-600 font-black uppercase mb-2 tracking-widest">Amount (₹)</p>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-transparent text-white text-3xl font-gaming focus:outline-none" 
                    value={adjustAmount} 
                    onChange={(e) => setAdjustAmount(Number(e.target.value))} 
                  />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 focus-within:border-[#00f2ea] transition-all">
                  <p className="text-[10px] text-gray-600 font-black uppercase mb-2 tracking-widest">Protocol Reason</p>
                  <input 
                    type="text" 
                    placeholder="REWARD / PENALTY..." 
                    className="w-full bg-transparent text-white text-sm font-tech focus:outline-none uppercase tracking-widest" 
                    value={adjustReason} 
                    onChange={(e) => setAdjustReason(e.target.value)} 
                  />
                </div>
                <div className="flex gap-6 pt-6">
                  <button 
                    onClick={() => handleAdjustBalance('SUB')}
                    className="flex-1 py-5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-3xl font-gaming font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <ArrowDown size={18} /> DEBIT
                  </button>
                  <button 
                    onClick={() => handleAdjustBalance('ADD')}
                    className="flex-1 py-5 bg-[#00f2ea]/10 text-[#00f2ea] border border-[#00f2ea]/20 rounded-3xl font-gaming font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#00f2ea] hover:text-black transition-all"
                  >
                    <ArrowUp size={18} /> CREDIT
                  </button>
                </div>
                <button 
                  onClick={() => setShowWalletModal(null)}
                  className="w-full py-4 text-gray-500 font-black text-[10px] uppercase tracking-widest"
                >
                  ABORT OVERRIDE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deploy Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0b0e14] border-2 border-[#00f2ea]/20 rounded-[60px] p-12 w-full max-w-lg">
              <h2 className="text-3xl font-gaming font-black text-white mb-10 uppercase tracking-tighter italic">Unit Deployment</h2>
              <form onSubmit={async (e) => { 
                  e.preventDefault(); 
                  try { 
                    await stateService.addUser(newUser); 
                    setShowAddModal(false); 
                    await refreshUsers(); 
                  } catch(err:any){ alert(err.message); } 
                }} className="space-y-6">
                <input type="text" placeholder="CODENAME" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white uppercase focus:border-[#00f2ea] outline-none" onChange={(e) => setNewUser({...newUser, username: e.target.value.toUpperCase()})} required />
                <input type="email" placeholder="EMAIL" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white lowercase focus:border-[#00f2ea] outline-none" onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
                <input type="password" placeholder="PIN" maxLength={6} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white tracking-[0.5em] focus:border-[#00f2ea] outline-none" onChange={(e) => setNewUser({...newUser, pin: e.target.value})} required />
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-gray-500 font-black">ABORT</button>
                  <button type="submit" className="flex-1 py-4 bg-[#00f2ea] text-black font-gaming font-black rounded-3xl">DEPLOY</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
