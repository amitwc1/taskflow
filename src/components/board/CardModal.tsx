"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Calendar, CheckSquare, Download, Eye, FileText, Image as ImageIcon, Loader2, MessageSquare, Paperclip, Plus, Save, Tag, Trash2, Users, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useActivityStore } from "@/store/useActivityStore";
import { useUserStore } from "@/store/useUserStore";
import type { Attachment, Card, ChecklistItem, Label } from "@/types";
import { logActivity } from "@/services/activityService";
import { canPreviewAttachment, formatAttachmentSize, isImageAttachment, isPdfAttachment } from "@/services/attachmentService";
import { LABEL_COLOR_OPTIONS, createLabel, deleteLabel as deleteLabelFromList, updateLabel as updateLabelInList } from "@/services/labelService";
import TimeTracker from "./TimeTracker";
import AIAssistant from "./AIAssistant";

interface CardModalProps {
  card: Card;
  onClose: () => void;
  boardMembers: string[];
  boardId?: string;
}

function getAttachmentIcon(attachment: Attachment) {
  if (isPdfAttachment(attachment)) return <FileText size={16} className="text-red-500" />;
  if (isImageAttachment(attachment)) return <ImageIcon size={16} className="text-sky-500" />;
  return <Paperclip size={16} className="text-primary" />;
}

export default function CardModal({ card, onClose, boardMembers, boardId }: CardModalProps) {
  const { updateCard, updateCardLabels, updateCardMembers, addCardAttachment, removeCardAttachment, deleteCard, addComment, deleteComment, subscribeComments, comments } = useBoardStore();
  const user = useAuthStore((s) => s.user);
  const { cardActivities, subscribeCard: subscribeCardActivities, clearCardActivities } = useActivityStore();
  const usersById = useUserStore((state) => state.usersById);
  const ensureUsers = useUserStore((state) => state.ensureUsers);

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
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState<string>(LABEL_COLOR_OPTIONS[0]?.color || "#61bd4f");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [previewAttachmentId, setPreviewAttachmentId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeComments(card.id), [card.id, subscribeComments]);
  useEffect(() => {
    const unsub = subscribeCardActivities(card.id);
    return () => { unsub(); clearCardActivities(); };
  }, [card.id, subscribeCardActivities, clearCardActivities]);
  useEffect(() => { ensureUsers([...boardMembers, ...(card.assignedMembers || [])]); }, [boardMembers, card.assignedMembers, ensureUsers]);
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || "");
    setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "");
    setLabels(card.labels || []);
    setChecklist(card.checklist || []);
    setAssignedMembers(card.assignedMembers || []);
  }, [card]);

  const memberProfiles = useMemo(() => boardMembers.map((memberId) => ({
    id: memberId,
    name: usersById[memberId]?.name || memberId,
    photoURL: usersById[memberId]?.photoURL || null,
    email: usersById[memberId]?.email || "",
  })), [boardMembers, usersById]);

  const previewAttachment = previewAttachmentId ? (card.attachments || []).find((attachment) => attachment.id === previewAttachmentId) || null : null;
  const checklistProgress = checklist.length > 0 ? Math.round((checklist.filter((item) => item.completed).length / checklist.length) * 100) : 0;

  const save = async (data: Partial<Card>) => {
    try {
      await updateCard(card.id, data);
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (title.trim() && title !== card.title) {
      save({ title: title.trim(), lastUpdatedBy: user?.uid, lastUpdatedByName: user?.displayName || "Unknown" });
    }
  };

  const handleDescBlur = () => {
    if (description !== card.description) {
      save({ description, lastUpdatedBy: user?.uid, lastUpdatedByName: user?.displayName || "Unknown" });
    }
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    save({ dueDate: val ? new Date(val).getTime() : null });
  };
  const resetLabelEditor = () => {
    setEditingLabelId(null);
    setLabelName("");
    setLabelColor(LABEL_COLOR_OPTIONS[0]?.color || "#61bd4f");
  };

  const handleSaveLabel = async () => {
    try {
      const newLabels = editingLabelId
        ? updateLabelInList(labels, editingLabelId, { name: labelName, color: labelColor })
        : [...labels, createLabel({ name: labelName, color: labelColor })];
      setLabels(newLabels);
      await updateCardLabels(card.id, newLabels);
      resetLabelEditor();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save label");
    }
  };

  const editLabel = (label: Label) => {
    setEditingLabelId(label.id);
    setLabelName(label.name);
    setLabelColor(label.color);
    setShowLabelPicker(true);
  };

  const deleteLabel = async (labelId: string) => {
    const newLabels = deleteLabelFromList(labels, labelId);
    setLabels(newLabels);
    await updateCardLabels(card.id, newLabels);
    if (editingLabelId === labelId) resetLabelEditor();
  };

  const addChecklistItem = () => {
    if (!newCheckItem.trim()) return;
    const newList = [...checklist, { id: uuidv4(), text: newCheckItem.trim(), completed: false }];
    setChecklist(newList);
    setNewCheckItem("");
    save({ checklist: newList });
  };

  const toggleCheckItem = (id: string) => {
    const newList = checklist.map((item) => item.id === id ? { ...item, completed: !item.completed } : item);
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
    if (!file || !user) return;
    setUploading(true);
    try {
      const attachment = await addCardAttachment(card.id, file, user.uid);
      setPreviewAttachmentId(canPreviewAttachment(attachment) ? attachment.id : null);
      toast.success("File uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    await removeCardAttachment(card.id, attachmentId);
    if (previewAttachmentId === attachmentId) setPreviewAttachmentId(null);
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

  const toggleMember = async (memberId: string) => {
    const wasAssigned = assignedMembers.includes(memberId);
    const newMembers = wasAssigned ? assignedMembers.filter((m) => m !== memberId) : [...assignedMembers, memberId];
    setAssignedMembers(newMembers);
    await updateCardMembers(card.id, newMembers);
    if (user && boardId) {
      logActivity({
        boardId,
        cardId: card.id,
        userId: user.uid,
        userName: user.displayName || "Unknown",
        userPhoto: user.photoURL,
        action: wasAssigned ? "card_unassigned" : "card_assigned",
        details: wasAssigned ? `unassigned ${usersById[memberId]?.name || memberId} from "${card.title}"` : `assigned ${usersById[memberId]?.name || memberId} to "${card.title}"`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-12 px-4" onClick={onClose}>
      <div className="bg-background rounded-xl w-full max-w-2xl border border-border shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 pb-2">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-foreground p-1"><X size={20} /></button>

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {labels.map((l) => (
                <button key={l.id} className="px-2 py-0.5 rounded text-xs text-white font-medium hover:opacity-80 transition-opacity" style={{ background: l.color }} onClick={() => editLabel(l)} title={`Click to edit "${l.name}"`}>{l.name}</button>
              ))}
            </div>
          )}

          {/* Title */}
          {editingTitle ? (
            <input className="text-xl font-semibold w-full bg-surface border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleBlur} onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()} autoFocus />
          ) : (
            <h2 className="text-xl font-semibold cursor-pointer hover:bg-surface-hover rounded px-2 py-1 -ml-2" onClick={() => setEditingTitle(true)}>{card.title}</h2>
          )}

          {/* Assigned members with avatars + names */}
          {assignedMembers.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-muted mr-1">Members:</span>
              {assignedMembers.map((m) => {
                const member = usersById[m];
                return (
                  <div key={m} className="flex items-center gap-1.5 rounded-full bg-surface px-2 py-1" title={member?.name || m}>
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold overflow-hidden">
                      {member?.photoURL ? <img src={member.photoURL} alt={member.name} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" /> : (member?.name || m)[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs">{member?.name || m}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_170px] gap-4 p-6 pt-2">
          {/* Main content */}
          <div className="space-y-5 min-w-0">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-muted mb-2">Description</h3>
              <textarea className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm" rows={4} placeholder="Add a description..." value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleDescBlur} />
            </div>

            {/* Due date */}
            {dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted" />
                <span className={new Date(dueDate) < new Date() ? "text-accent font-medium" : ""}>Due: {new Date(dueDate).toLocaleDateString()}</span>
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
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${checklistProgress}%` }} />
                </div>
                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <input type="checkbox" checked={item.completed} onChange={() => toggleCheckItem(item.id)} className="rounded border-border accent-primary" />
                      <span className={`text-sm flex-1 ${item.completed ? "line-through text-muted" : ""}`}>{item.text}</span>
                      <button onClick={() => removeCheckItem(item.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-opacity"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Add checklist item..." value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChecklistItem()} />
              <button onClick={addChecklistItem} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors">Add</button>
            </div>

            {/* Attachments */}
            {(card.attachments || []).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip size={14} className="text-muted" />
                  <h3 className="text-sm font-semibold text-muted">Attachments</h3>
                </div>
                <div className="space-y-2">
                  {(card.attachments || []).map((att) => (
                    <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface group">
                      <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {isImageAttachment(att) ? (
                          <img src={att.url} alt={att.name} className="w-12 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        ) : getAttachmentIcon(att)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {att.size != null && <span>{formatAttachmentSize(att.size)}</span>}
                          <span>{new Date(att.createdAt || att.uploadedAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {canPreviewAttachment(att) && (
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted hover:text-primary transition-colors" title="Preview"><Eye size={14} /></a>
                        )}
                        <a href={att.url} target="_blank" rel="noopener noreferrer" download={att.name} className="p-1.5 text-muted hover:text-primary transition-colors" title="Download"><Download size={14} /></a>
                        <button onClick={() => removeAttachment(att.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-accent transition-all" title="Remove"><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview overlay for images */}
            {previewAttachment && isImageAttachment(previewAttachment) && (
              <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center" onClick={() => setPreviewAttachmentId(null)}>
                <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setPreviewAttachmentId(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300"><X size={24} /></button>
                  <img src={previewAttachment.url} alt={previewAttachment.name} className="max-w-full max-h-[90vh] rounded-lg" referrerPolicy="no-referrer" />
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
                <input className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} />
                <button onClick={handleComment} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors">Send</button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.filter((c) => c.cardId === card.id).map((c) => (
                  <div key={c.id} className="flex gap-2 group">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {c.userPhoto ? <img src={c.userPhoto} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" /> : c.userName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.userName}</span>
                        <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{c.text}</p>
                    </div>
                    {c.userId === user?.uid && (
                      <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-opacity self-start"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                <h3 className="text-sm font-semibold text-muted">Activity</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cardActivities.length === 0 ? (
                  <p className="text-xs text-muted">No activity on this card yet</p>
                ) : cardActivities.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden mt-0.5">
                      {a.userPhoto ? <img src={a.userPhoto} alt="" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" /> : a.userName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs"><span className="font-medium">{a.userName}</span> <span className="text-muted">{a.details}</span></p>
                      <span className="text-[10px] text-muted">{formatDistanceToNow(a.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Add to card</p>

            {/* Members */}
            <button onClick={() => setShowMemberPicker(!showMemberPicker)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left"><Users size={14} /> Members</button>
            {showMemberPicker && (
              <div className="bg-surface border border-border rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
                {memberProfiles.map((m) => (
                  <button key={m.id} onClick={() => toggleMember(m.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left ${assignedMembers.includes(m.id) ? "bg-primary/20 text-primary" : "hover:bg-surface-hover"}`}>
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold shrink-0 overflow-hidden">
                      {m.photoURL ? <img src={m.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" /> : (m.name[0] || "?").toUpperCase()}
                    </div>
                    <span className="truncate">{m.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Labels */}
            <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left"><Tag size={14} /> Labels</button>
            {showLabelPicker && (
              <div className="bg-surface border border-border rounded-lg p-2 space-y-2">
                {labels.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted uppercase tracking-wider font-semibold px-1">Current labels</p>
                    {labels.map((l) => (
                      <div key={l.id} className="flex items-center gap-1.5">
                        <div className="w-6 h-4 rounded" style={{ background: l.color }} />
                        <span className="text-xs flex-1 truncate">{l.name}</span>
                        <button onClick={() => editLabel(l)} className="p-0.5 text-muted hover:text-foreground transition-colors" title="Edit"><Save size={10} /></button>
                        <button onClick={() => deleteLabel(l.id)} className="p-0.5 text-muted hover:text-accent transition-colors" title="Remove"><X size={10} /></button>
                      </div>
                    ))}
                    <hr className="border-border" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted uppercase tracking-wider font-semibold px-1">{editingLabelId ? "Edit label" : "Create label"}</p>
                  <input className="w-full px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Label name..." value={labelName} onChange={(e) => setLabelName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveLabel()} />
                  <div className="flex flex-wrap gap-1">
                    {LABEL_COLOR_OPTIONS.map((c) => (
                      <button key={c.color} onClick={() => setLabelColor(c.color)} className={`w-5 h-5 rounded transition-all ${labelColor === c.color ? "ring-2 ring-primary ring-offset-1" : ""}`} style={{ background: c.color }} title={c.name} />
                    ))}
                  </div>
                  {labelName.trim() && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] text-white font-medium" style={{ background: labelColor }}>{labelName.trim()}</span>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button onClick={handleSaveLabel} disabled={!labelName.trim()} className="flex-1 px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus size={12} className="inline mr-1" />{editingLabelId ? "Save" : "Add"}
                    </button>
                    {editingLabelId && (
                      <button onClick={resetLabelEditor} className="px-2 py-1 bg-surface-hover rounded text-xs">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Due date */}
            <div>
              <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors cursor-pointer"><Calendar size={14} /> Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => handleDueDateChange(e.target.value)} className="w-full mt-1 px-2 py-1 text-xs rounded border border-border bg-surface text-foreground" />
            </div>

            {/* Attachment */}
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
              {uploading ? "Uploading..." : "Attachment"}
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />

            <hr className="border-border my-2" />
            {boardId && <TimeTracker card={card} boardId={boardId} />}
            <hr className="border-border my-2" />
            <AIAssistant card={card} mode="card" />
            <hr className="border-border my-2" />

            <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-sm transition-colors text-left"><Trash2 size={14} /> Delete Card</button>
          </div>
        </div>
      </div>
    </div>
  );
}
