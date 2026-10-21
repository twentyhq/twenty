import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { mapOverridesEntryConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-overrides-entry-conditional-display.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';
import { fromUniversalConditionalDisplayToConditionalDisplay } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-universal-conditional-display-to-conditional-display.util';

type UniversalPageLayoutWidgetOverrides =
  FormatRecordSerializedRelationProperties<PageLayoutWidgetOverrides>;

const fromUniversalOverridesToPageLayoutWidgetOverridesEntry = ({
  universalOverrides,
  flatPageLayoutTabMaps,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalOverrides: UniversalPageLayoutWidgetOverrides;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): PageLayoutWidgetOverrides => {
  const { pageLayoutTabUniversalIdentifier, ...otherOverrides } =
    universalOverrides;

  const scalarOverrides: PageLayoutWidgetOverrides =
    mapOverridesEntryConditionalDisplay({
      overridesEntry: otherOverrides,
      mapConditionalDisplay: (universalConditionalDisplay) =>
        fromUniversalConditionalDisplayToConditionalDisplay({
          universalConditionalDisplay,
          flatFieldMetadataMaps,
          flatRoleMaps,
        }),
    });

  if (!isDefined(pageLayoutTabUniversalIdentifier)) {
    return {
      ...scalarOverrides,
    };
  }

  const flatPageLayoutTab =
    findFlatEntityByUniversalIdentifierOrThrow<FlatPageLayoutTab>({
      flatEntityMaps: flatPageLayoutTabMaps,
      universalIdentifier: pageLayoutTabUniversalIdentifier,
    });

  return {
    ...scalarOverrides,
    pageLayoutTabId:
      flatPageLayoutTab.id as PageLayoutWidgetOverrides['pageLayoutTabId'],
  };
};

export const fromUniversalOverridesToPageLayoutWidgetOverrides = ({
  universalOverrides,
  flatPageLayoutTabMaps,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalOverrides: AuthoredOverrides<UniversalPageLayoutWidgetOverrides>;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): AuthoredOverrides<PageLayoutWidgetOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'pageLayoutWidget',
    overrides: universalOverrides,
    mapEntry: (entry) =>
      fromUniversalOverridesToPageLayoutWidgetOverridesEntry({
        universalOverrides: entry,
        flatPageLayoutTabMaps,
        flatFieldMetadataMaps,
        flatRoleMaps,
      }),
  });
