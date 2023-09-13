import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/core/tenant/datasource/services/datasource.service';

@Injectable()
export class MetadataService {
  constructor(private readonly dataSourceService: DataSourceService) {}

  public async fetchMetadataFromWorkspaceId(workspaceId: string) {
    return this.dataSourceService.fetchMetadata(workspaceId);
  }
}
