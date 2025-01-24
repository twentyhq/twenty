import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

// TODO: could we export this to GraphQL ?
export type CompositeFieldMetadataType =
  | FieldMetadataType.ADDRESS
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.FULL_NAME
  | FieldMetadataType.LINKS
  | FieldMetadataType.EMAILS
  | FieldMetadataType.PHONES;

@Injectable()
export class CompositeColumnActionFactory extends ColumnActionAbstractFactory<CompositeFieldMetadataType> {
  protected readonly logger = new Logger(CompositeColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataInterface<CompositeFieldMetadataType>,
  ): WorkspaceMigrationColumnCreate[] {
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) {
      this.logger.error(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      );
      throw new WorkspaceMigrationException(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
        WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
      );
    }

    const columnActions: WorkspaceMigrationColumnCreate[] = [];

    for (const property of compositeType.properties) {
      if (property.type === FieldMetadataType.RELATION) {
        throw new WorkspaceMigrationException(
          `Relation type not supported for composite columns`,
          WorkspaceMigrationExceptionCode.INVALID_COMPOSITE_TYPE,
        );
      }

      const columnName = computeCompositeColumnName(fieldMetadata, property);
      const defaultValue = fieldMetadata.defaultValue?.[property.name];
      const serializedDefaultValue = serializeDefaultValue(defaultValue);
      const enumOptions = property.options
        ? [...property.options.map((option) => option.value)]
        : undefined;

      columnActions.push({
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName,
        columnType: fieldMetadataTypeToColumnType(property.type),
        enum: enumOptions,
        isNullable: fieldMetadata.isNullable || !property.isRequired,
        isUnique: fieldMetadata.isUnique,
        defaultValue: serializedDefaultValue,
        isArray:
          property.type === FieldMetadataType.MULTI_SELECT || property.isArray,
      });
    }

    return columnActions;
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataInterface<CompositeFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<CompositeFieldMetadataType>,
  ): WorkspaceMigrationColumnAlter[] {
    const currentCompositeType = compositeTypeDefinitions.get(
      currentFieldMetadata.type,
    );
    const alteredCompositeType = compositeTypeDefinitions.get(
      alteredFieldMetadata.type,
    );

    if (!currentCompositeType || !alteredCompositeType) {
      this.logger.error(
        `Composite type not found for field metadata type: ${currentFieldMetadata.type} or ${alteredFieldMetadata.type}`,
      );
      throw new WorkspaceMigrationException(
        `Composite type not found for field metadata type: ${currentFieldMetadata.type} or ${alteredFieldMetadata.type}`,
        WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
      );
    }

    const columnActions: WorkspaceMigrationColumnAlter[] = [];

    for (const alteredProperty of alteredCompositeType.properties) {
      // TODO: Based on the name for now, we can add a more robust check in the future
      const currentProperty = currentCompositeType.properties.find(
        (p) => p.name === alteredProperty.name,
      );

      if (!currentProperty) {
        this.logger.error(
          `Current property not found for altered property: ${alteredProperty.name}`,
        );
        throw new WorkspaceMigrationException(
          `Current property not found for altered property: ${alteredProperty.name}`,
          WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
        );
      }

      if (
        alteredProperty.type === FieldMetadataType.RELATION ||
        currentProperty.type === FieldMetadataType.RELATION
      ) {
        throw new WorkspaceMigrationException(
          `Relation type not supported for composite columns`,
          WorkspaceMigrationExceptionCode.INVALID_COMPOSITE_TYPE,
        );
      }

      const currentColumnName = computeCompositeColumnName(
        currentFieldMetadata,
        currentProperty,
      );
      const alteredColumnName = computeCompositeColumnName(
        alteredFieldMetadata,
        alteredProperty,
      );
      const defaultValue =
        alteredFieldMetadata.defaultValue?.[alteredProperty.name];
      const serializedDefaultValue = serializeDefaultValue(defaultValue);
      const enumOptions = alteredProperty.options
        ? [
            ...alteredProperty.options.map((option) => {
              const currentOption = currentProperty.options?.find(
                (currentOption) => currentOption.id === option.id,
              );

              // The id is the same, but the value is different, so we need to alter the enum
              if (currentOption && currentOption.value !== option.value) {
                return {
                  from: currentOption.value,
                  to: option.value,
                };
              }

              return option.value;
            }),
          ]
        : undefined;

      columnActions.push({
        action: WorkspaceMigrationColumnActionType.ALTER,
        currentColumnDefinition: {
          columnName: currentColumnName,
          columnType: fieldMetadataTypeToColumnType(currentProperty.type),
          enum: currentProperty.options
            ? [...currentProperty.options.map((option) => option.value)]
            : undefined,
          isNullable:
            currentFieldMetadata.isNullable || !currentProperty.isRequired,
          isUnique: currentFieldMetadata.isUnique ?? false,
          defaultValue: serializeDefaultValue(
            currentFieldMetadata.defaultValue?.[currentProperty.name],
          ),
          isArray:
            currentProperty.type === FieldMetadataType.MULTI_SELECT ||
            currentProperty.isArray,
        },
        alteredColumnDefinition: {
          columnName: alteredColumnName,
          columnType: fieldMetadataTypeToColumnType(alteredProperty.type),
          enum: enumOptions,
          isNullable:
            alteredFieldMetadata.isNullable || !alteredProperty.isRequired,
          isUnique:
            (alteredFieldMetadata.isUnique &&
              alteredProperty.isIncludedInUniqueConstraint) ??
            false,
          defaultValue: serializedDefaultValue,
          isArray:
            alteredProperty.type === FieldMetadataType.MULTI_SELECT ||
            alteredProperty.isArray,
        },
      });
    }

    return columnActions;
  }
}
