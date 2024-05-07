import { fetchAndSaveGithubData } from '@/github/fetch-and-save-github-data';

export const githubSync = async () => {
  await fetchAndSaveGithubData({ isInit: false });
  process.exit(0);
};

githubSync();
