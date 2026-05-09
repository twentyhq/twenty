type CleanupErrorHandler = (error: unknown) => void;

const reportCleanupErrorInDevelopment: CleanupErrorHandler = (error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Cleanup task failed:', error);
  }
};

export const runCleanupTasks = (
  cleanupTasks: ReadonlyArray<() => void>,
  onError: CleanupErrorHandler = reportCleanupErrorInDevelopment,
) => {
  cleanupTasks.forEach((cleanupTask) => {
    try {
      cleanupTask();
    } catch (error) {
      onError(error);
    }
  });
};
