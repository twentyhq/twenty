import { executePartialSync } from '@/github-sync/execute-partial-sync';

export const githubSync = async () => {
  await executePartialSync();
  process.exit(0);
};

githubSync();
