
import React, { useEffect, useState } from 'react';
import { User, AppNotification } from '../types';
import { stateService } from '../services/stateService';
import { Bell, Clock, Zap } from 'lucide-react';

const NotificationPage: React.FC<{ user: User }> = ({ user }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await stateService.getNotifications(user.id);
        setNotifications(data);
        // Mark all as read after fetching
        await stateService.markAllNotificationsRead(user.id);
      } catch (e) {
        console.error("Notif Sync Failure", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [user.id]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Bell className="text-[#ff4d00] animate-pulse" size={48} />
        <p className="font-gaming text-xs tracking-widest text-gray-500">FETCHING GRID TRANSMISSIONS...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
          <Bell size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-gaming font-black text-white uppercase tracking-tighter">Transmission Feed</h1>
          <p className="text-gray-400">Stay updated on squad movements and credits.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map(n => (
          <div key={n.id} className={`p-6 rounded-2xl border transition-all ${n.isRead ? 'bg-[#151518] border-white/5 opacity-60' : 'bg-[#151518] border-blue-500/30 shadow-lg shadow-blue-500/5'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-white text-sm font-bold leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500 font-black uppercase">
                  <Clock size={12} />
                  {new Date(n.timestamp).toLocaleString()}
                </div>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50 shrink-0"></div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 text-gray-600">
            <Bell size={64} className="mx-auto mb-4 opacity-10" />
            <p className="font-gaming font-bold uppercase tracking-widest">No transmissions detected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
