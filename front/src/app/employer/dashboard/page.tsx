'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Users,
  Calendar,
  Eye,
  MoreVertical,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Compass,
  FileText,
  ChevronDown,
  IndianRupee
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCompanyProfile } from '@/lib/hooks/useCompanyProfile'
import { toast } from 'sonner'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

import { getDashboardStats } from '@/apis/dashboard'
import { CandidateProfileModal } from '@/components/employer/CandidateProfileModal'
import api from '@/lib/api-client'

export default function DashboardPage() {
  const router = useRouter()
  const { data: company } = useCompanyProfile()
  const companyName = company?.name || 'ByTeBuZz'
  const [timeframe, setTimeframe] = useState('This Week')
  
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [viewingApplicant, setViewingApplicant] = useState<any | null>(null)

  const formatSalary = (min?: number | null, max?: number | null, currency?: string) => {
    if (min == null && max == null) return 'Salary not disclosed'
    const minNum = typeof min === 'number' ? min : 0
    const maxNum = typeof max === 'number' ? max : minNum
    const clean = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(1))
    if ((currency || 'INR') === 'INR') {
      return `${clean(minNum)} - ${clean(maxNum)} LPA`
    }
    return `${clean(minNum)} - ${clean(maxNum)} ${currency || ''}`.trim()
  }

  const formatExperience = (min?: number | null, max?: number | null) => {
    if (min == null && max == null) return 'Exp not specified'
    const minNum = min ?? 0
    const maxNum = max ?? minNum
    if (minNum === 0 && maxNum === 0) return 'Fresher'
    if (minNum === maxNum) return `${minNum} Yr${minNum === 1 ? '' : 's'}`
    return `${minNum} - ${maxNum} Yrs`
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats(timeframe)
        if (response.success) {
          setStats(response.data)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load dashboard statistics.'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()

    if (company?.id) {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/dashboard/${company.id}/`
        const ws = new WebSocket(wsUrl)
        
        ws.onmessage = (event) => {
            // Re-fetch stats on update to keep it simple and accurate
            fetchStats()
        }

        return () => {
            ws.close()
        }
    }
  }, [timeframe, company?.id])

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading dashboard...</div>
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-1 md:p-4 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700"
    >
      {/* ── HERO HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2"
          >
            Welcome back, <span className="text-[#5B4DFF] font-black">{companyName}</span>!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 font-medium mt-1 text-sm md:text-base"
          >
            Here&apos;s what&apos;s happening with your jobs today.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
          <Button 
            onClick={() => router.push('/employer/jobs/new')}
            className="bg-[#5B4DFF] hover:bg-[#4a3dec] text-white rounded-[14px] h-11 px-6 font-bold flex items-center gap-2 shadow-lg shadow-[#5B4DFF]/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} strokeWidth={2.5} />
            Post New Job
          </Button>
        </motion.div>
      </div>

      {/* ── STATS ROW (4 PREMIUM INTERACTIVE CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Jobs */}
        <motion.div variants={cardVariants} whileHover={{ y: -4 }} className="transition-all duration-300">
          <Card 
            onClick={() => router.push('/employer/jobs')}
            className="rounded-[20px] border-0 bg-[#f5f3ff] shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-100/80 text-[#8b5cf6] transition-colors group-hover:bg-[#8b5cf6] group-hover:text-white duration-300">
                  <Briefcase size={22} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Total Jobs</p>
                <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-[#5B4DFF] transition-colors duration-300">
                  {stats?.jobs?.total || 0}
                </h3>
                <p className="text-[11px] text-[#8b5cf6] font-semibold mt-2 flex items-center gap-1">
                  {stats?.jobs?.published || 0} active <ArrowUpRight size={12} />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Total Applicants */}
        <motion.div variants={cardVariants} whileHover={{ y: -4 }} className="transition-all duration-300">
          <Card 
            onClick={() => router.push('/employer/applicants')}
            className="rounded-[20px] border-0 bg-[#eff6ff] shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-100/80 text-[#3b82f6] transition-colors group-hover:bg-[#3b82f6] group-hover:text-white duration-300">
                  <Users size={22} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Total Applicants</p>
                <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-[#5B4DFF] transition-colors duration-300">
                  {stats?.applicants?.total || 0}
                </h3>
                <p className="text-[11px] text-[#3b82f6] font-semibold mt-2 flex items-center gap-1">
                  {stats?.applicants?.new || 0} new (Applied) <ArrowUpRight size={12} />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Interviews This Week */}
        <motion.div variants={cardVariants} whileHover={{ y: -4 }} className="transition-all duration-300">
          <Card 
            onClick={() => router.push('/employer/applicants')}
            className="rounded-[20px] border-0 bg-[#f0fdf4] shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-emerald-100/80 text-[#10b981] transition-colors group-hover:bg-[#10b981] group-hover:text-white duration-300">
                  <Calendar size={22} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Interviews & Shortlisted</p>
                <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-[#5B4DFF] transition-colors duration-300">
                  {(stats?.applicants?.status_breakdown?.INTERVIEWING || 0) + (stats?.applicants?.status_breakdown?.SHORTLISTED || 0)}
                </h3>
                <p className="text-[11px] text-[#10b981] font-semibold mt-2 flex items-center gap-1">
                  {stats?.applicants?.status_breakdown?.INTERVIEWING || 0} interviewing <ArrowUpRight size={12} />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Total Views */}
        <motion.div variants={cardVariants} whileHover={{ y: -4 }} className="transition-all duration-300">
          <Card 
            onClick={() => router.push('/employer/jobs')}
            className="rounded-[20px] border-0 bg-[#fffbeb] shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-amber-100/80 text-[#f59e0b] transition-colors group-hover:bg-[#f59e0b] group-hover:text-white duration-300">
                  <Eye size={22} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Total Views</p>
                <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-[#5B4DFF] transition-colors duration-300">
                  {stats?.jobs?.total_views?.toLocaleString() || 0}
                </h3>
                <p className="text-[11px] text-[#f59e0b] font-semibold mt-2 flex items-center gap-1">
                  Across all posts <ArrowUpRight size={12} />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── MAIN CONTENT GRID (3 COLUMNS: LEFT, CENTER, RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Recent Job Posts */}
        <motion.div variants={cardVariants}>
          <Card className="rounded-[20px] border border-gray-100 bg-white shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-lg">Recent Job Posts</h3>
                <Link href="/employer/jobs" className="text-xs font-bold text-[#5B4DFF] hover:underline flex items-center gap-1">
                  View All Jobs <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50 px-2">
                {stats?.recent_jobs?.length > 0 ? stats.recent_jobs.map((job: any, idx: number) => (
                  <Link
                    key={job.id || idx}
                    href={`/employer/applicants?job=${job.id}`}
                    className="p-4 hover:bg-[#5B4DFF]/5 rounded-xl transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#5B4DFF] transition-colors truncate">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium flex-wrap">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${job.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {job.status}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <IndianRupee size={12} />
                          {formatSalary(job.salary_min, job.salary_max, job.currency)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} />
                          {formatExperience(job.experience_min, job.experience_max)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block font-black text-gray-900 text-base">{job.applications_count}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Applicants</span>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-4 text-center text-gray-500 text-sm font-medium">No recent jobs found.</div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-50">
              <Button variant="outline" className="w-full h-11 rounded-[14px] border-[#5B4DFF]/20 text-[#5B4DFF] hover:bg-[#5B4DFF]/5 font-bold transition-all" asChild>
                <Link href="/employer/jobs">View All Jobs</Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* CENTER COLUMN: Recent Applicants */}
        <motion.div variants={cardVariants}>
          <Card className="rounded-[20px] border border-gray-100 bg-white shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-lg">Recent Applicants</h3>
                <Link href="/employer/applicants" className="text-xs font-bold text-[#5B4DFF] hover:underline flex items-center gap-1">
                  View All Applicants <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50 px-2">
                {stats?.recent_applicants?.length > 0 ? stats.recent_applicants.map((app: any, idx: number) => {
                  let statusColor = 'bg-gray-50 text-gray-700 border-gray-100';
                  if (app.status === 'APPLIED') statusColor = 'bg-blue-50 text-blue-700 border-blue-100';
                  if (app.status === 'SHORTLISTED') statusColor = 'bg-purple-50 text-purple-700 border-purple-100';
                  if (app.status === 'INTERVIEWING') statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                  if (app.status === 'HIRED') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  if (app.status === 'REJECTED') statusColor = 'bg-red-50 text-red-700 border-red-100';

                  const initials = app.candidate_name ? app.candidate_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'C';

                  return (
                    <div key={app.id || idx} className="p-4 hover:bg-[#5B4DFF]/5 rounded-xl transition-all duration-200 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4DFF]/20 to-[#8b5cf6]/20 flex items-center justify-center font-bold text-sm text-[#5B4DFF]">
                        {initials}
                      </div>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer group"
                        onClick={async () => {
                          try {
                            const detailRes = await api.get(`/application/${app.id}/`);
                            setViewingApplicant(detailRes.data);
                            setShowProfileModal(true);
                          } catch (error) {
                            const message = error instanceof Error ? error.message : 'Unable to load applicant details.';
                            toast.error(message);
                            setViewingApplicant(app);
                            setShowProfileModal(true);
                          }
                        }}
                      >
                        <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                          {app.candidate_name || 'Anonymous'}
                        </h4>
                        <p className="text-xs text-gray-400 font-semibold truncate">Applied for: {app.job_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="p-4 text-center text-gray-500 text-sm font-medium">No recent applicants.</div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-50">
              <Button variant="outline" className="w-full h-11 rounded-[14px] border-[#5B4DFF]/20 text-[#5B4DFF] hover:bg-[#5B4DFF]/5 font-bold transition-all" asChild>
                <Link href="/employer/applicants">View All Applicants</Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* RIGHT COLUMN: Application Overview Graph */}
        <motion.div variants={cardVariants}>
          <Card className="rounded-[20px] border border-gray-100 bg-white shadow-sm h-full flex flex-col justify-between">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-lg">Application Overview</h3>
              <div className="relative">
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div>
                <span className="block font-black text-gray-900 text-3xl">
                  {stats?.chart_data?.reduce((sum: number, item: any) => sum + item.applications, 0) || 0}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Applications in {timeframe}
                </span>
              </div>

              {/* Area Chart */}
              <div className="h-[180px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.chart_data || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5B4DFF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#5B4DFF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                    />
                    <Area type="monotone" dataKey="applications" stroke="#5B4DFF" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 border-t border-gray-50 bg-gray-50/50 rounded-b-[20px] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Top Performing Job</span>
                {stats?.top_performing_job && (
                  <span className="text-emerald-600 font-bold">{stats.top_performing_job.applicants} applicants</span>
                )}
              </div>
              <p className="font-extrabold text-gray-800 text-sm">
                {stats?.top_performing_job?.title || 'No active jobs yet'}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── BOTTOM SECTION: QUICK ACTIONS + PREMIUM UPGRADE BANNER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* LEFT/CENTER: Quick Actions Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Post a New Job', desc: 'Create a new job posting', icon: Briefcase, color: 'bg-purple-50 text-[#8b5cf6]', href: '/employer/jobs/new' },
            { label: 'Browse Applicants', desc: 'View all applicants', icon: Users, color: 'bg-blue-50 text-[#3b82f6]', href: '/employer/applicants' },
            { label: 'Company Profile', desc: 'Manage your company', icon: Compass, color: 'bg-emerald-50 text-[#10b981]', href: '/employer/company' },
            { label: 'Job Templates', desc: 'Use pre-built templates', icon: FileText, color: 'bg-amber-50 text-[#f59e0b]', href: '/employer/jobs' },
          ].map((action, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(action.href)}
              className="p-5 bg-white border border-gray-100 rounded-[20px] shadow-sm hover:shadow-md hover:border-[#5B4DFF]/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div className={`p-3 rounded-xl w-fit ${action.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <action.icon size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-[#5B4DFF] transition-colors">{action.label}</h4>
                <p className="text-[11px] text-gray-400 font-medium mt-1 leading-snug">{action.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* RIGHT: Upgrade to Premium Banner */}
        <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
          <Card className="rounded-[20px] border border-purple-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-sm h-full overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5B4DFF]/5 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">Upgrade to Premium</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Get more visibility and find the perfect candidates faster.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 shadow-sm">
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full bg-[#5B4DFF] hover:bg-[#4a3dec] text-white rounded-[14px] h-11 font-bold shadow-md shadow-[#5B4DFF]/15 transition-all hover:scale-[1.02]">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {showProfileModal && viewingApplicant && (
        <CandidateProfileModal 
          applicant={viewingApplicant} 
          onClose={() => {
            setShowProfileModal(false)
            setViewingApplicant(null)
          }} 
        />
      )}
    </motion.div>
  )
}
