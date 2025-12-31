
import React, { useMemo, useState, useEffect } from 'react';
import { User, UserRole, Match, Transaction } from '../types';
import { stateService } from '../services/stateService';
import { Trophy, Activity, Wallet, BarChart3, Target, Users, Zap, Flame, Shield, Swords } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string, trend?: string, index: number }> = ({ icon, label, value, color, trend, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }} 
    className="bg-[#0b0e14]/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5 text-[${color}]`} style={{ color }}>
      {icon}
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
    <p className="text-3xl font-gaming font-black text-white">{value}</p>
    {trend && (
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-3 py-1 rounded-full w-fit">
        <Zap size={10} /> {trend}
      </div>
    )}
  </motion.div>
);

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, u, t] = await Promise.all([
          stateService.getMatches(),
          stateService.getUsers(),
          isAdmin ? stateService.getAllTransactions() : stateService.getTransactions(user.id)
        ]);
        setMatches(m);
        setAllUsers(u);
        setTransactions(t);
      } catch (err) {
        console.error("Signal Sync Failure", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id, isAdmin]);

  const performanceData = useMemo(() => {
    if (isAdmin) {
      return allUsers.map(u => ({
        name: u.username,
        balance: u.balance
      })).sort((a,b) => b.balance - a.balance).slice(0, 15);
    } else {
      let current = user.balance;
      const data = transactions.slice(0, 10).reverse().map(t => {
        const point = { time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), balance: current };
        current -= t.amount;
        return point;
      });
      return data.length > 0 ? data : [{ time: 'NOW', balance: user.balance }];
    }
  }, [user.balance, transactions, isAdmin, allUsers]);

  const leaderBoard = useMemo(() => {
    return [...allUsers].sort((a, b) => b.balance - a.balance).slice(0, 5);
  }, [allUsers]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Zap className="text-[#ff4d00] animate-pulse" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">SYNCING GRID DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div>
          <h2 className="text-5xl font-gaming font-black uppercase text-white tracking-tighter italic">Operational Hub</h2>
          <p className="text-[#ff4d00] text-[10px] font-black uppercase tracking-[0.6em] mt-3 opacity-60">Strategic Overview & Combat Stats</p>
        </div>
        <div className="flex items-center gap-5">
          {(isAdmin || user.canCreateMatch) && (
            <Link to="/team-builder" className="bg-[#ff4d00] hover:bg-[#e64600] text-white px-10 py-5 rounded-2xl font-gaming font-black text-[10px] uppercase shadow-2xl shadow-[#ff4d00]/30 flex items-center gap-3 transition-all active:scale-95 group">
              <Swords size={18} className="group-hover:rotate-12 transition-transform" /> INITIALIZE MATCH
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard index={0} icon={<Shield size={28} />} label="GRID ENGAGEMENTS" value={matches.length} color="#ff4d00" trend="+14% FREQ" />
        <StatCard index={1} icon={<Activity size={28} />} label="ACTIVE SIGNAL" value={matches.filter(m => m.status === 'UNDECIDED').length} color="#00f2ea" trend="LIVE" />
        <StatCard index={2} icon={<Users size={28} />} label="OPERATIVE COUNT" value={allUsers.length} color="#ffea00" trend="+2 NEW" />
        <StatCard index={3} icon={<Wallet size={28} />} label="WALLET STATUS" value={`₹${user.balance.toFixed(2)}`} color="#ff4df0" trend="SYNCED" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 glass-panel p-12 rounded-[48px] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-[100px]"></div>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#00f2ea]/10 flex items-center justify-center text-[#00f2ea]">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-gaming font-black text-white uppercase tracking-widest text-sm italic">
              {isAdmin ? "GRID WIDE PERFORMANCE" : "SIGNAL FLUX MATRIX"}
            </h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {isAdmin ? (
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#444" fontSize={10} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#0b0e14', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                  <Bar dataKey="balance" fill="#ff4d00" radius={[10, 10, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="flux" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d00" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ff4d00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0e14', border: '1px solid #ffffff10', borderRadius: '20px' }} itemStyle={{ color: '#ff4d00' }} />
                  <Area type="monotone" dataKey="balance" stroke="#ff4d00" fillOpacity={1} fill="url(#flux)" strokeWidth={4} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-12 rounded-[48px]"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#ffea00]/10 flex items-center justify-center text-[#ffea00]">
              <Trophy size={20} />
            </div>
            <h3 className="font-gaming font-black text-white uppercase tracking-widest text-sm italic">ELITE RANKING</h3>
          </div>
          <div className="space-y-6">
            {leaderBoard.map((u, i) => (
              <motion.div 
                whileHover={{ x: 10 }}
                key={u.id} 
                className={`flex items-center gap-5 p-6 rounded-[24px] border transition-all ${u.id === user.id ? 'bg-[#ff4d00]/10 border-[#ff4d00]/30' : 'bg-white/5 border-transparent hover:border-white/10'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
                  i === 0 ? 'bg-[#ffea00] text-black shadow-[0_0_20px_rgba(255,234,0,0.5)]' : 
                  i === 1 ? 'bg-[#e5e7eb] text-black' : 
                  i === 2 ? 'bg-[#cd7f32] text-black' : 'bg-white/10 text-white'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{u.username}</p>
                  <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">RANK {i + 1} OPERATIVE</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-gaming font-black ${u.balance >= 0 ? 'text-[#ff4d00]' : 'text-red-500'}`}>₹{Math.abs(u.balance).toFixed(0)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-panel p-12 rounded-[48px]"
      >
         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Flame size={20} className="text-[#ff4d00]" />
               </div>
               <h3 className="font-gaming font-black text-white uppercase tracking-widest text-sm italic">RECENT ENGAGEMENTS</h3>
            </div>
            <Link to="/match-results" className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-[#ff4d00] transition-colors border-b border-white/5 pb-1">VIEW ALL LOGS</Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.slice(0, 4).sort((a,b) => b.createdAt - a.createdAt).map(m => (
              <div key={m.id} className="p-8 rounded-[32px] bg-white/5 flex items-center justify-between group hover:bg-white/10 transition-all border border-white/5">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center text-[#ff4d00] border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                      <Swords size={24} />
                   </div>
                   <div>
                      <p className="text-base font-bold text-white uppercase tracking-tight mb-1">{m.name}</p>
                      <div className="flex items-center gap-3">
                         <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">DEPLOYED: {new Date(m.createdAt).toLocaleDateString()}</p>
                         <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                         <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{m.teamA.length + m.teamB.length} UNITS</p>
                      </div>
                   </div>
                </div>
                <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${
                   m.status === 'SETTLED' ? 'bg-[#ff4d00]/10 text-[#ff4d00] border border-[#ff4d00]/20' : 'bg-[#ffea00]/10 text-[#ffea00] border border-[#ffea00]/20'
                }`}>
                   {m.status === 'SETTLED' ? `SQD ${m.winningTeam} WIN` : 'COMBAT LIVE'}
                </div>
              </div>
            ))}
            {matches.length === 0 && <div className="col-span-2 text-center py-20 opacity-10 font-gaming uppercase text-xs tracking-[1em]">NO LOGS DETECTED</div>}
         </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
