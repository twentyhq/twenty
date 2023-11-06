import { ConfigService } from '@nestjs/config';

import console from 'console';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();
const configService = new ConfigService();
export const connectionSource = new DataSource({
  type: 'postgres',
  logging: false,
  url: configService.get<string>('PG_DATABASE_URL'),
});

export const performQuery = async (
  query: string,
  consoleDescription: string,
  withLog = true,
) => {
  try {
    const result = await connectionSource.query(query);
    withLog && console.log(`Performed '${consoleDescription}' successfully`);
    return result;
  } catch (err) {
    withLog && console.error(`Failed to perform '${consoleDescription}':`, err);
  }
};
