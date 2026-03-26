import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

@Injectable()
export class CoreMigrationRunnerService {
  private readonly logger = new Logger(CoreMigrationRunnerService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Running core datasource migrations...');

    try {
      const migrations = await this.dataSource.runMigrations({
        transaction: 'each',
      });

      if (migrations.length === 0) {
        this.logger.log('No pending migrations');
      } else {
        this.logger.log(
          `Executed ${migrations.length} migration(s): ${migrations.map((migration) => migration.name).join(', ')}`,
        );
      }

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Error running database migrations:', error);
      throw error;
    }
  }
}
