import { Injectable } from '@nestjs/common';

import { ColumnType, EntitySchemaColumnOptions } from 'typeorm';

import { ReflectFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';

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
  create(reflectFieldMetadataMap: ReflectFieldMetadata): EntitySchemaColumnMap {
    let entitySchemaColumnMap: EntitySchemaColumnMap = {};

    for (const [key, reflectFieldMetadata] of Object.entries(
      reflectFieldMetadataMap,
    )) {
      // Skip relation fields
      if (reflectFieldMetadata.type === FieldMetadataType.RELATION) {
        continue;
      }

      if (isCompositeFieldMetadataType(reflectFieldMetadata.type)) {
        const compositeColumns =
          this.createCompositeColumns(reflectFieldMetadata);

        entitySchemaColumnMap = {
          ...entitySchemaColumnMap,
          ...compositeColumns,
        };

        continue;
      }

      const columnType = fieldMetadataTypeToColumnType(
        reflectFieldMetadata.type,
      );
      const defaultValue = serializeDefaultValue(
        reflectFieldMetadata.defaultValue,
      );

      entitySchemaColumnMap[key] = {
        name: key,
        type: columnType as ColumnType,
        nullable: reflectFieldMetadata.isNullable,
        primary: key === 'id',
        createDate: key === 'createdAt',
        updateDate: key === 'updatedAt',
        default: defaultValue,
      };

      if (isEnumFieldMetadataType(reflectFieldMetadata.type)) {
        const values = reflectFieldMetadata.options?.map(
          (option) => option.value,
        );

        if (values && values.length > 0) {
          entitySchemaColumnMap[key].enum = values;
        }
      }
    }

    return entitySchemaColumnMap;
  }

  private createCompositeColumns(
    reflectFieldMetadata: ReflectFieldMetadata['string'],
  ): EntitySchemaColumnMap {
    const entitySchemaColumnMap: EntitySchemaColumnMap = {};
    const compositeType = compositeTypeDefintions.get(
      reflectFieldMetadata.type,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type ${reflectFieldMetadata.type} is not defined in compositeTypeDefintions`,
      );
    }

    for (const compositeProperty of compositeType.properties) {
      const columnName = computeCompositeColumnName(
        reflectFieldMetadata.name,
        compositeProperty,
      );
      const columnType = fieldMetadataTypeToColumnType(compositeProperty.type);
      // TODO: Implement defaultValue for composite properties
      // const defaultValue = serializeDefaultValue(fieldMetadata.defaultValue);

      entitySchemaColumnMap[columnName] = {
        name: columnName,
        type: columnType as ColumnType,
        nullable: compositeProperty.isRequired,
      };

      if (isEnumFieldMetadataType(compositeProperty.type)) {
        throw new Error('Enum composite properties are not yet supported');
      }
    }

    return entitySchemaColumnMap;
  }
}
