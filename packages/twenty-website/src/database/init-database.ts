import { githubSynch } from '@/github-synch/github-synch';

export const initDatabase = async () => {
  await githubSynch();
  process.exit(0);
};

initDatabase();
