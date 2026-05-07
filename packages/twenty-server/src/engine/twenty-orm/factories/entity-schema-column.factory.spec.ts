import { FieldMetadataType } from 'twenty-shared/types';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import {
  type EntitySchemaFieldMetadataMaps,
  type EntitySchemaObjectMetadata,
} from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';

describe('EntitySchemaColumnFactory', () => {
  const factory = new EntitySchemaColumnFactory();

  it('should serialize normalized unique phone defaults from metadata input', () => {
    const objectMetadata = {
      id: 'object-id',
      nameSingular: 'contact',
      isCustom: true,
      fieldIds: ['phone-field-id'],
    } satisfies EntitySchemaObjectMetadata;

    const fieldMetadataMaps = {
      byId: {
        'phone-field-id': {
          id: 'phone-field-id',
          objectMetadataId: objectMetadata.id,
          name: 'home',
          type: FieldMetadataType.PHONES,
          settings: null,
          isNullable: true,
          isUnique: true,
          defaultValue: {
            primaryPhoneNumber: '',
            primaryPhoneCountryCode: '',
            primaryPhoneCallingCode: '',
            additionalPhones: null,
          },
          options: null,
          relationTargetObjectMetadataId: null,
          relationTargetFieldMetadataId: null,
        },
      },
    } satisfies EntitySchemaFieldMetadataMaps;

    const columns = factory.create(objectMetadata, fieldMetadataMaps);

    expect(columns).toMatchObject({
      homePrimaryPhoneNumber: {
        default: null,
      },
      homePrimaryPhoneCountryCode: {
        default: "''",
      },
      homePrimaryPhoneCallingCode: {
        default: null,
      },
      homeAdditionalPhones: {
        default: null,
      },
    });
  });
});
