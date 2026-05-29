"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  User,
  Upload,
  Bell,
  BarChart,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import UserProfilePopover from './UserProfilePopover';

const mainItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Search, label: 'Browse Jobs', href: '/dashboard/jobs' },
  { icon: FileText, label: 'My Applications', href: '/dashboard/applications' },
  { icon: Bookmark, label: 'Saved Jobs', href: '/dashboard/saved-jobs' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
];

const careerItems = [
  { icon: User, label: 'My Profile', href: '/dashboard/profile/edit' },
];

const toolsItems = [
  { icon: BarChart, label: 'Insights', href: '/dashboard/insights' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const NavItem = ({ item, pathname }: { item: any, pathname: string }) => {
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all group relative",
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-500")} />
      <span>{item.label}</span>
      
      {item.badge && (
        <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
      {isActive && !item.badge && (
        <ChevronRight className="w-4 h-4 ml-auto text-indigo-600" />
      )}
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex items-center mb-8 px-2">
          <Link href="/dashboard" className="block transition-transform hover:scale-105">
            <Image
              src="/images/bytebuzz_logo.png"
              alt="ByteBuzz Logo"
              width={160}
              height={40}
              priority
            />
          </Link>
        </div>

        <nav className="space-y-1">
          {mainItems.map((item) => (
            <NavItem key={item.label} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="mt-8">
          <h3 className="px-4 text-xs font-bold text-gray-400 tracking-wider mb-2">CAREER</h3>
          <nav className="space-y-1">
            {careerItems.map((item) => (
              <NavItem key={item.label} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>

        <div className="mt-8">
          <h3 className="px-4 text-xs font-bold text-gray-400 tracking-wider mb-2">TOOLS</h3>
          <nav className="space-y-1">
            {toolsItems.map((item) => (
              <NavItem key={item.label} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>
      </div>

      <div className="px-4 pb-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <UserProfilePopover />
          <button
            onClick={() => router.push('/logout')}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </aside>
  );
}