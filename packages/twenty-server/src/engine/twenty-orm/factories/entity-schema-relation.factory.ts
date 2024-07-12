import { Injectable } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { determineRelationDetails } from 'src/engine/twenty-orm/utils/determine-relation-details.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async create(
    fieldMetadataCollection: FieldMetadataEntity[],
  ): Promise<EntitySchemaRelationMap> {
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

      const relationType = this.getRelationType(
        fieldMetadata,
        relationMetadata,
      );
      // TODO: This will work for now but we need to handle this better in the future for custom names on the join column
      const relationDetails = await determineRelationDetails(
        relationType,
        fieldMetadata,
        relationMetadata,
        this.workspaceCacheStorageService,
      );

      entitySchemaRelationMap[fieldMetadata.name] = {
        type: relationType,
        target: relationDetails.target,
        inverseSide: relationDetails.inverseSide,
        joinColumn: relationDetails.joinColumn,
      };
    }

    return entitySchemaRelationMap;
  }

  private getRelationType(
    fieldMetadata: FieldMetadataEntity,
    relationMetadata: RelationMetadataEntity,
  ): RelationType {
    const relationDirection = deduceRelationDirection(
      fieldMetadata,
      relationMetadata,
    );

    switch (relationMetadata.relationType) {
      case RelationMetadataType.ONE_TO_MANY: {
        return relationDirection === RelationDirection.FROM
          ? 'one-to-many'
          : 'many-to-one';
      }
      case RelationMetadataType.ONE_TO_ONE:
        return 'one-to-one';
      case RelationMetadataType.MANY_TO_MANY:
        return 'many-to-many';
      default:
        throw new Error('Invalid relation type');
    }
  }
}
