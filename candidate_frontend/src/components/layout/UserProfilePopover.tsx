"use client";
import { accountApi } from '@/apis/user/route';
import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, KeyRound, Eye, EyeOff, Lock, User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UserProfilePopover() {
  const router = useRouter();
  const { user } = useAuth();
  const popoverId = useId();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Updated: "JD" removed, falls back to "U" if no name
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const handleSubmit = async () => {
    setError("");
    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await accountApi.changePassword(form);
      setChangePasswordOpen(false);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background: linear-gradient(135deg, #4338ca, #4f46e5, #6366f1, #4f46e5, #4338ca);
          background-size: 300% 300%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-gradient-hover:hover {
          background: linear-gradient(135deg, #4338ca, #4f46e5, #6366f1, #4f46e5, #4338ca);
          background-size: 300% 300%;
          animation: gradient-shift 2s ease infinite;
        }
      `}</style>

      <Popover>
        <PopoverTrigger asChild>
          <button

            className="relative flex items-center gap-3 rounded-lg p-2 transition-all duration-300 group w-full overflow-hidden animate-gradient-hover"
            suppressHydrationWarning
          >

            <div className="absolute opacity-100 group-hover:opacity-0 transition-opacity duration-300 rounded-lg" />
            <User className="size-10 stroke-1" />
            <div className="relative flex-1 text-left">
              <p className="text-md font-bold text-gray-900 group-hover:text-white truncate transition-colors duration-300">{user?.username || "User"}</p>
              <p className="text-xs text-gray-500 group-hover:text-indigo-100 truncate transition-colors duration-300">View Profile</p>
            </div>

          </button>
        </PopoverTrigger>

        <PopoverContent side="top" align="start" className="w-80 p-0 shadow-2xl rounded-xl overflow-hidden border-2 border-indigo-200">
          {/* Enhanced Animated Header */}
          <div className="relative overflow-hidden">
            <div className="h-24 w-full animate-gradient" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end gap-3">
              <Avatar className="w-16 h-16 shadow-xl hover:scale-105 transition-transform duration-300">
                <AvatarFallback
                  className="text-black text-2xl font-bold animate-gradient"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-1">
                <p className="font-bold text-white text-base drop-shadow-md">{user?.username || "User"}</p>
                <p className="text-xs text-indigo-100 drop-shadow-sm">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          {/* User Stats with Gradient Cards */}
          <div className="px-4 py-4 bg-gradient-to-b from-indigo-50 to-white border-b border-indigo-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative bg-white rounded-lg p-3 border border-indigo-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-indigo-600/10 transition-all duration-300" />
                <div className="relative z-10">
                  <p className="text-xs text-gray-500 mb-0.5">User ID</p>
                  <p className="text-sm font-bold text-gray-900">{user?.id || "N/A"}</p>
                </div>
              </div>
              <div className="relative bg-white rounded-lg p-3 border border-indigo-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-indigo-600/10 transition-all duration-300" />
                <div className="relative z-10">
                  <p className="text-xs text-gray-500 mb-0.5">Role</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{user?.role || "Member"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Animated Actions */}
          <div className="p-3 space-y-1">
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 overflow-hidden group transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-600/0 group-hover:from-indigo-500/10 group-hover:to-indigo-600/20 transition-all duration-300" />
              <div className="relative z-10 w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 group-hover:scale-110 transition-all duration-300">
                <KeyRound className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="relative z-10 flex-1 text-left group-hover:text-indigo-700 transition-colors duration-300">Change Password</span>
              <svg className="relative z-10 w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => router.push("/logout")}
              className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-600 overflow-hidden group transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-600/0 group-hover:from-red-500/10 group-hover:to-red-600/20 transition-all duration-300" />
              <div className="relative z-10 w-8 h-8 rounded-md bg-red-100 flex items-center justify-center group-hover:bg-red-200 group-hover:scale-110 transition-all duration-300">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="relative z-10 flex-1 text-left group-hover:text-red-700 transition-colors duration-300">Logout</span>
              <svg className="relative z-10 w-4 h-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Change Password</DialogTitle>
            <DialogDescription>
              Update your account password to keep it secure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="pl-10 pr-10"
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="pl-10 pr-10"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
              onClick={() => setChangePasswordOpen(false)}
            >
              Cancel
            </button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ background: 'linear-gradient(135deg,#4338ca,#4f46e5)' }}
            >
              {submitting ? "Saving..." : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}