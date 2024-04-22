import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { ColumnActionAbstractFactory } from 'src/engine/metadata-modules/workspace-migration/factories/column-action-abstract.factory';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';

export type CompositeFieldMetadataType =
  | FieldMetadataType.ADDRESS
  | FieldMetadataType.FILE
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.FULL_NAME
  | FieldMetadataType.LINK;

@Injectable()
export class CompositeColumnActionFactory extends ColumnActionAbstractFactory<CompositeFieldMetadataType> {
  protected readonly logger = new Logger(CompositeColumnActionFactory.name);

  protected handleCreateAction(
    fieldMetadata: FieldMetadataInterface<CompositeFieldMetadataType>,
  ): WorkspaceMigrationColumnCreate[] {
    const compositeType = compositeTypeDefintions.get(fieldMetadata.type);

    if (!compositeType) {
      this.logger.error(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      );
      throw new Error(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      );
    }

    const columnActions: WorkspaceMigrationColumnCreate[] = [];

    for (const property of compositeType.properties) {
      const columnName = computeCompositeColumnName(fieldMetadata, property);
      const defaultValue = fieldMetadata.defaultValue?.[property.name];
      const serializedDefaultValue = serializeDefaultValue(defaultValue);

      columnActions.push({
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName,
        columnType: fieldMetadataTypeToColumnType(property.type),
        isNullable: fieldMetadata.isNullable || !property.isRequired,
        defaultValue: serializedDefaultValue,
      });
    }

    return columnActions;
  }

  protected handleAlterAction(
    currentFieldMetadata: FieldMetadataInterface<CompositeFieldMetadataType>,
    alteredFieldMetadata: FieldMetadataInterface<CompositeFieldMetadataType>,
  ): WorkspaceMigrationColumnAlter[] {
    const currentCompositeType = compositeTypeDefintions.get(
      currentFieldMetadata.type,
    );
    const alteredCompositeType = compositeTypeDefintions.get(
      alteredFieldMetadata.type,
    );

    if (!currentCompositeType || !alteredCompositeType) {
      this.logger.error(
        `Composite type not found for field metadata type: ${currentFieldMetadata.type} or ${alteredFieldMetadata.type}`,
      );
      throw new Error(
        `Composite type not found for field metadata type: ${currentFieldMetadata.type} or ${alteredFieldMetadata.type}`,
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
        throw new Error(
          `Current property not found for altered property: ${alteredProperty.name}`,
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

      columnActions.push({
        action: WorkspaceMigrationColumnActionType.ALTER,
        currentColumnDefinition: {
          columnName: currentColumnName,
          columnType: fieldMetadataTypeToColumnType(currentProperty.type),
          isNullable:
            currentFieldMetadata.isNullable || !currentProperty.isRequired,
          defaultValue: serializeDefaultValue(
            currentFieldMetadata.defaultValue?.[currentProperty.name],
          ),
        },
        alteredColumnDefinition: {
          columnName: alteredColumnName,
          columnType: fieldMetadataTypeToColumnType(alteredProperty.type),
          isNullable:
            alteredFieldMetadata.isNullable || !alteredProperty.isRequired,
          defaultValue: serializedDefaultValue,
        },
      });
    }

    return columnActions;
  }
}
