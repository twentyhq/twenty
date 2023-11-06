import { ConfigService } from '@nestjs/config';

import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

import { PrismaService } from 'src/database/prisma.service';

config();

const configService = new ConfigService();
@Command({
  name: 'database:migrate-old-schema',
  description: 'Migrate old database data into new database',
})
export class MigrateOldSchemaCommand extends CommandRunner {
  constructor(
    private readonly prismaService: PrismaService,
    private oldConnectionSource,
    private newConnectionSource,
  ) {
    super();
    this.oldConnectionSource = new DataSource({
      type: 'postgres',
      logging: false,
      url: configService.get<string>('PRISMA_DATABASE_URL'),
    });
    this.newConnectionSource = new DataSource({
      type: 'postgres',
      logging: false,
      url: configService.get<string>('PG_DATABASE_URL'),
    });
  }

  async run() {
    const views = await this.oldConnectionSource.query('SELECT * FROM views');
    const tenants = await this.newConnectionSource.query(
      'SELECT * FROM metadata.data_source_metadata',
    );
    console.log(tenants);
    for (const view of views) {
      console.log(view);
    }
  }
}
