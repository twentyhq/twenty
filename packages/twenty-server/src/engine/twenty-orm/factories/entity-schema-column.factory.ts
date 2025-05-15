import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ColumnType, EntitySchemaColumnOptions } from 'typeorm';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type EntitySchemaColumnMap = {
  [key: string]: EntitySchemaColumnOptions;
};

@Injectable()
export class EntitySchemaColumnFactory {
  create(
    fieldMetadataMapByName: FieldMetadataMap,
    isNewRelationEnabled: boolean,
  ): EntitySchemaColumnMap {
    let entitySchemaColumnMap: EntitySchemaColumnMap = {};

    const fieldMetadataCollection = Object.values(fieldMetadataMapByName);

    for (const fieldMetadata of fieldMetadataCollection) {
      const key = fieldMetadata.name;

      if (
        isFieldMetadataInterfaceOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        if (!isNewRelationEnabled) {
          const relationMetadata =
            fieldMetadata.fromRelationMetadata ??
            fieldMetadata.toRelationMetadata;

          if (!relationMetadata) {
            throw new Error(
              `Relation metadata is missing for field ${fieldMetadata.name}`,
            );
          }

          const joinColumnKey = fieldMetadata.name + 'Id';
          const joinColumn = fieldMetadataCollection.find(
            (field) => field.name === joinColumnKey,
          )
            ? joinColumnKey
            : null;

          if (joinColumn) {
            entitySchemaColumnMap[joinColumn] = {
              name: joinColumn,
              type: 'uuid',
              nullable: fieldMetadata.isNullable,
            };
          }

          continue;
        } else {
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
            nullable: fieldMetadata.isNullable,
          };

          continue;
        }
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
        nullable: fieldMetadata.isNullable,
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
    fieldMetadata: FieldMetadataInterface,
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
