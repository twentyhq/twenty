import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { mapOverridesEntryConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-overrides-entry-conditional-display.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type ViewFieldOverrides } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

type UniversalViewFieldOverrides =
  FormatRecordSerializedRelationProperties<ViewFieldOverrides>;

const fromViewFieldOverridesToUniversalOverridesEntry = ({
  overrides,
  viewFieldGroupUniversalIdentifierById,
  fieldMetadataUniversalIdentifierById,
  roleUniversalIdentifierById,
  shouldThrowOnMissingIdentifier = true,
}: {
  overrides: ViewFieldOverrides;
  viewFieldGroupUniversalIdentifierById: Partial<Record<string, string>>;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  roleUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): UniversalViewFieldOverrides => {
  const { viewFieldGroupId, ...otherOverrides } = overrides;

  const scalarOverrides: UniversalViewFieldOverrides =
    mapOverridesEntryConditionalDisplay({
      overridesEntry: otherOverrides,
      mapConditionalDisplay: (conditionalDisplay) =>
        fromConditionalDisplayToUniversalConditionalDisplay({
          conditionalDisplay,
          fieldMetadataUniversalIdentifierById,
          roleUniversalIdentifierById,
        }),
    });

  if (!isDefined(viewFieldGroupId)) {
    return {
      ...scalarOverrides,
      ...(viewFieldGroupId === null
        ? { viewFieldGroupUniversalIdentifier: null }
        : {}),
    };
  }

  const viewFieldGroupUniversalIdentifier =
    viewFieldGroupUniversalIdentifierById[viewFieldGroupId];

  if (!isDefined(viewFieldGroupUniversalIdentifier)) {
    if (shouldThrowOnMissingIdentifier) {
      throw new FlatEntityMapsException(
        `ViewFieldGroup universal identifier not found for id: ${viewFieldGroupId}`,
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      );
    }

    return {
      ...scalarOverrides,
      viewFieldGroupUniversalIdentifier: null,
    };
  }

  return {
    ...scalarOverrides,
    viewFieldGroupUniversalIdentifier,
  };
};

export const fromViewFieldOverridesToUniversalOverrides = ({
  overrides,
  viewFieldGroupUniversalIdentifierById,
  fieldMetadataUniversalIdentifierById,
  roleUniversalIdentifierById,
  shouldThrowOnMissingIdentifier,
}: {
  overrides: AuthoredOverrides<ViewFieldOverrides>;
  viewFieldGroupUniversalIdentifierById: Partial<Record<string, string>>;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  roleUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): AuthoredOverrides<UniversalViewFieldOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'viewField',
    overrides,
    mapEntry: (entry) =>
      fromViewFieldOverridesToUniversalOverridesEntry({
        overrides: entry,
        viewFieldGroupUniversalIdentifierById,
        fieldMetadataUniversalIdentifierById,
        roleUniversalIdentifierById,
        shouldThrowOnMissingIdentifier,
      }),
  });
