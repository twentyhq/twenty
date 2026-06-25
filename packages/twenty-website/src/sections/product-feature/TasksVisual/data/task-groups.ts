import { type Task } from '../types/task';
import { TASKS } from './tasks';

export const TASK_GROUPS: { items: Task[]; label: string }[] = [
  { items: TASKS.filter((task) => !task.done), label: 'TODO' },
  { items: TASKS.filter((task) => task.done), label: 'DONE' },
];
