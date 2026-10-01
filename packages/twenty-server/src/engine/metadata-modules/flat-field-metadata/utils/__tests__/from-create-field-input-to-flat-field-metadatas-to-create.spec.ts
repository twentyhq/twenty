import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { fromCreateFieldInputToFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadatas-to-create.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

describe('fromCreateFieldInputToFlatFieldMetadatasToCreate', () => {
  it('should fail with INVALID_FIELD_INPUT on a type outside FieldMetadataType', async () => {
    const flatObjectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: 'object-id',
      id: 'object-id',
    });

    const result = await fromCreateFieldInputToFlatFieldMetadatasToCreate({
      createFieldInput: {
        name: 'isActive',
        label: 'Is active',
        description: 'Whether the record is active',
        type: 'CHECKBOX' as never,
        objectMetadataId: flatObjectMetadata.id,
      },
      flatApplication: {
        universalIdentifier: 'application-id',
      } as FlatApplication,
      flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatObjectMetadata,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
    });

    expect(result).toEqual({
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: 'Field type "CHECKBOX" is not supported',
        },
      ],
    });
  });
});
