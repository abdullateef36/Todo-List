/**
 * Hook for managing tasks with CRUD operations and AsyncStorage persistence.
 */
import { useState, useEffect, useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { Task } from '../types/task';
import { saveTasks, loadTasks } from '../utils/storage';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from storage on mount
  useEffect(() => {
    const load = async () => {
      const stored = await loadTasks();
      setTasks(stored);
      setIsLoading(false);
    };
    load();
  }, []);

  // Persist tasks to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const addTask = useCallback((title: string, description?: string, dueDate?: string) => {
    const newTask: Task = {
      id: Crypto.randomUUID(),
      title,
      description,
      completed: false,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const addTasks = useCallback((taskTitles: string[]) => {
    const newTasks: Task[] = taskTitles.map((title) => ({
      id: Crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    }));
    setTasks((prev) => [...newTasks, ...prev]);
    return newTasks;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  }, []);

  return {
    tasks,
    isLoading,
    addTask,
    addTasks,
    toggleTask,
    deleteTask,
    updateTask,
    clearCompleted,
  };
};
