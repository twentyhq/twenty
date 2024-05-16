import { fetchAndSaveGithubData } from '@/github-sync/fetch-and-save-github-data';

export const githubInit = async () => {
  await fetchAndSaveGithubData();
  process.exit(0);
};

githubInit();
