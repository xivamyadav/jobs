"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText, Bookmark, XCircle, TrendingUp, Calendar as CalendarIcon, X, Eye, Briefcase
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { candidateApi } from '@/apis/user';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/api-error';

const WavyLineBlue = () => (
  <svg className="absolute bottom-0 right-0 opacity-20 pointer-events-none" width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 60C0 60 20 20 60 20C100 20 120 40 160 40V60H0Z" fill="#3b82f6" />
    <path d="M0 60C0 60 40 40 80 40C120 40 140 10 160 10V60H0Z" fill="#60a5fa" />
  </svg>
);

const WavyLineGreen = () => (
  <svg className="absolute bottom-0 right-0 opacity-20 pointer-events-none" width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 60C0 60 20 20 60 20C100 20 120 40 160 40V60H0Z" fill="#10b981" />
    <path d="M0 60C0 60 40 40 80 40C120 40 140 10 160 10V60H0Z" fill="#34d399" />
  </svg>
);

const WavyLineRed = () => (
  <svg className="absolute bottom-0 right-0 opacity-20 pointer-events-none" width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 60C0 60 20 20 60 20C100 20 120 40 160 40V60H0Z" fill="#ef4444" />
    <path d="M0 60C0 60 40 40 80 40C120 40 140 10 160 10V60H0Z" fill="#f87171" />
  </svg>
);

const WavyLinePurple = () => (
  <svg className="absolute bottom-0 right-0 opacity-20 pointer-events-none" width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 60C0 60 20 20 60 20C100 20 120 40 160 40V60H0Z" fill="#a855f7" />
    <path d="M0 60C0 60 40 40 80 40C120 40 140 10 160 10V60H0Z" fill="#c084fc" />
  </svg>
);


export default function InsightsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'shortlisted' | 'not_shortlisted'>('shortlisted');

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await candidateApi.getInsights();
      if (res?.success) {
        setData(res.data);
      } else {
        setError('Insights data is unavailable.');
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to load insights. Please try again.');
      setError(msg);
      toast({ title: 'Insights unavailable', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const openModal = (type: 'shortlisted' | 'not_shortlisted') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-slate-900">Unable to load insights</h2>
          <p className="text-sm text-slate-500 mt-2">{error || 'Insights data is unavailable.'}</p>
          <button
            onClick={fetchInsights}
            className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Applied', value: data.stats.applied, color: '#3b82f6' }, // Blue
    { name: 'Shortlisted', value: data.stats.shortlisted, color: '#10b981' }, // Green
    { name: 'Not Shortlisted', value: data.stats.not_shortlisted, color: '#ef4444' }, // Red
  ];

  const totalPie = pieData.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const getPercentage = (value: number) => {
    return Math.round((value / totalPie) * 100);
  };

  const modalDetails = modalType === 'shortlisted' ? data.shortlisted_details : data.not_shortlisted_details;
  const modalTitle = modalType === 'shortlisted' ? 'Shortlisted Applications' : 'Not Shortlisted Applications';
  const modalColor = modalType === 'shortlisted' ? 'text-emerald-600' : 'text-red-600';
  const modalBg = modalType === 'shortlisted' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100';

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Insights
            </h1>
            <p className="text-slate-500 text-sm mt-1">Overview of your application journey</p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            {data.date_range}
          </div>
        </div>

        {/* ── Bottom Grid: Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Application Overview (Donut Chart) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Application Overview</h3>
            
            <div className="flex-1 flex flex-col xl:flex-row items-center justify-between gap-4">
              <div className="w-full xl:w-1/2 h-48 xl:h-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full xl:w-1/2 flex flex-col gap-3 justify-center">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold ml-5">{getPercentage(item.value)}%</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Applications</span>
              <span className="text-lg font-bold text-blue-600">{data.stats.total}</span>
            </div>
          </div>

          {/* Trend Overview (Line Chart) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Trend Overview</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '20px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="applied" 
                    name="Applied" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} 
                    activeDot={{ r: 5 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="shortlisted" 
                    name="Shortlisted" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="not_shortlisted" 
                    name="Not Shortlisted" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profile_views" 
                    name="Profile Views" 
                    stroke="#a855f7" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Recent Activity Timeline ── */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Application Activity</h3>
          
          {data.recent_activity && data.recent_activity.length > 0 ? (
            <div className="space-y-6">
              {data.recent_activity.map((activity: any, index: number) => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (activity.status === 'SHORTLISTED') badgeColor = 'bg-emerald-100 text-emerald-700';
                if (activity.status === 'NOT_SHORTLISTED') badgeColor = 'bg-red-100 text-red-700';
                if (activity.status === 'INTERVIEW') badgeColor = 'bg-purple-100 text-purple-700';
                if (activity.status === 'APPLIED') badgeColor = 'bg-blue-100 text-blue-700';
                if (['OFFERED', 'HIRED'].includes(activity.status)) badgeColor = 'bg-teal-100 text-teal-700';
                if (['UNDER_REVIEW', 'RESUME_VIEWED'].includes(activity.status)) badgeColor = 'bg-amber-100 text-amber-700';

                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Vertical line connecting items */}
                    {index !== data.recent_activity.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-100"></div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-slate-900">{activity.job_title}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{activity.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{activity.company_name}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                        {activity.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-500">No recent activity to show.</p>
            </div>
          )}
        </div>

      </div>

      {/* Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className={`px-6 py-4 border-b flex items-center justify-between ${modalBg}`}>
              <h2 className={`text-lg font-bold ${modalColor}`}>{modalTitle}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {modalDetails && modalDetails.length > 0 ? (
                <div className="space-y-4">
                  {modalDetails.map((item: any) => (
                    <div key={item.id} className="flex flex-col border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-900">{item.job_title}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{item.date}</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.company_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No applications found for this status.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
