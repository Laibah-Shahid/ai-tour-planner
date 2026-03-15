
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function ProfileDropdown({ user, onSignOut }: { user: User; onSignOut: () => void }) {

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/90 hover:bg-emerald-800 active:bg-emerald-900 border border-emerald-900 rounded-xl shadow focus:outline-none transition-colors"
        aria-label="Open profile menu"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Image
          src={user.user_metadata?.avatar_url || "/avatars/thumb-1.jpg"}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full border border-emerald-400"
        />
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
          <path d="M5 8L10 13L15 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-4 z-50 border border-emerald-100">
          <div className="flex items-center gap-3 px-4 pb-3 border-b border-emerald-100 overflow-hidden">
            <Image
              src={user.user_metadata?.avatar_url || "/avatars/thumb-1.jpg"}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full border border-emerald-400 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-semibold text-emerald-900 text-sm truncate">{user.user_metadata?.name || "User"}</div>
              <div className="text-xs text-emerald-700 truncate">{user.email}</div>
            </div>
          </div>
          <button
            className="w-full text-left px-4 py-2 mt-2 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium"
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
          >
            Profile
          </button>
          <button
            className="w-full text-left px-4 py-2 text-emerald-400 bg-emerald-50 rounded-lg font-medium cursor-not-allowed opacity-60"
            disabled
            aria-disabled="true"
          >
            Settings
          </button>
          <button
            className="w-full text-left px-4 py-2 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium"
            onClick={() => { setOpen(false); onSignOut(); }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
