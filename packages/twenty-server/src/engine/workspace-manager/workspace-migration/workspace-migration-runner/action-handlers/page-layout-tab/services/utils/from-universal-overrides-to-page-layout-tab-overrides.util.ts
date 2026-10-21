import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';

import { mapOverridesEntryConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-overrides-entry-conditional-display.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type PageLayoutTabOverrides } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';
import { fromUniversalConditionalDisplayToConditionalDisplay } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-universal-conditional-display-to-conditional-display.util';

type UniversalPageLayoutTabOverrides =
  FormatRecordSerializedRelationProperties<PageLayoutTabOverrides>;

export const fromUniversalOverridesToPageLayoutTabOverrides = ({
  universalOverrides,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalOverrides: AuthoredOverrides<UniversalPageLayoutTabOverrides>;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): AuthoredOverrides<PageLayoutTabOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'pageLayoutTab',
    overrides: universalOverrides,
    mapEntry: (overridesEntry): PageLayoutTabOverrides =>
      mapOverridesEntryConditionalDisplay({
        overridesEntry,
        mapConditionalDisplay: (universalConditionalDisplay) =>
          fromUniversalConditionalDisplayToConditionalDisplay({
            universalConditionalDisplay,
            flatFieldMetadataMaps,
            flatRoleMaps,
          }),
      }),
  });
