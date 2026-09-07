import { getSeededObjectViewUniversalIdentifier } from 'twenty-shared/application';
import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { ViewType } from 'twenty-shared/types';

import { buildBaseUniversalFlatView } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-view-to-create.util';
import { SEEDED_OBJECT_VIEW_POSITION } from 'src/engine/metadata-modules/view/constants/seeded-object-view-position.constant';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type SeededObjectViewObjectMetadata = Pick<
  UniversalFlatObjectMetadata,
  'universalIdentifier' | 'labelPlural'
>;

export const computeSeededObjectViewToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: SeededObjectViewObjectMetadata;
}): UniversalFlatView & { id: string } =>
  buildBaseUniversalFlatView({
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    applicationUniversalIdentifier,
    universalIdentifier: getSeededObjectViewUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
    }),
    name: `All ${objectMetadata.labelPlural}`,
    key: null,
    icon: VIEW_TYPE_DEFAULT_ICONS[ViewType.TABLE],
    type: ViewType.TABLE,
    position: SEEDED_OBJECT_VIEW_POSITION,
    isSystemSideEffect: false,
  });
