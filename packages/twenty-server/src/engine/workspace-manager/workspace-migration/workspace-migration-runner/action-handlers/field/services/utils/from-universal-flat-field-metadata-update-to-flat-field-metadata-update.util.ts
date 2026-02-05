import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-update.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { fromUniversalSettingsToFlatFieldMetadataSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-settings-to-flat-field-metadata-settings.util';

export const fromUniversalFlatFieldMetadataUpdateToFlatFieldMetadataUpdate = ({
  universalUpdate,
  flatFieldMetadataMaps,
}: {
  universalUpdate: UniversalFlatEntityUpdate<'fieldMetadata'>;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): FlatEntityUpdate<'fieldMetadata'> => {
  const { universalSettings, ...restProperties } = universalUpdate;

  if (universalSettings === undefined) {
    return restProperties;
  }

  const settings = fromUniversalSettingsToFlatFieldMetadataSettings({
    universalSettings,
    allFieldIdToBeCreatedInActionByUniversalIdentifierMap: new Map(),
    flatFieldMetadataMaps,
  });

  return {
    ...restProperties,
    settings,
  };
};
