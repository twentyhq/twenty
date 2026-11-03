import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { mapOverridesEntryConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-overrides-entry-conditional-display.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

type UniversalPageLayoutWidgetOverrides =
  FormatRecordSerializedRelationProperties<PageLayoutWidgetOverrides>;

const fromPageLayoutWidgetOverridesToUniversalOverridesEntry = ({
  overrides,
  pageLayoutTabUniversalIdentifierById,
  fieldMetadataUniversalIdentifierById,
  roleUniversalIdentifierById,
  shouldThrowOnMissingIdentifier = true,
}: {
  overrides: PageLayoutWidgetOverrides;
  pageLayoutTabUniversalIdentifierById: Partial<Record<string, string>>;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  roleUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): UniversalPageLayoutWidgetOverrides => {
  const { pageLayoutTabId, ...otherOverrides } = overrides;

  const scalarOverrides: UniversalPageLayoutWidgetOverrides =
    mapOverridesEntryConditionalDisplay({
      overridesEntry: otherOverrides,
      mapConditionalDisplay: (conditionalDisplay) =>
        fromConditionalDisplayToUniversalConditionalDisplay({
          conditionalDisplay,
          fieldMetadataUniversalIdentifierById,
          roleUniversalIdentifierById,
        }),
    });

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

export const fromPageLayoutWidgetOverridesToUniversalOverrides = ({
  overrides,
  pageLayoutTabUniversalIdentifierById,
  fieldMetadataUniversalIdentifierById,
  roleUniversalIdentifierById,
  shouldThrowOnMissingIdentifier,
}: {
  overrides: AuthoredOverrides<PageLayoutWidgetOverrides>;
  pageLayoutTabUniversalIdentifierById: Partial<Record<string, string>>;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  roleUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): AuthoredOverrides<UniversalPageLayoutWidgetOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'pageLayoutWidget',
    overrides,
    mapEntry: (entry) =>
      fromPageLayoutWidgetOverridesToUniversalOverridesEntry({
        overrides: entry,
        pageLayoutTabUniversalIdentifierById,
        fieldMetadataUniversalIdentifierById,
        roleUniversalIdentifierById,
        shouldThrowOnMissingIdentifier,
      }),
  });
