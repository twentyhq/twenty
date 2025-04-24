import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { EntitySchemaRelationOptions } from 'typeorm';

import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { determineRelationDetails } from 'src/engine/twenty-orm/utils/determine-relation-details.util';
import { determineSchemaRelationDetails } from 'src/engine/twenty-orm/utils/determine-schema-relation-details.util';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  constructor() {}

  async create(
    fieldMetadataMapByName: FieldMetadataMap,
    objectMetadataMaps: ObjectMetadataMaps,
    isNewRelationEnabled: boolean,
  ): Promise<EntitySchemaRelationMap> {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    const fieldMetadataCollection = Object.values(fieldMetadataMapByName);

    for (const fieldMetadata of fieldMetadataCollection) {
      if (
        !isFieldMetadataInterfaceOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        continue;
      }

      if (!isNewRelationEnabled) {
        const relationMetadata =
          fieldMetadata.fromRelationMetadata ??
          fieldMetadata.toRelationMetadata;

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
      } else {
        if (!fieldMetadata.settings) {
          throw new Error(
            `Field metadata settings are missing for field ${fieldMetadata.name}`,
          );
        }

        const schemaRelationDetails = await determineSchemaRelationDetails(
          fieldMetadata,
          objectMetadataMaps,
        );

        entitySchemaRelationMap[fieldMetadata.name] = {
          type: schemaRelationDetails.relationType,
          target: schemaRelationDetails.target,
          inverseSide: schemaRelationDetails.inverseSide,
          joinColumn: schemaRelationDetails.joinColumn,
        } satisfies EntitySchemaRelationOptions;
      }
    }

    return entitySchemaRelationMap;
  }
}
