import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AutomationRule, Card, List } from "@/types";
import { createNotification } from "./notificationService";

export async function createAutomation(
  rule: Omit<AutomationRule, "id" | "executionCount" | "lastExecuted" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "automations"), {
    ...rule,
    executionCount: 0,
    lastExecuted: null,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function updateAutomation(id: string, data: Partial<AutomationRule>) {
  await updateDoc(doc(db, "automations", id), data);
}

export async function deleteAutomation(id: string) {
  await deleteDoc(doc(db, "automations", id));
}

export function subscribeAutomations(
  boardId: string,
  callback: (rules: AutomationRule[]) => void
) {
  const q = query(
    collection(db, "automations"),
    where("boardId", "==", boardId)
  );
  return onSnapshot(q, (snap) => {
    const rules = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as AutomationRule))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(rules);
  }, (error) => {
    console.error("Automations subscription error:", error);
    callback([]);
  });
}

export async function executeAutomations(
  boardId: string,
  trigger: string,
  context: {
    card?: Card;
    fromListId?: string;
    toListId?: string;
    labelId?: string;
    lists?: List[];
    boardMembers?: string[];
  }
) {
  const q = query(
    collection(db, "automations"),
    where("boardId", "==", boardId)
  );
  const snap = await getDocs(q);

  const matchingDocs = snap.docs.filter((d) => {
    const data = d.data();
    return data.enabled === true && data.trigger === trigger;
  });

  for (const ruleDoc of matchingDocs) {
    const rule = { id: ruleDoc.id, ...ruleDoc.data() } as AutomationRule;
    let shouldExecute = false;

    switch (rule.trigger) {
      case "card_moved_to_list":
        shouldExecute = context.toListId === rule.triggerConfig.listId;
        break;
      case "label_added":
        shouldExecute = context.labelId === rule.triggerConfig.labelId;
        break;
      case "card_created":
        shouldExecute = true;
        break;
      case "checklist_completed":
        if (context.card) {
          const allDone =
            context.card.checklist.length > 0 &&
            context.card.checklist.every((c) => c.completed);
          shouldExecute = allDone;
        }
        break;
      default:
        break;
    }

    if (!shouldExecute || !context.card) continue;

    try {
      switch (rule.actionType) {
        case "move_card":
          if (rule.actionConfig.listId) {
            await updateDoc(doc(db, "cards", context.card.id), {
              listId: rule.actionConfig.listId,
              updatedAt: Date.now(),
            });
          }
          break;
        case "assign_member":
          if (rule.actionConfig.memberId) {
            const existing = context.card.assignedMembers || [];
            if (!existing.includes(rule.actionConfig.memberId)) {
              await updateDoc(doc(db, "cards", context.card.id), {
                assignedMembers: [...existing, rule.actionConfig.memberId],
                updatedAt: Date.now(),
              });
            }
          }
          break;
        case "add_label":
          if (rule.actionConfig.labelColor && rule.actionConfig.labelName) {
            const existingLabels = context.card.labels || [];
            if (!existingLabels.some((l) => l.color === rule.actionConfig.labelColor)) {
              await updateDoc(doc(db, "cards", context.card.id), {
                labels: [
                  ...existingLabels,
                  {
                    id: Date.now().toString(),
                    color: rule.actionConfig.labelColor,
                    name: rule.actionConfig.labelName,
                  },
                ],
                updatedAt: Date.now(),
              });
            }
          }
          break;
        case "set_due_date":
          if (rule.actionConfig.daysFromNow) {
            const days = parseInt(rule.actionConfig.daysFromNow, 10);
            const dueDate = Date.now() + days * 24 * 60 * 60 * 1000;
            await updateDoc(doc(db, "cards", context.card.id), {
              dueDate,
              updatedAt: Date.now(),
            });
          }
          break;
        case "send_notification":
          if (context.card.assignedMembers) {
            for (const memberId of context.card.assignedMembers) {
              await createNotification({
                userId: memberId,
                type: "automation_triggered",
                title: `Automation: ${rule.name}`,
                message: `Rule triggered on card "${context.card.title}"`,
                boardId,
                cardId: context.card.id,
              });
            }
          }
          break;
      }

      await updateDoc(doc(db, "automations", rule.id), {
        executionCount: rule.executionCount + 1,
        lastExecuted: Date.now(),
      });
    } catch (err) {
      console.error("Automation execution error:", err);
    }
  }
}
