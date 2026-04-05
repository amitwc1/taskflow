"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun, Search, ChevronDown, User, Settings } from "lucide-react";
import toast from "react-hot-toast";
import NotificationPanel from "@/components/board/NotificationPanel";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setShowProfile(false);
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  return (
    <nav className="h-12 bg-primary flex items-center justify-between px-4 text-white shrink-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center bg-white/20 rounded-lg overflow-hidden">
              <Search size={14} className="ml-2.5 text-white/60 shrink-0" />
              <input
                ref={searchRef}
                className="bg-transparent text-white placeholder-white/50 text-sm px-2 py-1.5 w-52 focus:outline-none"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); setSearchOpen(false); } }}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            >
              <Search size={14} />
              <span className="hidden sm:inline text-white/70">Search</span>
            </button>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user && (
          <>
            <NotificationPanel />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.displayName?.[0] || user.email?.[0] || "U"
                  )}
                </div>
                <ChevronDown size={12} className={`transition-transform ${showProfile ? "rotate-180" : ""}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-background border border-border rounded-xl shadow-xl z-50 py-2 text-foreground animate-in fade-in slide-in-from-top-1">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          (user.displayName?.[0] || "U").toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{user.displayName || "User"}</p>
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface-hover transition-colors"
                    >
                      <User size={14} className="text-muted" />
                      Profile
                    </Link>
                    <button
                      onClick={toggle}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface-hover transition-colors text-left"
                    >
                      {dark ? <Sun size={14} className="text-muted" /> : <Moon size={14} className="text-muted" />}
                      {dark ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface-hover transition-colors text-accent text-left"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
