/**
 * Task type definition for the To-Do List app.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
}
