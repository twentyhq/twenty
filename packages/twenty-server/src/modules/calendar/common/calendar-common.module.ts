import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/calendar-messaging-participant-manager/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [AddPersonIdAndWorkspaceMemberIdService],
  exports: [],
})
export class CalendarCommonModule {}
