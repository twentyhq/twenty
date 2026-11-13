import { ViewVisibility } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceViewOwnershipIndexCacheService } from 'src/engine/metadata-modules/metadata-ownership/services/workspace-view-ownership-index-cache.service';

type ViewOwnershipIndexSources = Parameters<
  WorkspaceViewOwnershipIndexCacheService['getFromSources']
>[0];

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const privateView = {
  id: 'private-view',
  universalIdentifier: 'private-view-universal-identifier',
  visibility: ViewVisibility.UNLISTED,
  createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
} as FlatView;

const privateViewField = {
  id: 'private-view-field',
  universalIdentifier: 'private-view-field-universal-identifier',
  viewId: privateView.id,
} as FlatViewField;

const buildSources = (): ViewOwnershipIndexSources => ({
  flatViewMaps: buildFlatEntityMaps([privateView]),
  flatViewFieldMaps: buildFlatEntityMaps([privateViewField]),
  flatViewFilterMaps: createEmptyFlatEntityMaps(),
  flatViewSortMaps: createEmptyFlatEntityMaps(),
  flatViewGroupMaps: createEmptyFlatEntityMaps(),
  flatViewFilterGroupMaps: createEmptyFlatEntityMaps(),
  flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
});

describe('WorkspaceViewOwnershipIndexCacheService', () => {
  it('indexes private views and their children from the source maps', () => {
    const service = new WorkspaceViewOwnershipIndexCacheService();

    expect(service.getFromSources(buildSources())).toEqual({
      ownerUserWorkspaceIdByPrivateRootId: {
        'private-view': OWNER_USER_WORKSPACE_ID,
      },
      privateRootIdsByOwnerUserWorkspaceId: {
        [OWNER_USER_WORKSPACE_ID]: ['private-view'],
      },
      ownerUserWorkspaceIdByPrivateChildId: {
        'private-view-field': OWNER_USER_WORKSPACE_ID,
      },
    });
  });

  it('returns the same index while every source map is unchanged', () => {
    const service = new WorkspaceViewOwnershipIndexCacheService();
    const sources = buildSources();

    expect(service.getFromSources({ ...sources })).toBe(
      service.getFromSources(sources),
    );
  });

  it('recomputes when the root map changes', () => {
    const service = new WorkspaceViewOwnershipIndexCacheService();
    const sources = buildSources();
    const metadataOwnershipIndex = service.getFromSources(sources);

    expect(
      service.getFromSources({
        ...sources,
        flatViewMaps: buildFlatEntityMaps([privateView]),
      }),
    ).not.toBe(metadataOwnershipIndex);
  });

  it('recomputes when a single child map changes', () => {
    const service = new WorkspaceViewOwnershipIndexCacheService();
    const sources = buildSources();
    const metadataOwnershipIndex = service.getFromSources(sources);

    expect(
      service.getFromSources({
        ...sources,
        flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
      }),
    ).not.toBe(metadataOwnershipIndex);
  });

  it('keeps the index of earlier sources after a recompute', () => {
    const service = new WorkspaceViewOwnershipIndexCacheService();
    const sources = buildSources();
    const changedSources = {
      ...sources,
      flatViewSortMaps: createEmptyFlatEntityMaps(),
    };
    const metadataOwnershipIndex = service.getFromSources(sources);
    const changedMetadataOwnershipIndex =
      service.getFromSources(changedSources);

    expect(service.getFromSources(sources)).toBe(metadataOwnershipIndex);
    expect(service.getFromSources(changedSources)).toBe(
      changedMetadataOwnershipIndex,
    );
  });
});
