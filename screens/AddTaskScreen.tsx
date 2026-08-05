/**
 * AddTaskScreen — form for adding a new task or editing an existing one.
 * Supports title, optional description, and an optional due date picked via
 * the native system date picker (@react-native-community/datetimepicker).
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useTasksContext } from '../context/TaskContext';
import { useThemeContext } from '../context/ThemeContext';
import { formatDate } from '../utils/voiceUtils';

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
  const { tasks, addTask, updateTask, isLoading } = useTasksContext();
  const { theme } = useThemeContext();
  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load task if editing
  useEffect(() => {
    if (isEditing && tasks.length > 0) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
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

    // Store the due date as the end of the chosen day (so it is not overdue
    // until that date has fully passed).
    const isoDueDate = dueDate
      ? new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate(),
          23,
          59,
          59,
          999
        ).toISOString()
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

  const handleDateChange = useCallback((event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event && (event as { type?: string }).type === 'dismissed') return;
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  }, []);

  const handleClearDate = useCallback(() => {
    setDueDate(undefined);
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

          {/* Date field — opens the native picker */}
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateField,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dateFieldContent}>
              <Calendar
                color={dueDate ? theme.colors.text : theme.colors.placeholder}
                size={18}
              />
              <Text
                style={
                  dueDate
                    ? { color: theme.colors.text, fontSize: 16 }
                    : { color: theme.colors.placeholder, fontSize: 16 }
                }
              >
                {dueDate ? formatDate(dueDate) : 'Select a date'}
              </Text>
            </View>
          </TouchableOpacity>

          {dueDate ? (
            <TouchableOpacity
              style={[
                styles.clearDateButton,
                { backgroundColor: theme.colors.danger },
              ]}
              onPress={handleClearDate}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.clearDateText,
                  { color: theme.colors.dangerText },
                ]}
              >
                Clear date
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Android: the picker opens as a dialog when rendered */}
          {showDatePicker && Platform.OS === 'android' ? (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          ) : null}

          {/* iOS: render the picker inline with a Done button */}
          {showDatePicker && Platform.OS === 'ios' ? (
            <View
              style={[
                styles.iosPickerContainer,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setShowDatePicker(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.doneButtonText,
                    { color: theme.colors.primaryText },
                  ]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
  dateField: {
    height: 52,
    justifyContent: 'center',
  },
  dateFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearDateButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iosPickerContainer: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneButtonText: {
    fontSize: 15,
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
