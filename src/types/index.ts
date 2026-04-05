// ========================
// Core Types
// ========================

export type Role = "admin" | "member" | "viewer";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ========================
// Board Member with role info
// ========================

export interface BoardMember {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: Role;
  joinedAt: number;
}

// ========================
// User Presence
// ========================

export interface UserPresence {
  userId: string;
  displayName: string;
  photoURL: string | null;
  email: string | null;
  boardId: string;
  lastSeen: number;
  online: boolean;
}

// ========================
// User Stats for dashboard analytics
// ========================

export interface UserStats {
  userId: string;
  displayName: string;
  photoURL: string | null;
  email: string | null;
  tasksCompleted: number;
  tasksPending: number;
  totalTimeSpent: number;
  activityCount: number;
}

export interface WorkspaceMember {
  userId: string;
  role: Role;
  email: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  memberRoles?: Record<string, Role>;
  createdAt: number;
  updatedAt: number;
}

export interface Board {
  id: string;
  title: string;
  workspaceId: string;
  ownerId: string;
  background: string;
  visibility: "private" | "workspace" | "public";
  members: string[];
  memberEmails: string[];
  memberRoles?: Record<string, Role>;
  createdAt: number;
  updatedAt: number;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: number;
}

export interface Card {
  id: string;
  listId: string;
  boardId: string;
  title: string;
  description: string;
  order: number;
  dueDate: number | null;
  labels: Label[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  assignedMembers: string[];
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: number;
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto: string | null;
  text: string;
  createdAt: number;
}

// ========================
// Activity Log
// ========================

export type ActivityAction =
  | "card_created"
  | "card_moved"
  | "card_updated"
  | "card_deleted"
  | "card_assigned"
  | "card_unassigned"
  | "list_created"
  | "list_deleted"
  | "list_renamed"
  | "comment_added"
  | "comment_deleted"
  | "label_added"
  | "label_removed"
  | "checklist_completed"
  | "attachment_added"
  | "due_date_set"
  | "due_date_removed"
  | "member_invited"
  | "member_removed"
  | "member_role_changed"
  | "board_updated";

export interface Activity {
  id: string;
  boardId: string;
  cardId?: string;
  listId?: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

// ========================
// Notifications
// ========================

export type NotificationType =
  | "card_assigned"
  | "card_unassigned"
  | "comment_added"
  | "due_date_approaching"
  | "due_date_passed"
  | "mentioned"
  | "board_invited"
  | "member_removed"
  | "card_moved"
  | "automation_triggered";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  boardId?: string;
  cardId?: string;
  read: boolean;
  createdAt: number;
}

// ========================
// Time Tracking
// ========================

export interface TimeLog {
  id: string;
  cardId: string;
  boardId: string;
  userId: string;
  userName: string;
  startTime: number;
  endTime: number | null;
  duration: number; // ms
  createdAt: number;
}

export interface ActiveTimer {
  cardId: string;
  boardId: string;
  startTime: number;
}

// ========================
// Automation
// ========================

export type AutomationTrigger =
  | "card_moved_to_list"
  | "due_date_passed"
  | "label_added"
  | "card_created"
  | "checklist_completed";

export type AutomationActionType =
  | "move_card"
  | "assign_member"
  | "add_label"
  | "set_due_date"
  | "send_notification";

export interface AutomationRule {
  id: string;
  boardId: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  triggerConfig: Record<string, string>;
  actionType: AutomationActionType;
  actionConfig: Record<string, string>;
  createdBy: string;
  executionCount: number;
  lastExecuted: number | null;
  createdAt: number;
}

// ========================
// Search & Filters
// ========================

export interface FilterPreset {
  id: string;
  boardId: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  createdAt: number;
}

export interface SearchFilters {
  keyword?: string;
  members?: string[];
  labels?: string[];
  dueDateFrom?: number | null;
  dueDateTo?: number | null;
  hasChecklist?: boolean;
  isOverdue?: boolean;
}

// ========================
// Views
// ========================

export type ViewMode = "board" | "calendar" | "timeline" | "table";

export interface Invitation {
  boardId: string;
  email: string;
  invitedBy: string;
  status: "pending" | "accepted";
  createdAt: number;
}
