import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/core/tenant/datasource/services/datasource.service';

@Injectable()
export class MetadataService {
  constructor(private readonly dataSourceService: DataSourceService) {}

  public async fetchMetadataFromWorkspaceId(workspaceId: string) {
    await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    return await this.dataSourceService.fetchObjectsAndFieldsFromMetadata(
      workspaceId,
    );
  }
}
