import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntitySchemaRelationOptions } from 'typeorm';

import {
  type EntitySchemaFieldMetadata,
  type EntitySchemaFieldMetadataMaps,
  type EntitySchemaObjectMetadata,
  type EntitySchemaObjectMetadataMaps,
} from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';
import { determineSchemaRelationDetails } from 'src/engine/twenty-orm/utils/determine-schema-relation-details.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

type RelationFieldMetadata = EntitySchemaFieldMetadata<
  FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
>;

@Injectable()
export class EntitySchemaRelationFactory {
  constructor() {}

  create(
    objectMetadata: EntitySchemaObjectMetadata,
    objectMetadataMaps: EntitySchemaObjectMetadataMaps,
    fieldMetadataMaps: EntitySchemaFieldMetadataMaps,
  ): EntitySchemaRelationMap {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    const fieldMetadatas = objectMetadata.fieldMetadataIds
      .map((fieldId) => fieldMetadataMaps.byId[fieldId])
      .filter(isDefined);

    for (const fieldMetadata of fieldMetadatas) {
      if (!this.isRelationField(fieldMetadata)) {
        continue;
      }

      const relationDetails = determineSchemaRelationDetails(
        fieldMetadata,
        objectMetadataMaps,
        fieldMetadataMaps,
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

  private isRelationField(
    fieldMetadata: EntitySchemaFieldMetadata,
  ): fieldMetadata is RelationFieldMetadata {
    return (
      fieldMetadata.type === FieldMetadataType.RELATION ||
      fieldMetadata.type === FieldMetadataType.MORPH_RELATION
    );
  }
}
