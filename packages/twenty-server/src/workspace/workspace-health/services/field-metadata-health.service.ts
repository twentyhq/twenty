import { Injectable, NotFoundException } from '@nestjs/common';

import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceTableStructure } from 'src/workspace/workspace-health/interfaces/workspace-table-definition.interface';
import { WorkspaceHealthOptions } from 'src/workspace/workspace-health/interfaces/workspace-health-options.interface';

import { currencyFields } from 'src/metadata/field-metadata/composite-types/currency.composite-type';
import { fullNameFields } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { linkFields } from 'src/metadata/field-metadata/composite-types/link.composite-type';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/metadata/field-metadata/utils/is-composite-field-metadata-type.util';
import { DatabaseStructureService } from 'src/workspace/workspace-health/services/database-structure.service';
import { validName } from 'src/workspace/workspace-health/utils/valid-name.util';

@Injectable()
export class FieldMetadataHealthService {
  constructor(
    private readonly databaseStructureService: DatabaseStructureService,
  ) {}

  async healthCheck(
    schemaName: string,
    tableName: string,
    fieldMetadataCollection: FieldMetadataEntity[],
    options: WorkspaceHealthOptions,
  ): Promise<WorkspaceHealthIssue[]> {
    const issues: WorkspaceHealthIssue[] = [];
    const workspaceTableColumns =
      await this.databaseStructureService.getWorkspaceTableColumns(
        schemaName,
        tableName,
      );

    if (!workspaceTableColumns) {
      throw new NotFoundException(
        `Table ${tableName} not found in schema ${schemaName}`,
      );
    }

    for (const fieldMetadata of fieldMetadataCollection) {
      // Ignore relation fields for now
      if (
        fieldMetadata.fromRelationMetadata ||
        fieldMetadata.toRelationMetadata
      ) {
        // TODO: Check relation fields
        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeFieldMetadataMap = {
          [FieldMetadataType.CURRENCY]: currencyFields(fieldMetadata),
          [FieldMetadataType.FULL_NAME]: fullNameFields(fieldMetadata),
          [FieldMetadataType.LINK]: linkFields(fieldMetadata),
        };

        const compositeFieldMetadataCollection =
          compositeFieldMetadataMap[fieldMetadata.type];

        for (const compositeFieldMetadata of compositeFieldMetadataCollection) {
          const compositeFieldIssues = await this.healthCheckField(
            tableName,
            workspaceTableColumns,
            compositeFieldMetadata as FieldMetadataEntity,
            options,
          );

          issues.push(...compositeFieldIssues);
        }
      } else {
        const fieldIssues = await this.healthCheckField(
          tableName,
          workspaceTableColumns,
          fieldMetadata,
          options,
        );

        issues.push(...fieldIssues);
      }
    }

    return issues;
  }

  private async healthCheckField(
    tableName: string,
    workspaceTableColumns: WorkspaceTableStructure[],
    fieldMetadata: FieldMetadataEntity,
    options: WorkspaceHealthOptions,
  ): Promise<WorkspaceHealthIssue[]> {
    const issues: WorkspaceHealthIssue[] = [];

    if (options.mode === 'structure' || options.mode === 'all') {
      const structureIssues = await this.structureFieldCheck(
        tableName,
        workspaceTableColumns,
        fieldMetadata,
      );

      issues.push(...structureIssues);
    }

    if (options.mode === 'metadata' || options.mode === 'all') {
      const metadataIssues = await this.metadataFieldCheck(
        tableName,
        fieldMetadata,
      );

      issues.push(...metadataIssues);
    }

    return issues;
  }

  private async structureFieldCheck(
    tableName: string,
    workspaceTableColumns: WorkspaceTableStructure[],
    fieldMetadata: FieldMetadataEntity,
  ): Promise<WorkspaceHealthIssue[]> {
    const issues: WorkspaceHealthIssue[] = [];
    const columnName = fieldMetadata.targetColumnMap.value;
    const dataType = this.databaseStructureService.getPostgresDataType(
      fieldMetadata.type,
    );
    const isNullable = fieldMetadata.isNullable ? 'YES' : 'NO';
    // Check if column exist in database
    const columnStructure = workspaceTableColumns.find(
      (tableDefinition) => tableDefinition.column_name === columnName,
    );

    if (!columnStructure) {
      issues.push({
        type: WorkspaceHealthIssueType.MISSING_COLUMN,
        fieldMetadata,
        columnStructure,
        message: `Column ${columnName} not found in table ${tableName}`,
      });

      return issues;
    }

    // Check if column data type is the same
    if (columnStructure.data_type !== dataType) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT,
        fieldMetadata,
        columnStructure,
        message: `Column ${columnName} type is not the same as the field metadata type "${columnStructure.data_type}" !== "${dataType}"`,
      });
    }

    if (columnStructure.is_nullable !== isNullable) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT,
        fieldMetadata,
        columnStructure,
        message: `Column ${columnName} is not nullable as expected`,
      });
    }

    return issues;
  }

  private async metadataFieldCheck(
    tableName: string,
    fieldMetadata: FieldMetadataEntity,
  ): Promise<WorkspaceHealthIssue[]> {
    const issues: WorkspaceHealthIssue[] = [];
    const columnName = fieldMetadata.targetColumnMap.value;

    if (Object.keys(fieldMetadata.targetColumnMap).length !== 1) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
        fieldMetadata,
        message: `Column ${columnName} has more than one target column map, it should only contains "value"`,
      });
    }

    if (fieldMetadata.isCustom && !columnName.startsWith('_')) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_NAME_SHOULD_BE_CUSTOM,
        fieldMetadata,
        message: `Column ${columnName} is marked as custom in table ${tableName} but doesn't start with "_"`,
      });
    }

    if (!fieldMetadata.objectMetadataId) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_OBJECT_REFERENCE_INVALID,
        fieldMetadata,
        message: `Column ${columnName} doesn't have a valid object metadata id`,
      });
    }

    if (!Object.values(FieldMetadataType).includes(fieldMetadata.type)) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_TYPE_NOT_VALID,
        fieldMetadata,
        message: `Column ${columnName} doesn't have a valid field metadata type`,
      });
    }

    if (
      !fieldMetadata.name ||
      !validName(fieldMetadata.name) ||
      !fieldMetadata.label
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_NAME_NOT_VALID,
        fieldMetadata,
        message: `Column ${columnName} doesn't have a valid name or label`,
      });
    }

    return issues;
  }
}
