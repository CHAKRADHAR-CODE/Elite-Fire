
import React, { useMemo, useState, useEffect } from 'react';
import { User, Transaction, Match } from '../types';
import { stateService } from '../services/stateService';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Calendar, 
  History as HistoryIcon, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const WalletPage: React.FC<{ user: User }> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, m] = await Promise.all([
          stateService.getTransactions(user.id),
          stateService.getMatches()
        ]);
        setTransactions(t);
        setMatches(m);
      } catch (e) {
        console.error("Vault Access Error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const analytics = useMemo(() => {
    const wins = transactions.filter(t => t.type === 'WIN').length;
    const losses = transactions.filter(t => t.type === 'LOSS').length;
    const totalWinAmount = transactions.filter(t => t.type === 'WIN').reduce((acc, t) => acc + t.amount, 0);
    const totalLossAmount = Math.abs(transactions.filter(t => t.type === 'LOSS').reduce((acc, t) => acc + t.amount, 0));

    return { wins, losses, totalWinAmount, totalLossAmount };
  }, [transactions]);

  const walletHistory = useMemo(() => {
    let current = user.balance;
    const history = transactions.slice(0, 20).reverse().map(t => {
      const pt = { time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), balance: current };
      current -= t.amount;
      return pt;
    });
    return history.length > 0 ? history : [{ time: 'NOW', balance: user.balance }];
  }, [user.balance, transactions]);

  const pieData = [
    { name: 'Wins', value: analytics.wins || 1 },
    { name: 'Losses', value: analytics.losses || 0.1 },
  ];

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Wallet className="text-[#00f2ea] animate-pulse" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">OPENING CREDIT VAULT...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div>
          <h1 className="text-5xl font-gaming font-black text-white uppercase tracking-tighter italic">Grid Wallet</h1>
          <p className="text-[#00f2ea] text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-60">Financial Signal Receptacle</p>
        </div>
        <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <ShieldCheck className="text-[#00f2ea]" size={20} />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Command Encryption Active</span>
        </div>
      </motion.div>

      {/* Main Balance Display */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b0e14]/60 backdrop-blur-2xl p-12 rounded-[60px] border border-white/5 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
          <Wallet size={300} />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f2ea]/40 to-transparent"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Total Liquid Signal Strength</p>
            <div className="flex items-baseline gap-4">
              <span className="text-7xl font-gaming font-black text-white tracking-tighter">₹{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.balance >= 0 ? 'bg-[#00f2ea]/10 text-[#00f2ea] border-[#00f2ea]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                {user.balance >= 0 ? 'SECURE' : 'CRITICAL'}
              </div>
            </div>
            <div className="mt-8 flex items-center gap-10">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Active Battles</p>
                <p className="text-xl font-gaming font-black text-white">{matches.length}</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Clearance Level</p>
                <p className="text-xl font-gaming font-black text-[#ff4d00]">{user.role}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/40 p-8 rounded-[40px] border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-inner">
             <div className="h-[180px] w-[180px] shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                      <Cell fill="#00f2ea" />
                      <Cell fill="#ef4444" />
                   </Pie>
                   <Tooltip contentStyle={{ backgroundColor: '#0b0e14', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00f2ea]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={16} className="text-[#00f2ea]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Wins</span>
                  </div>
                  <span className="text-base font-gaming font-black text-[#00f2ea]">₹{analytics.totalWinAmount.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-red-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <TrendingDown size={16} className="text-red-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Loss</span>
                  </div>
                  <span className="text-base font-gaming font-black text-red-500">₹{analytics.totalLossAmount.toFixed(0)}</span>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Performance Visualization */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-panel p-10 rounded-[48px] border border-white/5"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00f2ea]/10 flex items-center justify-center text-[#00f2ea]">
                <Activity size={20} />
              </div>
              <h3 className="font-gaming font-black text-white uppercase tracking-widest text-sm italic">Signal Performance Analysis</h3>
            </div>
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Last 20 Log Points</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={walletHistory}>
                <defs>
                  <linearGradient id="walletFlux" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ea" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f2ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" stroke="#444" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis stroke="#444" fontSize={9} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0e14', border: '1px solid #ffffff10', borderRadius: '20px', padding: '15px' }}
                  itemStyle={{ color: '#00f2ea', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#00f2ea" fillOpacity={1} fill="url(#walletFlux)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Info & Protocol Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-[48px] border border-white/5 space-y-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Lock className="text-[#ff4d00]" size={20} />
            <h3 className="font-gaming font-black text-white uppercase tracking-widest text-sm italic">Protocol Info</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={18} className="text-[#00f2ea]" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Admin Control Policy</p>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                As per Security Protocol 7-A, only High Command (Admin) can authorize credit additions or signal withdrawals. Users cannot perform manual deposits.
              </p>
            </div>

            <div className="p-6 bg-[#ff4d00]/5 rounded-3xl border border-[#ff4d00]/10">
              <div className="flex items-center gap-3 mb-4 text-[#ff4d00]">
                <Zap size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest">Efficiency Rating</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-gaming font-black text-white">
                  {transactions.length > 0 ? Math.round((analytics.wins / (transactions.length || 1)) * 100) : 0}%
                </span>
                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Win/Engagement Ratio</span>
              </div>
            </div>

            <div className="bg-black/60 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Avg Stake</p>
                  <p className="text-xl font-gaming font-black text-white">₹{transactions.length > 0 ? (transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0) / transactions.length).toFixed(0) : 0}</p>
               </div>
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                  <Target size={24} />
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scannable Transaction History */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[60px] border border-white/5 overflow-hidden shadow-2xl"
      >
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <HistoryIcon className="text-[#00f2ea]" size={24} />
             </div>
             <div>
                <h3 className="font-gaming font-black text-white uppercase tracking-widest text-base italic">Master Ledger Logs</h3>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Chronological Signal Flow</p>
             </div>
          </div>
          
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00f2ea] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="SCAN LEDGER..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:border-[#00f2ea] transition-all font-gaming uppercase tracking-widest placeholder:opacity-30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredTransactions.map(t => (
            <motion.div 
              layout
              key={t.id} 
              className="p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all group cursor-default border-l-4 border-transparent hover:border-[#00f2ea]"
            >
               <div className="flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all group-hover:rotate-12 ${t.amount >= 0 ? 'bg-[#00f2ea]/10 text-[#00f2ea]' : 'bg-red-400/10 text-red-400'}`}>
                     {t.amount >= 0 ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                  </div>
                  <div className="space-y-1">
                     <p className="text-base font-bold text-white uppercase tracking-tight group-hover:text-[#00f2ea] transition-colors">{t.description}</p>
                     <div className="flex items-center gap-4 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(t.timestamp).toLocaleString()}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-800"></span>
                        <span className={`px-2.5 py-0.5 rounded-full border ${t.amount >= 0 ? 'bg-[#00f2ea]/5 text-[#00f2ea] border-[#00f2ea]/20' : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>{t.type}</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className={`text-2xl font-gaming font-black ${t.amount >= 0 ? 'text-[#00f2ea]' : 'text-red-400'}`}>
                        {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                    </p>
                    <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">TX_ID: {t.id.slice(0, 12)}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
               </div>
            </motion.div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-32 text-center text-gray-800 flex flex-col items-center">
               <Info size={64} className="mb-6 opacity-10" />
               <p className="font-gaming uppercase text-sm tracking-[0.8em]">LEDGER SCAN COMPLETE: NO DATA FOUND</p>
            </div>
          )}
        </div>
        
        <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> SYSTEM SYNCHRONIZED
           </div>
           <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">ELITE FIRE LEDGER v5.2.0</p>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletPage;
