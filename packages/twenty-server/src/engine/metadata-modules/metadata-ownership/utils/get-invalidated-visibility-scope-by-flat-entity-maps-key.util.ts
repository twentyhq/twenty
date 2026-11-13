import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { OWNERSHIP_INDEX_SOURCE_KEY_NAMES_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/metadata-ownership/constants/ownership-index-source-key-names-by-root-metadata-name.constant';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { findOwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/utils/find-ownable-root-metadata-name.util';
import { isOwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/utils/is-ownable-root-metadata-name.util';
import { resolveOwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/utils/resolve-ownable-root-privacy-state.util';
import { type WorkspaceCacheInvalidatedVisibilityScope } from 'src/engine/workspace-cache/types/workspace-cache-invalidated-visibility-scope.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

type InvalidatedVisibilityScopeByFlatEntityMapsKey = Partial<
  Record<keyof AllFlatEntityMaps, WorkspaceCacheInvalidatedVisibilityScope>
>;

type OwnableRootFlatEntityMaps = Partial<
  Pick<AllFlatEntityMaps, MetadataToFlatEntityMapsKey<OwnableRootMetadataName>>
>;

const getMetadataEventRows = (
  metadataEvent: MetadataEvent,
): Record<string, unknown>[] => {
  if (metadataEvent.type === 'created') {
    return [metadataEvent.properties.after];
  }

  if (metadataEvent.type === 'deleted') {
    return [metadataEvent.properties.before];
  }

  return [metadataEvent.properties.before, metadataEvent.properties.after];
};

const getTouchedRootPrivateStates = ({
  metadataEvent,
  rootMetadataName,
  loadedRootFlatEntityMaps,
}: {
  metadataEvent: MetadataEvent;
  rootMetadataName: OwnableRootMetadataName;
  loadedRootFlatEntityMaps: FlatEntityMaps<
    MetadataFlatEntity<OwnableRootMetadataName>
  >[];
}): boolean[] => {
  const rows = getMetadataEventRows(metadataEvent);

  if (isOwnableRootMetadataName(metadataEvent.metadataName)) {
    return rows.map(
      (row) =>
        resolveOwnableRootPrivacyState({ rootMetadataName, row }).isPrivate,
    );
  }

  const children: Partial<Record<string, { rootIdProperty: string }>> =
    OWNABLE_METADATA_BY_ROOT_METADATA_NAME[rootMetadataName].children;
  const rootIdProperty = children[metadataEvent.metadataName]?.rootIdProperty;

  if (!isDefined(rootIdProperty) || loadedRootFlatEntityMaps.length === 0) {
    return [];
  }

  return rows.flatMap((row) => {
    const rootId = row[rootIdProperty];
    const roots = isString(rootId)
      ? loadedRootFlatEntityMaps
          .map((flatEntityMaps) =>
            findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: rootId,
              flatEntityMaps,
            }),
          )
          .filter(isDefined)
      : [];

    return roots.length === 0
      ? [true]
      : roots.map(
          (root) =>
            resolveOwnableRootPrivacyState({ rootMetadataName, row: root })
              .isPrivate,
        );
  });
};

export const getInvalidatedVisibilityScopeByFlatEntityMapsKey = ({
  metadataEvents,
  fromAllFlatEntityMaps,
  toAllFlatEntityMaps,
}: {
  metadataEvents: MetadataEvent[];
  fromAllFlatEntityMaps: OwnableRootFlatEntityMaps;
  toAllFlatEntityMaps: OwnableRootFlatEntityMaps;
}): InvalidatedVisibilityScopeByFlatEntityMapsKey => {
  const touchedPrivateStatesByRootMetadataName = new Map<
    OwnableRootMetadataName,
    Set<boolean>
  >();

  for (const metadataEvent of metadataEvents) {
    const rootMetadataName = findOwnableRootMetadataName(
      metadataEvent.metadataName,
    );

    if (!isDefined(rootMetadataName)) {
      continue;
    }

    const rootFlatEntityMapsKey =
      getMetadataFlatEntityMapsKey(rootMetadataName);
    const touchedPrivateStates =
      touchedPrivateStatesByRootMetadataName.get(rootMetadataName) ??
      new Set<boolean>();

    for (const isPrivate of getTouchedRootPrivateStates({
      metadataEvent,
      rootMetadataName,
      loadedRootFlatEntityMaps: [
        fromAllFlatEntityMaps[rootFlatEntityMapsKey],
        toAllFlatEntityMaps[rootFlatEntityMapsKey],
      ].filter(isDefined),
    })) {
      touchedPrivateStates.add(isPrivate);
    }

    touchedPrivateStatesByRootMetadataName.set(
      rootMetadataName,
      touchedPrivateStates,
    );
  }

  const invalidatedVisibilityScopeByFlatEntityMapsKey: InvalidatedVisibilityScopeByFlatEntityMapsKey =
    {};

  for (const [
    rootMetadataName,
    touchedPrivateStates,
  ] of touchedPrivateStatesByRootMetadataName) {
    if (touchedPrivateStates.size === 0) {
      continue;
    }

    const visibilityScope: WorkspaceCacheInvalidatedVisibilityScope =
      touchedPrivateStates.size === 2
        ? 'both'
        : touchedPrivateStates.has(true)
          ? 'private'
          : 'workspace';

    for (const flatEntityMapsKey of OWNERSHIP_INDEX_SOURCE_KEY_NAMES_BY_ROOT_METADATA_NAME[
      rootMetadataName
    ]) {
      invalidatedVisibilityScopeByFlatEntityMapsKey[flatEntityMapsKey] =
        visibilityScope;
    }
  }

  return invalidatedVisibilityScopeByFlatEntityMapsKey;
};
