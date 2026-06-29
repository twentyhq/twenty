import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

/**
 * Application ids owning the one-to-many children of `flatEntity`.
 *
 * A parent can own children in another application (e.g. a custom field's view
 * field inside a standard view). Validators enumerate a parent's full children
 * set across applications, so those apps must be part of the build scope too.
 */
export const getOneToManyChildrenApplicationIds = ({
  metadataName,
  flatEntity,
  allRelatedFlatEntityMaps,
}: {
  metadataName: AllMetadataName;
  flatEntity: Record<string, unknown>;
  allRelatedFlatEntityMaps: Partial<AllFlatEntityMaps>;
}): string[] => {
  const applicationIds = new Set<string>();

  for (const oneToManyRelation of Object.values(
    ALL_ONE_TO_MANY_METADATA_RELATIONS[metadataName],
  ) as ({
    metadataName: AllMetadataName;
    universalFlatEntityForeignKeyAggregator: string;
  } | null)[]) {
    if (!isDefined(oneToManyRelation)) {
      continue;
    }

    const childFlatEntityMaps =
      allRelatedFlatEntityMaps[
        getMetadataFlatEntityMapsKey(oneToManyRelation.metadataName)
      ];

    if (!isDefined(childFlatEntityMaps)) {
      continue;
    }

    const childUniversalIdentifiers =
      flatEntity[oneToManyRelation.universalFlatEntityForeignKeyAggregator];

    if (!Array.isArray(childUniversalIdentifiers)) {
      continue;
    }

    for (const childUniversalIdentifier of childUniversalIdentifiers) {
      if (typeof childUniversalIdentifier !== 'string') {
        continue;
      }

      const childFlatEntity =
        childFlatEntityMaps.byUniversalIdentifier[childUniversalIdentifier];

      if (isDefined(childFlatEntity)) {
        applicationIds.add(childFlatEntity.applicationId);
      }
    }
  }

  return [...applicationIds];
};
