import { Module } from '@nestjs/common';

import { CoreEngineVersionService } from 'src/engine/services/core-engine-version.service';
import { CoreMigrationRunnerService } from 'src/engine/services/core-migration-runner.service';

@Module({
  providers: [CoreEngineVersionService, CoreMigrationRunnerService],
  exports: [CoreEngineVersionService, CoreMigrationRunnerService],
})
export class CoreEngineModule {}
