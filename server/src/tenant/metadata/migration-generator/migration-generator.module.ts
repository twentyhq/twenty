import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/tenant/metadata/data-source/data-source.module';

import { MigrationGeneratorService } from './migration-generator.service';

@Module({
  imports: [DataSourceModule],
  exports: [MigrationGeneratorService],
  providers: [MigrationGeneratorService],
})
export class MigrationGeneratorModule {}
