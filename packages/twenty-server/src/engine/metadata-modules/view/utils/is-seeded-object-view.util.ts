import { getSeededObjectViewUniversalIdentifier } from 'twenty-shared/application';

import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const isSeededObjectView = (
  flatView: Pick<
    UniversalFlatView,
    | 'universalIdentifier'
    | 'applicationUniversalIdentifier'
    | 'objectMetadataUniversalIdentifier'
  >,
): boolean =>
  flatView.universalIdentifier ===
  getSeededObjectViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      flatView.applicationUniversalIdentifier,
    objectUniversalIdentifier: flatView.objectMetadataUniversalIdentifier,
  });
