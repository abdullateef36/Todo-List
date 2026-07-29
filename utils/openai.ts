/**
 * OpenAI API utilities for speech-to-text transcription.
 */
import * as FileSystem from 'expo-file-system';

const WHISPER_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
}

/**
 * Transcribes an audio file using OpenAI's Whisper API.
 *
 * @param audioUri - Local file URI of the recorded audio
 * @param apiKey - OpenAI API key
 * @returns Transcription result with text or error
 */
export const transcribeAudio = async (
  audioUri: string,
  apiKey: string
): Promise<TranscriptionResult> => {
  try {
    // Read the audio file as base64
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      return { text: '', success: false, error: 'Audio file not found' };
    }

    // Create form data for the Whisper API
    const formData = new FormData();
    // @ts-ignore - FormData file attachment for React Native
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });
    formData.append('model', 'whisper-1');

    const response = await fetch(WHISPER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
      return { text: '', success: false, error: errorMessage };
    }

    const data = await response.json();
    return { text: data.text || '', success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { text: '', success: false, error: message };
  }
};

/**
 * Uses GPT to intelligently split a transcribed text into separate task titles.
 * This is more accurate than heuristic splitting for complex natural language.
 *
 * @param text - The transcribed text
 * @param apiKey - OpenAI API key
 * @returns Array of task titles
 */
export const splitTextWithGPT = async (
  text: string,
  apiKey: string
): Promise<string[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
