"use client";

import { useState } from "react";
import { useAutomationStore } from "@/store/useAutomationStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { AutomationRule, AutomationTrigger, AutomationActionType, List } from "@/types";
import { Zap, Plus, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

interface AutomationPanelProps {
  boardId: string;
  lists: List[];
  members: string[];
  open: boolean;
  onClose: () => void;
}

const TRIGGERS: { value: AutomationTrigger; label: string }[] = [
  { value: "card_moved_to_list", label: "Card moved to list" },
  { value: "card_created", label: "Card created" },
  { value: "label_added", label: "Label added" },
  { value: "checklist_completed", label: "All checklist items done" },
  { value: "due_date_passed", label: "Due date passed" },
];

const ACTIONS: { value: AutomationActionType; label: string }[] = [
  { value: "move_card", label: "Move card to list" },
  { value: "assign_member", label: "Assign member" },
  { value: "add_label", label: "Add label" },
  { value: "set_due_date", label: "Set due date (days from now)" },
  { value: "send_notification", label: "Send notification" },
];

export default function AutomationPanel({
  boardId,
  lists,
  members,
  open,
  onClose,
}: AutomationPanelProps) {
  const user = useAuthStore((s) => s.user);
  const { rules, create, update, remove } = useAutomationStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<AutomationTrigger>("card_moved_to_list");
  const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});
  const [actionType, setActionType] = useState<AutomationActionType>("move_card");
  const [actionConfig, setActionConfig] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    try {
      await create({
        boardId,
        name: name.trim(),
        enabled: true,
        trigger,
        triggerConfig,
        actionType,
        actionConfig,
        createdBy: user.uid,
      });
      setShowForm(false);
      setName("");
      setTriggerConfig({});
      setActionConfig({});
      toast.success("Automation created");
    } catch {
      toast.error("Failed to create automation");
    }
  };

  const toggleRule = async (rule: AutomationRule) => {
    await update(rule.id, { enabled: !rule.enabled });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <h3 className="font-semibold">Automations</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Create button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted hover:border-primary hover:text-primary transition-colors mb-4"
            >
              <Plus size={16} /> Create Automation
            </button>
          )}

          {/* Create form */}
          {showForm && (
            <div className="bg-surface rounded-xl p-4 mb-4 space-y-3">
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Rule name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />

              <div>
                <label className="block text-xs font-medium text-muted mb-1">When (Trigger)</label>
                <select
                  value={trigger}
                  onChange={(e) => {
                    setTrigger(e.target.value as AutomationTrigger);
                    setTriggerConfig({});
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TRIGGERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {trigger === "card_moved_to_list" && (
                <select
                  value={triggerConfig.listId || ""}
                  onChange={(e) => setTriggerConfig({ listId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select list...</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              )}

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Then (Action)</label>
                <select
                  value={actionType}
                  onChange={(e) => {
                    setActionType(e.target.value as AutomationActionType);
                    setActionConfig({});
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {actionType === "move_card" && (
                <select
                  value={actionConfig.listId || ""}
                  onChange={(e) => setActionConfig({ listId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select destination list...</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              )}

              {actionType === "assign_member" && (
                <select
                  value={actionConfig.memberId || ""}
                  onChange={(e) => setActionConfig({ memberId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select member...</option>
                  {members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}

              {actionType === "set_due_date" && (
                <input
                  type="number"
                  min="1"
                  placeholder="Days from now..."
                  value={actionConfig.daysFromNow || ""}
                  onChange={(e) => setActionConfig({ daysFromNow: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rules list */}
          <div className="space-y-2">
            {rules.length === 0 && !showForm ? (
              <div className="text-center py-8 text-muted text-sm">
                No automations yet
              </div>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 rounded-xl border ${
                    rule.enabled ? "border-primary/30 bg-primary/5" : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap
                        size={14}
                        className={rule.enabled ? "text-primary" : "text-muted"}
                      />
                      <span className="text-sm font-medium">{rule.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleRule(rule)}
                        className="p-1 hover:bg-surface-hover rounded transition-colors"
                      >
                        {rule.enabled ? (
                          <ToggleRight size={18} className="text-primary" />
                        ) : (
                          <ToggleLeft size={18} className="text-muted" />
                        )}
                      </button>
                      <button
                        onClick={() => remove(rule.id)}
                        className="p-1 hover:bg-surface-hover rounded transition-colors text-muted hover:text-accent"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    When: {TRIGGERS.find((t) => t.value === rule.trigger)?.label} →{" "}
                    {ACTIONS.find((a) => a.value === rule.actionType)?.label}
                  </p>
                  {rule.executionCount > 0 && (
                    <p className="text-[10px] text-muted mt-1">
                      Executed {rule.executionCount} time{rule.executionCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
