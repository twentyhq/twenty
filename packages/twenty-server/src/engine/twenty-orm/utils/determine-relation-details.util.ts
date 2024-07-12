import lowerFirst from 'lodash.lowerfirst';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

interface RelationDetails {
  target: string;
  inverseSide: string;
  joinColumn: { name: string } | undefined;
}

// relations: [
//   'fields.object',
//   'fields',
//   'fields.fromRelationMetadata',
//   'fields.toRelationMetadata',
//   'fields.fromRelationMetadata.toObjectMetadata',
// ],

export async function determineRelationDetails(
  relationType: RelationType,
  fieldMetadata: FieldMetadataEntity,
  relationMetadata: RelationMetadataEntity,
  workspaceCacheStorageService: WorkspaceCacheStorageService,
): Promise<RelationDetails> {
  let target: string;
  let inverseSide: string;
  let joinColumn: { name: string } | undefined;

  switch (relationType) {
    case 'one-to-many':
      target = lowerFirst(relationMetadata.toObjectMetadata.nameSingular);
      inverseSide = fieldMetadata.name;
      break;

    case 'many-to-one': {
      const objectMetadata =
        await workspaceCacheStorageService.getObjectMetadata(
          relationMetadata.toObjectMetadataId,
        );

      target = lowerFirst(relationMetadata.fromObjectMetadata.nameSingular);
      inverseSide = relationMetadata.fromFieldMetadata.name;
      joinColumn = { name: fieldMetadata.name + 'Id' };
      break;
    }

    case 'one-to-one':
      if (relationMetadata.fromFieldMetadataId === fieldMetadata.id) {
        target = lowerFirst(relationMetadata.toObjectMetadata.nameSingular);
        inverseSide = fieldMetadata.name;
      } else {
        target = lowerFirst(relationMetadata.fromObjectMetadata.nameSingular);
        inverseSide = relationMetadata.fromFieldMetadata.name;
        joinColumn = { name: fieldMetadata.name + 'Id' };
      }
      break;

    case 'many-to-many':
      target = lowerFirst(relationMetadata.toObjectMetadata.nameSingular);
      inverseSide = fieldMetadata.name;
      break;

    default:
      throw new Error('Invalid relation type');
  }

  return { target, inverseSide, joinColumn };
}
