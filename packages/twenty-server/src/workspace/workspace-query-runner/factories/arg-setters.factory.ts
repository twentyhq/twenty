import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceQueryRunnerOptions } from 'src/workspace/workspace-query-runner/interfaces/query-runner-option.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

@Injectable()
export class ArgsSettersFactory {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
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

    return this.applySettersToArgsRecursive(args, options, fieldMetadataMap);
  }

  private async applySettersToArgsRecursive(
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
          this.applySettersToArgsRecursive(arg, options, fieldMetadataMap),
        ),
      );
    }

    const newArgs = {};

    for (const [key, value] of Object.entries(args)) {
      const fieldMetadata = fieldMetadataMap.get(key);

      if (!fieldMetadata) {
        newArgs[key] = await this.applySettersToArgsRecursive(
          value,
          options,
          fieldMetadataMap,
        );
        continue;
      }

      switch (fieldMetadata.type) {
        case FieldMetadataType.POSITION:
          newArgs[key] = await this.buildPositionValue(
            value,
            options.objectMetadataItem,
            options.workspaceId,
          );
          break;
        default:
          newArgs[key] = await this.applySettersToArgsRecursive(
            value,
            options,
            fieldMetadataMap,
          );
      }
    }

    return newArgs;
  }

  private async buildPositionValue(
    value: number | 'first' | 'last',
    objectMetadataItem: ObjectMetadataInterface,
    workspaceId: string,
  ) {
    if (typeof value === 'number') {
      return value;
    }

    const orderByDirection = value === 'first' ? 'ASC' : 'DESC';

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const name =
      (objectMetadataItem.isCustom ? '_' : '') +
      objectMetadataItem.nameSingular;

    const record = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT position FROM ${dataSourceSchema}."${name}"
            WHERE "position" IS NOT NULL ORDER BY "position" ${orderByDirection} LIMIT 1`,
      [],
      workspaceId,
      undefined,
    );

    const position =
      (value === 'first' ? record[0]?.position / 2 : record[0]?.position + 1) ||
      1;

    return position;
  }
}
