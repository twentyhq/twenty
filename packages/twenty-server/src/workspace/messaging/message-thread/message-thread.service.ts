import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';

@Injectable()
export class MessageThreadService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async deleteByIds(
    messageThreadIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."messageThread" WHERE id = ANY($1)`,
      [messageThreadIds],
    );
  }
}
