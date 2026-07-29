/**
 * TaskListScreen — main screen showing all tasks with search, filter,
 * theme toggle, and voice input via FAB.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useTasks } from '../hooks/useTasks';
import { useThemeContext } from '../context/ThemeContext';
import { SearchBar } from '../components/SearchBar';
import { TaskItem } from '../components/TaskItem';
import { FAB } from '../components/FAB';
import { ThemeToggle } from '../components/ThemeToggle';
import { VoiceInputModal } from '../components/VoiceInputModal';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { sortTasksByDueDate } from '../utils/voiceUtils';
import { Task } from '../types/task';

type TaskListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TaskList'
>;

interface TaskListScreenProps {
  navigation: TaskListScreenNavigationProp;
}

type Filter = 'all' | 'active' | 'completed';

export const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const {
    tasks,
    isLoading,
    addTasks,
    toggleTask,
    deleteTask,
    clearCompleted,
  } = useTasks();
  const { theme, mode, toggleTheme } = useThemeContext();
  const {
    state: voiceState,
    error: voiceError,
    startRecording,
    stopRecordingAndTranscribe,
    cancelRecording,
    reset,
  } = useVoiceInput();

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [transcribedTasks, setTranscribedTasks] = useState<string[]>([]);

  // When voice input completes with tasks, add them and close the modal
  useEffect(() => {
    if (voiceState === 'idle' && transcribedTasks.length > 0) {
      addTasks(transcribedTasks);
      setVoiceModalVisible(false);
      setTranscribedTasks([]);
    }
  }, [voiceState, transcribedTasks, addTasks]);

  // Filter, search, and sort tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          (t.description &&
            t.description.toLowerCase().includes(searchLower))
      );
    }

    return sortTasksByDueDate(result);
  }, [tasks, filter, searchText]);

  // FAB press: start voice recording (or restart after error)
  const handleFABPress = useCallback(async () => {
    if (voiceState === 'idle' || voiceState === 'error') {
      reset();
      setVoiceModalVisible(true);
      setTranscribedTasks([]);
      await startRecording();
    }
  }, [voiceState, reset, startRecording]);

  // Modal close: stop recording if active, otherwise cancel
  const handleVoiceModalClose = useCallback(async () => {
    if (voiceState === 'recording') {
      const result = await stopRecordingAndTranscribe();
      if (result.tasks.length > 0) {
        setTranscribedTasks(result.tasks);
      }
      // If error, modal stays open and shows the error
    } else {
      cancelRecording();
      setVoiceModalVisible(false);
      setTranscribedTasks([]);
    }
  }, [voiceState, stopRecordingAndTranscribe, cancelRecording]);

  // Delete with confirmation
  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTask(id),
        },
      ]);
    },
    [deleteTask]
  );

  // Clear completed tasks
  const handleClearCompleted = useCallback(() => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) return;
    Alert.alert(
      'Clear Completed',
      `Remove ${completedCount} completed task(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearCompleted,
        },
      ]
    );
  }, [tasks, clearCompleted]);

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      theme={theme}
      onToggle={toggleTask}
      onDelete={handleDelete}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {searchText.trim()
          ? 'No tasks match your search'
          : 'No tasks yet'}
      </Text>
      {!searchText.trim() && (
        <Text
          style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
        >
          Tap the microphone or + button to add a task
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return null;
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Tasks
        </Text>
        <View style={styles.headerButtons}>
          <ThemeToggle theme={theme} mode={mode} onToggle={toggleTheme} />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddTask')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.addButtonText, { color: theme.colors.primaryText }]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <SearchBar
        theme={theme}
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Filter + Clear Completed */}
      <View style={styles.filterRow}>
        <View style={styles.filterContainer}>
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filter === f ? theme.colors.primary : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === f
                        ? theme.colors.primaryText
                        : theme.colors.text,
                  },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {completedCount > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCompleted}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.clearText, { color: theme.colors.danger }]}
            >
              Clear ({completedCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <FAB theme={theme} onPress={handleFABPress} voiceState={voiceState} />

      {/* Voice Input Modal */}
      <VoiceInputModal
        visible={voiceModalVisible}
        theme={theme}
        voiceState={voiceState}
        error={voiceError}
        transcribedTasks={transcribedTasks}
        onCancel={handleVoiceModalClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
});
