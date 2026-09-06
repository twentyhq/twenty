import {
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';

import {
  RECORD_FORM_PAGE_LAYOUT_NAME,
  RECORD_FORM_TAB_PROPS,
} from 'src/engine/metadata-modules/metadata-side-effect/constants/record-form-tab-props.constant';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';

export const computeSystemRecordFormPageLayoutToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: Pick<UniversalFlatObjectMetadata, 'universalIdentifier'>;
}): {
  pageLayout: UniversalFlatPageLayout;
  pageLayoutTab: UniversalFlatPageLayoutTab;
} => {
  const now = new Date().toISOString();

  const pageLayoutUniversalIdentifier =
    getSystemRecordFormPageLayoutUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
    });

  const pageLayoutTabUniversalIdentifier =
    getSystemPageLayoutTabUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      pageLayoutUniversalIdentifier,
      title: RECORD_FORM_TAB_PROPS.title,
    });

  const pageLayoutTab: UniversalFlatPageLayoutTab = {
    universalIdentifier: pageLayoutTabUniversalIdentifier,
    applicationUniversalIdentifier,
    title: RECORD_FORM_TAB_PROPS.title,
    position: RECORD_FORM_TAB_PROPS.position,
    pageLayoutUniversalIdentifier,
    widgetUniversalIdentifiers: [],
    isActive: true,
    isSystemSideEffect: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    icon: RECORD_FORM_TAB_PROPS.icon,
    layoutMode: RECORD_FORM_TAB_PROPS.layoutMode,
    overrides: null,
  };

  const pageLayout: UniversalFlatPageLayout = {
    universalIdentifier: pageLayoutUniversalIdentifier,
    applicationUniversalIdentifier,
    name: RECORD_FORM_PAGE_LAYOUT_NAME,
    type: PageLayoutType.RECORD_FORM,
    isFirstTabPinned: true,
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    tabUniversalIdentifiers: [pageLayoutTabUniversalIdentifier],
    isSystemSideEffect: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  };

  return { pageLayout, pageLayoutTab };
};
