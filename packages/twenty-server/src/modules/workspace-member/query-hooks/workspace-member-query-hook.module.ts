import { Module } from '@nestjs/common';

import { WorkspaceMemberDeleteManyPreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-many.pre-query.hook';
import { WorkspaceMemberDeleteOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-delete-one.pre-query.hook';

@Module({
  providers: [
    WorkspaceMemberDeleteOnePreQueryHook,
    WorkspaceMemberDeleteManyPreQueryHook,
  ],
})
export class WorkspaceMemberQueryHookModule {}
