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
