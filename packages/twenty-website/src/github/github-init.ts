import { fetchAndSaveGithubData } from '@/github/fetch-and-save-github-data';

export const githubInit = async () => {
  await fetchAndSaveGithubData({ isInit: true });
  process.exit(0);
};

githubInit();
