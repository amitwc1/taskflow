import type { Card, List } from "@/types";

// Calls our own server-side /api/ai route — the OpenAI key never reaches the browser
async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "AI request failed");
  }

  const data = await res.json();
  return data.content || "";
}

export async function generateSubtasks(cardTitle: string, cardDescription: string): Promise<string[]> {
  const prompt = `Given a task card with title "${cardTitle}" and description "${cardDescription || "No description"}", generate 3-5 actionable subtasks. Return only a JSON array of strings, no other text. Example: ["Subtask 1", "Subtask 2"]`;

  const response = await callOpenAI(prompt);
  try {
    const cleaned = response.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return response
      .split("\n")
      .map((line) => line.replace(/^[-\d.]+\s*/, "").trim())
      .filter(Boolean);
  }
}

export async function suggestDueDate(
  cardTitle: string,
  cardDescription: string
): Promise<string> {
  const prompt = `Given a task "${cardTitle}" with description "${cardDescription || "No description"}", suggest a reasonable due date from today. Return only the number of days from today as a single integer. For example, "7" for one week.`;

  const response = await callOpenAI(prompt);
  const days = parseInt(response.trim(), 10);
  if (isNaN(days) || days < 1) return "7";
  return String(days);
}

export async function summarizeBoardProgress(
  lists: List[],
  cards: Card[]
): Promise<string> {
  const summary = lists.map((list) => {
    const listCards = cards.filter((c) => c.listId === list.id);
    const overdueCount = listCards.filter(
      (c) => c.dueDate && c.dueDate < Date.now()
    ).length;
    return `"${list.title}": ${listCards.length} cards${overdueCount > 0 ? ` (${overdueCount} overdue)` : ""}`;
  });

  const prompt = `Analyze this project board and provide a brief progress summary (2-3 sentences):\n${summary.join("\n")}\nTotal cards: ${cards.length}`;

  return await callOpenAI(prompt);
}

export function isAIConfigured(): boolean {
  // AI availability is determined server-side; assume available and handle errors gracefully
  return true;
}
