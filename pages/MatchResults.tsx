
import React, { useState, useMemo, useEffect } from 'react';
import { stateService } from '../services/stateService';
import { Match, User, UserRole } from '../types';
import { Trophy, ChevronDown, ChevronUp, CheckCircle2, DollarSign, Clock, Target, AlertTriangle, Zap, Activity, Flame, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MatchResults: React.FC<{ user: User }> = ({ user }) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNDECIDED' | 'PENDING'>('ALL');
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [fetching, setFetching] = useState(true);

  const loadMatches = async () => {
    try {
      const data = await stateService.getMatches();
      setAllMatches(data);
    } catch (e) {
      console.error("Signal Archive Failure", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);
  
  const filteredMatches = useMemo(() => {
    switch (filter) {
      case 'UNDECIDED': return allMatches.filter(m => m.status === 'UNDECIDED');
      case 'PENDING': return allMatches.filter(m => {
          if (m.status === 'UNDECIDED') return false;
          const losers = m.winningTeam === 'A' ? m.teamB : m.teamA;
          return losers.some(p => !p.paid);
      });
      default: return allMatches;
    }
  }, [allMatches, filter]);

  const handleSettle = async (matchId: string, winner: 'A' | 'B') => {
    if (!confirm(`CONFIRM SQUAD ${winner} VICTORY? This protocol will automatically adjust credit flows across all active signals.`)) return;
    setLoading(matchId);
    try {
      await stateService.settleMatch(matchId, winner);
      await loadMatches();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleMarkPaid = async (matchId: string, userId: string) => {
    try {
      await stateService.markLoserAsPaid(matchId, userId);
      await loadMatches();
    } catch (err) {
      console.error(err);
    }
  };

  const renderMatchCard = (m: Match, idx: number) => {
    const isSettled = m.status === 'SETTLED';
    const isExpanded = selectedMatch === m.id;
    const losers = isSettled ? (m.winningTeam === 'A' ? m.teamB : m.teamA) : [];
    const hasUnpaid = losers.some(p => !p.paid);
    const totalStake = [...m.teamA, ...m.teamB].reduce((acc, p) => acc + p.betAmount, 0);

    return (
      <motion.div 
        key={m.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`bg-[#0b0e14]/60 backdrop-blur-xl rounded-[40px] border transition-all ${isExpanded ? 'border-[#00f2ea]/30 ring-1 ring-[#00f2ea]/10' : 'border-white/5 hover:border-white/20'}`}
      >
        <div 
          className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer group" 
          onClick={() => setSelectedMatch(isExpanded ? null : m.id)}
        >
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${isSettled ? 'bg-[#00f2ea]/10 text-[#00f2ea] shadow-[0_0_40px_rgba(0,242,234,0.1)]' : 'bg-[#ffea00]/10 text-[#ffea00] border border-[#ffea00]/20'}`}>
              {isSettled ? <Trophy size={40} className="group-hover:scale-110 transition-transform" /> : <Clock size={40} className="animate-spin-slow" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-gaming font-black text-white uppercase text-xl tracking-tighter italic">{m.name}</h4>
                {hasUnpaid && <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded font-black animate-pulse">DEBT PENDING</span>}
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <div className="text-right">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Combat Volume</p>
              <p className="text-2xl font-gaming font-black text-white">₹{totalStake.toLocaleString()}</p>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Status</p>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isSettled ? 'bg-[#00f2ea]/10 text-[#00f2ea]' : 'bg-[#ffea00]/10 text-[#ffea00]'}`}>
                  {isSettled ? 'ARCHIVED' : 'LIVE GRID'}
                </div>
              </div>
              {isExpanded ? <ChevronUp size={24} className="text-gray-500" /> : <ChevronDown size={24} className="text-gray-500" />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden border-t border-white/5"
            >
              <div className="p-10 space-y-12">
                {/* Tactical Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-[#ffea00]/10 flex items-center justify-center text-[#ffea00]">
                         <Activity size={20} />
                      </div>
                      <div>
                         <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Operative Count</p>
                         <p className="text-lg font-gaming font-black text-white">{m.teamA.length + m.teamB.length} UNITS</p>
                      </div>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-[#00f2ea]/10 flex items-center justify-center text-[#00f2ea]">
                         <DollarSign size={20} />
                      </div>
                      <div>
                         <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Avg Stake/Unit</p>
                         <p className="text-lg font-gaming font-black text-white">₹{(totalStake / (m.teamA.length + m.teamB.length || 1)).toFixed(0)}</p>
                      </div>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center text-[#ff4d00]">
                         <Flame size={20} />
                      </div>
                      <div>
                         <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Victory Pool</p>
                         <p className="text-lg font-gaming font-black text-white">₹{totalStake}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Team A Display */}
                  <div className={`relative p-8 rounded-[40px] border-2 transition-all ${m.winningTeam === 'A' ? 'border-[#00f2ea]/40 bg-[#00f2ea]/5 shadow-[0_0_60px_rgba(0,242,234,0.1)]' : 'border-white/5 bg-white/5'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <Swords size={24} className={m.winningTeam === 'A' ? 'text-[#00f2ea]' : 'text-gray-600'} />
                        <h5 className="font-gaming text-sm font-black text-white uppercase tracking-[0.2em]">Squad Alpha</h5>
                      </div>
                      {m.winningTeam === 'A' && <span className="bg-[#00f2ea] text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic">VICTORS</span>}
                    </div>
                    <div className="space-y-4">
                      {m.teamA.map(p => (
                        <div key={p.userId} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-[#00f2ea]/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 group-hover:text-[#00f2ea]">{p.username[0]}</div>
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{p.username}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] font-gaming font-black text-gray-600 group-hover:text-white transition-colors">₹{p.betAmount}</span>
                            {isSettled && m.winningTeam === 'B' && (
                               p.paid ? <CheckCircle2 size={18} className="text-[#00f2ea]" /> : 
                               <div className="relative group/paid">
                                  <AlertTriangle size={18} className="text-red-500" />
                                  {user.role === UserRole.ADMIN && (
                                    <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(m.id, p.userId); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/paid:opacity-100 bg-[#00f2ea] text-black text-[9px] font-black px-4 py-2 rounded-full whitespace-nowrap transition-all shadow-xl hover:scale-105 z-20">SETTLE DEBT</button>
                                  )}
                               </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isSettled && user.role === UserRole.ADMIN && (
                      <button onClick={() => handleSettle(m.id, 'A')} disabled={!!loading} className="w-full mt-10 py-5 bg-[#00f2ea] text-black font-gaming font-black text-[11px] rounded-[24px] uppercase tracking-widest shadow-lg shadow-[#00f2ea]/20 transition-all hover:scale-[1.02] active:scale-95">
                        {loading === m.id ? 'SYNCHRONIZING...' : 'DECLARE SQUAD ALPHA VICTORS'}
                      </button>
                    )}
                  </div>

                  {/* Team B Display */}
                  <div className={`relative p-8 rounded-[40px] border-2 transition-all ${m.winningTeam === 'B' ? 'border-[#00f2ea]/40 bg-[#00f2ea]/5 shadow-[0_0_60px_rgba(0,242,234,0.1)]' : 'border-white/5 bg-white/5'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <Swords size={24} className={m.winningTeam === 'B' ? 'text-[#00f2ea]' : 'text-gray-600'} />
                        <h5 className="font-gaming text-sm font-black text-white uppercase tracking-[0.2em]">Squad Bravo</h5>
                      </div>
                      {m.winningTeam === 'B' && <span className="bg-[#00f2ea] text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic">VICTORS</span>}
                    </div>
                    <div className="space-y-4">
                      {m.teamB.map(p => (
                        <div key={p.userId} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-[#00f2ea]/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 group-hover:text-[#00f2ea]">{p.username[0]}</div>
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{p.username}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] font-gaming font-black text-gray-600 group-hover:text-white transition-colors">₹{p.betAmount}</span>
                            {isSettled && m.winningTeam === 'A' && (
                               p.paid ? <CheckCircle2 size={18} className="text-[#00f2ea]" /> : 
                               <div className="relative group/paid">
                                  <AlertTriangle size={18} className="text-red-500" />
                                  {user.role === UserRole.ADMIN && (
                                    <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(m.id, p.userId); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/paid:opacity-100 bg-[#00f2ea] text-black text-[9px] font-black px-4 py-2 rounded-full whitespace-nowrap transition-all shadow-xl hover:scale-105 z-20">SETTLE DEBT</button>
                                  )}
                               </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isSettled && user.role === UserRole.ADMIN && (
                      <button onClick={() => handleSettle(m.id, 'B')} disabled={!!loading} className="w-full mt-10 py-5 bg-[#00f2ea] text-black font-gaming font-black text-[11px] rounded-[24px] uppercase tracking-widest shadow-lg shadow-[#00f2ea]/20 transition-all hover:scale-[1.02] active:scale-95">
                        {loading === m.id ? 'SYNCHRONIZING...' : 'DECLARE SQUAD BRAVO VICTORS'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (fetching) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Activity className="text-[#00f2ea] animate-pulse" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">ACCESSING BATTLE ARCHIVES...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
        <div>
           <h1 className="text-5xl font-gaming font-black text-white uppercase tracking-tighter italic">Combat Archive</h1>
           <p className="text-[#00f2ea] text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-60">Result Settlements & Credit Flow Logs</p>
        </div>
        
        <div className="flex bg-[#0b0e14] p-2 rounded-[24px] border border-white/10 self-start shadow-xl">
           <button onClick={() => setFilter('ALL')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${filter === 'ALL' ? 'bg-[#00f2ea] text-black shadow-lg shadow-[#00f2ea]/30' : 'text-gray-500 hover:text-white'}`}>ALL LOGS</button>
           <button onClick={() => setFilter('UNDECIDED')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${filter === 'UNDECIDED' ? 'bg-[#ffea00] text-black shadow-lg shadow-[#ffea00]/30' : 'text-gray-500 hover:text-white'}`}>LIVE</button>
           <button onClick={() => setFilter('PENDING')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${filter === 'PENDING' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-500 hover:text-white'}`}>DEBTS</button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredMatches.length > 0 ? filteredMatches.sort((a,b) => b.createdAt - a.createdAt).map(renderMatchCard) : (
          <div className="py-40 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 opacity-10">
                <Target size={48} />
             </div>
             <p className="font-gaming uppercase text-xs tracking-[1em] text-white opacity-20 italic">No combat signals matched the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchResults;
