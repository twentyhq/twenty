import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

type UniversalPageLayoutWidgetOverrides =
  FormatRecordSerializedRelationProperties<PageLayoutWidgetOverrides>;

export const fromPageLayoutWidgetOverridesToUniversalOverrides = ({
  overrides,
  pageLayoutTabUniversalIdentifierById,
  shouldThrowOnMissingIdentifier = true,
}: {
  overrides: PageLayoutWidgetOverrides;
  pageLayoutTabUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): UniversalPageLayoutWidgetOverrides => {
  const { pageLayoutTabId, ...scalarOverrides } = overrides;

  if (!isDefined(pageLayoutTabId)) {
    return {
      ...scalarOverrides,
      ...(pageLayoutTabId === null
        ? { pageLayoutTabUniversalIdentifier: null }
        : {}),
    };
  }

  const pageLayoutTabUniversalIdentifier =
    pageLayoutTabUniversalIdentifierById[pageLayoutTabId];

  if (!isDefined(pageLayoutTabUniversalIdentifier)) {
    if (shouldThrowOnMissingIdentifier) {
      throw new FlatEntityMapsException(
        `PageLayoutTab universal identifier not found for id: ${pageLayoutTabId}`,
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      );
    }

    return {
      ...scalarOverrides,
      pageLayoutTabUniversalIdentifier: null,
    };
  }

  return {
    ...scalarOverrides,
    pageLayoutTabUniversalIdentifier,
  };
};
