
import React, { useState, useEffect } from 'react';
import { stateService } from '../services/stateService';
import { User } from '../types';
import { Download, FileSpreadsheet, User as UserIcon, Zap } from 'lucide-react';

const DebtorsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await stateService.getUsers();
        setUsers(data);
      } catch (e) {
        console.error("Finance Data Signal Lost", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  
  const handleExport = () => {
    const headers = ['Username', 'Email', 'Matches Paid', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => `${u.username},${u.email},${u.totalMatchesPaid},${u.balance.toFixed(2)}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `debtors_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Zap className="text-[#ffea00] animate-pulse" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">AUDITING GRID CREDITS...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-gaming font-black text-white uppercase tracking-tighter">Finance Hub</h1>
          <p className="text-gray-400">Export debtor reports for squad commanders.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#00e676] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#00c853] transition-all shadow-lg shadow-[#00e676]/20"
        >
          <Download size={20} />
          EXPORT CSV
        </button>
      </div>

      <div className="bg-[#151518] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-[#ffea00]" size={20} />
            <h3 className="font-gaming text-sm font-bold text-white uppercase tracking-widest">Active Operatives List</h3>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-gray-400">{users.length} TOTAL</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/40 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Operative</th>
                <th className="px-6 py-4">Comlink</th>
                <th className="px-6 py-4">Battles Clear</th>
                <th className="px-6 py-4 text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <UserIcon size={14} className="text-[#ff4d00]" />
                      </div>
                      <span className="text-sm font-bold text-white">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-bold">{u.totalMatchesPaid}</td>
                  <td className={`px-6 py-4 text-right text-sm font-gaming font-bold ${u.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{u.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtorsPage;
