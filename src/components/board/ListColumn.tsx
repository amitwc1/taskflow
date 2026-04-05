"use client";

import { useState, useRef, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useBoardStore } from "@/store/useBoardStore";
import CardItem from "./CardItem";
import type { Card, List } from "@/types";
import { MoreHorizontal, Plus, X, Trash2, Edit3, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface ListColumnProps {
  list: List;
  cards: Card[];
  index: number;
  onCardClick: (card: Card) => void;
}

export default function ListColumn({ list, cards, index, onCardClick }: ListColumnProps) {
  const { createCard, updateList, deleteList } = useBoardStore();
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const addCardRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddCard && addCardRef.current) {
      addCardRef.current.focus();
    }
  }, [showAddCard]);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    try {
      await createCard({
        listId: list.id,
        boardId: list.boardId,
        title: newCardTitle.trim(),
        description: "",
        order: cards.length,
        dueDate: null,
        labels: [],
        checklist: [],
        attachments: [],
        assignedMembers: [],
      });
      setNewCardTitle("");
      setShowAddCard(false);
    } catch {
      toast.error("Failed to create card");
    }
  };

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (listTitle.trim() && listTitle !== list.title) {
      await updateList(list.id, { title: listTitle.trim() });
    }
  };

  const handleDeleteList = async () => {
    if (confirm("Delete this list and all its cards?")) {
      try {
        await deleteList(list.id);
        toast.success("List deleted");
      } catch {
        toast.error("Failed to delete list");
      }
    }
  };

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-72 shrink-0"
        >
          <div className="bg-surface rounded-xl p-3 max-h-[calc(100vh-140px)] flex flex-col shadow-sm">
            {/* List header */}
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between mb-2 px-1"
            >
              {editingTitle ? (
                <input
                  className="font-semibold text-sm bg-background border border-border rounded px-2 py-1 flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3
                    className="font-semibold text-sm cursor-pointer hover:bg-surface-hover rounded px-1 py-0.5 truncate"
                    onClick={() => setEditingTitle(true)}
                  >
                    {list.title}
                  </h3>
                  <span className="text-[10px] text-muted bg-background/80 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                    {cards.length}
                  </span>
                </div>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-surface-hover rounded transition-colors text-muted"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-background border border-border rounded-lg shadow-xl z-10 w-48 py-1 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted border-b border-border mb-1">
                      List actions
                    </div>
                    <button
                      onClick={() => {
                        setEditingTitle(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover text-left"
                    >
                      <Edit3 size={14} /> Rename list
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteList();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover text-left text-accent"
                    >
                      <Trash2 size={14} /> Delete list
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cards dropzone */}
            <Droppable droppableId={list.id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto list-scroll space-y-2 min-h-1 rounded-lg transition-colors px-0.5 ${
                    snapshot.isDraggingOver ? "bg-primary/5" : ""
                  }`}
                >
                  {cards.map((card, cardIndex) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      index={cardIndex}
                      onClick={() => onCardClick(card)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add card */}
            {showAddCard ? (
              <div className="mt-2">
                <input
                  ref={addCardRef}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter card title..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCard();
                    if (e.key === "Escape") setShowAddCard(false);
                  }}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleAddCard}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="p-1.5 hover:bg-surface-hover rounded transition-colors text-muted"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCard(true)}
                className="mt-2 flex items-center gap-1 w-full px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface-hover transition-colors"
              >
                <Plus size={16} /> Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
