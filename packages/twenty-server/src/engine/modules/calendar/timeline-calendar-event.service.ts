import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class TimelineCalendarEventService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}
}
