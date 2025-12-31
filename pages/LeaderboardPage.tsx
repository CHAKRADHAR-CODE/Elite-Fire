
import React, { useState, useEffect } from 'react';
import { stateService } from '../services/stateService';
import { User } from '../types';
import { Trophy, Target, Flame, Zap } from 'lucide-react';

const LeaderboardPage: React.FC<{ user: User }> = ({ user: currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await stateService.getUsers();
        setUsers(data.sort((a, b) => b.balance - a.balance));
      } catch (err) {
        console.error("Ranking Signal Lost", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Trophy className="text-[#ffea00] animate-bounce" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">CALCULATING ELITE DOMINANCE...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-[#ffea00]/20 rounded-2xl text-[#ffea00]">
          <Trophy size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-gaming font-black text-white uppercase tracking-tighter">Global Ranking</h1>
          <p className="text-gray-400">The most elite warriors in the ecosystem.</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {users.slice(0, 3).map((u, i) => (
          <div key={u.id} className={`p-8 rounded-3xl border-2 flex flex-col items-center relative overflow-hidden ${
            i === 0 ? 'bg-yellow-500/5 border-yellow-500/30' : 
            i === 1 ? 'bg-gray-400/5 border-gray-400/30' : 'bg-amber-600/5 border-amber-600/30'
          }`}>
             <div className={`absolute top-0 right-0 p-4 opacity-10`}>
                <Flame size={80} />
             </div>
             
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-xl ${
                i === 0 ? 'bg-yellow-500 text-black shadow-yellow-500/30' : 
                i === 1 ? 'bg-gray-400 text-black shadow-gray-400/30' : 'bg-amber-600 text-black shadow-amber-600/30'
             }`}>
                {i + 1}
             </div>
             <h4 className="text-xl font-gaming font-black text-white mb-1 uppercase truncate w-full text-center">{u.username}</h4>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">ELITE WARRIOR</p>
             <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-black">Net Assets</p>
                <p className="text-2xl font-gaming font-bold text-white">₹{u.balance.toFixed(2)}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Full List */}
      <div className="bg-[#151518] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="font-gaming font-bold text-white uppercase tracking-widest text-sm">Operative Rankings</h3>
            <Target size={18} className="text-gray-500" />
        </div>
        <div className="divide-y divide-white/5">
            {users.map((u, i) => (
                <div key={u.id} className={`flex items-center gap-4 p-5 hover:bg-white/5 transition-all ${u.id === currentUser.id ? 'bg-[#ff4d00]/10' : ''}`}>
                    <div className="w-8 text-center text-xs font-black text-gray-500">#{i + 1}</div>
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white">
                        {u.username[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white uppercase truncate">{u.username}</p>
                            {u.id === currentUser.id && <span className="text-[8px] bg-[#ff4d00] text-white px-1 rounded font-black">YOU</span>}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold">{u.totalMatchesPaid} BATTLES FOUGHT</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-gaming font-bold ${u.balance >= 0 ? 'text-[#00e676]' : 'text-red-500'}`}>₹{u.balance.toFixed(2)}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
