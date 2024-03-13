import { Injectable } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import {
  RecordPositionQueryFactory,
  RecordPositionQueryType,
} from 'src/workspace/workspace-query-builder/factories/record-position-query.factory';
import { RecordPositionFactory } from 'src/workspace/workspace-query-runner/factories/record-position.factory';

@Injectable()
export class RecordPositionBackfillService {
  constructor(
    private readonly recordPositionFactory: RecordPositionFactory,
    private readonly recordPositionQueryFactory: RecordPositionQueryFactory,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async backfill(
    workspaceId: string,
    objectMetadata: { nameSingular: string; isCustom: boolean },
    recordId: string,
  ) {
    const position = await this.recordPositionFactory.create(
      'last',
      objectMetadata as ObjectMetadataInterface,
      workspaceId,
    );

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const query = await this.recordPositionQueryFactory.create(
      RecordPositionQueryType.UPDATE,
      position,
      objectMetadata as ObjectMetadataInterface,
      dataSourceSchema,
      recordId,
    );

    this.workspaceDataSourceService.executeRawQuery(
      query,
      [],
      workspaceId,
      undefined,
    );
  }
}
