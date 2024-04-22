import { migrate } from '@/database/database';
import { fetchAndSaveGithubData } from '@/github-sync/fetch-and-save-github-data';

export const initDatabase = async () => {
  await migrate();
  await fetchAndSaveGithubData();
  process.exit(0);
};

initDatabase();
