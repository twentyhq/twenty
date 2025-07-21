import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ColumnType, EntitySchemaColumnOptions } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type EntitySchemaColumnMap = {
  [key: string]: EntitySchemaColumnOptions;
};

@Injectable()
export class EntitySchemaColumnFactory {
  create(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): EntitySchemaColumnMap {
    let entitySchemaColumnMap: EntitySchemaColumnMap = {};

    const fieldMetadataCollection = Object.values(
      objectMetadataItemWithFieldMaps.fieldsById,
    );

    for (const fieldMetadata of fieldMetadataCollection) {
      const key = fieldMetadata.name;

      const isRelation =
        isFieldMetadataEntityOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        ) ||
        isFieldMetadataEntityOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        );

      if (isRelation) {
        const isManyToOneRelation =
          fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;
        const joinColumnName = fieldMetadata.settings?.joinColumnName;

        if (!isManyToOneRelation) {
          continue;
        }

        if (!isDefined(joinColumnName)) {
          throw new TwentyORMException(
            `Field ${fieldMetadata.id} of type ${fieldMetadata.type}  is a many to one relation but does not have a join column name`,
            TwentyORMExceptionCode.MALFORMED_METADATA,
          );
        }

        entitySchemaColumnMap[joinColumnName] = {
          name: joinColumnName,
          type: 'uuid',
          nullable: fieldMetadata.isNullable ?? false,
        };

        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeColumns = this.createCompositeColumns(fieldMetadata);

        entitySchemaColumnMap = {
          ...entitySchemaColumnMap,
          ...compositeColumns,
        };

        continue;
      }

      const columnType = fieldMetadataTypeToColumnType(fieldMetadata.type);
      const defaultValue = serializeDefaultValue(fieldMetadata.defaultValue);

      entitySchemaColumnMap[key] = {
        name: key,
        type: columnType as ColumnType,
        // TODO: We should double check that
        primary: key === 'id',
        nullable: fieldMetadata.isNullable ?? false,
        createDate: key === 'createdAt',
        updateDate: key === 'updatedAt',
        deleteDate: key === 'deletedAt',
        array: fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
        default: defaultValue,
      };

      if (isEnumFieldMetadataType(fieldMetadata.type)) {
        const values = fieldMetadata.options?.map((option) => option.value);

        if (values && values.length > 0) {
          entitySchemaColumnMap[key].enum = values;
        }
      }
    }

    return entitySchemaColumnMap;
  }

  private createCompositeColumns(
    fieldMetadata: FieldMetadataEntity,
  ): EntitySchemaColumnMap {
    const entitySchemaColumnMap: EntitySchemaColumnMap = {};
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) {
      throw new Error(
        `Composite type ${fieldMetadata.type} is not defined in compositeTypeDefinitions`,
      );
    }

    for (const compositeProperty of compositeType.properties) {
      const columnName = computeCompositeColumnName(
        fieldMetadata.name,
        compositeProperty,
      );
      const columnType = fieldMetadataTypeToColumnType(compositeProperty.type);
      const defaultValue = serializeDefaultValue(
        // @ts-expect-error legacy noImplicitAny
        fieldMetadata.defaultValue?.[compositeProperty.name],
      );

      entitySchemaColumnMap[columnName] = {
        name: columnName,
        type: columnType as ColumnType,
        nullable: compositeProperty.isRequired,
        default: defaultValue,
      };

      if (isEnumFieldMetadataType(compositeProperty.type)) {
        const values = compositeProperty.options?.map((option) => option.value);

        if (values && values.length > 0) {
          entitySchemaColumnMap[columnName].enum = values;
        }
      }
    }

    return entitySchemaColumnMap;
  }
}
