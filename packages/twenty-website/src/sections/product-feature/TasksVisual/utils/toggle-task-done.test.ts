import { type Task } from '../types/task';
import { toggleTaskDone } from './toggle-task-done';

const TASKS: Task[] = [
  {
    body: '',
    done: false,
    due: '',
    id: 'a',
    target: { avatarUrl: '', name: '' },
    title: 'A',
  },
  {
    body: '',
    done: true,
    due: '',
    id: 'b',
    target: { avatarUrl: '', name: '' },
    title: 'B',
  },
];

describe('toggleTaskDone', () => {
  it('should mark a not-done task as done', () => {
    expect(toggleTaskDone(TASKS, 'a')[0].done).toBe(true);
  });

  it('should mark a done task as not done', () => {
    expect(toggleTaskDone(TASKS, 'b')[1].done).toBe(false);
  });

  it('should leave the other tasks untouched', () => {
    expect(toggleTaskDone(TASKS, 'a')[1]).toBe(TASKS[1]);
  });

  it('should not mutate the input tasks', () => {
    toggleTaskDone(TASKS, 'a');
    expect(TASKS[0].done).toBe(false);
  });
});
