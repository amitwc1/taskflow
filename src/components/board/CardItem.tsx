"use client";

import { useState } from "react";
import type { Card as CardType } from "@/types";
import {
  Draggable,
} from "@hello-pangea/dnd";
import { Calendar, CheckSquare, MessageSquare, Paperclip, Pencil, Clock } from "lucide-react";

interface CardItemProps {
  card: CardType;
  index: number;
  onClick: () => void;
}

export default function CardItem({ card, index, onClick }: CardItemProps) {
  const [hovered, setHovered] = useState(false);
  const checklistTotal = card.checklist?.length || 0;
  const checklistDone = card.checklist?.filter((c) => c.completed).length || 0;
  const attachmentCount = card.attachments?.length || 0;
  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;
  const hasBadges = card.dueDate || checklistTotal > 0 || attachmentCount > 0 || (card.assignedMembers && card.assignedMembers.length > 0);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`relative bg-background rounded-lg border border-border p-2.5 cursor-pointer group transition-all duration-150 ${
            snapshot.isDragging
              ? "shadow-xl ring-2 ring-primary rotate-[2deg] scale-[1.02]"
              : "shadow-sm hover:shadow-md hover:ring-1 hover:ring-primary/30"
          }`}
        >
          {/* Quick action button (hover) */}
          {hovered && !snapshot.isDragging && (
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-surface hover:bg-surface-hover rounded flex items-center justify-center shadow-sm border border-border transition-colors z-10"
              title="Edit card"
            >
              <Pencil size={11} className="text-muted" />
            </button>
          )}

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((l) => (
                <span
                  key={l.id}
                  className="h-2 rounded-full transition-all duration-200 group-hover:h-4 group-hover:px-1.5 group-hover:text-[9px] group-hover:text-white group-hover:font-medium group-hover:leading-4 overflow-hidden"
                  style={{ background: l.color, width: hovered ? "auto" : "40px", minWidth: hovered ? "40px" : undefined }}
                  title={l.name}
                >
                  {hovered && <span>{l.name}</span>}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <p className="text-sm font-medium leading-snug pr-6">{card.title}</p>

          {/* Badges row */}
          {hasBadges && (
            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              {card.dueDate && (
                <span
                  className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
                    isOverdue
                      ? "bg-accent/15 text-accent font-medium"
                      : "text-muted"
                  }`}
                >
                  <Clock size={11} />
                  {new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
              {checklistTotal > 0 && (
                <span
                  className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
                    checklistDone === checklistTotal
                      ? "bg-green-500/15 text-green-600 font-medium"
                      : "text-muted"
                  }`}
                >
                  <CheckSquare size={11} />
                  {checklistDone}/{checklistTotal}
                </span>
              )}
              {attachmentCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <Paperclip size={11} />
                  {attachmentCount}
                </span>
              )}

              {/* Assigned member avatars */}
              {card.assignedMembers && card.assignedMembers.length > 0 && (
                <div className="flex -space-x-1.5 ml-auto">
                  {card.assignedMembers.slice(0, 3).map((m) => (
                    <div
                      key={m}
                      className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold border-2 border-background"
                      title={m}
                    >
                      {m[0]?.toUpperCase()}
                    </div>
                  ))}
                  {card.assignedMembers.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-surface text-muted flex items-center justify-center text-[10px] font-bold border-2 border-background">
                      +{card.assignedMembers.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
