import { fetchAndSaveGithubData } from '@/github/fetch-and-save-github-data';

export const githubSync = async () => {
  const pageLimitFlagIndex = process.argv.indexOf('--pageLimit');
  let pageLimit = 0;

  if (pageLimitFlagIndex > -1) {
    pageLimit = parseInt(process.argv[pageLimitFlagIndex + 1], 10);
  }

  await fetchAndSaveGithubData({ pageLimit });
  process.exit(0);
};

githubSync();
