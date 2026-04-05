"use client";

import { useState, useEffect } from "react";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Role, Board } from "@/types";
import toast from "react-hot-toast";
import { UserPlus, X, Loader2, Shield, ShieldCheck, Eye, ChevronDown } from "lucide-react";

interface InviteModalProps {
  boardId: string;
  currentMembers: string[];
  currentEmails: string[];
  open: boolean;
  onClose: () => void;
  board?: Board;
}

const roleConfig: Record<Role, { label: string; icon: typeof Shield; description: string; color: string }> = {
  admin: { label: "Admin", icon: ShieldCheck, description: "Full access, manage members", color: "text-amber-600" },
  member: { label: "Member", icon: Shield, description: "Create and edit cards", color: "text-blue-600" },
  viewer: { label: "Viewer", icon: Eye, description: "View only", color: "text-gray-500" },
};

export default function InviteModal({ boardId, currentMembers, currentEmails, open, onClose, board }: InviteModalProps) {
  const user = useAuthStore((s) => s.user);
  const { members, subscribeMemberList, invite, remove, changeRole, isAdmin, currentUserRole } = useCollaborationStore();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("member");
  const [loading, setLoading] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    if (boardId && open) {
      const unsub = subscribeMemberList(boardId);
      return unsub;
    }
  }, [boardId, open, subscribeMemberList]);

  if (!open) return null;

  const currentIsAdmin = board && user ? isAdmin(board, user.uid) : false;

  const handleInvite = async () => {
    if (!email.trim() || !user || !board) return;
    const trimmed = email.trim().toLowerCase();

    if (currentEmails.includes(trimmed)) {
      toast.error("User is already a member");
      return;
    }

    setLoading(true);
    try {
      const result = await invite({
        boardId,
        email: trimmed,
        role: selectedRole,
        invitedBy: { uid: user.uid, displayName: user.displayName || "Unknown", photoURL: user.photoURL },
      });
      if (!result.success) {
        toast.error(result.error || "Failed to invite");
      } else {
        toast.success(`Invited ${trimmed} as ${selectedRole}`);
        setEmail("");
      }
    } catch {
      toast.error("Failed to invite user");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!user || !board) return;
    if (!confirm("Remove this member from the board?")) return;
    try {
      await remove({ boardId, userId, removedBy: { uid: user.uid, displayName: user.displayName || "Unknown", photoURL: user.photoURL } });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!user || !board) return;
    setChangingRole(userId);
    try {
      await changeRole({
        boardId,
        userId,
        newRole,
        changedBy: { uid: user.uid, displayName: user.displayName || "Unknown", photoURL: user.photoURL },
      });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to change role");
    } finally {
      setChangingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl p-6 w-full max-w-lg border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus size={20} /> Board Members
          </h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Invite section (admin only) */}
        {currentIsAdmin && (
          <div className="mb-5">
            <p className="text-xs font-medium text-muted mb-2">Invite new member</p>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Enter email address..."
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="px-2 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm flex items-center gap-2 shrink-0"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Invite
              </button>
            </div>
          </div>
        )}

        {/* Members list */}
        <div>
          <h4 className="text-sm font-medium text-muted mb-2">
            Members ({members.length || currentEmails.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.length > 0
              ? members.map((m) => {
                  const config = roleConfig[m.role];
                  const RoleIcon = config.icon;
                  const isOwner = board?.ownerId === m.userId;
                  const isSelf = user?.uid === m.userId;
                  return (
                    <div key={m.userId} className="flex items-center justify-between p-2.5 rounded-lg bg-surface">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                          {m.photoURL ? (
                            <img src={m.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            (m.displayName?.[0] || m.email[0]).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{m.displayName || m.email}</p>
                          <p className="text-xs text-muted truncate">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOwner && (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            Owner
                          </span>
                        )}
                        {currentIsAdmin && !isOwner ? (
                          <div className="relative">
                            <select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.userId, e.target.value as Role)}
                              disabled={changingRole === m.userId}
                              className={`text-xs px-2 py-1 rounded border border-border bg-background ${config.color} cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary appearance-none pr-6`}
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
                          </div>
                        ) : (
                          <span className={`flex items-center gap-1 text-xs ${config.color}`}>
                            <RoleIcon size={12} />
                            {config.label}
                          </span>
                        )}
                        {currentIsAdmin && !isOwner && !isSelf && (
                          <button
                            onClick={() => handleRemove(m.userId)}
                            className="text-muted hover:text-accent transition-colors p-1"
                            title="Remove member"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              : /* Fallback to email list if members haven't loaded */
                currentEmails.map((memberEmail, i) => (
                  <div key={memberEmail} className="flex items-center justify-between p-2.5 rounded-lg bg-surface">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {memberEmail[0].toUpperCase()}
                      </div>
                      <span className="text-sm">{memberEmail}</span>
                    </div>
                    {i === 0 && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
