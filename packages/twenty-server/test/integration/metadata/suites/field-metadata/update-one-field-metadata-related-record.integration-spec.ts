import { faker } from '@faker-js/faker';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
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

      console.log(createOneField);

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

      expect(updateOneField).toMatchInlineSnapshot(`
{
  "id": "d96464a5-1e70-4d4c-8b62-6ccb20d132d4",
  "options": [
    {
      "color": "green",
      "id": "3c447a31-5939-4768-ac88-f58f6837ed82",
      "label": "Option 0_UPDATED",
      "position": 1,
      "value": "option0",
    },
    {
      "color": "green",
      "id": "24a4c902-4219-43e7-acad-a6114493cf56",
      "label": "Option 1",
      "position": 2,
      "value": "option1",
    },
    {
      "color": "green",
      "id": "f53c8659-e79f-4139-8d6d-bb2d11d3c74b",
      "label": "Option 2_UPDATED",
      "position": 3,
      "value": "option2",
    },
    {
      "color": "green",
      "id": "aa769c15-90b3-4912-bf18-7d30b221bb78",
      "label": "Option 3",
      "position": 4,
      "value": "option3",
    },
    {
      "color": "green",
      "id": "bdd3f2e1-13af-459b-9acc-a42e360543c6",
      "label": "Option 4_UPDATED",
      "position": 5,
      "value": "option4",
    },
    {
      "color": "green",
      "id": "0c1c4273-598d-4a84-beef-6df457358180",
      "label": "Option 5",
      "position": 6,
      "value": "option5",
    },
    {
      "color": "green",
      "id": "7aef3eb5-73bc-4888-a212-333ac9e43966",
      "label": "Option 6_UPDATED",
      "position": 7,
      "value": "option6",
    },
    {
      "color": "green",
      "id": "2a39aca4-f2fd-4049-a85e-1c045c52f414",
      "label": "Option 7",
      "position": 8,
      "value": "option7",
    },
    {
      "color": "green",
      "id": "6e78e322-0bc4-4a4d-b961-debbe50ac3f3",
      "label": "Option 8_UPDATED",
      "position": 9,
      "value": "option8",
    },
    {
      "color": "green",
      "id": "0a1a3b87-fc7b-41bb-940d-f6a15de0d243",
      "label": "Option 9",
      "position": 10,
      "value": "option9",
    },
  ],
}
`);
    });
  });
});
