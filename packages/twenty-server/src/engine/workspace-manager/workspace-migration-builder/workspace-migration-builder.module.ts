import { Module } from '@nestjs/common';

import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

import { workspaceMigrationBuilderFactories } from './factories';

@Module({
  imports: [WorkspaceMigrationModule],
  providers: [...workspaceMigrationBuilderFactories],
  exports: [...workspaceMigrationBuilderFactories],
})
export class WorkspaceMigrationBuilderModule {}
