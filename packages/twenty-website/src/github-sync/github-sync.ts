import { fetchAndSaveGithubData } from '@/github-sync/fetch-and-save-github-data';

export const githubSync = async () => {
  await fetchAndSaveGithubData();
  process.exit(0);
};

githubSync();
