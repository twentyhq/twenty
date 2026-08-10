import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

const getMetadataManyToOneForeignKeys = (
  metadataName: AllMetadataName,
): string[] =>
  Object.values(ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName])
    .filter(isDefined)
    .flatMap((relation) => [relation.foreignKey, relation.universalForeignKey]);

// A mutation only affects a related entity's cached flat map when it changes
// which entities reference each other: create, delete, or an update that moves
// a relation foreign key. A plain attribute update (e.g. a viewField position
// change) leaves every related map untouched, so only the mutated entity's own
// map needs invalidation.
const actionChangesRelationMembership = (
  action: AllUniversalWorkspaceMigrationAction,
): boolean => {
  if (action.type !== 'update') {
    return true;
  }

  const foreignKeys = getMetadataManyToOneForeignKeys(action.metadataName);

  return Object.keys(action.update).some((updatedKey) =>
    foreignKeys.includes(updatedKey),
  );
};

export const getInvalidatedMetadataNamesFromActions = (
  actions: AllUniversalWorkspaceMigrationAction[],
): AllMetadataName[] => {
  const metadataNames = new Set<AllMetadataName>();

  for (const action of actions) {
    metadataNames.add(action.metadataName);

    if (actionChangesRelationMembership(action)) {
      getMetadataRelatedMetadataNames(action.metadataName).forEach(
        (metadataName) => metadataNames.add(metadataName),
      );
      getMetadataSerializedRelationNames(action.metadataName).forEach(
        (metadataName) => metadataNames.add(metadataName),
      );
    }
  }

  return [...metadataNames];
};
