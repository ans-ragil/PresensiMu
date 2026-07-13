import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DashboardSkeleton } from '../components/Skeleton';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const categories = [
  { key: 'Semua', icon: '📋' },
  { key: 'APPROVAL', icon: '✅' },
  { key: 'REMINDER', icon: '⏰' },
  { key: 'PENGUMUMAN', icon: '📢' },
  { key: 'HR', icon: '💼' },
  { key: 'SISTEM', icon: '⚙️' },
];

const categoryLabels: Record<string, string> = {
  APPROVAL: 'Approval', REMINDER: 'Reminder', PENGUMUMAN: 'Pengumuman', HR: 'Informasi HR', SISTEM: 'Sistem',
};

const categoryColors: Record<string, string> = {
  APPROVAL: 'bg-emerald-100 text-emerald-700',
  REMINDER: 'bg-amber-100 text-amber-700',
  PENGUMUMAN: 'bg-blue-100 text-blue-700',
  HR: 'bg-purple-100 text-purple-700',
  SISTEM: 'bg-gray-100 text-gray-700',
};

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const filtered = activeCategory === 'Semua' ? notifications : notifications.filter(n => n.category === activeCategory);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    return `${days}h lalu`;
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifikasi</h1>
          {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} belum dibaca</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <span>{cat.icon}</span> {cat.key === 'Semua' ? 'Semua' : categoryLabels[cat.key]}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          filtered.map(n => (
            <div key={n.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all ${
                !n.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryColors[n.category] || 'bg-gray-100 text-gray-600'}`}>
                  {categories.find(c => c.key === n.category)?.icon || '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                    {n.link && (
                      <Link to={n.link} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Lihat →</Link>
                    )}
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n.id)} className="text-[10px] text-gray-400 hover:text-gray-600 ml-auto">
                        Tandai dibaca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="h-2" />
    </div>
  );
};

export default Notification;
