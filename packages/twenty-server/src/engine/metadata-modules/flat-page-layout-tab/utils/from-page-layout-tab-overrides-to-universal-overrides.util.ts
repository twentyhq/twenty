import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';

import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { mapOverridesEntryConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-overrides-entry-conditional-display.util';
import { type PageLayoutTabOverrides } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

type UniversalPageLayoutTabOverrides =
  FormatRecordSerializedRelationProperties<PageLayoutTabOverrides>;

export const fromPageLayoutTabOverridesToUniversalOverrides = ({
  overrides,
  fieldMetadataUniversalIdentifierById,
  roleUniversalIdentifierById,
}: {
  overrides: AuthoredOverrides<PageLayoutTabOverrides>;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  roleUniversalIdentifierById: Partial<Record<string, string>>;
}): AuthoredOverrides<UniversalPageLayoutTabOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'pageLayoutTab',
    overrides,
    mapEntry: (overridesEntry): UniversalPageLayoutTabOverrides =>
      mapOverridesEntryConditionalDisplay({
        overridesEntry,
        mapConditionalDisplay: (conditionalDisplay) =>
          fromConditionalDisplayToUniversalConditionalDisplay({
            conditionalDisplay,
            fieldMetadataUniversalIdentifierById,
            roleUniversalIdentifierById,
          }),
      }),
  });
