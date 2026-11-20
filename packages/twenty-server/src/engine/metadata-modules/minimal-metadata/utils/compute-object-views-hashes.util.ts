import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ObjectViewsHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/object-views-hash.dto';

export const computeObjectViewsHashes = ({
  flatViews,
  viewContentHashByViewId,
}: {
  flatViews: FlatView[];
  viewContentHashByViewId: Map<string, string>;
}): ObjectViewsHashDTO[] => {
  const viewContentHashesByObjectMetadataId = new Map<string, string[]>();

  const flatViewsSortedById = [...flatViews].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  for (const flatView of flatViewsSortedById) {
    const viewContentHash = viewContentHashByViewId.get(flatView.id);

    if (!isDefined(viewContentHash)) {
      continue;
    }

    const viewContentHashes =
      viewContentHashesByObjectMetadataId.get(flatView.objectMetadataId) ?? [];

    viewContentHashes.push(viewContentHash);
    viewContentHashesByObjectMetadataId.set(
      flatView.objectMetadataId,
      viewContentHashes,
    );
  }

  return [...viewContentHashesByObjectMetadataId.entries()].map(
    ([objectMetadataId, viewContentHashes]) => ({
      objectMetadataId,
      hash: createHash('sha256')
        .update(viewContentHashes.join(':'))
        .digest('hex'),
    }),
  );
};
