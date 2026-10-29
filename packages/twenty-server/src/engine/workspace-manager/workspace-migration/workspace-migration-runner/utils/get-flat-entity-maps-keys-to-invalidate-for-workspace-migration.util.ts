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

// Updating these deletes and recreates the row with a new id, relinking the
// parent aggregators even when no foreign key is in the update payload.
const METADATA_NAMES_WITH_ID_REGENERATING_UPDATE = new Set<AllMetadataName>([
  'index',
]);

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

  const regeneratesId =
    METADATA_NAMES_WITH_ID_REGENERATING_UPDATE.has(metadataName);

  return Object.values(manyToOneRelations)
    .filter(
      (relation): relation is ManyToOneRelation =>
        isDefined(relation) &&
        (regeneratesId ||
          changedProperties.has(relation.foreignKey) ||
          (isDefined(relation.universalForeignKey) &&
            changedProperties.has(relation.universalForeignKey))),
    )
    .map((relation) => relation.metadataName);
};

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
