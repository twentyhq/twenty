import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMemberCreateManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-create-many.pre-query.hook';
import { WorkspaceMemberCreateOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-create-one.pre-query.hook';
import { WorkspaceMemberDeleteManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-many.pre-query.hook';
import { WorkspaceMemberDeleteOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-one.pre-query.hook';
import { WorkspaceMemberDestroyManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-destroy-many.pre-query.hook';
import { WorkspaceMemberDestroyOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-destroy-one.pre-query.hook';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';
import { WorkspaceMemberRestoreManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-restore-many.pre-query.hook';
import { WorkspaceMemberRestoreOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-restore-one.pre-query.hook';
import { WorkspaceMemberUpdateManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-update-many.pre-query.hook';
import { WorkspaceMemberUpdateOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-update-one.pre-query.hook';

@Module({
  providers: [
    WorkspaceMemberPreQueryHookService,
    WorkspaceMemberCreateOnePreQueryHook,
    WorkspaceMemberCreateManyPreQueryHook,
    WorkspaceMemberDeleteOnePreQueryHook,
    WorkspaceMemberDeleteManyPreQueryHook,
    WorkspaceMemberDestroyOnePreQueryHook,
    WorkspaceMemberDestroyManyPreQueryHook,
    WorkspaceMemberRestoreOnePreQueryHook,
    WorkspaceMemberRestoreManyPreQueryHook,
    WorkspaceMemberUpdateOnePreQueryHook,
    WorkspaceMemberUpdateManyPreQueryHook,
  ],
  imports: [
    FeatureFlagModule,
    PermissionsModule,
    TypeOrmModule.forFeature([UserWorkspace], 'core'),
  ],
})
export class WorkspaceMemberQueryHookModule {}
