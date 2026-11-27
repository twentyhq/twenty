import { createHash } from 'crypto';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ObjectViewsHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/object-views-hash.dto';

export const computeObjectViewsHashes = ({
  flatViews,
  viewContentHashByViewIdMaps,
}: {
  flatViews: FlatView[];
  viewContentHashByViewIdMaps: Map<string, string>[];
}): ObjectViewsHashDTO[] => {
  const viewContentHashesByObjectMetadataId = new Map<string, string[]>();

  const flatViewsSortedById = [...flatViews].sort(
    (firstFlatView, secondFlatView) =>
      firstFlatView.id.localeCompare(secondFlatView.id),
  );

  for (const flatView of flatViewsSortedById) {
    const viewContentHash = viewContentHashByViewIdMaps
      .map(
        (viewContentHashByViewId) =>
          viewContentHashByViewId.get(flatView.id) ?? '',
      )
      .join(',');

    const viewContentHashes =
      viewContentHashesByObjectMetadataId.get(flatView.objectMetadataId) ?? [];

    viewContentHashes.push(`${flatView.id}:${viewContentHash}`);
    viewContentHashesByObjectMetadataId.set(
      flatView.objectMetadataId,
      viewContentHashes,
    );
  }

  return [...viewContentHashesByObjectMetadataId].map(
    ([objectMetadataId, viewContentHashes]) => ({
      objectMetadataId,
      hash: createHash('sha256')
        .update(viewContentHashes.join(';'))
        .digest('hex'),
    }),
  );
};
