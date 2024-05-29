import { Injectable } from '@nestjs/common';

import { ColumnType, EntitySchemaColumnOptions } from 'typeorm';

import { WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';

import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

type EntitySchemaColumnMap = {
  [key: string]: EntitySchemaColumnOptions;
};

@Injectable()
export class EntitySchemaColumnFactory {
  create(
    fieldMetadataArgsCollection: WorkspaceFieldMetadataArgs[],
    relationMetadataArgsCollection: WorkspaceRelationMetadataArgs[],
  ): EntitySchemaColumnMap {
    let entitySchemaColumnMap: EntitySchemaColumnMap = {};

    for (const fieldMetadataArgs of fieldMetadataArgsCollection) {
      const key = fieldMetadataArgs.name;

      if (isCompositeFieldMetadataType(fieldMetadataArgs.type)) {
        const compositeColumns = this.createCompositeColumns(fieldMetadataArgs);

        entitySchemaColumnMap = {
          ...entitySchemaColumnMap,
          ...compositeColumns,
        };

        continue;
      }

      const columnType = fieldMetadataTypeToColumnType(fieldMetadataArgs.type);
      const defaultValue = serializeDefaultValue(
        fieldMetadataArgs.defaultValue,
      );

      entitySchemaColumnMap[key] = {
        name: key,
        type: columnType as ColumnType,
        primary: fieldMetadataArgs.isPrimary,
        nullable: fieldMetadataArgs.isNullable,
        createDate: key === 'createdAt',
        updateDate: key === 'updatedAt',
        array: fieldMetadataArgs.type === FieldMetadataType.MULTI_SELECT,
        default: defaultValue,
      };

      for (const relationMetadataArgs of relationMetadataArgsCollection) {
        if (relationMetadataArgs.joinColumn) {
          entitySchemaColumnMap[relationMetadataArgs.joinColumn] = {
            name: relationMetadataArgs.joinColumn,
            type: 'uuid',
            nullable: relationMetadataArgs.isNullable,
          };
        }
      }

      if (isEnumFieldMetadataType(fieldMetadataArgs.type)) {
        const values = fieldMetadataArgs.options?.map((option) => option.value);

        if (values && values.length > 0) {
          entitySchemaColumnMap[key].enum = values;
        }
      }
    }

    return entitySchemaColumnMap;
  }

  private createCompositeColumns(
    fieldMetadataArgs: WorkspaceFieldMetadataArgs,
  ): EntitySchemaColumnMap {
    const entitySchemaColumnMap: EntitySchemaColumnMap = {};
    const compositeType = compositeTypeDefintions.get(fieldMetadataArgs.type);

    if (!compositeType) {
      throw new Error(
        `Composite type ${fieldMetadataArgs.type} is not defined in compositeTypeDefintions`,
      );
    }

    for (const compositeProperty of compositeType.properties) {
      const columnName = computeCompositeColumnName(
        fieldMetadataArgs.name,
        compositeProperty,
      );
      const columnType = fieldMetadataTypeToColumnType(compositeProperty.type);
      const defaultValue = serializeDefaultValue(
        fieldMetadataArgs.defaultValue?.[compositeProperty.name],
      );

      entitySchemaColumnMap[columnName] = {
        name: columnName,
        type: columnType as ColumnType,
        nullable: compositeProperty.isRequired,
        default: defaultValue,
      };

      if (isEnumFieldMetadataType(compositeProperty.type)) {
        throw new Error('Enum composite properties are not yet supported');
      }
    }

    return entitySchemaColumnMap;
  }
}
