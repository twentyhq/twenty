import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';

export const VIEW_CONTENT_FLAT_ENTITY_MAPS_KEYS = [
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatViewFieldGroupMaps',
  'flatViewFilterMaps',
  'flatViewFilterGroupMaps',
  'flatViewGroupMaps',
  'flatViewSortMaps',
] as const satisfies (keyof AllFlatEntityMaps)[];

export type ViewContentFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  (typeof VIEW_CONTENT_FLAT_ENTITY_MAPS_KEYS)[number]
>;

export const computeViewContentHashByViewId = ({
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatViewFilterMaps,
  flatViewFilterGroupMaps,
  flatViewGroupMaps,
  flatViewSortMaps,
}: ViewContentFlatEntityMaps): Map<string, string> => {
  const viewContentHashByViewId = new Map<string, string>();

  for (const flatView of Object.values(flatViewMaps.byUniversalIdentifier)) {
    if (!isDefined(flatView)) {
      continue;
    }

    const viewContent = {
      view: flatView,
      viewFields: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFieldIds,
        flatEntityMaps: flatViewFieldMaps,
      }),
      viewFieldGroups: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFieldGroupIds,
        flatEntityMaps: flatViewFieldGroupMaps,
      }),
      viewFilters: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFilterIds,
        flatEntityMaps: flatViewFilterMaps,
      }),
      viewFilterGroups: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewFilterGroupIds,
        flatEntityMaps: flatViewFilterGroupMaps,
      }),
      viewGroups: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewGroupIds,
        flatEntityMaps: flatViewGroupMaps,
      }),
      viewSorts: findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatView.viewSortIds,
        flatEntityMaps: flatViewSortMaps,
      }),
    };

    viewContentHashByViewId.set(
      flatView.id,
      createHash('sha256').update(JSON.stringify(viewContent)).digest('hex'),
    );
  }

  return viewContentHashByViewId;
};
