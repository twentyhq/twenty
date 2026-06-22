import { computeUniversalIdentifier } from '@/application/deterministic-identifier/compute-universal-identifier.util';
import {
  DISCRIMINATOR_BY_ENTITY_TYPE,
  SYSTEM_INDEX_DISCRIMINATOR,
  SYSTEM_NAVIGATION_COMMAND_DISCRIMINATOR,
  SYSTEM_RECORD_PAGE_LAYOUT_DISCRIMINATOR,
  SYSTEM_RECORD_PAGE_TAB_DISCRIMINATOR,
  SYSTEM_RECORD_PAGE_WIDGET_DISCRIMINATOR,
  SYSTEM_RECORD_VIEW_DISCRIMINATOR,
  type SystemIndexKind,
  type SystemRecordPageTabKind,
  type SystemRecordPageWidgetKind,
  type SystemRecordViewKind,
} from '@/application/deterministic-identifier/deterministic-identifier-discriminator.constant';

export const getSystemFieldUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  fieldName,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  fieldName: string;
}): string =>
  computeUniversalIdentifier({
    entityType: 'field',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: objectUniversalIdentifier,
    discriminator: DISCRIMINATOR_BY_ENTITY_TYPE.field({ name: fieldName }),
  });

export const getRecordViewUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  kind,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  kind: SystemRecordViewKind;
}): string =>
  computeUniversalIdentifier({
    entityType: 'view',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: objectUniversalIdentifier,
    discriminator: SYSTEM_RECORD_VIEW_DISCRIMINATOR[kind],
  });

export const getViewFieldUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}): string =>
  computeUniversalIdentifier({
    entityType: 'viewField',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: viewUniversalIdentifier,
    discriminator: DISCRIMINATOR_BY_ENTITY_TYPE.viewField({
      fieldMetadataUniversalIdentifier,
    }),
  });

export const getDefaultIndexUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  kind,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  kind: SystemIndexKind;
}): string =>
  computeUniversalIdentifier({
    entityType: 'index',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: objectUniversalIdentifier,
    discriminator: SYSTEM_INDEX_DISCRIMINATOR[kind],
  });

export const getRecordPageLayoutUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeUniversalIdentifier({
    entityType: 'pageLayout',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: objectUniversalIdentifier,
    discriminator: SYSTEM_RECORD_PAGE_LAYOUT_DISCRIMINATOR,
  });

export const getRecordPageTabUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  pageLayoutUniversalIdentifier,
  tabKind,
}: {
  ownerApplicationUniversalIdentifier: string;
  pageLayoutUniversalIdentifier: string;
  tabKind: SystemRecordPageTabKind;
}): string =>
  computeUniversalIdentifier({
    entityType: 'pageLayoutTab',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: pageLayoutUniversalIdentifier,
    discriminator: SYSTEM_RECORD_PAGE_TAB_DISCRIMINATOR[tabKind],
  });

export const getRecordPageWidgetUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  pageLayoutTabUniversalIdentifier,
  widgetKind,
}: {
  ownerApplicationUniversalIdentifier: string;
  pageLayoutTabUniversalIdentifier: string;
  widgetKind: SystemRecordPageWidgetKind;
}): string =>
  computeUniversalIdentifier({
    entityType: 'pageLayoutWidget',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: pageLayoutTabUniversalIdentifier,
    discriminator: SYSTEM_RECORD_PAGE_WIDGET_DISCRIMINATOR[widgetKind],
  });

export const getNavigationCommandUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeUniversalIdentifier({
    entityType: 'commandMenuItem',
    ownerApplicationUniversalIdentifier,
    parentUniversalIdentifier: objectUniversalIdentifier,
    discriminator: SYSTEM_NAVIGATION_COMMAND_DISCRIMINATOR,
  });
