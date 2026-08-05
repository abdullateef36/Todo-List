/**
 * Storage utilities for persisting tasks and settings using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';
import { ThemeMode } from '../constants/theme';

const TASKS_KEY = '@tasks';
const THEME_KEY = '@theme';

/**
 * Save the tasks array to AsyncStorage.
 */
export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, jsonValue);
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
};

/**
 * Load the tasks array from AsyncStorage.
 */
export const loadTasks = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    if (jsonValue === null) return [];
    return JSON.parse(jsonValue) as Task[];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
};

/**
 * Save the user's preferred theme mode.
 */
export const saveTheme = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, mode);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
};

/**
 * Load the user's preferred theme mode.
 */
export const loadTheme = async (): Promise<ThemeMode | null> => {
  try {
    return await AsyncStorage.getItem(THEME_KEY) as ThemeMode | null;
  } catch (error) {
    console.error('Failed to load theme:', error);
    return null;
  }
};
