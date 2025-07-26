import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [WorkspaceMigrationBuilderV2Service],
  exports: [WorkspaceMigrationBuilderV2Service],
})
export class WorkspaceMigrationBuilderV2Module {}
