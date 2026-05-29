"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Building2,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { name: "My Jobs", href: "/employer/jobs", icon: Briefcase },
  { name: "Post a Job", href: "/employer/jobs/new", icon: PlusCircle },
  { name: "Applicants", href: "/employer/applicants", icon: Users },
  { name: "Company Profile", href: "/employer/company", icon: Building2 },
  { name: "Notifications", href: "/employer/notifications", icon: Bell, isNotification: true },
  { name: "Settings", href: "/employer/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const unreadCount = 2;

  const handleLogout = () => {
    // Cookies clear karne ka logic
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "has-company-setup=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
    router.refresh();
  };

  return (
    // Is line ko check karo sidebar mein:
    <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-white flex flex-col h-screen border-r border-gray-200">

      <div className="px-5 py-5 border-b border-gray-200 flex-shrink-0">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={160}
          height={40}
          priority
        />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const displayBadge = item.isNotification ? unreadCount : (item as any).badge;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-600")} />
                <span>{item.name}</span>
              </div>

              {displayBadge && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  isActive ? "bg-white/30 text-white" : "bg-indigo-100 text-indigo-600"
                )}>
                  {displayBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- MVSHINE HATA DIYA, AB YAHAN SIRF LOGOUT HAI --- */}
      {/* Logout button at the very bottom */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl shadow-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout Account</span>
        </button>
      </div>
    </aside>
  );
}