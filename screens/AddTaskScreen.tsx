/**
 * AddTaskScreen — form for adding a new task or editing an existing one.
 * Supports title, optional description, and optional due date.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useTasks } from '../hooks/useTasks';
import { useThemeContext } from '../context/ThemeContext';
import { Task } from '../types/task';

type AddTaskScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddTask'
>;

interface AddTaskScreenProps {
  navigation: AddTaskScreenNavigationProp;
  route: {
    params?: { taskId?: string };
  };
}

export const AddTaskScreen: React.FC<AddTaskScreenProps> = ({
  navigation,
  route,
}) => {
  const { tasks, addTask, updateTask, isLoading } = useTasks();
  const { theme } = useThemeContext();
  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Load task if editing
  useEffect(() => {
    if (isEditing && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      } else if (!isLoading) {
        // Task not found — treat as new
        navigation.goBack();
      }
    }
  }, [isEditing, taskId, tasks, isLoading, navigation]);

  const handleSave = useCallback(() => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }

    const isoDueDate = dueDate
      ? new Date(dueDate).toISOString().split('T')[0] +
        'T23:59:59.999Z'
      : undefined;

    if (isEditing && taskId) {
      updateTask(taskId, {
        title: trimmedTitle,
        description: description.trim() || undefined,
        dueDate: isoDueDate,
      });
    } else {
      addTask(trimmedTitle, description.trim() || undefined, isoDueDate);
    }

    navigation.goBack();
  }, [title, description, dueDate, isEditing, taskId, addTask, updateTask, navigation]);

  const handleSetToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
  }, []);

  const handleClearDate = useCallback(() => {
    setDueDate('');
  }, []);

  const isFormValid = title.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Title *
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.titleInput,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={theme.colors.placeholder}
            returnKeyType="next"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Description (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Due Date */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Due Date (optional)
          </Text>
          <View style={styles.dateRow}>
            <TextInput
              style={[
                styles.input,
                styles.dateInput,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.placeholder}
              inputMode="date"
            />
            <TouchableOpacity
              style={[
                styles.dateButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleSetToday}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  { color: theme.colors.primaryText },
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>
            {dueDate ? (
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: theme.colors.danger },
                ]}
                onPress={handleClearDate}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    { color: theme.colors.dangerText },
                  ]}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>

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
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
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
          disabled={!isFormValid}
        >
          <Text
            style={[
              styles.saveText,
              { color: isFormValid ? theme.colors.primaryText : theme.colors.textSecondary },
            ]}
          >
            {isEditing ? 'Update' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  titleInput: {
    height: 52,
  },
  descriptionInput: {
    height: 100,
    paddingTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    height: 52,
  },
  dateButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dateButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
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
