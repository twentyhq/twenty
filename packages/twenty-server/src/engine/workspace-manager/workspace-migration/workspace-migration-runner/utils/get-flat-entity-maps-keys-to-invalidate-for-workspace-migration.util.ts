import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';

type ManyToOneRelation = {
  metadataName: AllMetadataName;
  foreignKey: string;
  universalForeignKey: string | null;
};

// An action only mutates its own flat entity map plus the related maps whose
// many-to-one foreign-key aggregators it relinks: create and delete relink
// every relation, while an update relinks a relation only when its foreign key
// is among the changed fields. Metadata loaded read-only to validate an action
// (e.g. objectMetadata for a viewField) is never mutated, so it must stay out
// of the invalidation set to avoid recomputing large maps for nothing.
export const getFlatEntityMapsKeysToInvalidateForWorkspaceMigration = (
  actions: AllUniversalWorkspaceMigrationAction[],
): (keyof AllFlatEntityMaps)[] => {
  const metadataNamesToInvalidate = new Set<AllMetadataName>();

  for (const action of actions) {
    metadataNamesToInvalidate.add(action.metadataName);

    const changedProperties =
      action.type === 'update' ? new Set(Object.keys(action.update)) : null;

    const manyToOneRelations = ALL_MANY_TO_ONE_METADATA_RELATIONS[
      action.metadataName
    ] as Record<string, ManyToOneRelation | null>;

    for (const relation of Object.values(manyToOneRelations)) {
      if (!isDefined(relation)) {
        continue;
      }

      const relinksRelation =
        !isDefined(changedProperties) ||
        changedProperties.has(relation.foreignKey) ||
        (isDefined(relation.universalForeignKey) &&
          changedProperties.has(relation.universalForeignKey));

      if (relinksRelation) {
        metadataNamesToInvalidate.add(relation.metadataName);
      }
    }
  }

  return [...metadataNamesToInvalidate].map(getMetadataFlatEntityMapsKey);
};
