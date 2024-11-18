import { Injectable } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { determineRelationDetails } from 'src/engine/twenty-orm/utils/determine-relation-details.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  constructor() {}

  async create(
    fieldMetadataMapByName: FieldMetadataMap,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<EntitySchemaRelationMap> {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    const fieldMetadataCollection = Object.values(fieldMetadataMapByName);

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
        objectMetadataMaps,
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
