/**
 * Groq API utilities for speech-to-text transcription.
 *
 * Groq serves OpenAI-compatible endpoints with a free tier (no credit card).
 * Registry: https://console.groq.com/docs/speech-to-text
 */
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const WHISPER_ENDPOINT = `${GROQ_BASE_URL}/audio/transcriptions`;
const CHAT_ENDPOINT = `${GROQ_BASE_URL}/chat/completions`;

// Model used for speech-to-text (Whisper on Groq's free tier).
const STT_MODEL = 'whisper-large-v3-turbo';

// Model used for splitting natural language into separate tasks.
const SPLIT_MODEL = 'llama-3.1-8b-instant';

export interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

/**
 * Transcribes an audio file using Groq's Whisper API.
 *
 * @param audioUri - Local file URI of the recorded audio
 * @param apiKey - Groq API key (starts with "gsk_")
 * @returns Transcription result with text or error
 */
export const transcribeAudio = async (
  audioUri: string,
  apiKey: string
): Promise<TranscriptionResult> => {
  try {
    // Verify the audio file exists (skip on web, where file metadata is limited)
    if (Platform.OS !== 'web') {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        return { text: '', success: false, error: 'Audio file not found' };
      }
    }

    if (Platform.OS === 'web') {
      // Web: the URI is a blob: URL from MediaRecorder. Fetch it and append
      // a real Blob to FormData. This works because the browser's fetch sets
      // the correct Content-Type for blob: URLs, so response.blob() has the
      // right MIME type.
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'recording.m4a');
      formData.append('model', STT_MODEL);

      const apiResponse = await fetch(WHISPER_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message || `HTTP ${apiResponse.status}`;
        return { text: '', success: false, error: errorMessage };
      }

      const data = await apiResponse.json();
      return { text: data.text || '', success: true };
    }

    // Native / Expo Go: use FileSystem.uploadAsync which handles
    // multipart/form-data natively and sets the audio MIME type correctly.
    // This avoids the "Unsupported FormDataPart implementation" error that
    // occurs when appending { uri, type, name } objects to FormData in Expo Go.
    const uploadResult = await FileSystem.uploadAsync(
      WHISPER_ENDPOINT,
      audioUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: 'audio/m4a',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        parameters: {
          model: STT_MODEL,
        },
      }
    );

    if (uploadResult.status !== 200) {
      let errorMessage: string;
      try {
        const errorData = JSON.parse(uploadResult.body);
        errorMessage =
          errorData.error?.message || `HTTP ${uploadResult.status}`;
      } catch {
        errorMessage = `HTTP ${uploadResult.status}`;
      }
      return { text: '', success: false, error: errorMessage };
    }

    const data = JSON.parse(uploadResult.body);
    return { text: data.text || '', success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { text: '', success: false, error: message };
  }
};

/**
 * Uses Groq (Llama) to intelligently split a transcribed text into separate
 * task titles. This is more accurate than heuristic splitting for complex
 * natural language.
 *
 * @param text - The transcribed text
 * @param apiKey - Groq API key (starts with "gsk_")
 * @returns Array of task titles
 */
export const splitTextWithGPT = async (
  text: string,
  apiKey: string
): Promise<string[]> => {
  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: SPLIT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that splits natural language into individual task titles. ' +
              'Given a string of tasks spoken naturally, return ONLY a JSON array of strings, each being a separate task. ' +
              'For example: "Buy groceries and call mom" → ["Buy groceries", "Call mom"]. ' +
              'Do not include any explanations or extra text. Just the JSON array.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return [];

    // Parse the JSON array from the response
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    return [];
  } catch (error) {
    console.error('Failed to split text with GPT:', error);
    return [];
  }
};
