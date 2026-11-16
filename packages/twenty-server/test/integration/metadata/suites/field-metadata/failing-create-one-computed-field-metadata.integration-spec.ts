import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

describe('Field metadata computation (e2e)', () => {
  let objectMetadataId = '';

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'computationHolder',
        namePlural: 'computationHolders',
        labelSingular: 'Computation holder',
        labelPlural: 'Computation holders',
        icon: 'IconBox',
      },
    });

    objectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('exposes a null computation on a stored field', async () => {
    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        name: 'budget',
        label: 'Budget',
        type: FieldMetadataType.NUMBER,
      },
      gqlFields: 'id computation',
    });

    expect(data.createOneField).toMatchObject({ computation: null });
  });

  it('rejects a field with a computation until a computation can be evaluated', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId,
        name: 'doubleBudget',
        label: 'Double budget',
        type: FieldMetadataType.NUMBER,
        computation: { kind: 'FORMULA', expression: 'budget * 2' },
      },
      gqlFields: 'id computation',
    });

    expect(JSON.stringify(errors)).toContain(
      'computed fields are not available yet',
    );
  });
});
