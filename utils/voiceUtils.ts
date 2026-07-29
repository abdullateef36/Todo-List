/**
 * Utilities for voice input processing and task splitting.
 */

/**
 * Splits a transcribed speech string into individual task titles.
 *
 * Uses natural language heuristics to detect task boundaries:
 * - Splits on conjunctions: "and", "&", "then"
 * - Splits on punctuation: commas, semicolons
 * - Handles "and" within a phrase gracefully (e.g., "call mom and dad" stays as one task)
 */
export const splitTranscribedTextIntoTasks = (text: string): string[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Normalize whitespace
  const normalized = trimmed.replace(/\s+/g, ' ');

  // Split on conjunctions and punctuation that typically separate tasks
  // We use a regex that splits on: " and ", " & ", " then ", ", ", ";", " — "
  const separators = /\s*(?:and|&|then)\s+|,\s*|\s*;\s*|\s*—\s*|\s*-\s+/i;

  const parts = normalized.split(separators).map((p) => p.trim()).filter((p) => p.length > 0);

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      unique.push(part);
    }
  }

  return unique;
};

/**
 * Cleans up a task title from speech transcription.
 * - Removes leading/trailing whitespace
 * - Capitalizes the first letter
 * - Removes trailing punctuation
 */
export const cleanTaskTitle = (title: string): string => {
  const trimmed = title.trim();
  // Remove trailing punctuation
  const cleaned = trimmed.replace(/[.,;:!?]+$/, '');
  // Capitalize first letter
  if (cleaned.length === 0) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/**
 * Formats a date for display.
 */
export const formatDate = (date: Date): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

/**
 * Formats a date and time for display.
 */
export const formatDateTime = (date: Date): string => {
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(date)} at ${time}`;
};

/**
 * Checks if a date is overdue (past today, not completed).
 */
export const isOverdue = (dueDate: string | undefined, completed: boolean): boolean => {
  if (!dueDate || completed) return false;
  const due = new Date(dueDate);
  const now = new Date();
  // Set to end of today for comparison
  now.setHours(23, 59, 59, 999);
  return due < now;
};

/**
 * Sorts tasks by due date (earliest first), with tasks without due dates at the end.
 */
export const sortTasksByDueDate = (tasks: import('../types/task').Task[]): import('../types/task').Task[] => {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};
