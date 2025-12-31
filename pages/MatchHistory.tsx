
import React, { useState, useEffect } from 'react';
import { stateService } from '../services/stateService';
import { Match, User } from '../types';
import { History, LayoutGrid, Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

const MatchHistory: React.FC<{ user: User }> = ({ user }) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING_PAYMENT' | 'UNDECIDED'>('ALL');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await stateService.getMatches();
        setMatches(data);
      } catch (e) {
        console.error("Combat Log Signal Loss", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredMatches = matches.filter(m => {
    if (filter === 'ALL') return true;
    if (filter === 'UNDECIDED') return m.status === 'UNDECIDED';
    if (filter === 'PENDING_PAYMENT') {
        const losers = m.winningTeam === 'A' ? m.teamB : m.teamA;
        return m.status === 'SETTLED' && losers.some(p => !p.paid);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Clock className="text-[#ffea00] animate-spin-slow" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">ACCESSING COMBAT LOGS...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-gaming font-black text-white uppercase tracking-tighter">Archive Terminal</h1>
          <p className="text-gray-400">Review historical data and engagement logs.</p>
        </div>

        <div className="flex p-1 bg-[#151518] rounded-xl border border-white/10 self-start">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${filter === 'ALL' ? 'bg-[#ff4d00] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <LayoutGrid size={14} /> ALL
          </button>
          <button 
            onClick={() => setFilter('PENDING_PAYMENT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${filter === 'PENDING_PAYMENT' ? 'bg-[#ff1744] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <AlertTriangle size={14} /> DEBT PENDING
          </button>
          <button 
            onClick={() => setFilter('UNDECIDED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${filter === 'UNDECIDED' ? 'bg-[#ffea00] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Clock size={14} /> UNDECIDED
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map(m => (
          <div key={m.id} className="p-6 rounded-2xl bg-[#151518] border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
            {m.status === 'SETTLED' && (
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-all">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{m.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(m.createdAt).toLocaleDateString()}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-widest ${
                    m.status === 'SETTLED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="text-center flex-1">
                <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Squad Alpha</p>
                <div className="flex -space-x-2 justify-center">
                    {m.teamA.slice(0, 3).map((p, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-blue-600 border border-black flex items-center justify-center text-[8px] font-bold">{p.username[0]}</div>
                    ))}
                </div>
              </div>
              <div className="w-px h-8 bg-white/5"></div>
              <div className="text-center flex-1">
                <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Squad Bravo</p>
                <div className="flex -space-x-2 justify-center">
                    {m.teamB.slice(0, 3).map((p, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-red-600 border border-black flex items-center justify-center text-[8px] font-bold">{p.username[0]}</div>
                    ))}
                </div>
              </div>
            </div>
            
            {m.winningTeam && (
              <div className="mt-2 text-center py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                 <p className="text-xs font-gaming font-black text-green-500 uppercase">WINNER: SQUAD {m.winningTeam}</p>
              </div>
            )}
          </div>
        ))}

        {filteredMatches.length === 0 && (
          <div className="md:col-span-2 py-20 text-center text-gray-600">
            <History size={64} className="mx-auto mb-4 opacity-10" />
            <p className="font-gaming font-bold uppercase tracking-widest">No match records found for this frequency.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
