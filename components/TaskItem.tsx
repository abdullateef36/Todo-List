/**
 * TaskItem component — renders a single task with checkbox, title,
 * optional description, due date, and delete button.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Task } from '../types/task';
import { Theme } from '../constants/theme';
import { formatDate, isOverdue } from '../utils/voiceUtils';

interface TaskItemProps {
  task: Task;
  theme: Theme;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  theme,
  onToggle,
  onDelete,
}) => {
  // Animation for checkbox toggle
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();
    onToggle(task.id);
  };

  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.checkbox,
            {
              backgroundColor: task.completed
                ? theme.colors.completed
                : 'transparent',
              borderColor: task.completed
                ? theme.colors.completed
                : theme.colors.border,
            },
          ]}
        >
          {task.completed && (
            <Text style={[styles.checkmark, { color: theme.colors.primaryText }]}>
              ✓
            </Text>
          )}
        </Animated.View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: task.completed
                  ? theme.colors.textSecondary
                  : theme.colors.text,
                textDecorationLine: task.completed ? 'line-through' : 'none',
              },
            ]}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text
              style={[
                styles.description,
                { color: theme.colors.textSecondary },
              ]}
            >
              {task.description}
            </Text>
          ) : null}
          {task.dueDate ? (
            <View style={styles.dueDateContainer}>
              <Text
                style={[
                  styles.dueDate,
                  {
                    color: overdue
                      ? theme.colors.danger
                      : theme.colors.textSecondary,
                    fontWeight: overdue ? 'bold' : 'normal',
                  },
                ]}
              >
                {overdue ? '⚠ Overdue: ' : '📅 '}
                {formatDate(new Date(task.dueDate))}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
        activeOpacity={0.7}
        hitSlop={10}
      >
        <Text style={[styles.deleteText, { color: theme.colors.danger }]}>
          ✕
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
  dueDateContainer: {
    marginTop: 4,
  },
  dueDate: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
