"use client";

interface AvatarGroupProps {
  /** Array of user identifiers (names, emails, or IDs) */
  users: { id: string; name?: string; photo?: string | null }[];
  /** Max avatars to show before +N overflow */
  max?: number;
  /** Avatar size: sm (20px), md (28px), lg (32px) */
  size?: "sm" | "md" | "lg";
  /** Extra CSS classes on the wrapper */
  className?: string;
}

const sizeMap = {
  sm: { avatar: "w-5 h-5", text: "text-[9px]", overlap: "-space-x-1.5" },
  md: { avatar: "w-7 h-7", text: "text-[10px]", overlap: "-space-x-2" },
  lg: { avatar: "w-8 h-8", text: "text-xs", overlap: "-space-x-2.5" },
};

/** Consistent color palette for avatar fallbacks */
const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
  "bg-violet-500", "bg-cyan-500", "bg-pink-500", "bg-teal-500",
];

function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function AvatarGroup({ users, max = 4, size = "md", className = "" }: AvatarGroupProps) {
  const s = sizeMap[size];
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  if (users.length === 0) return null;

  return (
    <div className={`flex items-center ${s.overlap} ${className}`}>
      {visible.map((u) => (
        <div
          key={u.id}
          className={`${s.avatar} rounded-full border-2 border-background flex items-center justify-center ${s.text} font-bold text-white shrink-0 overflow-hidden ${u.photo ? "" : getColor(u.id)}`}
          title={u.name || u.id}
        >
          {u.photo ? (
            <img src={u.photo} alt="" className={`${s.avatar} rounded-full object-cover`} referrerPolicy="no-referrer" />
          ) : (
            (u.name?.[0] || u.id[0] || "?").toUpperCase()
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`${s.avatar} rounded-full border-2 border-background bg-surface text-muted flex items-center justify-center ${s.text} font-bold shrink-0`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
