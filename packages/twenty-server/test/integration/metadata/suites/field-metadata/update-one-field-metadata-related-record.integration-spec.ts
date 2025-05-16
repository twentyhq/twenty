import { faker } from '@faker-js/faker';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// faker.seed(42);

describe('updateOne', () => {
  describe('FieldMetadataService Enum Default Value Validation', () => {
    let idToDelete: string;

    afterEach(async () => {
      if (isDefined(idToDelete)) {
        await deleteOneObjectMetadata({
          input: { idToDelete: idToDelete },
        });
      }
    });

    it('should throw an error if the default value is not in the options', async () => {
      const singular = faker.word.words();
      const plural = singular + faker.word.sample(3);
      const {
        data: { createOneObject },
      } = await createOneObjectMetadata({
        input: getMockCreateObjectInput({
          labelSingular: singular,
          labelPlural: plural,
          nameSingular: singular.split(' ').join(''),
          namePlural: plural.split(' ').join(''),
          isLabelSyncedWithName: false,
        }),
        gqlFields: `
          id
          nameSingular
        `,
      });

      idToDelete = createOneObject.id;

      const allOptions = Array.from({ length: 10 }, (_value, index) => ({
        label: `Option ${index}`,
        value: `option${index}`,
        color: 'green',
        position: index + 1,
      }));

      const {
        data: { createOneField },
      } = await createOneFieldMetadata({
        input: {
          objectMetadataId: createOneObject.id,
          type: FieldMetadataType.SELECT,
          name: 'testName',
          label: 'Test name',
          isLabelSyncedWithName: true,
          options: allOptions,
        },
        gqlFields: `
        id
        options
        `,
      });

      const {
        data: { createOneResponse: createOneView },
      } = await createOneOperation<{
        id: string;
        objectMetadataId: string;
        type: string;
      }>({
        objectMetadataSingularName: 'view',
        input: {
          id: faker.string.uuid(),
          objectMetadataId: createOneObject.id,
          type: 'table',
        },
      });

      const viewFilterId = faker.string.uuid();
      const {
        data: { createOneResponse: createOneViewFilter },
      } = await createOneOperation<{
        id: string;
        viewId: string;
        fieldMetadataId: string;
        operand: string;
        value: string;
        displayValue: string;
      }>({
        objectMetadataSingularName: 'viewFilter',
        input: {
          id: viewFilterId,
          viewId: createOneView.id,
          fieldMetadataId: createOneField.id,
          operand: 'is',
          value: JSON.stringify(allOptions.map(({ label }) => label)),
          displayValue: `${allOptions.length} options`,
        },
      });

      console.log(createOneViewFilter);

      const updatedOptions = createOneField.options.map(
        (
          { label, ...rest }: FieldMetadataComplexOption,
          index: number,
        ): FieldMetadataComplexOption => {
          return {
            ...rest,
            label: index % 2 === 0 ? `${label}_UPDATED` : label,
          };
        },
      );

      const {
        data: { updateOneField },
      } = await updateOneFieldMetadata({
        input: {
          idToUpdate: createOneField.id,
          updatePayload: {
            options: updatedOptions,
          },
        },
        gqlFields: `
          id
          options
        `,
      });

      const {
        data: { findResponse: findOneViewFilter },
      } = await findOneOperation({
        gqlFields: `
        id
        displayValue
        value
        `,
        objectMetadataSingularName: 'viewFilter',
        filter: {
          id: { eq: createOneViewFilter.id },
        },
      });

      expect(findOneViewFilter).toMatchInlineSnapshot(`
{
  "displayValue": "10 options",
  "id": "aabb843a-1ba1-49d2-ba58-237534286101",
  "value": "["Option 0","Option 1","Option 2","Option 3","Option 4","Option 5","Option 6","Option 7","Option 8","Option 9"]",
}
`);
    });
  });
});
