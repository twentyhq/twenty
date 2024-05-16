import { migrate } from '@/database/database';

export const migrateDatabase = async () => {
  await migrate();
  process.exit(0);
};

migrateDatabase();
