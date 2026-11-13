import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getSubFlatEntityByIdsMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-by-ids-maps-or-throw.util';
import { PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/constants/permission-storage-object-universal-identifiers.constant';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';

const PARENT_UNIVERSAL_IDENTIFIER_PROPERTY_SUFFIX = 'UniversalIdentifier';
const NON_PARENT_UNIVERSAL_IDENTIFIER_PROPERTIES = [
  'universalIdentifier',
  'applicationUniversalIdentifier',
];

const isReferencingOmittedEntity = ({
  flatEntity,
  omittedUniversalIdentifiers,
}: {
  flatEntity: SyncableFlatEntity;
  omittedUniversalIdentifiers: Set<string>;
}): boolean =>
  Object.entries(flatEntity).some(
    ([property, value]) =>
      property.endsWith(PARENT_UNIVERSAL_IDENTIFIER_PROPERTY_SUFFIX) &&
      !NON_PARENT_UNIVERSAL_IDENTIFIER_PROPERTIES.includes(property) &&
      omittedUniversalIdentifiers.has(value),
  );

// TODO(@charlesBochet): remove once recordShare and accessGroup are no longer standard objects
export const temporaryOmitPermissionStorageObjectsFromTwentyStandardAllFlatEntityMaps =
  (
    allFlatEntityMaps: TwentyStandardAllFlatEntityMaps,
  ): TwentyStandardAllFlatEntityMaps => {
    const allFlatEntities = Object.values(allFlatEntityMaps).flatMap(
      (flatEntityMaps: FlatEntityMaps<SyncableFlatEntity>) =>
        Object.values(flatEntityMaps.byUniversalIdentifier).filter(isDefined),
    );
    const omittedUniversalIdentifiers = new Set(
      PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS,
    );
    let omittedCount = 0;

    while (omittedCount !== omittedUniversalIdentifiers.size) {
      omittedCount = omittedUniversalIdentifiers.size;

      for (const flatEntity of allFlatEntities) {
        if (
          isReferencingOmittedEntity({
            flatEntity,
            omittedUniversalIdentifiers,
          })
        ) {
          omittedUniversalIdentifiers.add(flatEntity.universalIdentifier);
        }
      }
    }

    return Object.fromEntries(
      Object.entries(allFlatEntityMaps).map(
        ([flatEntityMapsKey, flatEntityMaps]: [
          string,
          FlatEntityMaps<SyncableFlatEntity>,
        ]) => [
          flatEntityMapsKey,
          getSubFlatEntityByIdsMapsOrThrow({
            flatEntityMaps,
            flatEntityIds: Object.values(flatEntityMaps.byUniversalIdentifier)
              .filter(isDefined)
              .filter(
                ({ universalIdentifier }) =>
                  !omittedUniversalIdentifiers.has(universalIdentifier),
              )
              .map(({ id }) => id),
          }),
        ],
      ),
    ) as TwentyStandardAllFlatEntityMaps;
  };
