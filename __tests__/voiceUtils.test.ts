/**
 * Unit tests for the pure voice-processing utilities in utils/voiceUtils.ts.
 * These functions contain no native dependencies and can be tested with Jest.
 */
import {
  splitTranscribedTextIntoTasks,
  cleanTaskTitle,
  formatDate,
  isOverdue,
  sortTasksByDueDate,
} from '../utils/voiceUtils';
import { Task } from '../types/task';

describe('cleanTaskTitle', () => {
  it('trims leading and trailing whitespace', () => {
    expect(cleanTaskTitle('   buy milk   ')).toBe('Buy milk');
  });

  it('capitalizes the first letter', () => {
    expect(cleanTaskTitle('buy milk')).toBe('Buy milk');
  });

  it('removes trailing punctuation', () => {
    expect(cleanTaskTitle('call mom!')).toBe('Call mom');
    expect(cleanTaskTitle('finish report.')).toBe('Finish report');
  });

  it('returns an empty string for empty input', () => {
    expect(cleanTaskTitle('   ')).toBe('');
    expect(cleanTaskTitle('')).toBe('');
  });
});

describe('splitTranscribedTextIntoTasks', () => {
  it('splits on the conjunction "and"', () => {
    expect(splitTranscribedTextIntoTasks('Buy provisions and call mom')).toEqual([
      'Buy provisions',
      'call mom',
    ]);
  });

  it('splits on commas and semicolons', () => {
    expect(
      splitTranscribedTextIntoTasks('Buy milk, walk the dog; water plants')
    ).toEqual(['Buy milk', 'walk the dog', 'water plants']);
  });

  it('splits on "then"', () => {
    expect(
      splitTranscribedTextIntoTasks('Finish the report then email the team')
    ).toEqual(['Finish the report', 'email the team']);
  });

  it('returns an empty array for empty input', () => {
    expect(splitTranscribedTextIntoTasks('')).toEqual([]);
    expect(splitTranscribedTextIntoTasks('   ')).toEqual([]);
  });

  it('deduplicates repeated tasks while preserving order', () => {
    expect(splitTranscribedTextIntoTasks('Buy milk and buy milk')).toEqual([
      'Buy milk',
    ]);
  });
});

describe('formatDate', () => {
  it('formats a date as "Mon D, YYYY"', () => {
    expect(formatDate(new Date(2026, 6, 20))).toBe('Jul 20, 2026');
    expect(formatDate(new Date(2026, 0, 5))).toBe('Jan 5, 2026');
  });
});

describe('isOverdue', () => {
  it('returns false when there is no due date', () => {
    expect(isOverdue(undefined, false)).toBe(false);
  });

  it('returns false for completed tasks', () => {
    expect(isOverdue('2020-01-01', true)).toBe(false);
  });

  it('returns true for a past due date on an open task', () => {
    expect(isOverdue('2020-01-01', false)).toBe(true);
  });

  it('returns false for a future due date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    expect(isOverdue(future.toISOString(), false)).toBe(false);
  });
});

describe('sortTasksByDueDate', () => {
  const makeTask = (id: string, dueDate?: string): Task => ({
    id,
    title: `Task ${id}`,
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    dueDate,
  });

  it('sorts tasks by due date (earliest first)', () => {
    const tasks = [
      makeTask('a', '2026-03-01'),
      makeTask('b', '2026-01-01'),
      makeTask('c', '2026-02-01'),
    ];
    expect(sortTasksByDueDate(tasks).map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('puts tasks without a due date at the end', () => {
    const tasks = [
      makeTask('nodate1'),
      makeTask('b', '2026-01-01'),
      makeTask('nodate2'),
    ];
    expect(sortTasksByDueDate(tasks).map((t) => t.id)).toEqual([
      'b',
      'nodate1',
      'nodate2',
    ]);
  });

  it('does not mutate the original array', () => {
    const tasks = [
      makeTask('a', '2026-03-01'),
      makeTask('b', '2026-01-01'),
    ];
    sortTasksByDueDate(tasks);
    expect(tasks[0].id).toBe('a');
    expect(tasks[1].id).toBe('b');
  });
});