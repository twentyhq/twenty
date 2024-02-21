export const getDryRunLogHeader = (isDryRun: boolean | undefined): string => {
  return isDryRun ? 'Dry-run mode: ' : '';
};
