"use client";

import { useState, useMemo } from "react";
import type { Card, List } from "@/types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  cards: Card[];
  lists: List[];
  onCardClick: (card: Card) => void;
}

export default function CalendarView({ cards, lists, onCardClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const cardsWithDates = useMemo(
    () => cards.filter((c) => c.dueDate),
    [cards]
  );

  const getCardsForDay = (day: Date) =>
    cardsWithDates.filter((c) => isSameDay(new Date(c.dueDate!), day));

  const getListTitle = (listId: string) =>
    lists.find((l) => l.id === listId)?.title || "";

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-background/90 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-semibold text-muted"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1">
          {days.map((day, idx) => {
            const dayCards = getCardsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={idx}
                className={`min-h-[100px] border-b border-r border-border p-1 ${
                  !isCurrentMonth ? "opacity-40" : ""
                } ${isToday ? "bg-primary/5" : ""}`}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? "bg-primary text-white" : "text-muted"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayCards.slice(0, 3).map((card) => {
                    const isOverdue = card.dueDate! < Date.now();
                    return (
                      <button
                        key={card.id}
                        onClick={() => onCardClick(card)}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate transition-colors ${
                          isOverdue
                            ? "bg-accent/20 text-accent hover:bg-accent/30"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                        title={`${card.title} — ${getListTitle(card.listId)}`}
                      >
                        {card.title}
                      </button>
                    );
                  })}
                  {dayCards.length > 3 && (
                    <span className="text-[10px] text-muted px-1">
                      +{dayCards.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
