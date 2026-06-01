import { FieldMetadataType } from 'twenty-shared/types';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexFieldMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { computeFlatIndexFieldColumnNames } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';

describe('computeFlatIndexFieldColumnNames', () => {
  const phoneFieldMetadataId = 'phone-field-metadata-id';
  const phoneFieldUniversalIdentifier = 'phone-field-universal-identifier';

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {
      [phoneFieldUniversalIdentifier]: {
        id: phoneFieldMetadataId,
        universalIdentifier: phoneFieldUniversalIdentifier,
        name: 'phone',
        type: FieldMetadataType.PHONES,
      } as FlatFieldMetadata,
    },
    universalIdentifierById: {
      [phoneFieldMetadataId]: phoneFieldUniversalIdentifier,
    },
    universalIdentifiersByApplicationId: {},
  } as MetadataFlatEntityMaps<'fieldMetadata'>;

  it('returns every unique subfield column for phone composite fields', () => {
    const flatIndexFieldMetadatas = [
      {
        fieldMetadataId: phoneFieldMetadataId,
      } as FlatIndexFieldMetadata,
    ];
    expect(
      computeFlatIndexFieldColumnNames({
        flatIndexFieldMetadatas,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      'phonePrimaryPhoneNumber',
      'phonePrimaryPhoneCountryCode',
      'phonePrimaryPhoneCallingCode',
    ]);
  });
});
