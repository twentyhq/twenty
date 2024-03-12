import { Injectable } from '@nestjs/common';

import { WorkspaceQueryRunnerOptions } from 'src/workspace/workspace-query-runner/interfaces/query-runner-option.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { RecordPositionQueryFactory } from 'src/workspace/workspace-query-builder/factories/record-position-query.factory';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly recordPositionQueryFactory: RecordPositionQueryFactory,
  ) {}

  async create(
    args: Record<string, any>,
    options: WorkspaceQueryRunnerOptions,
  ) {
    const fieldMetadataCollection = options.fieldMetadataCollection;

    const fieldMetadataMap = new Map(
      fieldMetadataCollection.map((fieldMetadata) => [
        fieldMetadata.name,
        fieldMetadata,
      ]),
    );

    return {
      data: await Promise.all(
        args.data.map((arg) =>
          this.overrideArgByFieldMetadata(arg, options, fieldMetadataMap),
        ),
      ),
    };
  }

  private async overrideArgByFieldMetadata(
    arg: Record<string, any>,
    options: WorkspaceQueryRunnerOptions,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    const createArgPromiseByArgKey = Object.entries(arg).map(
      async ([key, value]) => {
        const fieldMetadata = fieldMetadataMap.get(key);

        if (!fieldMetadata) {
          return [key, await Promise.resolve(value)];
        }

        switch (fieldMetadata.type) {
          case FieldMetadataType.POSITION:
            return [
              key,
              await this.buildPositionValue(
                value,
                options.objectMetadataItem,
                options.workspaceId,
              ),
            ];
          default:
            return [key, await Promise.resolve(value)];
        }
      },
    );

    const newArgEntries = await Promise.all(createArgPromiseByArgKey);

    return Object.fromEntries(newArgEntries);
  }

  private async buildPositionValue(
    value: number | 'first' | 'last',
    objectMetadataItem: ObjectMetadataInterface,
    workspaceId: string,
  ) {
    if (typeof value === 'number') {
      return value;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const query = await this.recordPositionQueryFactory.create(
      value,
      objectMetadataItem,
      dataSourceSchema,
    );

    const records = await this.workspaceDataSourceService.executeRawQuery(
      query,
      [],
      workspaceId,
      undefined,
    );

    return (
      (value === 'first'
        ? records[0]?.position / 2
        : records[0]?.position + 1) || 1
    );
  }
}
