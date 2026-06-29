import { fromUniversalSettingsToFlatFieldMetadataSettings } from '../from-universal-settings-to-flat-field-metadata-settings.util';
import { MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { RelationType, RelationOnDeleteAction } from 'twenty-shared/types';

describe('fromUniversalSettingsToFlatFieldMetadataSettings', () => {
  it('should map MORPH_RELATION settings correctly', () => {
    const universalSettings = {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
      joinColumnName: 'targetLigacaoId',
    };

    const result = fromUniversalSettingsToFlatFieldMetadataSettings({
      universalSettings,
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap: new Map(),
      flatFieldMetadataMaps:
        {} as unknown as MetadataFlatEntityMaps<'fieldMetadata'>,
    });

    expect(result).toEqual({
      relationType: 'MANY_TO_ONE',
      onDelete: 'SET_NULL',
      joinColumnName: 'targetLigacaoId',
      junctionTargetFieldId: undefined,
    });
  });
});
