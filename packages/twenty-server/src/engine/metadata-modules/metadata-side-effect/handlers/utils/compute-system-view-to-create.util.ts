import {
  SYSTEM_VIEW_KEYS,
  getSystemViewUniversalIdentifier,
  type SystemViewKey,
} from 'twenty-shared/application';
import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { buildBaseUniversalFlatView } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-base-universal-flat-view.util';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type SystemViewObjectMetadata = Pick<
  UniversalFlatObjectMetadata,
  'universalIdentifier' | 'labelSingular'
>;

// The INDEX view name is a template resolved at display time; the record-page
// view name is materialized at creation.
const SYSTEM_VIEW_PROPERTIES_BY_VIEW_KEY = {
  [SYSTEM_VIEW_KEYS.INDEX]: {
    type: ViewType.TABLE,
    icon: VIEW_TYPE_DEFAULT_ICONS[ViewType.TABLE],
    computeName: () => INDEX_VIEW_NAME,
  },
  [SYSTEM_VIEW_KEYS.FIELDS_WIDGET]: {
    type: ViewType.FIELDS_WIDGET,
    icon: 'IconList',
    computeName: (objectMetadata: SystemViewObjectMetadata) =>
      `${objectMetadata.labelSingular} Record Page Fields`,
  },
} as const satisfies Record<
  SystemViewKey,
  {
    type: ViewType;
    icon: string;
    computeName: (objectMetadata: SystemViewObjectMetadata) => string;
  }
>;

export const computeSystemViewToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
  viewKey,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: SystemViewObjectMetadata;
  viewKey: SystemViewKey;
}): UniversalFlatView & { id: string } => {
  const { type, icon, computeName } =
    SYSTEM_VIEW_PROPERTIES_BY_VIEW_KEY[viewKey];

  return buildBaseUniversalFlatView({
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    applicationUniversalIdentifier,
    universalIdentifier: getSystemViewUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
      viewKey,
    }),
    name: computeName(objectMetadata),
    key: viewKey === SYSTEM_VIEW_KEYS.INDEX ? ViewKey.INDEX : null,
    icon,
    type,
    position: 0,
    isSystemSideEffect: true,
  });
};
