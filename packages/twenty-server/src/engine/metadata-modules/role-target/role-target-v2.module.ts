import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/workspace-many-or-all-flat-entity-maps-cache/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

import { RoleTargetServiceV2 } from './role-target-v2.service';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationV2Module,
  ],
  providers: [RoleTargetServiceV2],
  exports: [RoleTargetServiceV2],
})
export class RoleTargetV2Module {}

