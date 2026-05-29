'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Building2,
  Bell,
  Settings,
  LogOut,
  Menu, // Hamburger icon
  X,     // Close icon
  type LucideIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        w-[280px] bg-white border-r border-gray-200 fixed h-full flex flex-col justify-between py-8 z-[60] shadow-lg transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div>
          {/* Logo Section */}
          <div className="px-8 mb-10 flex items-center justify-between">
            <Link href="/employer/dashboard" className="block transition-transform hover:scale-105">
              <img src="/images/bytebuzz_horizontal.png" alt="ByteBuzz Logo" className="h-14 w-auto object-contain" />
            </Link>
            {/* Mobile Close Button */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-600 hover:text-indigo-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-6 space-y-2">
            <NavItem href="/employer/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem href="/employer/jobs" label="My Jobs" icon={Briefcase} />
            <NavItem href="/employer/jobs/new" label="Post a Job" icon={PlusCircle} />
            <NavItem href="/employer/applicants" label="Applicants" icon={Users} />
            <NavItem href="/employer/company" label="Company Profile" icon={Building2} />
            <NavItem href="/employer/notifications" label="Notifications" icon={Bell} />
            <NavItem href="/employer/settings" label="Settings" icon={Settings} />
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="px-6 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 text-sm font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            <LogOut size={19} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* lg:pl-[280px] add kiya taaki desktop par waisa hi rahe */}
      <div className="flex-1 flex flex-col lg:pl-[280px] w-full min-w-0">

        {/* --- HEADER --- 
         <header className="h-[72px] bg-white/90 backdrop-blur-md border-b border-indigo-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="hidden xs:block">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Employer Panel</h2>
              <p className="text-xs text-indigo-600 font-bold capitalize mt-0.5">
                Workspace / {pathname.split('/').pop()?.replace(/-/g, ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/employer/notifications" className="relative p-2 md:p-2.5 rounded-xl border border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors group">
              <Bell className="text-gray-600 group-hover:text-indigo-600" size={20} />
              <span className="absolute top-2 md:top-2.5 right-2 md:right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>

            <div className="flex items-center gap-4 pl-3 md:pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-700 leading-none">
                  {user?.full_name || "John Employer"}
                </p>
                <p className="text-[10px] text-gray-500 font-bold mt-1.5 uppercase tracking-wider">
                  {user?.role || "Administrator"}
                </p>
              </div>
              <div className="w-10 h-10 md:w-11 md:h-11 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-bold text-white shadow-lg shadow-indigo-200">
                {user?.full_name?.substring(0, 2).toUpperCase() || "JE"}
              </div>
            </div>
          </div>
        </header> */}

        {/* --- PAGE CONTENT --- */}
        <main className="p-4 md:p-8 w-full max-w-[1600px] animate-in fade-in slide-in-from-bottom-3 duration-700 mx-auto">
          <ErrorBoundary fallback={
            <Card className="border-gray-200 bg-gray-50 p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
                <p className="text-red-700 mb-4">An unexpected error occurred. Please try refreshing the page or contact support.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </Card>
          }>
            {children}
          </ErrorBoundary>          {/* Error Boundary Fallback Refresh Button Disabled */}        </main>
      </div>
    </div>
  );
}

/**
 * Reusable Navigation Item Component
 */
function NavItem({ href, label, icon: Icon, badge = "", onClick, disabled = false }: { href: string; label: string; icon: LucideIcon; badge?: string; onClick?: () => void; disabled?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (disabled) {
    return (
      <div
        className="flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        <div className="flex items-center gap-4">
          <Icon
            size={20}
            strokeWidth={2}
            className="text-gray-400"
          />
          <span className="text-sm tracking-tight font-semibold">
            {label}
          </span>
        </div>
        {badge && (
          <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-gray-300 text-gray-600">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 lg:translate-x-2'
        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:translate-x-1'
        }`}
    >
      <div className="flex items-center gap-4">
        <Icon
          size={20}
          strokeWidth={isActive ? 2.5 : 2}
          className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600 transition-colors'}
        />
        <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
          {label}
        </span>
      </div>
      {badge && (
        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-colors ${isActive
          ? 'bg-white/30 text-white'
          : 'bg-indigo-100 text-indigo-600 border border-indigo-200 group-hover:bg-indigo-200'
          }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}