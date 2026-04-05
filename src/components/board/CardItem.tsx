"use client";

import { useEffect, useMemo, useState } from "react";
import type { Card as CardType } from "@/types";
import { useUserStore } from "@/store/useUserStore";
import {
  Draggable,
} from "@hello-pangea/dnd";
import { CheckSquare, Paperclip, Pencil, Clock } from "lucide-react";
import AvatarGroup from "@/components/ui/AvatarGroup";
import LabelTag from "@/components/ui/LabelTag";

interface CardItemProps {
  card: CardType;
  index: number;
  onClick: () => void;
}

export default function CardItem({ card, index, onClick }: CardItemProps) {
  const [hovered, setHovered] = useState(false);
  const usersById = useUserStore((state) => state.usersById);
  const ensureUsers = useUserStore((state) => state.ensureUsers);
  const checklistTotal = card.checklist?.length || 0;
  const checklistDone = card.checklist?.filter((c) => c.completed).length || 0;
  const attachmentCount = card.attachments?.length || 0;
  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;
  const hasBadges = card.dueDate || checklistTotal > 0 || attachmentCount > 0 || (card.assignedMembers && card.assignedMembers.length > 0);

  useEffect(() => {
    ensureUsers(card.assignedMembers || []);
  }, [card.assignedMembers, ensureUsers]);

  const assignedUsers = useMemo(
    () =>
      (card.assignedMembers || []).map((memberId) => ({
        id: memberId,
        name: usersById[memberId]?.name || memberId,
        photo: usersById[memberId]?.photoURL || null,
      })),
    [card.assignedMembers, usersById]
  );

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
            <div className="flex flex-wrap gap-1 mb-2 overflow-hidden max-w-full">
              {card.labels.map((l) => (
                <LabelTag
                  key={l.id}
                  color={l.color}
                  name={l.name}
                  variant="compact"
                />
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
                <AvatarGroup users={assignedUsers} max={3} size="sm" className="ml-auto" />
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
