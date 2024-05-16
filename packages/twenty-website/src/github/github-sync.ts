import { executePartialSync } from '@/github/execute-partial-sync';
import { fetchAndSaveGithubData } from '@/github/fetch-and-save-github-data';

export const githubSync = async () => {
  const isFullSyncFlagIndex = process.argv.indexOf('--isFullSync');
  const isFullSync = isFullSyncFlagIndex > -1;

  if (isFullSync) {
    await fetchAndSaveGithubData();
  } else {
    await executePartialSync();
  }

  process.exit(0);
};

githubSync();
