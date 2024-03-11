import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceQueryRunnerOptions } from 'src/workspace/workspace-query-runner/interfaces/query-runner-option.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RecordPositionQueryFactory } from 'src/workspace/workspace-query-builder/factories/record-position-query.factory';

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

    return this.createArgsRecursive(args, options, fieldMetadataMap);
  }

  private async createArgsRecursive(
    args: Record<string, any>,
    options: WorkspaceQueryRunnerOptions,
    fieldMetadataMap: Map<string, FieldMetadataInterface>,
  ) {
    // If it's not an object, we don't need to do anything
    if (typeof args !== 'object' || args === null) {
      return args;
    }

    // If it's an array, we need to map all items
    if (Array.isArray(args)) {
      return Promise.all(
        args.map((arg) =>
          this.createArgsRecursive(arg, options, fieldMetadataMap),
        ),
      );
    }

    const createArgPromisesByArgKey = Object.entries(args).map(
      async ([key, value]) => {
        const fieldMetadata = fieldMetadataMap.get(key);

        if (!fieldMetadata) {
          return [
            key,
            await this.createArgsRecursive(value, options, fieldMetadataMap),
          ];
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
            return [
              key,
              await this.createArgsRecursive(value, options, fieldMetadataMap),
            ];
        }
      },
    );

    const newArgEntries = await Promise.all(createArgPromisesByArgKey);

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
