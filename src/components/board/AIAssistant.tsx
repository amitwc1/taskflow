"use client";

import { useState } from "react";
import { isAIConfigured, generateSubtasks, suggestDueDate, summarizeBoardProgress } from "@/services/aiService";
import { useBoardStore } from "@/store/useBoardStore";
import type { Card, List, ChecklistItem } from "@/types";
import { Sparkles, Loader2, Wand2, CalendarClock, BarChart3 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

interface AIAssistantProps {
  card?: Card;
  lists?: List[];
  cards?: Card[];
  mode: "card" | "board";
}

export default function AIAssistant({ card, lists, cards, mode }: AIAssistantProps) {
  const { updateCard } = useBoardStore();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  if (!isAIConfigured()) {
    return null;
  }

  const handleGenerateSubtasks = async () => {
    if (!card) return;
    setLoading(true);
    try {
      const subtasks = await generateSubtasks(card.title, card.description);
      const newItems: ChecklistItem[] = subtasks.map((text) => ({
        id: uuidv4(),
        text,
        completed: false,
      }));
      await updateCard(card.id, {
        checklist: [...(card.checklist || []), ...newItems],
      });
      toast.success(`Generated ${subtasks.length} subtasks`);
    } catch {
      toast.error("Failed to generate subtasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestDueDate = async () => {
    if (!card) return;
    setLoading(true);
    try {
      const daysStr = await suggestDueDate(card.title, card.description);
      const days = parseInt(daysStr, 10);
      const dueDate = Date.now() + days * 24 * 60 * 60 * 1000;
      await updateCard(card.id, { dueDate });
      toast.success(`Due date set to ${days} days from now`);
    } catch {
      toast.error("Failed to suggest due date");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!lists || !cards) return;
    setLoading(true);
    try {
      const result = await summarizeBoardProgress(lists, cards);
      setSummary(result);
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm">
        <Loader2 size={14} className="animate-spin" />
        AI is thinking...
      </div>
    );
  }

  if (mode === "card") {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={12} /> AI Assistant
        </p>
        <button
          onClick={handleGenerateSubtasks}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left"
        >
          <Wand2 size={14} className="text-purple-400" /> Generate Subtasks
        </button>
        <button
          onClick={handleSuggestDueDate}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm transition-colors text-left"
        >
          <CalendarClock size={14} className="text-purple-400" /> Suggest Due Date
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleSummarize}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
      >
        <BarChart3 size={14} className="text-purple-300" /> AI Summary
      </button>
      {summary && (
        <div className="mt-2 p-3 bg-black/20 backdrop-blur-sm rounded-lg text-sm text-white/80 max-w-md">
          {summary}
        </div>
      )}
    </div>
  );
}
