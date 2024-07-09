import { Injectable } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';
import lowerFirst from 'lodash.lowerfirst';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  create(
    fieldMetadataCollection: FieldMetadataEntity[],
  ): EntitySchemaRelationMap {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    for (const fieldMetadata of fieldMetadataCollection) {
      if (!isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const relationMetadata =
        fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

      if (!relationMetadata) {
        throw new Error(
          `Relation metadata is missing for field ${fieldMetadata.name}`,
        );
      }

      const relationType = this.getRelationType(relationMetadata.relationType);
      const joinColumnKey = fieldMetadata.name + 'Id';
      // Lower only first letter of the object name
      const target = lowerFirst(fieldMetadata.object.nameSingular);
      const inverseSide =
        lowerFirst(relationMetadata.toObjectMetadata.nameSingular) ?? target;
      const joinColumn = fieldMetadataCollection.find(
        (field) => field.name === joinColumnKey,
      )
        ? joinColumnKey
        : null;

      entitySchemaRelationMap[fieldMetadata.name] = {
        type: relationType,
        target,
        inverseSide,
        joinColumn: joinColumn
          ? {
              name: joinColumn,
            }
          : undefined,
      };
    }

    return entitySchemaRelationMap;
  }

  private getRelationType(
    relationMetadataType: RelationMetadataType,
  ): RelationType {
    switch (relationMetadataType) {
      case RelationMetadataType.ONE_TO_MANY:
        return 'one-to-many';
      case RelationMetadataType.MANY_TO_ONE:
        return 'many-to-one';
      case RelationMetadataType.ONE_TO_ONE:
        return 'one-to-one';
      case RelationMetadataType.MANY_TO_MANY:
        return 'many-to-many';
      default:
        throw new Error('Invalid relation type');
    }
  }
}
