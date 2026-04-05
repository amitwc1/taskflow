import { v4 as uuidv4 } from "uuid";
import type { Label } from "@/types";

export const LABEL_COLOR_OPTIONS = [
  { color: "#61bd4f", name: "Green" },
  { color: "#f2d600", name: "Yellow" },
  { color: "#ff9f1a", name: "Orange" },
  { color: "#eb5a46", name: "Red" },
  { color: "#c377e0", name: "Purple" },
  { color: "#0079bf", name: "Blue" },
  { color: "#00c2e0", name: "Sky" },
  { color: "#51e898", name: "Lime" },
  { color: "#ff78cb", name: "Pink" },
  { color: "#344563", name: "Dark" },
] as const;

function normalizeHexColor(color: string) {
  const trimmed = color.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function normalizeLabelInput(input: { name: string; color: string }) {
  const name = input.name.trim();
  const color = normalizeHexColor(input.color);

  if (!name) {
    throw new Error("Label name is required.");
  }

  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
    throw new Error("Choose a valid label color.");
  }

  return { name, color };
}

export function createLabel(input: { name: string; color: string }): Label {
  return {
    id: uuidv4(),
    ...normalizeLabelInput(input),
  };
}

export function updateLabel(
  labels: Label[],
  labelId: string,
  input: { name: string; color: string }
): Label[] {
  const normalized = normalizeLabelInput(input);

  return labels.map((label) =>
    label.id === labelId ? { ...label, ...normalized } : label
  );
}

export function deleteLabel(labels: Label[], labelId: string): Label[] {
  return labels.filter((label) => label.id !== labelId);
}
