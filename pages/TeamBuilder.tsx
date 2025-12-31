
import React, { useState, useEffect } from 'react';
import { stateService } from '../services/stateService';
import { User, MatchPlayer } from '../types';
import { Shield, Zap, Plus, X, Swords, Target, Cpu, UserPlus, Info, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeamBuilder: React.FC = () => {
  const [matchName, setMatchName] = useState('');
  const [teamA, setTeamA] = useState<MatchPlayer[]>([]);
  const [teamB, setTeamB] = useState<MatchPlayer[]>([]);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const savedUser = localStorage.getItem('efb_current_user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await stateService.getUsers();
        setAvailableUsers(users.filter(u => !u.isBlocked));
      } catch (err) {
        console.error("Manifest Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const addPlayerToTeam = (userId: string, team: 'A' | 'B') => {
    const user = availableUsers.find(u => u.id === userId);
    if (!user) return;

    const newPlayer: MatchPlayer = {
      userId: user.id,
      username: user.username,
      betAmount: betAmount,
      paid: false
    };

    if (team === 'A') {
      if (teamA.find(p => p.userId === userId) || teamB.find(p => p.userId === userId)) return;
      setTeamA([...teamA, newPlayer]);
    } else {
      if (teamA.find(p => p.userId === userId) || teamB.find(p => p.userId === userId)) return;
      setTeamB([...teamB, newPlayer]);
    }
  };

  const removePlayer = (id: string, team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamA(teamA.filter(p => p.userId !== id));
    } else {
      setTeamB(teamB.filter(p => p.userId !== id));
    }
  };

  const handleCreateMatch = async () => {
    if (!currentUser) return;
    if (teamA.length === 0 || teamB.length === 0) {
      alert('SQUAD ALERT: Both teams must have at least one active operative.');
      return;
    }
    
    try {
      await stateService.createMatch(matchName, teamA, teamB, currentUser.id);
      setMatchName('');
      setTeamA([]);
      setTeamB([]);
      alert('MATCH INITIALIZED: Signals deployed across the grid.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center gap-4">
        <Cpu className="text-[#00f2ea] animate-spin-slow" size={32} />
        <p className="font-gaming text-xs text-gray-500 tracking-[0.4em]">LOADING RECRUIT MANIFEST...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div>
          <h1 className="text-5xl font-gaming font-black text-white uppercase tracking-tighter italic">Squad Architect</h1>
          <p className="text-[#ff4d00] text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-60">Initialize Battlefield Engagement</p>
        </div>
        <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/5">
           <Users className="text-[#ff4d00]" size={20} />
           <div>
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Available Units</p>
              <p className="text-xl font-gaming font-black text-white">{availableUsers.length}</p>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          {/* Config Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0b0e14]/60 backdrop-blur-xl p-10 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none rotate-12">
               <Cpu size={200} />
            </div>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-[#00f2ea]/10 flex items-center justify-center text-[#00f2ea]">
                <Cpu size={20} />
              </div>
              <h3 className="font-gaming font-black text-white uppercase tracking-widest text-sm italic">Combat Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 focus-within:border-[#00f2ea]/50 transition-all group">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mb-2 ml-1">Engagement Designation</p>
                <input 
                  type="text"
                  placeholder="AUTO-GENERATING..."
                  className="w-full bg-transparent text-white focus:outline-none font-gaming text-lg uppercase tracking-tight placeholder:opacity-20"
                  value={matchName}
                  onChange={(e) => setMatchName(e.target.value)}
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between group focus-within:border-[#ffea00]/50 transition-all">
                 <div className="flex-1">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mb-2 ml-1">Individual Stakes</p>
                    <div className="flex items-center gap-4">
                       <span className="text-3xl font-gaming font-black text-[#ffea00]">₹</span>
                       <input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                        className="bg-transparent text-4xl font-gaming font-black text-white focus:outline-none w-full tracking-tighter"
                       />
                    </div>
                 </div>
                 <div className="w-16 h-16 rounded-2xl bg-[#ffea00]/5 flex items-center justify-center text-[#ffea00] opacity-40">
                    <Target size={32} />
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Squad Viewports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0b0e14]/60 backdrop-blur-xl p-10 rounded-[48px] border border-white/10 min-h-[450px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#00f2ea]/20">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-[#00f2ea] animate-pulse"></div>
                   <h4 className="font-gaming text-sm font-black text-white uppercase tracking-widest italic">Squad Alpha</h4>
                </div>
                <div className="bg-[#00f2ea]/10 text-[#00f2ea] text-[10px] font-black px-4 py-1.5 rounded-full border border-[#00f2ea]/20 uppercase">{teamA.length} UNITS</div>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                  {teamA.map((p, i) => (
                    <motion.div 
                      key={p.userId} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 hover:border-[#00f2ea]/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center font-black text-[10px] text-gray-500">A{i+1}</div>
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{p.username}</span>
                      </div>
                      <button 
                        onClick={() => removePlayer(p.userId, 'A')} 
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {teamA.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full opacity-10 py-20">
                     <Shield size={64} className="mb-4" />
                     <p className="font-gaming uppercase text-[10px] tracking-[1em] text-center">Awaiting Signals</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0b0e14]/60 backdrop-blur-xl p-10 rounded-[48px] border border-white/10 min-h-[450px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/20">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                   <h4 className="font-gaming text-sm font-black text-white uppercase tracking-widest italic">Squad Bravo</h4>
                </div>
                <div className="bg-white/10 text-gray-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-white/20 uppercase">{teamB.length} UNITS</div>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                  {teamB.map((p, i) => (
                    <motion.div 
                      key={p.userId} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center font-black text-[10px] text-gray-500">B{i+1}</div>
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{p.username}</span>
                      </div>
                      <button 
                        onClick={() => removePlayer(p.userId, 'B')} 
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {teamB.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full opacity-10 py-20">
                     <ShieldAlert size={64} className="mb-4" />
                     <p className="font-gaming uppercase text-[10px] tracking-[1em] text-center">Awaiting Signals</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(0,242,234,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateMatch} 
            className="w-full bg-[#00f2ea] text-black py-8 rounded-[40px] font-gaming font-black text-lg shadow-[0_0_40px_rgba(0,242,234,0.3)] transition-all flex items-center justify-center gap-6 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <Swords size={32} className="group-hover:rotate-12 transition-transform duration-500" /> 
            INITIALIZE COMBAT ENGAGEMENT
            <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform duration-500" />
          </motion.button>
        </div>

        {/* Selection Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }} 
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0b0e14]/60 backdrop-blur-xl p-10 rounded-[48px] border border-white/10 h-fit sticky top-10 flex flex-col shadow-2xl"
        >
           <div className="flex items-center gap-4 mb-8">
              <UserPlus className="text-[#00f2ea]" size={24} />
              <h3 className="font-gaming font-black text-white uppercase tracking-widest text-sm italic">Recruit Manifest</h3>
           </div>
           
           <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar flex-1">
              {availableUsers.map(u => {
                const inA = !!teamA.find(p => p.userId === u.id);
                const inB = !!teamB.find(p => p.userId === u.id);
                const isSelected = inA || inB;

                return (
                  <div key={u.id} className={`p-5 rounded-[2rem] border transition-all flex flex-col gap-4 ${isSelected ? 'bg-white/5 border-transparent opacity-30 grayscale' : 'bg-white/5 border-white/5 hover:border-[#00f2ea]/50 group'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center font-black text-xl text-[#00f2ea] group-hover:scale-110 transition-transform">
                        {u.username[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white uppercase truncate tracking-tight">{u.username}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Grid Ready</p>
                      </div>
                    </div>
                    {!isSelected && (
                      <div className="flex gap-3">
                        <button onClick={() => addPlayerToTeam(u.id, 'A')} className="flex-1 py-3 rounded-2xl bg-[#00f2ea]/10 text-[#00f2ea] border border-[#00f2ea]/20 flex items-center justify-center hover:bg-[#00f2ea] hover:text-black transition-all font-gaming font-black text-xs uppercase italic">A</button>
                        <button onClick={() => addPlayerToTeam(u.id, 'B')} className="flex-1 py-3 rounded-2xl bg-white/5 text-gray-400 border border-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all font-gaming font-black text-xs uppercase italic">B</button>
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
           <div className="mt-10 p-6 bg-[#00f2ea]/5 rounded-3xl border border-[#00f2ea]/10 text-[10px] text-[#00f2ea] font-black uppercase tracking-[0.2em] flex gap-4 italic items-center">
              <Zap size={24} className="shrink-0 animate-pulse" />
              <span>Only authorized signals are available for deployment.</span>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamBuilder;
