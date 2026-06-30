import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';

import { type CommandMenuItemOverrides } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

type UniversalCommandMenuItemOverrides =
  FormatRecordSerializedRelationProperties<CommandMenuItemOverrides>;

export const fromUniversalOverridesToCommandMenuItemOverrides = ({
  universalOverrides,
  flatObjectMetadataMaps,
  flatPageLayoutMaps,
}: {
  universalOverrides: UniversalCommandMenuItemOverrides;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatPageLayoutMaps: FlatEntityMaps<FlatPageLayout>;
}): CommandMenuItemOverrides => {
  const {
    availabilityObjectMetadataUniversalIdentifier,
    pageLayoutUniversalIdentifier,
    ...scalarOverrides
  } = universalOverrides;

  const overrides: CommandMenuItemOverrides = { ...scalarOverrides };

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
