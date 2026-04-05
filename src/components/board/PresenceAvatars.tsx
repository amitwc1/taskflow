"use client";

import { usePresenceStore } from "@/store/usePresenceStore";

export default function PresenceAvatars() {
  const { onlineUsers } = usePresenceStore();

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 6).map((u) => (
          <div key={u.userId} className="relative" title={`${u.displayName} (online)`}>
            <div className="w-7 h-7 rounded-full border-2 border-white/30 overflow-hidden bg-white/30 text-white flex items-center justify-center text-xs font-bold">
              {u.photoURL ? (
                <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                u.displayName?.[0]?.toUpperCase() || "?"
              )}
            </div>
            {/* Green online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white/30 rounded-full" />
          </div>
        ))}
        {onlineUsers.length > 6 && (
          <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white/30">
            +{onlineUsers.length - 6}
          </div>
        )}
      </div>
      <span className="text-white/60 text-xs ml-1">
        {onlineUsers.length} online
      </span>
    </div>
  );
}
