import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { type EntitySchemaRelationOptions } from 'typeorm';

import { computeMorphRelationFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-relation-field-name.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { determineSchemaRelationDetails } from 'src/engine/twenty-orm/utils/determine-schema-relation-details.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  constructor() {}

  async create(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<EntitySchemaRelationMap> {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    const fieldMetadataCollection = Object.values(
      objectMetadataItemWithFieldMaps.fieldsById,
    );

    for (const fieldMetadata of fieldMetadataCollection) {
      const isRelation =
        isFieldMetadataEntityOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        ) ||
        isFieldMetadataEntityOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        );

      if (!isRelation) {
        continue;
      }

      if (!fieldMetadata.settings) {
        throw new Error(
          `Field metadata settings are missing for field ${fieldMetadata.name}`,
        );
      }

      const schemaRelationDetails = await determineSchemaRelationDetails(
        fieldMetadata,
        objectMetadataMaps,
      );

      const targetObjectMetadata =
        objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

      if (!targetObjectMetadata) {
        throw new Error(
          `Target object metadata not found for field ${fieldMetadata.name}`,
        );
      }

      const fieldName =
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION
          ? computeMorphRelationFieldName({
              fieldName: fieldMetadata.name,
              relationDirection: fieldMetadata.settings.relationType,
              targetObjectMetadata,
            })
          : fieldMetadata.name;

      entitySchemaRelationMap[fieldName] = {
        type: schemaRelationDetails.relationType,
        target: schemaRelationDetails.target,
        inverseSide: schemaRelationDetails.inverseSide,
        joinColumn: schemaRelationDetails.joinColumn,
      } satisfies EntitySchemaRelationOptions;
    }

    return entitySchemaRelationMap;
  }
}
