import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';

type ManyToOneRelation = {
  metadataName: AllMetadataName;
  foreignKey: string;
  universalForeignKey: string | null;
};

const getUpdateAffectedMetadataNames = ({
  metadataName,
  changedProperties,
}: {
  metadataName: AllMetadataName;
  changedProperties: Set<string>;
}): AllMetadataName[] => {
  const manyToOneRelations = ALL_MANY_TO_ONE_METADATA_RELATIONS[
    metadataName
  ] as Record<string, ManyToOneRelation | null>;

  // An update replaces the entity in its own map only. A many-to-one related
  // map is relinked solely when the update changes that relation's foreign key.
  return Object.values(manyToOneRelations)
    .filter(
      (relation): relation is ManyToOneRelation =>
        isDefined(relation) &&
        (changedProperties.has(relation.foreignKey) ||
          (isDefined(relation.universalForeignKey) &&
            changedProperties.has(relation.universalForeignKey))),
    )
    .map((relation) => relation.metadataName);
};

// A migration's load set is broad (relations + validation deps), but
// invalidation must cover only the maps an action mutates, or a lone viewField
// reorder needlessly recomputes flatObjectMetadataMaps/flatFieldMetadataMaps.
// Create and delete may co-write or cascade any related entity; an update only
// relinks a many-to-one map when its foreign key changes.
export const getFlatEntityMapsKeysToInvalidateForWorkspaceMigration = (
  actions: AllUniversalWorkspaceMigrationAction[],
): (keyof AllFlatEntityMaps)[] => {
  const metadataNamesToInvalidate = new Set<AllMetadataName>();

  for (const action of actions) {
    metadataNamesToInvalidate.add(action.metadataName);

    const affectedMetadataNames =
      action.type === 'update'
        ? getUpdateAffectedMetadataNames({
            metadataName: action.metadataName,
            changedProperties: new Set(Object.keys(action.update)),
          })
        : getMetadataRelatedMetadataNames(action.metadataName);

    for (const metadataName of affectedMetadataNames) {
      metadataNamesToInvalidate.add(metadataName);
    }
  }

  return [...metadataNamesToInvalidate].map(getMetadataFlatEntityMapsKey);
};
