"use client";

import { useEffect, useMemo, useState } from "react";
import type { Card, List } from "@/types";
import { useUserStore } from "@/store/useUserStore";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import AvatarGroup from "@/components/ui/AvatarGroup";
import LabelTag from "@/components/ui/LabelTag";

interface TableViewProps {
  cards: Card[];
  lists: List[];
  onCardClick: (card: Card) => void;
}

type SortKey = "title" | "list" | "dueDate" | "labels" | "members" | "checklist";
type SortDir = "asc" | "desc";

export default function TableView({ cards, lists, onCardClick }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const usersById = useUserStore((state) => state.usersById);
  const ensureUsers = useUserStore((state) => state.ensureUsers);
  const [renderedAt] = useState(() => Date.now());

  const listTitles = useMemo(
    () => Object.fromEntries(lists.map((list) => [list.id, list.title])),
    [lists]
  );

  const getListTitle = (listId: string) => listTitles[listId] || "";

  useEffect(() => {
    ensureUsers(cards.flatMap((card) => card.assignedMembers || []));
  }, [cards, ensureUsers]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedCards = (() => {
    const sorted = [...cards];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "list":
          cmp = getListTitle(a.listId).localeCompare(getListTitle(b.listId));
          break;
        case "dueDate":
          cmp = (a.dueDate || Infinity) - (b.dueDate || Infinity);
          break;
        case "labels":
          cmp = (a.labels?.length || 0) - (b.labels?.length || 0);
          break;
        case "members":
          cmp = (a.assignedMembers?.length || 0) - (b.assignedMembers?.length || 0);
          break;
        case "checklist": {
          const aDone = a.checklist?.filter((c) => c.completed).length || 0;
          const bDone = b.checklist?.filter((c) => c.completed).length || 0;
          cmp = aDone - bDone;
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  })();

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-muted/50" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      <h2 className="text-lg font-bold text-white mb-4">Table View</h2>

      <div className="flex-1 bg-background/90 backdrop-blur-sm rounded-xl border border-border overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-border">
              {[
                { key: "title" as SortKey, label: "Title", className: "min-w-[200px]" },
                { key: "list" as SortKey, label: "List", className: "min-w-[120px]" },
                { key: "dueDate" as SortKey, label: "Due Date", className: "min-w-[120px]" },
                { key: "labels" as SortKey, label: "Labels", className: "min-w-[150px]" },
                { key: "members" as SortKey, label: "Members", className: "min-w-[120px]" },
                { key: "checklist" as SortKey, label: "Progress", className: "min-w-[100px]" },
              ].map(({ key, label, className }) => (
                <th key={key} className={`text-left ${className}`}>
                  <button
                    onClick={() => toggleSort(key)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-muted hover:text-foreground w-full"
                  >
                    {label} <SortIcon col={key} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCards.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted text-sm">
                  No cards to display
                </td>
              </tr>
            ) : (
              sortedCards.map((card) => {
                const isOverdue = card.dueDate ? card.dueDate < renderedAt : false;
                const checkTotal = card.checklist?.length || 0;
                const checkDone = card.checklist?.filter((c) => c.completed).length || 0;
                const progress = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : -1;

                return (
                  <tr
                    key={card.id}
                    onClick={() => onCardClick(card)}
                    className="border-b border-border hover:bg-surface/50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-sm font-medium">{card.title}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs px-2 py-1 rounded-full bg-surface text-muted font-medium">
                        {getListTitle(card.listId)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {card.dueDate ? (
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            isOverdue ? "text-accent font-medium" : "text-muted"
                          }`}
                        >
                          <Calendar size={12} />
                          {format(new Date(card.dueDate), "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span className="text-xs text-muted/50">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {card.labels?.map((l) => (
                          <LabelTag
                            key={l.id}
                            color={l.color}
                            name={l.name}
                            variant="compact"
                            className="w-6 h-3 hover:w-auto hover:px-2"
                          />
                        ))}
                        {(!card.labels || card.labels.length === 0) && (
                          <span className="text-xs text-muted/50">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center">
                        {(card.assignedMembers?.length || 0) > 0 && (
                          <AvatarGroup
                            users={(card.assignedMembers || []).map((memberId) => ({
                              id: memberId,
                              name: usersById[memberId]?.name || memberId,
                              photo: usersById[memberId]?.photoURL || null,
                            }))}
                            max={3}
                            size="sm"
                          />
                        )}
                        {(!card.assignedMembers || card.assignedMembers.length === 0) && (
                          <span className="text-xs text-muted/50">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {progress >= 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-surface rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                progress === 100 ? "bg-green-500" : "bg-primary"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted">{progress}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted/50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
