/**
 * Storage utilities for persisting tasks and settings using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';
import { ThemeMode } from '../constants/theme';

const TASKS_KEY = '@tasks';
const THEME_KEY = '@theme';
const API_KEY_KEY = '@openai_api_key';

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

/**
 * Save the OpenAI API key for voice transcription.
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(API_KEY_KEY, apiKey);
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
};

/**
 * Load the OpenAI API key for voice transcription.
 */
export const loadApiKey = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(API_KEY_KEY);
  } catch (error) {
    console.error('Failed to load API key:', error);
    return null;
  }
};
