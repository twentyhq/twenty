import { WorkspaceJoinColumnsMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-join-columns-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

export const getJoinColumn = (
  joinColumnsMetadataArgsCollection: WorkspaceJoinColumnsMetadataArgs[],
  relationMetadataArgs: WorkspaceRelationMetadataArgs,
  opposite = false,
): string | null => {
  if (
    relationMetadataArgs.type === RelationMetadataType.ONE_TO_MANY ||
    relationMetadataArgs.type === RelationMetadataType.MANY_TO_MANY
  ) {
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
    throw new Error(
      `Join column for ${relationMetadataArgs.name} relation is present on both sides`,
    );
  }

  // If we're in a ONE_TO_ONE relation and there are no join columns, we need to find the join column on the inverse side
  if (
    relationMetadataArgs.type === RelationMetadataType.ONE_TO_ONE &&
    filteredJoinColumnsMetadataArgsCollection.length === 0 &&
    !opposite
  ) {
    const inverseSideRelationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(inverseSideTarget);
    const inverseSideRelationMetadataArgs =
      inverseSideRelationMetadataArgsCollection.find(
        (inverseSideRelationMetadataArgs) =>
          inverseSideRelationMetadataArgs.inverseSideFieldKey ===
          relationMetadataArgs.name,
      );

    if (!inverseSideRelationMetadataArgs) {
      throw new Error(
        `Inverse side join column of relation ${relationMetadataArgs.name} is missing`,
      );
    }

    return getJoinColumn(
      inverseSideJoinColumnsMetadataArgsCollection,
      inverseSideRelationMetadataArgs,
      // Avoid infinite recursion
      true,
    );
  }

  // Check if there are multiple join columns for the relation
  if (filteredJoinColumnsMetadataArgsCollection.length > 1) {
    throw new Error(
      `Multiple join columns found for relation ${relationMetadataArgs.name}`,
    );
  }

  const joinColumnsMetadataArgs = filteredJoinColumnsMetadataArgsCollection[0];

  if (!joinColumnsMetadataArgs) {
    throw new Error(
      `Join column is missing for relation ${relationMetadataArgs.name}`,
    );
  }

  return joinColumnsMetadataArgs.joinColumn;
};
