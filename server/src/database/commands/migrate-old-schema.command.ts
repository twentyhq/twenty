import { ConfigService } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

import { PrismaService } from 'src/database/prisma.service';

config();

const configService = new ConfigService();

const oldConnectionSource = new DataSource({
  type: 'postgres',
  logging: false,
  url: configService.get<string>('PRISMA_DATABASE_URL'),
});
const newConnectionSource = new DataSource({
  type: 'postgres',
  logging: false,
  url: configService.get<string>('PG_DATABASE_URL'),
});
@Command({
  name: 'database:migrate-old-schema',
  description: 'Migrate old database data into new database',
})
export class MigrateOldSchemaCommand extends CommandRunner {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async run() {
    try {
      /*const views = await oldConnectionSource.query('SELECT * FROM views');
      console.log('views', views);*/
      const tenants = await newConnectionSource.query(
        'SELECT * FROM metadata.data_source_metadata',
      );
      console.log('tenants', tenants);
      /*    for (const view of views) {
      console.log(view);
    }*/
    } catch (e) {
      console.log(e);
    }
  }
}
