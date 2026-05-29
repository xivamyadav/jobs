"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Eye, FileText, Briefcase, CheckCircle, Clock, XCircle, UserCheck, Loader2 } from 'lucide-react';
import { api } from '@/apis/user';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/api-error';

interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const getIcon = (type: string, title: string) => {
  const t = title.toLowerCase();
  if (t.includes('shortlisted') && !t.includes('not shortlisted')) {
    return <CheckCircle className="w-5 h-5 text-green-700" />;
  }
  if (t.includes('update') || t.includes('not shortlisted')) {
    return <Briefcase className="w-5 h-5 text-[#8b6508]" />;
  }
  switch (type) {
    case 'PROFILE_VIEW': return <Eye className="w-5 h-5 text-blue-600" />;
    case 'RESUME_DOWNLOAD': return <FileText className="w-5 h-5 text-emerald-600" />;
    case 'SYSTEM': return <Bell className="w-5 h-5 text-amber-600" />;
    default: return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getIconBg = (type: string, title: string) => {
  const t = title.toLowerCase();
  if (t.includes('shortlisted') && !t.includes('not shortlisted')) {
    return 'bg-[#e8f3e8]'; // Light green
  }
  if (t.includes('update') || t.includes('not shortlisted')) {
    return 'bg-[#f4efe6]'; // Light beige
  }
  switch (type) {
    case 'PROFILE_VIEW': return 'bg-blue-50';
    case 'RESUME_DOWNLOAD': return 'bg-emerald-50';
    case 'SYSTEM': return 'bg-amber-50';
    default: return 'bg-gray-100';
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/v1/notifications/');
      const data = res.data?.data?.notifications || res.data?.notifications || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to load notifications.');
      toast({ title: 'Notifications unavailable', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await api.patch(`/api/v1/notifications/${id}/read/`);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to mark notification as read.');
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await api.patch('/api/v1/notifications/read-all/');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to mark notifications as read.');
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
      fetchNotifications();
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header removed from sticky to simple flow */}
      <div className="px-8 py-8 max-w-4xl mx-auto">
        
        {/* Top Controls: Tabs and Mark All */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
                filter === 'all' 
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
                filter === 'unread' 
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-xl">
            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-base font-semibold text-gray-900">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">We&apos;ll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`flex items-start gap-4 p-5 rounded-xl border border-gray-200 transition-all bg-white ${
                  notif.is_read ? 'opacity-70' : 'cursor-pointer hover:shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${getIconBg(notif.notification_type, notif.title)} flex items-center justify-center flex-shrink-0`}>
                  {getIcon(notif.notification_type, notif.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {notif.title}
                    </h3>
                    {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {/* Render message with some bolding if possible, or just raw text */}
                    {notif.message}
                  </p>
                  <p className="text-sm font-medium text-gray-500 mt-3">{formatTime(notif.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
