import { migrate } from '@/database/database';

export const initDatabase = async () => {
  await migrate();
  process.exit(0);
};

initDatabase();
