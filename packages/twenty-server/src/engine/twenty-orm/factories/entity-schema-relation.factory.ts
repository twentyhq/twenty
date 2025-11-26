import { Injectable } from '@nestjs/common';

import { type EntitySchemaRelationOptions } from 'typeorm';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { determineSchemaRelationDetails } from 'src/engine/twenty-orm/utils/determine-schema-relation-details.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  constructor() {}

  create(
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): EntitySchemaRelationMap {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    const flatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    for (const flatFieldMetadata of flatFieldMetadatas) {
      if (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
        continue;
      }

      if (!flatFieldMetadata.settings) {
        throw new Error(
          `Field metadata settings are missing for field ${flatFieldMetadata.name}`,
        );
      }

      const schemaRelationDetails = determineSchemaRelationDetails(
        flatFieldMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );

      const targetObjectMetadata =
        flatObjectMetadataMaps.byId[
          flatFieldMetadata.relationTargetObjectMetadataId
        ];

      if (!targetObjectMetadata) {
        throw new Error(
          `Target object metadata not found for field ${flatFieldMetadata.name}`,
        );
      }

      entitySchemaRelationMap[flatFieldMetadata.name] = {
        type: schemaRelationDetails.relationType,
        target: schemaRelationDetails.target,
        inverseSide: schemaRelationDetails.inverseSide,
        joinColumn: schemaRelationDetails.joinColumn,
      } satisfies EntitySchemaRelationOptions;
    }

    return entitySchemaRelationMap;
  }
}
