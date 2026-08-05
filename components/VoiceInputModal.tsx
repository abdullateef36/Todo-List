/**
 * VoiceInputModal — full-screen modal shown during voice recording and
 * transcription. Displays the current state and any transcribed tasks.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../constants/theme';
import { VoiceInputState } from '../hooks/useVoiceInput';

interface VoiceInputModalProps {
  visible: boolean;
  theme: Theme;
  voiceState: VoiceInputState;
  error?: string;
  transcribedTasks: string[];
  onCancel: () => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  visible,
  theme,
  voiceState,
  error,
  transcribedTasks,
  onCancel,
}) => {
  const getStateText = () => {
    switch (voiceState) {
      case 'requesting-permission':
        return 'Requesting microphone permission...';
      case 'recording':
        return 'Listening... Speak now';
      case 'transcribing':
        return 'Transcribing...';
      case 'processing':
        return 'Processing tasks...';
      case 'error':
        return error || 'Something went wrong';
      default:
        return '';
    }
  };

  const getSubText = () => {
    if (voiceState === 'recording') {
      return 'Tap the microphone and speak your tasks naturally';
    }
    if (voiceState === 'processing' && transcribedTasks.length > 0) {
      return `Found ${transcribedTasks.length} task(s)`;
    }
    return '';
  };

  const showSpinner =
    voiceState === 'requesting-permission' ||
    voiceState === 'transcribing' ||
    voiceState === 'processing';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Voice Input
            </Text>
            <TouchableOpacity onPress={onCancel} hitSlop={10}>
              <Text style={[styles.closeButton, { color: theme.colors.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {showSpinner ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={styles.spinner}
              />
            ) : null}

            <Text style={[styles.stateText, { color: theme.colors.text }]}>
              {getStateText()}
            </Text>

            {getSubText() ? (
              <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
                {getSubText()}
              </Text>
            ) : null}

            {transcribedTasks.length > 0 ? (
              <View style={styles.tasksContainer}>
                {transcribedTasks.map((task, index) => (
                  <View
                    key={index}
                    style={[
                      styles.taskPreview,
                      { backgroundColor: theme.colors.background },
                    ]}
                  >
                    <Text style={[styles.taskPreviewText, { color: theme.colors.text }]}>
                      {index + 1}. {task}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  stateText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  tasksContainer: {
    width: '100%',
    marginTop: 8,
  },
  taskPreview: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskPreviewText: {
    fontSize: 14,
  },
});
