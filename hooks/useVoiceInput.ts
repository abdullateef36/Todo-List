/**
 * Hook for voice input recording and transcription.
 * Records audio, transcribes via the Groq (Whisper) API, and splits into tasks.
 */
import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
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
  const recordingRef = useRef<Audio.Recording | null>(null);

  const cleanupRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        // Ignore cleanup errors
      }
      recordingRef.current = null;
    }
  };

  const startRecording = useCallback(async (): Promise<boolean> => {
    setState('requesting-permission');
    setError(undefined);

    try {
      // Request audio recording permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission is required for voice input.');
        setState('error');
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // DoNotMix
        interruptionModeAndroid: 1, // DoNotMix
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setState('recording');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      setState('error');
      return false;
    }
  }, []);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<VoiceInputResult> => {
    setState('transcribing');
    setError(undefined);

    try {
      const recording = recordingRef.current;
      if (!recording) {
        throw new Error('No active recording');
      }

      // Stop recording and get the URI
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

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

      // Try GPT-based splitting first, fall back to heuristic
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
  }, []);

  const cancelRecording = useCallback(async () => {
    await cleanupRecording();
    setState('idle');
    setError(undefined);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setError(undefined);
  }, []);

  return {
    state,
    error,
    startRecording,
    stopRecordingAndTranscribe,
    cancelRecording,
    reset,
  };
};
