import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [WorkspaceMigrationModule, FeatureFlagModule],
  providers: [],
  exports: [],
})
export class WorkspaceMigrationBuilderV2Module {}
