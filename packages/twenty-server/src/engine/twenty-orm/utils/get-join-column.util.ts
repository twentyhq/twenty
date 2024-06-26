import { WorkspaceJoinColumnsMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-join-columns-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

export const getJoinColumn = (
  joinColumnsMetadataArgsCollection: WorkspaceJoinColumnsMetadataArgs[],
  relationMetadataArgs: WorkspaceRelationMetadataArgs,
): string | null => {
  if (
    relationMetadataArgs.type === RelationMetadataType.ONE_TO_MANY ||
    relationMetadataArgs.type === RelationMetadataType.MANY_TO_MANY
  ) {
    return null;
  }

  const filteredJoinColumnsMetadataArgsCollection =
    joinColumnsMetadataArgsCollection.filter(
      (joinColumnsMetadataArgs) =>
        joinColumnsMetadataArgs.relationName === relationMetadataArgs.name,
    );

  // If we're in a ONE_TO_ONE relation and there are no join columns, we need to find the join column on the inverse side
  if (
    relationMetadataArgs.type === RelationMetadataType.ONE_TO_ONE &&
    filteredJoinColumnsMetadataArgsCollection.length === 0
  ) {
    const inverseSideTarget = relationMetadataArgs.inverseSideTarget();
    const inverseSideJoinColumnsMetadataArgsCollection =
      metadataArgsStorage.filterJoinColumns(inverseSideTarget);
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
        `Inverse side relation metadata args are missing for relation ${relationMetadataArgs.name}`,
      );
    }

    return getJoinColumn(
      inverseSideJoinColumnsMetadataArgsCollection,
      inverseSideRelationMetadataArgs,
    );
  }

  // Check if there are multiple join columns for the relation
  if (filteredJoinColumnsMetadataArgsCollection.length > 1) {
    throw new Error(
      `Multiple join columns metadata args found for relation ${relationMetadataArgs.name}`,
    );
  }

  const joinColumnsMetadataArgs = filteredJoinColumnsMetadataArgsCollection[0];

  if (!joinColumnsMetadataArgs) {
    throw new Error(
      `Join columns metadata args are missing for relation ${relationMetadataArgs.name}`,
    );
  }

  return joinColumnsMetadataArgs.joinColumn;
};
