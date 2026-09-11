import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

type UniversalPageLayoutWidgetOverrides =
  FormatRecordSerializedRelationProperties<PageLayoutWidgetOverrides>;

const fromUniversalOverridesToPageLayoutWidgetOverridesEntry = ({
  universalOverrides,
  flatPageLayoutTabMaps,
}: {
  universalOverrides: UniversalPageLayoutWidgetOverrides;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
}): PageLayoutWidgetOverrides => {
  const { pageLayoutTabUniversalIdentifier, ...scalarOverrides } =
    universalOverrides;

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
}: {
  universalOverrides: AuthoredOverrides<UniversalPageLayoutWidgetOverrides>;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
}): AuthoredOverrides<PageLayoutWidgetOverrides> =>
  mapAuthoredOverrideEntries({
    metadataName: 'pageLayoutWidget',
    overrides: universalOverrides,
    mapEntry: (entry) =>
      fromUniversalOverridesToPageLayoutWidgetOverridesEntry({
        universalOverrides: entry,
        flatPageLayoutTabMaps,
      }),
  });
