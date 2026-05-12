import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceMemberCreateManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-create-many.pre-query.hook';
import { WorkspaceMemberCreateOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-create-one.pre-query.hook';
import { WorkspaceMemberDeleteManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-many.pre-query.hook';
import { WorkspaceMemberDeleteOnePostQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-one.post-query.hook';
import { WorkspaceMemberDeleteOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-one.pre-query.hook';
import { WorkspaceMemberDestroyManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-destroy-many.pre-query.hook';
import { WorkspaceMemberDestroyOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-destroy-one.pre-query.hook';
import { WorkspaceMemberRestoreManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-restore-many.pre-query.hook';
import { WorkspaceMemberRestoreOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-restore-one.pre-query.hook';
import { WorkspaceMemberUpdateManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-update-many.pre-query.hook';

@Module({
  providers: [
    WorkspaceMemberCreateOnePreQueryHook,
    WorkspaceMemberCreateManyPreQueryHook,
    WorkspaceMemberDeleteOnePreQueryHook,
    WorkspaceMemberDeleteOnePostQueryHook,
    WorkspaceMemberDeleteManyPreQueryHook,
    WorkspaceMemberDestroyOnePreQueryHook,
    WorkspaceMemberDestroyManyPreQueryHook,
    WorkspaceMemberRestoreOnePreQueryHook,
    WorkspaceMemberRestoreManyPreQueryHook,
    WorkspaceMemberUpdateManyPreQueryHook,
  ],
  imports: [
    CoreEntityCacheModule,
    FeatureFlagModule,
    UserWorkspaceModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
})
export class WorkspaceMemberQueryHookModule {}
