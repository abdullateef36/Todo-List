/**
 * Hook for voice input recording and transcription.
 * Records audio with expo-audio, transcribes via the Groq (Whisper) API,
 * and splits the transcript into separate tasks.
 */
import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { transcribeAudio, splitTextWithGPT } from '../utils/groq';
import { splitTranscribedTextIntoTasks, cleanTaskTitle } from '../utils/voiceUtils';
import { DEFAULT_GROQ_API_KEY } from '../constants/config';

export type VoiceInputState =
  | 'idle'
  | 'requesting-permission'
  | 'recording'
  | 'transcribing'
  | 'processing'
  | 'error';

export interface VoiceInputResult {
  tasks: string[];
  error?: string;
}

export const useVoiceInput = () => {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [error, setError] = useState<string | undefined>(undefined);

  // The recorder instance is owned by expo-audio and reused across recordings.
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Live recorder state (isRecording, duration) for UI feedback.
  const recorderState = useAudioRecorderState(recorder);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setState('requesting-permission');
    setError(undefined);

    try {
      // Request audio recording permissions
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission is required for voice input.');
        setState('error');
        return false;
      }

      // Configure audio session for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Start a new recording
      await recorder.prepareToRecordAsync();
      recorder.record();

      setState('recording');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      setState('error');
      return false;
    }
  }, [recorder]);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<VoiceInputResult> => {
    setState('transcribing');
    setError(undefined);

    try {
      // Stop recording and get the URI
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      // Use the built-in Groq API key (configured in constants/config.ts)
      const apiKey = DEFAULT_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error(
          'Groq API key not found. Please add your API key in constants/config.ts.'
        );
      }

      // Transcribe the audio
      const transcription = await transcribeAudio(uri, apiKey);
      if (!transcription.success || !transcription.text.trim()) {
        throw new Error(transcription.error || 'Failed to transcribe audio');
      }

      setState('processing');

      // Try LLM-based splitting first, fall back to heuristics
      let taskTitles: string[] = [];
      try {
        taskTitles = await splitTextWithGPT(transcription.text, apiKey);
        if (taskTitles.length === 0) {
          // Fall back to heuristic splitting
          taskTitles = splitTranscribedTextIntoTasks(transcription.text);
        }
      } catch {
        taskTitles = splitTranscribedTextIntoTasks(transcription.text);
      }

      // Clean up task titles
      const cleanedTasks = taskTitles
        .map(cleanTaskTitle)
        .filter((t) => t.length > 0);

      // Clean up the audio file
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // Ignore cleanup errors
      }

      setState('idle');
      return { tasks: cleanedTasks };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setState('error');
      return { tasks: [], error: message };
    }
  }, [recorder]);

  const cancelRecording = useCallback(async () => {
    try {
      await recorder.stop();
    } catch {
      // Ignore cleanup errors (e.g. no active recording)
    }
    setState('idle');
    setError(undefined);
  }, [recorder]);

  const reset = useCallback(() => {
    setState('idle');
    setError(undefined);
  }, []);

  return {
    state,
    error,
    isRecording: recorderState.isRecording,
    recordingDuration: Math.floor(recorderState.durationMillis / 1000),
    startRecording,
    stopRecordingAndTranscribe,
    cancelRecording,
    reset,
  };
};