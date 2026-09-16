import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { ViewType } from 'twenty-shared/types';

import { buildBaseUniversalFlatView } from 'src/engine/metadata-modules/view/utils/build-base-universal-flat-view.util';
import { INITIAL_OBJECT_VIEW_POSITION } from 'src/engine/metadata-modules/view/constants/initial-object-view-position.constant';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type InitialObjectViewObjectMetadata = Pick<
  UniversalFlatObjectMetadata,
  'universalIdentifier' | 'labelPlural'
>;

export const computeInitialObjectViewToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: InitialObjectViewObjectMetadata;
}): UniversalFlatView & { id: string } =>
  buildBaseUniversalFlatView({
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    applicationUniversalIdentifier,
    universalIdentifier: getInitialObjectViewUniversalIdentifier({
      viewApplicationUniversalIdentifier: applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
    }),
    name: `All ${objectMetadata.labelPlural}`,
    key: null,
    icon: VIEW_TYPE_DEFAULT_ICONS[ViewType.TABLE],
    type: ViewType.TABLE,
    position: INITIAL_OBJECT_VIEW_POSITION,
    isSystemSideEffect: false,
  });
