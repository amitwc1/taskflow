"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Card, Label, ChecklistItem } from "@/types";
import toast from "react-hot-toast";
import {
  X, Calendar, Tag, CheckSquare, Paperclip, MessageSquare, Trash2,
  Plus, Users, Loader2
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import TimeTracker from "./TimeTracker";
import AIAssistant from "./AIAssistant";
import { logActivity } from "@/services/activityService";
import { useActivityStore } from "@/store/useActivityStore";
import { formatDistanceToNow } from "date-fns";

const LABEL_COLORS = [
  { color: "#61bd4f", name: "Green" },
  { color: "#f2d600", name: "Yellow" },
  { color: "#ff9f1a", name: "Orange" },
  { color: "#eb5a46", name: "Red" },
  { color: "#c377e0", name: "Purple" },
  { color: "#0079bf", name: "Blue" },
  { color: "#00c2e0", name: "Sky" },
  { color: "#51e898", name: "Lime" },
  { color: "#ff78cb", name: "Pink" },
  { color: "#344563", name: "Dark" },
];

interface CardModalProps {
  card: Card;
  onClose: () => void;
  boardMembers: string[];
  boardId?: string;
}

export default function CardModal({ card, onClose, boardMembers, boardId }: CardModalProps) {
  const { updateCard, deleteCard, addComment, deleteComment, subscribeComments, comments } = useBoardStore();
  const user = useAuthStore((s) => s.user);
  const { cardActivities, subscribeCard: subscribeCardActivities, clearCardActivities } = useActivityStore();

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "");
  const [labels, setLabels] = useState<Label[]>(card.labels || []);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || []);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [commentText, setCommentText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [assignedMembers, setAssignedMembers] = useState<string[]>(card.assignedMembers || []);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeComments(card.id);
    return unsub;
  }, [card.id, subscribeComments]);

  useEffect(() => {
    const unsub = subscribeCardActivities(card.id);
    return () => {
      unsub();
      clearCardActivities();
    };
  }, [card.id, subscribeCardActivities, clearCardActivities]);

  const save = useCallback(
    async (data: Partial<Card>) => {
      try {
        await updateCard(card.id, data);
      } catch {
        toast.error("Failed to save");
      }
    },
    [card.id, updateCard]
  );

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (title.trim() && title !== card.title) {
      save({ title: title.trim(), lastUpdatedBy: user?.uid, lastUpdatedByName: user?.displayName || "Unknown" });
      if (user && boardId) {
        logActivity({
          boardId,
          cardId: card.id,
          userId: user.uid,
          userName: user.displayName || "Unknown",
          userPhoto: user.photoURL,
          action: "card_updated",
          details: `renamed card to "${title.trim()}"`,
        });
      }
    }
  };

  const handleDescBlur = () => {
    if (description !== card.description) {
      save({ description, lastUpdatedBy: user?.uid, lastUpdatedByName: user?.displayName || "Unknown" });
      if (user && boardId) {
        logActivity({
          boardId,
          cardId: card.id,
          userId: user.uid,
          userName: user.displayName || "Unknown",
          userPhoto: user.photoURL,
          action: "card_updated",
          details: `updated description on "${card.title}"`,
        });
      }
    }
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    save({ dueDate: val ? new Date(val).getTime() : null });
  };

  const toggleLabel = (label: { color: string; name: string }) => {
    let newLabels: Label[];
    const existing = labels.find((l) => l.color === label.color);
    if (existing) {
      newLabels = labels.filter((l) => l.color !== label.color);
    } else {
      newLabels = [...labels, { id: uuidv4(), ...label }];
    }
    setLabels(newLabels);
    save({ labels: newLabels });
  };

  const addChecklistItem = () => {
    if (!newCheckItem.trim()) return;
    const newList = [...checklist, { id: uuidv4(), text: newCheckItem.trim(), completed: false }];
    setChecklist(newList);
    setNewCheckItem("");
    save({ checklist: newList });
  };

  const toggleCheckItem = (id: string) => {
    const newList = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(newList);
    save({ checklist: newList });
  };

  const removeCheckItem = (id: string) => {
    const newList = checklist.filter((item) => item.id !== id);
    setChecklist(newList);
    save({ checklist: newList });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileRef2 = ref(storage, `attachments/${card.id}/${uuidv4()}-${file.name}`);
      await uploadBytes(fileRef2, file);
      const url = await getDownloadURL(fileRef2);
      const newAttachments = [
        ...(card.attachments || []),
        { id: uuidv4(), name: file.name, url, type: file.type, uploadedAt: Date.now() },
      ];
      await save({ attachments: newAttachments });
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    const attachment = (card.attachments || []).find((a) => a.id === attachmentId);
    // Delete the file from Firebase Storage
    if (attachment?.url) {
      try {
        const fileRef = ref(storage, attachment.url);
        await deleteObject(fileRef);
      } catch {
        // File may already be deleted — continue removing the reference
      }
    }
    const newAttachments = (card.attachments || []).filter((a) => a.id !== attachmentId);
    await save({ attachments: newAttachments });
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      await addComment({
        cardId: card.id,
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "Unknown",
        userPhoto: user.photoURL,
        text: commentText.trim(),
      });
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this card?")) {
      try {
        await deleteCard(card.id);
        onClose();
        toast.success("Card deleted");
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  const toggleMember = (memberId: string) => {
    let newMembers: string[];
    const wasAssigned = assignedMembers.includes(memberId);
    if (wasAssigned) {
      newMembers = assignedMembers.filter((m) => m !== memberId);
    } else {
      newMembers = [...assignedMembers, memberId];
    }
    setAssignedMembers(newMembers);
    save({ assignedMembers: newMembers, lastUpdatedBy: user?.uid, lastUpdatedByName: user?.displayName || "Unknown" });

    // Log activity
    if (user && boardId) {
      logActivity({
        boardId,
        cardId: card.id,
        userId: user.uid,
        userName: user.displayName || "Unknown",
        userPhoto: user.photoURL,
        action: wasAssigned ? "card_unassigned" : "card_assigned",
        details: wasAssigned
          ? `unassigned a member from "${card.title}"`
          : `assigned a member to "${card.title}"`,
      });
    }
  };

  const checklistProgress = checklist.length > 0
    ? Math.round((checklist.filter((c) => c.completed).length / checklist.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-12 px-4" onClick={onClose}>
      <div
        className="bg-background rounded-xl w-full max-w-2xl border border-border shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-2">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-foreground p-1">
            <X size={20} />
          </button>

          {/* Labels display */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {labels.map((l) => (
                <span
                  key={l.id}
                  className="px-2 py-0.5 rounded text-xs text-white font-medium"
                  style={{ background: l.color }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          {editingTitle ? (
            <input
              className="text-xl font-semibold w-full bg-surface border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              autoFocus
            />
          ) : (
            <h2
              className="text-xl font-semibold cursor-pointer hover:bg-surface-hover rounded px-2 py-1 -ml-2"
              onClick={() => setEditingTitle(true)}
            >
              {card.title}
            </h2>
          )}

          {/* Assigned members */}
          {assignedMembers.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-muted mr-1">Members:</span>
              {assignedMembers.map((m) => (
                <div
                  key={m}
                  className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold"
                  title={m}
                >
                  {m[0]?.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_170px] gap-4 p-6 pt-2">
          {/* Main content */}
          <div className="space-y-5 min-w-0">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-muted mb-2">Description</h3>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                rows={4}
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescBlur}
              />
            </div>

            {/* Due date */}
            {dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted" />
                <span className={new Date(dueDate) < new Date() ? "text-accent font-medium" : ""}>
                  Due: {new Date(dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Checklist */}
            {checklist.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare size={14} className="text-muted" />
                  <h3 className="text-sm font-semibold text-muted">Checklist</h3>
                  <span className="text-xs text-muted ml-auto">{checklistProgress}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-1.5 mb-3">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleCheckItem(item.id)}
                        className="rounded border-border accent-primary"
                      />
                      <span className={`text-sm flex-1 ${item.completed ? "line-through text-muted" : ""}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => removeCheckItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add checklist item..."
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
              />
              <button
                onClick={addChecklistItem}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
              >
                Add
              </button>
            </div>

            {/* Attachments */}
            {(card.attachments?.length ?? 0) > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip size={14} className="text-muted" />
                  <h3 className="text-sm font-semibold text-muted">Attachments</h3>
                </div>
                <div className="space-y-2">
                  {card.attachments?.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface group">
                      <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary text-xs font-bold">
                        {att.name.split(".").pop()?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline truncate block"
                        >
                          {att.name}
                        </a>
                        <span className="text-xs text-muted">
                          {new Date(att.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} className="text-muted" />
                <h3 className="text-sm font-semibold text-muted">Comments</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <button
                  onClick={handleComment}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
                >
                  Send
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments
                  .filter((c) => c.cardId === card.id)
                  .map((c) => (
                    <div key={c.id} className="flex gap-2 group">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {c.userPhoto ? (
                          <img src={c.userPhoto} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          c.userName[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.userName}</span>
                          <span className="text-xs text-muted">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{c.text}</p>
                      </div>
                      {c.userId === user?.uid && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-opacity self-start"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Card Activity History */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <h3 className="text-sm font-semibold text-muted">Activity</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cardActivities.length === 0 ? (
                  <p className="text-xs text-muted">No activity on this card yet</p>
                ) : (
                  cardActivities.map((a) => (
                    <div key={a.id} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden mt-0.5">
                        {a.userPhoto ? (
                          <img src={a.userPhoto} alt="" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          a.userName[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="font-medium">{a.userName}</span>{" "}
                          <span className="text-muted">{a.details}</span>
                        </p>
                        <span className="text-[10px] text-muted">
                          {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Add to card</p>

            <button
              onClick={() => setShowMemberPicker(!showMemberPicker)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left"
            >
              <Users size={14} /> Members
            </button>
            {showMemberPicker && (
              <div className="bg-surface border border-border rounded-lg p-2 space-y-1">
                {boardMembers.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMember(m)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs ${
                      assignedMembers.includes(m) ? "bg-primary/20 text-primary" : "hover:bg-surface-hover"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLabelPicker(!showLabelPicker)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left"
            >
              <Tag size={14} /> Labels
            </button>
            {showLabelPicker && (
              <div className="bg-surface border border-border rounded-lg p-2 space-y-1">
                {LABEL_COLORS.map((l) => (
                  <button
                    key={l.color}
                    onClick={() => toggleLabel(l)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
                      labels.some((la) => la.color === l.color) ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="w-8 h-4 rounded" style={{ background: l.color }} />
                    {l.name}
                  </button>
                ))}
              </div>
            )}

            <div>
              <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors cursor-pointer">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full mt-1 px-2 py-1 text-xs rounded border border-border bg-surface text-foreground"
              />
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
              Attachment
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />

            <hr className="border-border my-2" />

            {/* Time Tracker */}
            {boardId && <TimeTracker card={card} boardId={boardId} />}

            <hr className="border-border my-2" />

            {/* AI Assistant */}
            <AIAssistant card={card} mode="card" />

            <hr className="border-border my-2" />

            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-sm transition-colors text-left"
            >
              <Trash2 size={14} /> Delete Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
