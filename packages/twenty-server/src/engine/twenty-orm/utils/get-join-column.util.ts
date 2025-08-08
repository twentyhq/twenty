import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type WorkspaceJoinColumnsMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-join-columns-metadata-args.interface';
import { type WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';

import {
  RelationException,
  RelationExceptionCode,
} from 'src/engine/twenty-orm/exceptions/relation.exception';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

export const getJoinColumn = (
  joinColumnsMetadataArgsCollection: WorkspaceJoinColumnsMetadataArgs[],
  relationMetadataArgs: WorkspaceRelationMetadataArgs,
): string | null => {
  if (relationMetadataArgs.type === RelationType.ONE_TO_MANY) {
    return null;
  }

  const inverseSideTarget = relationMetadataArgs.inverseSideTarget();
  const inverseSideJoinColumnsMetadataArgsCollection =
    metadataArgsStorage.filterJoinColumns(inverseSideTarget);
  const filteredJoinColumnsMetadataArgsCollection =
    joinColumnsMetadataArgsCollection.filter(
      (joinColumnsMetadataArgs) =>
        joinColumnsMetadataArgs.relationName === relationMetadataArgs.name,
    );
  const oppositeFilteredJoinColumnsMetadataArgsCollection =
    inverseSideJoinColumnsMetadataArgsCollection.filter(
      (joinColumnsMetadataArgs) =>
        joinColumnsMetadataArgs.relationName === relationMetadataArgs.name,
    );

  if (
    filteredJoinColumnsMetadataArgsCollection.length > 0 &&
    oppositeFilteredJoinColumnsMetadataArgsCollection.length > 0
  ) {
    throw new RelationException(
      `Join column for ${relationMetadataArgs.name} relation is present on both sides`,
      RelationExceptionCode.RELATION_JOIN_COLUMN_ON_BOTH_SIDES,
    );
  }

  // Check if there are multiple join columns for the relation
  if (filteredJoinColumnsMetadataArgsCollection.length > 1) {
    throw new RelationException(
      `Multiple join columns found for relation ${relationMetadataArgs.name}`,
      RelationExceptionCode.MULTIPLE_JOIN_COLUMNS_FOUND,
    );
  }

  const joinColumnsMetadataArgs = filteredJoinColumnsMetadataArgsCollection[0];

  if (!joinColumnsMetadataArgs) {
    throw new RelationException(
      `Join column is missing for relation ${relationMetadataArgs.name}`,
      RelationExceptionCode.MISSING_RELATION_JOIN_COLUMN,
    );
  }

  return joinColumnsMetadataArgs.joinColumn;
};
