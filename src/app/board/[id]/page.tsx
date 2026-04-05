"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useActivityStore } from "@/store/useActivityStore";
import { useAutomationStore } from "@/store/useAutomationStore";
import { useTimeTrackingStore } from "@/store/useTimeTrackingStore";
import { useSearchStore } from "@/store/useSearchStore";
import { usePresenceStore } from "@/store/usePresenceStore";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ListColumn from "@/components/board/ListColumn";
import SearchFilterBar from "@/components/board/SearchFilterBar";
import PresenceAvatars from "@/components/board/PresenceAvatars";
import ViewSwitcher from "@/components/views/ViewSwitcher";
import type { Card, ViewMode } from "@/types";
import { Plus, X, ArrowLeft, UserPlus, Settings, Loader2, Activity, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logActivity } from "@/services/activityService";
import { executeAutomations } from "@/services/automationService";

// Lazy-load heavy modals & panels — only downloaded when opened
const CardModal = dynamic(() => import("@/components/board/CardModal"));
const InviteModal = dynamic(() => import("@/components/board/InviteModal"));
const BoardSettings = dynamic(() => import("@/components/board/BoardSettings"));
const ActivityLog = dynamic(() => import("@/components/board/ActivityLog"));
const AutomationPanel = dynamic(() => import("@/components/board/AutomationPanel"));
const AIAssistant = dynamic(() => import("@/components/board/AIAssistant"));
const CalendarView = dynamic(() => import("@/components/views/CalendarView"));
const TimelineView = dynamic(() => import("@/components/views/TimelineView"));
const TableView = dynamic(() => import("@/components/views/TableView"));

function BoardContent() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const user = useAuthStore((s) => s.user);
  const {
    currentBoard, lists, cards, boardLoading,
    subscribeBoard, subscribeLists, subscribeCards,
    createList, clearBoard,
  } = useBoardStore();
  const { subscribe: subscribeActivities } = useActivityStore();
  const { subscribe: subscribeAutomations } = useAutomationStore();
  const { subscribeLogs: subscribeTimeLogs } = useTimeTrackingStore();
  const { filterCards, subscribePresets } = useSearchStore();
  const { startTracking, subscribeOnlineUsers, reset: resetPresence } = usePresenceStore();
  const { subscribeMemberList, setCurrentUserRole, reset: resetCollab } = useCollaborationStore();

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  useEffect(() => {
    if (!boardId) return;
    const unsub1 = subscribeBoard(boardId);
    const unsub2 = subscribeLists(boardId);
    const unsub3 = subscribeCards(boardId);
    const unsub4 = subscribeActivities(boardId);
    const unsub5 = subscribeAutomations(boardId);
    const unsub6 = subscribeTimeLogs(boardId);
    const unsub7 = user ? subscribePresets(boardId, user.uid) : () => {};
    const unsub8 = subscribeMemberList(boardId);
    const unsub9 = subscribeOnlineUsers(boardId);

    // Start presence tracking
    let cleanupPresence = () => {};
    if (user) {
      cleanupPresence = startTracking({
        userId: user.uid,
        displayName: user.displayName || "Unknown",
        photoURL: user.photoURL,
        email: user.email,
        boardId,
      });
    }

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
      unsub7();
      unsub8();
      unsub9();
      cleanupPresence();
      resetPresence();
      resetCollab();
      clearBoard();
    };
  }, [boardId, user, subscribeBoard, subscribeLists, subscribeCards, subscribeActivities, subscribeAutomations, subscribeTimeLogs, subscribePresets, subscribeMemberList, subscribeOnlineUsers, startTracking, resetPresence, resetCollab, clearBoard]);

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      await createList(boardId, newListTitle.trim(), lists.length);
      if (user) {
        logActivity({
          boardId,
          userId: user.uid,
          userName: user.displayName || "Unknown",
          userPhoto: user.photoURL,
          action: "list_created",
          details: `created list "${newListTitle.trim()}"`,
        });
      }
      setNewListTitle("");
      setShowAddList(false);
    } catch {
      toast.error("Failed to create list");
    }
  };

  // Apply filters to cards
  const filteredCards = filterCards(cards);

  const getCardsForList = useCallback(
    (listId: string) => filteredCards.filter((c) => c.listId === listId).sort((a, b) => a.order - b.order),
    [filteredCards]
  );

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, type } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      if (type === "list") {
        // Reorder lists
        const reordered = [...lists];
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);

        const batch = writeBatch(db);
        reordered.forEach((list, i) => {
          batch.update(doc(db, "lists", list.id), { order: i });
        });
        await batch.commit();
        return;
      }

      // Card drag
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;

      if (sourceListId === destListId) {
        // Same list reorder
        const listCards = getCardsForList(sourceListId);
        const reordered = [...listCards];
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);

        const batch = writeBatch(db);
        reordered.forEach((card, i) => {
          batch.update(doc(db, "cards", card.id), { order: i });
        });
        await batch.commit();
      } else {
        // Move card to different list
        const sourceCards = [...getCardsForList(sourceListId)];
        const destCards = [...getCardsForList(destListId)];
        const [moved] = sourceCards.splice(source.index, 1);

        destCards.splice(destination.index, 0, { ...moved, listId: destListId });

        const batch = writeBatch(db);
        // Update source list orders
        sourceCards.forEach((card, i) => {
          batch.update(doc(db, "cards", card.id), { order: i });
        });
        // Update dest list orders + the moved card's listId
        destCards.forEach((card, i) => {
          const updateData: Record<string, unknown> = { order: i };
          if (card.id === moved.id) {
            updateData.listId = destListId;
          }
          batch.update(doc(db, "cards", card.id), updateData);
        });
        await batch.commit();

        // Log activity
        if (user) {
          const fromList = lists.find((l) => l.id === sourceListId);
          const toList = lists.find((l) => l.id === destListId);
          logActivity({
            boardId,
            cardId: moved.id,
            userId: user.uid,
            userName: user.displayName || "Unknown",
            userPhoto: user.photoURL,
            action: "card_moved",
            details: `moved "${moved.title}" from "${fromList?.title}" to "${toList?.title}"`,
          });
        }

        // Execute automations
        const movedCard = cards.find((c) => c.id === moved.id);
        if (movedCard) {
          executeAutomations(boardId, "card_moved_to_list", {
            card: movedCard,
            fromListId: sourceListId,
            toListId: destListId,
            lists,
            boardMembers: currentBoard?.members,
          });
        }
      }
    },
    [lists, getCardsForList]
  );

  // Refresh selectedCard from real-time data
  useEffect(() => {
    if (selectedCard) {
      const updated = cards.find((c) => c.id === selectedCard.id);
      if (updated) setSelectedCard(updated);
    }
  }, [cards, selectedCard]);

  // Set current user role when board loads
  useEffect(() => {
    if (currentBoard && user) {
      setCurrentUserRole(currentBoard, user.uid);
    }
  }, [currentBoard, user, setCurrentUserRole]);

  if (boardLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-muted mb-4">Board not found</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ background: currentBoard.background }}
    >
      {/* Board header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 backdrop-blur-sm gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-white font-bold text-lg">{currentBoard.title}</h1>
          <span className="text-white/60 text-xs px-2 py-0.5 rounded bg-white/10">
            {currentBoard.visibility}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <ViewSwitcher current={viewMode} onChange={setViewMode} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SearchFilterBar boardId={boardId} members={currentBoard.members || []} />
          <AIAssistant mode="board" lists={lists} cards={cards} />
          {/* Presence avatars */}
          <PresenceAvatars />
          <button
            onClick={() => setShowActivity(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            title="Activity Log"
          >
            <Activity size={16} />
          </button>
          <button
            onClick={() => setShowAutomation(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            title="Automations"
          >
            <Zap size={16} />
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
          >
            <UserPlus size={14} /> Invite
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Views */}
      {viewMode === "board" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 flex items-start gap-4 p-4 overflow-x-auto overflow-y-hidden"
              >
                {lists.map((list, index) => (
                  <ListColumn
                    key={list.id}
                    list={list}
                    cards={getCardsForList(list.id)}
                    index={index}
                    onCardClick={setSelectedCard}
                  />
                ))}
                {provided.placeholder}

                {/* Add list button */}
                <div className="w-72 shrink-0">
                  {showAddList ? (
                    <div className="bg-surface rounded-xl p-3">
                      <input
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter list title..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddList();
                          if (e.key === "Escape") setShowAddList(false);
                        }}
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={handleAddList}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
                        >
                          Add List
                        </button>
                        <button
                          onClick={() => setShowAddList(false)}
                          className="p-1.5 hover:bg-surface-hover rounded transition-colors text-muted"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddList(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors text-sm"
                    >
                      <Plus size={16} /> Add another list
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {viewMode === "calendar" && (
        <CalendarView cards={filteredCards} lists={lists} onCardClick={setSelectedCard} />
      )}

      {viewMode === "timeline" && (
        <TimelineView cards={filteredCards} lists={lists} onCardClick={setSelectedCard} />
      )}

      {viewMode === "table" && (
        <TableView cards={filteredCards} lists={lists} onCardClick={setSelectedCard} />
      )}

      {/* Card modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          boardMembers={currentBoard.members || []}
          boardId={boardId}
        />
      )}

      {/* Invite modal */}
      <InviteModal
        boardId={boardId}
        currentMembers={currentBoard.members || []}
        currentEmails={currentBoard.memberEmails || []}
        open={showInvite}
        onClose={() => setShowInvite(false)}
        board={currentBoard}
      />

      {/* Board settings */}
      <BoardSettings
        board={currentBoard}
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Activity log */}
      <ActivityLog
        boardId={boardId}
        open={showActivity}
        onClose={() => setShowActivity(false)}
      />

      {/* Automation panel */}
      <AutomationPanel
        boardId={boardId}
        lists={lists}
        members={currentBoard.members || []}
        open={showAutomation}
        onClose={() => setShowAutomation(false)}
      />
    </div>
  );
}

export default function BoardPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <BoardContent />
        </div>
      </div>
    </AuthGuard>
  );
}
