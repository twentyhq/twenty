import { Injectable, InternalServerErrorException } from '@nestjs/common';

import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceTableStructure } from 'src/workspace/workspace-health/interfaces/workspace-table-definition.interface';
import { WorkspaceHealthOptions } from 'src/workspace/workspace-health/interfaces/workspace-health-options.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/metadata/field-metadata/utils/is-composite-field-metadata-type.util';
import { DatabaseStructureService } from 'src/workspace/workspace-health/services/database-structure.service';
import { validName } from 'src/workspace/workspace-health/utils/valid-name.util';
import { compositeDefinitions } from 'src/metadata/field-metadata/composite-types';
import { validateDefaultValueForType } from 'src/metadata/field-metadata/utils/validate-default-value-for-type.util';
import { isEnumFieldMetadataType } from 'src/metadata/field-metadata/utils/is-enum-field-metadata-type.util';
import { validateOptionsForType } from 'src/metadata/field-metadata/utils/validate-options-for-type.util';

@Injectable()
export class FieldMetadataHealthService {
  constructor(
    private readonly databaseStructureService: DatabaseStructureService,
  ) {}

  async healthCheck(
    tableName: string,
    workspaceTableColumns: WorkspaceTableStructure[],
    fieldMetadataCollection: FieldMetadataEntity[],
    options: WorkspaceHealthOptions,
  ): Promise<WorkspaceHealthIssue[]> {
    const issues: WorkspaceHealthIssue[] = [];

    for (const fieldMetadata of fieldMetadataCollection) {
      // Relation metadata are checked in another service
      if (
        fieldMetadata.fromRelationMetadata ||
        fieldMetadata.toRelationMetadata
      ) {
        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeFieldMetadataCollection =
          compositeDefinitions.get(fieldMetadata.type)?.(fieldMetadata) ?? [];

        if (options.mode === 'metadata' || options.mode === 'all') {
          const targetColumnMapIssues =
            this.targetColumnMapCheck(fieldMetadata);

          issues.push(...targetColumnMapIssues);

          const defaultValueIssues =
            this.defaultValueHealthCheck(fieldMetadata);

          issues.push(...defaultValueIssues);
        }

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
      const structureIssues = this.structureFieldCheck(
        tableName,
        workspaceTableColumns,
        fieldMetadata,
      );

      issues.push(...structureIssues);
    }

    if (options.mode === 'metadata' || options.mode === 'all') {
      const metadataIssues = this.metadataFieldCheck(tableName, fieldMetadata);

      issues.push(...metadataIssues);
    }

    return issues;
  }

  private structureFieldCheck(
    tableName: string,
    workspaceTableColumns: WorkspaceTableStructure[],
    fieldMetadata: FieldMetadataEntity,
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];
    const columnName = fieldMetadata.targetColumnMap.value;

    const dataType = this.databaseStructureService.getPostgresDataType(
      fieldMetadata.type,
      fieldMetadata.name,
      fieldMetadata.object?.nameSingular,
    );

    const defaultValue = this.databaseStructureService.getPostgresDefault(
      fieldMetadata.type,
      fieldMetadata.defaultValue,
    );
    // Check if column exist in database
    const columnStructure = workspaceTableColumns.find(
      (tableDefinition) => tableDefinition.columnName === columnName,
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
    if (columnStructure.dataType !== dataType) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT,
        fieldMetadata,
        columnStructure,
        message: `Column ${columnName} type is not the same as the field metadata type "${columnStructure.dataType}" !== "${dataType}"`,
      });
    }

    if (columnStructure.isNullable !== fieldMetadata.isNullable) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_NULLABILITY_CONFLICT,
        fieldMetadata,
        columnStructure,
        message: `Column ${columnName} is expected to be ${
          fieldMetadata.isNullable ? 'nullable' : 'not nullable'
        } but is ${columnStructure.isNullable ? 'nullable' : 'not nullable'}`,
      });
    }

    if (
      defaultValue &&
      columnStructure.columnDefault &&
      !columnStructure.columnDefault.startsWith(defaultValue)
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT,
        fieldMetadata,
        columnStructure,
        message: `Column ${columnName} default value is not the same as the field metadata default value "${columnStructure.columnDefault}" !== "${defaultValue}"`,
      });
    }

    return issues;
  }

  private metadataFieldCheck(
    tableName: string,
    fieldMetadata: FieldMetadataEntity,
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];
    const columnName = fieldMetadata.targetColumnMap.value;
    const targetColumnMapIssues = this.targetColumnMapCheck(fieldMetadata);
    const defaultValueIssues = this.defaultValueHealthCheck(fieldMetadata);

    if (Object.keys(fieldMetadata.targetColumnMap).length !== 1) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
        fieldMetadata,
        message: `Column ${columnName} has more than one target column map, it should only contains "value"`,
      });
    }

    issues.push(...targetColumnMapIssues);

    if (fieldMetadata.isCustom && !columnName?.startsWith('_')) {
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

    if (
      isEnumFieldMetadataType(fieldMetadata.type) &&
      !validateOptionsForType(fieldMetadata.type, fieldMetadata.options)
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_OPTIONS_NOT_VALID,
        fieldMetadata,
        message: `Column options of ${fieldMetadata.targetColumnMap?.value} is not valid`,
      });
    }

    issues.push(...defaultValueIssues);

    return issues;
  }

  private targetColumnMapCheck(
    fieldMetadata: FieldMetadataEntity,
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];

    if (!fieldMetadata.targetColumnMap) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
        fieldMetadata,
        message: `Column targetColumnMap of ${fieldMetadata.name} is empty`,
      });
    }

    if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
      if (
        Object.keys(fieldMetadata.targetColumnMap).length !== 1 &&
        !('value' in fieldMetadata.targetColumnMap)
      ) {
        issues.push({
          type: WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
          fieldMetadata,
          message: `Column targetColumnMap "${fieldMetadata.targetColumnMap}" is not valid or well structured`,
        });
      }

      return issues;
    }

    if (
      !this.isCompositeObjectWellStructured(
        fieldMetadata.type,
        fieldMetadata.targetColumnMap,
      )
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
        fieldMetadata,
        message: `Column targetColumnMap for composite type ${fieldMetadata.type} is not well structured "${fieldMetadata.targetColumnMap}"`,
      });
    }

    return issues;
  }

  private defaultValueHealthCheck(
    fieldMetadata: FieldMetadataEntity,
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];

    if (
      !validateDefaultValueForType(
        fieldMetadata.type,
        fieldMetadata.defaultValue,
      )
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID,
        fieldMetadata,
        message: `Column default value for composite type ${fieldMetadata.type} is not well structured`,
      });
    }

    return issues;
  }

  private isCompositeObjectWellStructured(
    fieldMetadataType: FieldMetadataType,
    object: any,
  ): boolean {
    const subFields = compositeDefinitions.get(fieldMetadataType)?.() ?? [];

    if (!object) {
      return true;
    }

    if (subFields.length === 0) {
      throw new InternalServerErrorException(
        `The composite field type ${fieldMetadataType} doesn't have any sub fields, it seems this one is not implemented in the composite definitions map`,
      );
    }

    for (const subField of subFields) {
      if (!object[subField.name]) {
        return false;
      }
    }

    return true;
  }
}
