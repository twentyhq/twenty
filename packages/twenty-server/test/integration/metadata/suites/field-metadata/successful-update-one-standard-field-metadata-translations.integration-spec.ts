import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

describe('Standard field metadata per-locale translations update should succeed', () => {
  let nameFieldMetadata: FieldMetadataDTO | undefined;

  const gqlFields = `
    id
    name
    label
    description
    standardOverrides {
      label
      description
      translations
    }
  `;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    const companyObject = objects.find((o) => o.nameSingular === 'company');

    jestExpectToBeDefined(companyObject?.fieldsList);

    nameFieldMetadata = companyObject.fieldsList.find(
      (field) => field.name === 'name',
    );
  });

  afterEach(async () => {
    jestExpectToBeDefined(nameFieldMetadata);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: nameFieldMetadata.id,
        updatePayload: {
          translations: { 'fr-FR': { label: '', description: '' } },
        },
      },
    });
  });

  it('should store per-locale label and description overrides', async () => {
    jestExpectToBeDefined(nameFieldMetadata);

    const { data } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: nameFieldMetadata.id,
        updatePayload: {
          translations: { 'fr-FR': { label: 'Nom', description: 'Le nom' } },
        },
      },
      gqlFields,
    });

    expect(data.updateOneField.standardOverrides?.translations).toEqual({
      'fr-FR': { label: 'Nom', description: 'Le nom' },
    });
  });

  it('should remove a per-locale key when it is cleared and keep the others', async () => {
    jestExpectToBeDefined(nameFieldMetadata);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: nameFieldMetadata.id,
        updatePayload: {
          translations: { 'fr-FR': { label: 'Nom', description: 'Le nom' } },
        },
      },
    });

    const { data } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: nameFieldMetadata.id,
        updatePayload: {
          translations: { 'fr-FR': { description: '' } },
        },
      },
      gqlFields,
    });

    expect(data.updateOneField.standardOverrides?.translations).toEqual({
      'fr-FR': { label: 'Nom' },
    });
  });
});
