import { Injectable } from '@nestjs/common';

import { ColumnType, EntitySchemaColumnOptions } from 'typeorm';

import { WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';
import { WorkspaceJoinColumnsMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-join-columns-metadata-args.interface';
import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getJoinColumn } from 'src/engine/twenty-orm/utils/get-join-column.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

type EntitySchemaColumnMap = {
  [key: string]: EntitySchemaColumnOptions;
};

@Injectable()
export class EntitySchemaColumnFactory {
  // TODO: Some part of the code can be merged
  createFromObjectMetadata(
    fieldMetadataCollection: FieldMetadataEntity[],
  ): EntitySchemaColumnMap {
    let entitySchemaColumnMap: EntitySchemaColumnMap = {};

    for (const fieldMetadata of fieldMetadataCollection) {
      const key = fieldMetadata.name;

      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        const relationMetadata =
          fieldMetadata.fromRelationMetadata ??
          fieldMetadata.toRelationMetadata;

        if (!relationMetadata) {
          throw new Error(
            `Relation metadata is missing for field ${fieldMetadata.name}`,
          );
        }

        // Hmmm, how can we deduce the joinColumn based on the relation metadata?
        // const joinColumn = fieldMetadata.name + 'Id'; This should work in most cases but not all the time
        // Maybe we should refactor relations before this ?

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
        nullable: fieldMetadata.isNullable,
        createDate: key === 'createdAt',
        updateDate: key === 'updatedAt',
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

  createFromMetadataArgs(
    fieldMetadataArgsCollection: WorkspaceFieldMetadataArgs[],
    relationMetadataArgsCollection: WorkspaceRelationMetadataArgs[],
    joinColumnsMetadataArgsCollection: WorkspaceJoinColumnsMetadataArgs[],
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
        const joinColumn = getJoinColumn(
          joinColumnsMetadataArgsCollection,
          relationMetadataArgs,
        );

        if (joinColumn) {
          entitySchemaColumnMap[joinColumn] = {
            name: joinColumn,
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

  private createCompositeColumns(fieldMetadata: {
    name: string;
    type: FieldMetadataType;
    defaultValue?: FieldMetadataDefaultValue;
  }): EntitySchemaColumnMap {
    const entitySchemaColumnMap: EntitySchemaColumnMap = {};
    const compositeType = compositeTypeDefintions.get(fieldMetadata.type);

    if (!compositeType) {
      throw new Error(
        `Composite type ${fieldMetadata.type} is not defined in compositeTypeDefintions`,
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
        throw new Error('Enum composite properties are not yet supported');
      }
    }

    return entitySchemaColumnMap;
  }
}
