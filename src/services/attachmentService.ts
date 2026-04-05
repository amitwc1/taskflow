import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage } from "@/lib/firebase";
import type { Attachment } from "@/types";

export function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageAttachment(attachment: Attachment) {
  return attachment.type.startsWith("image/");
}

export function isPdfAttachment(attachment: Attachment) {
  return attachment.type === "application/pdf";
}

export function canPreviewAttachment(attachment: Attachment) {
  return isImageAttachment(attachment) || isPdfAttachment(attachment);
}

export async function uploadCardAttachment(params: {
  cardId: string;
  file: File;
  currentAttachments: Attachment[];
  uploadedBy: string;
}) {
  const { cardId, file, currentAttachments, uploadedBy } = params;
  const duplicate = currentAttachments.some(
    (attachment) => attachment.name.toLowerCase() === file.name.toLowerCase()
  );

  if (duplicate) {
    throw new Error("A file with that name is already attached to this card.");
  }

  const storagePath = `attachments/${cardId}/${file.name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    id: uuidv4(),
    name: file.name,
    url,
    type: file.type || "application/octet-stream",
    size: file.size,
    uploadedBy,
    createdAt: Date.now(),
    storagePath,
  } satisfies Attachment;
}

export async function deleteCardAttachment(attachment: Attachment) {
  const target = attachment.storagePath || attachment.url;
  if (!target) return;

  await deleteObject(ref(storage, target));
}
