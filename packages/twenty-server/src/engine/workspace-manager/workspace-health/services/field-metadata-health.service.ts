import { Injectable } from '@nestjs/common';

import isEqual from 'lodash.isequal';

import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceTableStructure } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-table-definition.interface';
import { WorkspaceHealthOptions } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-options.interface';
import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { DatabaseStructureService } from 'src/engine/workspace-manager/workspace-health/services/database-structure.service';
import { validName } from 'src/engine/workspace-manager/workspace-health/utils/valid-name.util';
import { compositeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { validateDefaultValueForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-default-value-for-type.util';
import {
  EnumFieldMetadataUnionType,
  isEnumFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { validateOptionsForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-options-for-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { computeCompositeFieldMetadata } from 'src/engine/workspace-manager/workspace-health/utils/compute-composite-field-metadata.util';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';
import { customNamePrefix } from 'src/engine/utils/compute-custom-name.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

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
      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeFieldMetadataCollection =
          compositeDefinitions.get(fieldMetadata.type)?.(fieldMetadata) ?? [];

        if (options.mode === 'metadata' || options.mode === 'all') {
          const targetColumnMapIssue = this.targetColumnMapCheck(fieldMetadata);

          if (targetColumnMapIssue) {
            issues.push(targetColumnMapIssue);
          }

          const defaultValueIssues =
            this.defaultValueHealthCheck(fieldMetadata);

          issues.push(...defaultValueIssues);
        }

        // Only check structure on nested composite fields
        if (options.mode === 'structure' || options.mode === 'all') {
          for (const compositeFieldMetadata of compositeFieldMetadataCollection) {
            const compositeFieldStructureIssues = this.structureFieldCheck(
              tableName,
              workspaceTableColumns,
              computeCompositeFieldMetadata(
                compositeFieldMetadata,
                fieldMetadata,
              ),
            );

            issues.push(...compositeFieldStructureIssues);
          }
        }

        // Only check metadata on the parent composite field
        if (options.mode === 'metadata' || options.mode === 'all') {
          const compositeFieldMetadataIssues = this.metadataFieldCheck(
            tableName,
            fieldMetadata,
          );

          issues.push(...compositeFieldMetadataIssues);
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

    const dataType =
      this.databaseStructureService.getPostgresDataType(fieldMetadata);

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

    const columnDefaultValue = columnStructure.columnDefault?.split('::')?.[0];

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

    if (columnDefaultValue && isEnumFieldMetadataType(fieldMetadata.type)) {
      const enumValues = fieldMetadata.options?.map((option) =>
        serializeDefaultValue(`'${option.value}'`),
      );

      if (!enumValues.includes(columnDefaultValue)) {
        issues.push({
          type: WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID,
          fieldMetadata,
          columnStructure,
          message: `Column ${columnName} default value is not in the enum values "${columnDefaultValue}" NOT IN "${enumValues}"`,
        });
      }
    }

    if (columnDefaultValue !== defaultValue) {
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
    const targetColumnMapIssue = this.targetColumnMapCheck(fieldMetadata);
    const defaultValueIssues = this.defaultValueHealthCheck(fieldMetadata);

    if (targetColumnMapIssue) {
      issues.push(targetColumnMapIssue);
    }

    if (fieldMetadata.name.startsWith(customNamePrefix)) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_NAME_SHOULD_NOT_BE_PREFIXED,
        fieldMetadata,
        message: `Column ${columnName} should not be prefixed with "${customNamePrefix}"`,
      });
    }

    if (fieldMetadata.isCustom && !columnName?.startsWith(customNamePrefix)) {
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
  ): WorkspaceHealthIssue | null {
    const targetColumnMap = generateTargetColumnMap(
      fieldMetadata.type,
      fieldMetadata.isCustom,
      fieldMetadata.name,
    );

    if (
      !fieldMetadata.targetColumnMap ||
      !isEqual(targetColumnMap, fieldMetadata.targetColumnMap)
    ) {
      return {
        type: WorkspaceHealthIssueType.COLUMN_TARGET_COLUMN_MAP_NOT_VALID,
        fieldMetadata,
        message: `Column targetColumnMap "${JSON.stringify(
          fieldMetadata.targetColumnMap,
        )}" is not the same as the generated one "${JSON.stringify(
          targetColumnMap,
        )}"`,
      };
    }

    return null;
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

    if (
      isEnumFieldMetadataType(fieldMetadata.type) &&
      fieldMetadata.defaultValue
    ) {
      const enumValues = fieldMetadata.options?.map((option) =>
        serializeDefaultValue(`'${option.value}'`),
      );
      const metadataDefaultValue = (
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<EnumFieldMetadataUnionType>
      )?.value;

      if (metadataDefaultValue && !enumValues.includes(metadataDefaultValue)) {
        issues.push({
          type: WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_NOT_VALID,
          fieldMetadata,
          message: `Column default value is not in the enum values "${metadataDefaultValue}" NOT IN "${enumValues}"`,
        });
      }
    }

    return issues;
  }
}
