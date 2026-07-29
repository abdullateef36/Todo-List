/**
 * SettingsScreen — allows the user to enter and save their OpenAI API key
 * for voice transcription. Also provides a test button to verify the key.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useThemeContext } from '../context/ThemeContext';
import { saveApiKey, loadApiKey } from '../utils/storage';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved API key on mount
  useEffect(() => {
    const load = async () => {
      const saved = await loadApiKey();
      if (saved) {
        setApiKey(saved);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // Save the API key
  const handleSave = useCallback(async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter an API key.');
      return;
    }
    if (!trimmed.startsWith('sk-')) {
      Alert.alert(
        'Warning',
        'OpenAI API keys typically start with "sk-". Continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            style: 'destructive',
            onPress: async () => {
              await saveApiKey(trimmed);
              Alert.alert('Success', 'API key saved successfully.');
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }
    await saveApiKey(trimmed);
    Alert.alert('Success', 'API key saved successfully.');
    navigation.goBack();
  }, [apiKey, navigation]);

  const isFormValid = apiKey.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={10}
          >
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* API Key Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Voice Input
          </Text>
          <Text
            style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}
          >
            Enter your OpenAI API key to enable voice-to-text transcription.
            Get one at{' '}
            <Text style={{ color: theme.colors.primary }}>platform.openai.com</Text>.
          </Text>

          <View style={styles.fieldContainer}>
            <Text
              style={[styles.label, { color: theme.colors.textSecondary }]}
            >
              API Key
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-..."
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Save Button */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.cancelText, { color: theme.colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isFormValid
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!isFormValid || isLoading}
          >
            <Text
              style={[
                styles.saveText,
                {
                  color: isFormValid
                    ? theme.colors.primaryText
                    : theme.colors.textSecondary,
                },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
