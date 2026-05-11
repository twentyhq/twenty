import { runCleanupTasks } from '../run-cleanup-tasks';

describe('runCleanupTasks', () => {
  it('runs cleanup tasks in declaration order', () => {
    const calls: string[] = [];

    runCleanupTasks(
      [() => calls.push('first'), () => calls.push('second')],
      jest.fn(),
    );

    expect(calls).toEqual(['first', 'second']);
  });

  it('continues cleanup after a task throws', () => {
    const error = new Error('dispose failed');
    const calls: string[] = [];
    const onError = jest.fn();

    runCleanupTasks(
      [
        () => calls.push('first'),
        () => {
          throw error;
        },
        () => calls.push('third'),
      ],
      onError,
    );

    expect(calls).toEqual(['first', 'third']);
    expect(onError).toHaveBeenCalledWith(error);
  });
});
