/**
 * Task context — provides shared task state across all screens.
 *
 * Without this, each screen that called useTasks() got its own isolated state,
 * so tasks added on the Add Task screen never appeared on the Task List screen.
 * A single provider at the root keeps one source of truth (plus AsyncStorage
 * persistence) that every screen reads and writes.
 */
import React, { createContext, useContext } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';

interface TasksContextValue {
  tasks: Task[];
  isLoading: boolean;
  addTask: (title: string, description?: string, dueDate?: string) => Task;
  addTasks: (titles: string[]) => Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  clearCompleted: () => void;
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export const useTasksContext = (): TasksContextValue => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const tasksValue = useTasks();
  return (
    <TasksContext.Provider value={tasksValue}>
      {children}
    </TasksContext.Provider>
  );
};
