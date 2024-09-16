import { Injectable } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';

import {
  FieldMetadataMap,
  ObjectMetadataMap,
} from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { determineRelationDetails } from 'src/engine/twenty-orm/utils/determine-relation-details.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  constructor() {}

  async create(
    fieldMetadataMap: FieldMetadataMap,
    objectMetadataMap: ObjectMetadataMap,
  ): Promise<EntitySchemaRelationMap> {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    const fieldMetadataCollection = Object.values(fieldMetadataMap);

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

      const relationDetails = await determineRelationDetails(
        fieldMetadata,
        relationMetadata,
        objectMetadataMap,
      );

      entitySchemaRelationMap[fieldMetadata.name] = {
        type: relationDetails.relationType,
        target: relationDetails.target,
        inverseSide: relationDetails.inverseSide,
        joinColumn: relationDetails.joinColumn,
      } satisfies EntitySchemaRelationOptions;
    }

    return entitySchemaRelationMap;
  }
}
