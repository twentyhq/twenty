import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceMemberIndividualRoleService } from 'src/engine/permissions/workspace-member-individual-role/services/workspace-member-individual-role.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceMigrationModule, ApplicationModule],
  providers: [WorkspaceMemberIndividualRoleService],
  exports: [WorkspaceMemberIndividualRoleService],
})
export class WorkspaceMemberIndividualRoleModule {}
