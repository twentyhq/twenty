import { getInitialObjectViewUniversalIdentifier } from 'twenty-shared/application';

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
    objectMetadataApplicationUniversalIdentifier:
      flatView.applicationUniversalIdentifier,
    objectUniversalIdentifier: flatView.objectMetadataUniversalIdentifier,
  });
