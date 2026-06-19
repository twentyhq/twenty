type CleanupErrorHandler = (error: unknown) => void;

const reportCleanupErrorInDevelopment: CleanupErrorHandler = (error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Cleanup task failed:', error);
  }
};

// Runs every cleanup task even if an earlier one throws, so a single failed
// teardown can't leak the rest of a render loop's disposables.
export function runCleanupTasks(
  cleanupTasks: ReadonlyArray<() => void>,
  onError: CleanupErrorHandler = reportCleanupErrorInDevelopment,
) {
  cleanupTasks.forEach((cleanupTask) => {
    try {
      cleanupTask();
    } catch (error) {
      onError(error);
    }
  });
}
