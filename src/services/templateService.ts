import {
  collection,
  addDoc,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { TEMPLATES, getTemplateById } from "@/data/templates";
import type { BoardTemplate, Label } from "@/types";

// ========================
// Template Service
// ========================
// Provides helpers to:
//  - List all available templates
//  - Look up a single template by ID
//  - Create a fully-structured board from a template using Firestore batch writes

/** Return all available templates */
export function getTemplates(): BoardTemplate[] {
  return TEMPLATES;
}

/** Return a single template by ID, or undefined */
export function getTemplate(id: string): BoardTemplate | undefined {
  return getTemplateById(id);
}

/**
 * Create a new board from a template.
 *
 * Flow:
 * 1. Create the board document
 * 2. Batch-create all lists with order indexes
 * 3. Batch-create all cards within each list with order indexes and default labels
 *
 * Uses batch writes for performance (max 500 ops per batch).
 */
export async function createBoardFromTemplate(
  templateId: string,
  userId: string,
  userEmail: string,
  workspaceId: string,
  boardTitle?: string,
): Promise<string> {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Template "${templateId}" not found`);

  const now = Date.now();

  // 1. Create board document
  const boardRef = await addDoc(collection(db, "boards"), {
    title: boardTitle || template.name,
    workspaceId,
    ownerId: userId,
    background: template.background,
    visibility: "workspace" as const,
    members: [userId],
    memberEmails: [userEmail],
    memberRoles: { [userId]: "admin" },
    createdAt: now,
    updatedAt: now,
  });

  const boardId = boardRef.id;

  // 2. Deep-copy labels with unique IDs for this board
  const boardLabels: Label[] = template.labels.map((l) => ({
    id: uuidv4(),
    name: l.name,
    color: l.color,
  }));

  // 3. Batch-create lists and cards
  // Collect all write operations, then chunk into batches of 499
  const ops: Array<{
    path: string;
    data: Record<string, unknown>;
  }> = [];

  template.lists.forEach((list, listIndex) => {
    // Generate a deterministic doc reference for the list
    const listRef = doc(collection(db, "lists"));
    const listId = listRef.id;

    ops.push({
      path: `lists/${listId}`,
      data: {
        boardId,
        title: list.title,
        order: listIndex,
        createdAt: now,
      },
    });

    // Create cards for this list
    list.cards.forEach((card, cardIndex) => {
      const cardRef = doc(collection(db, "cards"));

      ops.push({
        path: `cards/${cardRef.id}`,
        data: {
          listId,
          boardId,
          title: card.title,
          description: card.description || "",
          order: cardIndex,
          dueDate: null,
          labels: boardLabels, // attach all default labels to every card for easy filtering
          checklist: [],
          attachments: [],
          assignedMembers: [],
          members: [],
          createdAt: now,
          updatedAt: now,
        },
      });
    });
  });

  // Chunk operations into batches of 499 (Firestore limit is 500 per batch)
  const BATCH_LIMIT = 499;
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const chunk = ops.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);

    for (const op of chunk) {
      const [collName, docId] = op.path.split("/");
      batch.set(doc(db, collName, docId), op.data);
    }

    await batch.commit();
  }

  return boardId;
}
