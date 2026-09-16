import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const isInitialObjectView = (
  flatView: Pick<
    UniversalFlatView,
    | 'universalIdentifier'
    | 'applicationUniversalIdentifier'
    | 'objectMetadataUniversalIdentifier'
  >,
): boolean =>
  flatView.universalIdentifier ===
  getInitialObjectViewUniversalIdentifier({
    viewApplicationUniversalIdentifier: flatView.applicationUniversalIdentifier,
    objectUniversalIdentifier: flatView.objectMetadataUniversalIdentifier,
  });
