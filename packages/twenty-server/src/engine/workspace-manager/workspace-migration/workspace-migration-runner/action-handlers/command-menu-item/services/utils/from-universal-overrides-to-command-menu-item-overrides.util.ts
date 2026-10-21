import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';

import { type CommandMenuItemOverrides } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { mapOverridesEntryConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-overrides-entry-conditional-display.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';
import { fromUniversalConditionalDisplayToConditionalDisplay } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-universal-conditional-display-to-conditional-display.util';

type UniversalCommandMenuItemOverrides =
  FormatRecordSerializedRelationProperties<CommandMenuItemOverrides>;

const fromUniversalOverridesToCommandMenuItemOverridesEntry = ({
  universalOverrides,
  flatObjectMetadataMaps,
  flatPageLayoutMaps,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalOverrides: UniversalCommandMenuItemOverrides;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatPageLayoutMaps: FlatEntityMaps<FlatPageLayout>;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): CommandMenuItemOverrides => {
  const {
    availabilityObjectMetadataUniversalIdentifier,
    pageLayoutUniversalIdentifier,
    ...scalarOverrides
  } = universalOverrides;

  const overrides: CommandMenuItemOverrides =
    mapOverridesEntryConditionalDisplay({
      overridesEntry: scalarOverrides,
      mapConditionalDisplay: (universalConditionalDisplay) =>
        fromUniversalConditionalDisplayToConditionalDisplay({
          universalConditionalDisplay,
          flatFieldMetadataMaps,
          flatRoleMaps,
        }),
    });

  if (availabilityObjectMetadataUniversalIdentifier !== undefined) {
    if (availabilityObjectMetadataUniversalIdentifier === null) {
      overrides.availabilityObjectMetadataId = null;
    } else {
      const flatObjectMetadata =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: availabilityObjectMetadataUniversalIdentifier,
        });

      overrides.availabilityObjectMetadataId = flatObjectMetadata?.id ?? null;
    }
  }

  if (pageLayoutUniversalIdentifier !== undefined) {
    if (pageLayoutUniversalIdentifier === null) {
      overrides.pageLayoutId = null;
    } else {
      const flatPageLayout =
        findFlatEntityByUniversalIdentifier<FlatPageLayout>({
          flatEntityMaps: flatPageLayoutMaps,
          universalIdentifier: pageLayoutUniversalIdentifier,
        });

      overrides.pageLayoutId = flatPageLayout?.id ?? null;
    }
  }

  return overrides;
};

export const fromUniversalOverridesToCommandMenuItemOverrides = ({
  universalOverrides,
  flatObjectMetadataMaps,
  flatPageLayoutMaps,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalOverrides: AuthoredOverrides<UniversalCommandMenuItemOverrides>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatPageLayoutMaps: FlatEntityMaps<FlatPageLayout>;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): AuthoredOverrides<CommandMenuItemOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'commandMenuItem',
    overrides: universalOverrides,
    mapEntry: (entry) =>
      fromUniversalOverridesToCommandMenuItemOverridesEntry({
        universalOverrides: entry,
        flatObjectMetadataMaps,
        flatPageLayoutMaps,
        flatFieldMetadataMaps,
        flatRoleMaps,
      }),
  });
