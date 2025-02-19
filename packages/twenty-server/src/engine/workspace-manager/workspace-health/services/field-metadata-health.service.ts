import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';
import { WorkspaceHealthOptions } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-options.interface';
import { WorkspaceTableStructure } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-table-definition.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  EnumFieldMetadataUnionType,
  isEnumFieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { validateDefaultValueForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-default-value-for-type.util';
import { validateOptionsForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-options-for-type.util';
import { customNamePrefix } from 'src/engine/utils/compute-table-name.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { DatabaseStructureService } from 'src/engine/workspace-manager/workspace-health/services/database-structure.service';
import { validName } from 'src/engine/workspace-manager/workspace-health/utils/valid-name.util';

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

      const fieldIssues = await this.healthCheckField(
        tableName,
        workspaceTableColumns,
        fieldMetadata,
        options,
      );

      issues.push(...fieldIssues);
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
    const dataTypes =
      this.databaseStructureService.getPostgresDataTypes(fieldMetadata);
    const issues: WorkspaceHealthIssue[] = [];
    let columnNames: string[] = [];

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

      if (!compositeType) {
        throw new Error(`Composite type ${fieldMetadata.type} is not defined`);
      }

      columnNames = compositeType.properties.map((compositeProperty) =>
        computeCompositeColumnName(fieldMetadata, compositeProperty),
      );
    } else {
      columnNames = [computeColumnName(fieldMetadata)];
    }

    const defaultValues = this.databaseStructureService.getPostgresDefaults(
      fieldMetadata.type,
      fieldMetadata.defaultValue,
    );

    // Check if column exist in database
    const columnStructureMap = workspaceTableColumns.reduce(
      (acc, workspaceTableColumn) => {
        const columnName = workspaceTableColumn.columnName;

        if (columnNames.includes(columnName)) {
          acc[columnName] = workspaceTableColumn;
        }

        return acc;
      },
      {} as { [key: string]: WorkspaceTableStructure },
    );

    for (const [index, columnName] of columnNames.entries()) {
      const columnStructure = columnStructureMap[columnName];

      if (!columnStructure) {
        issues.push({
          type: WorkspaceHealthIssueType.MISSING_COLUMN,
          fieldMetadata,
          columnStructures: workspaceTableColumns,
          message: `Column ${columnName} not found in table ${tableName}`,
        });

        continue;
      }

      const columnDefaultValue =
        columnStructure.columnDefault?.split('::')?.[0];

      // Check if column data type is the same
      if (!dataTypes[index] || columnStructure.dataType !== dataTypes[index]) {
        issues.push({
          type: WorkspaceHealthIssueType.COLUMN_DATA_TYPE_CONFLICT,
          fieldMetadata,
          columnStructure,
          message: `Column ${columnName} type is not the same as the field metadata type "${columnStructure.dataType}" !== "${dataTypes[index]}"`,
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

      if (columnDefaultValue !== defaultValues[index]) {
        issues.push({
          type: WorkspaceHealthIssueType.COLUMN_DEFAULT_VALUE_CONFLICT,
          fieldMetadata,
          columnStructure,
          message: `Column ${columnName} default value is not the same as the field metadata default value "${columnStructure.columnDefault}" !== "${defaultValues[index]}"`,
        });
      }
    }

    return issues;
  }

  private metadataFieldCheck(
    tableName: string,
    fieldMetadata: FieldMetadataEntity,
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];
    const columnName = fieldMetadata.name;
    const defaultValueIssues = this.defaultValueHealthCheck(fieldMetadata);

    if (fieldMetadata.name.startsWith(customNamePrefix)) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_NAME_SHOULD_NOT_BE_PREFIXED,
        fieldMetadata,
        message: `Column ${columnName} should not be prefixed with "${customNamePrefix}"`,
      });
    }

    if (fieldMetadata.isCustom && columnName?.startsWith(customNamePrefix)) {
      issues.push({
        type: WorkspaceHealthIssueType.COLUMN_NAME_SHOULD_NOT_BE_CUSTOM,
        fieldMetadata,
        message: `Column ${columnName} is marked as custom in table ${tableName} but and start with "_", this behavior has been removed. Please remove the prefix.`,
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
        message: `Column options of ${fieldMetadata.name} is not valid`,
      });
    }

    issues.push(...defaultValueIssues);

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
      ).isValid
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
      const metadataDefaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<EnumFieldMetadataUnionType>;

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
