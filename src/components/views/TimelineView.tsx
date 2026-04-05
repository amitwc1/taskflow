"use client";

import { useState, useMemo } from "react";
import type { Card, List } from "@/types";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  format,
  isSameDay,
  differenceInDays,
  eachDayOfInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineViewProps {
  cards: Card[];
  lists: List[];
  onCardClick: (card: Card) => void;
}

export default function TimelineView({ cards, lists, onCardClick }: TimelineViewProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [renderedAt] = useState(() => Date.now());
  const numWeeks = 4;
  const startDate = weekStart;
  const endDate = addDays(addWeeks(weekStart, numWeeks), -1);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const totalDays = days.length;

  const cardsWithDates = useMemo(
    () =>
      cards
        .filter((c) => c.dueDate)
        .sort((a, b) => a.dueDate! - b.dueDate!),
    [cards]
  );

  const getListTitle = (listId: string) =>
    lists.find((l) => l.id === listId)?.title || "";

  const getCardPosition = (card: Card) => {
    const created = card.createdAt;
    const due = card.dueDate!;
    const cardStart = Math.max(created, startDate.getTime());
    const cardEnd = Math.min(due, endDate.getTime());

    if (cardEnd < startDate.getTime() || cardStart > endDate.getTime()) {
      return null;
    }

    const left =
      (Math.max(0, differenceInDays(new Date(cardStart), startDate)) / totalDays) * 100;
    const width =
      (Math.max(1, differenceInDays(new Date(cardEnd), new Date(cardStart)) + 1) / totalDays) * 100;

    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const COLORS = [
    "bg-blue-500/70",
    "bg-green-500/70",
    "bg-purple-500/70",
    "bg-orange-500/70",
    "bg-pink-500/70",
    "bg-teal-500/70",
    "bg-yellow-500/70",
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {format(startDate, "MMM d")} — {format(endDate, "MMM d, yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 bg-background/90 backdrop-blur-sm rounded-xl border border-border overflow-auto">
        {/* Day headers */}
        <div className="flex border-b border-border sticky top-0 bg-background z-10">
          <div className="w-40 shrink-0 p-2 border-r border-border text-xs font-semibold text-muted">
            Card
          </div>
          <div className="flex-1 flex">
            {days.map((day, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[40px] p-1 text-center text-[10px] border-r border-border ${
                  isSameDay(day, new Date())
                    ? "bg-primary/10 font-bold text-primary"
                    : "text-muted"
                } ${day.getDay() === 0 || day.getDay() === 6 ? "bg-surface/50" : ""}`}
              >
                <div>{format(day, "EEE")}</div>
                <div>{format(day, "d")}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card rows */}
        {cardsWithDates.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">
            No cards with due dates to display
          </div>
        ) : (
          cardsWithDates.map((card, idx) => {
            const position = getCardPosition(card);
            const listTitle = getListTitle(card.listId);
            const isOverdue = card.dueDate! < renderedAt;

            return (
              <div key={card.id} className="flex border-b border-border hover:bg-surface/30">
                <div className="w-40 shrink-0 p-2 border-r border-border">
                  <button
                    onClick={() => onCardClick(card)}
                    className="text-xs font-medium text-foreground hover:text-primary truncate block w-full text-left"
                  >
                    {card.title}
                  </button>
                  <span className="text-[10px] text-muted">{listTitle}</span>
                </div>
                <div className="flex-1 relative h-10">
                  {position && (
                    <div
                      onClick={() => onCardClick(card)}
                      className={`absolute top-1.5 h-6 rounded cursor-pointer transition-opacity hover:opacity-90 flex items-center px-1.5 ${
                        isOverdue ? "bg-accent/70" : COLORS[idx % COLORS.length]
                      }`}
                      style={{ left: position.left, width: position.width, minWidth: "20px" }}
                    >
                      <span className="text-[10px] text-white truncate font-medium">
                        {card.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
