import { faker } from '@faker-js/faker';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreViewGroup } from 'test/integration/metadata/suites/view-group/utils/create-one-core-view-group.util';
import { findCoreViewGroups } from 'test/integration/metadata/suites/view-group/utils/find-core-view-groups.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import {
  FieldMetadataType,
  type EnumFieldMetadataType,
} from 'twenty-shared/types';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

type Option = FieldMetadataDefaultOption | FieldMetadataComplexOption;

const generateOption = (index: number): Option => ({
  label: `Option ${index}`,
  value: `OPTION_${index}`,
  color: 'green',
  position: index,
});

const generateOptions = (length: number) =>
  Array.from({ length }, (_value, index) => generateOption(index));

const fakeOptionUpdate = ({ value, label, ...option }: Option) => ({
  ...option,
  value: `${value}_UPDATED`,
  label: `${label} updated`,
});

const testFieldMetadataTypes: EnumFieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
];

describe('update-one-field-metadata-view-groups-side-effect-v2', () => {
  let objectMetadataIdToDelete: string;

  const createObjectWithSelectFieldAndView = async (
    fieldType: EnumFieldMetadataType,
    initialOptions: Option[],
  ) => {
    const singular = 'sideEffect';
    const plural = 'sideEffects';

    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: getMockCreateObjectInput({
        labelSingular: singular,
        labelPlural: plural,
        nameSingular: singular,
        namePlural: plural,
        isLabelSyncedWithName: false,
      }),
    });

    objectMetadataIdToDelete = createOneObject.id;

    const {
      data: { createOneField },
    } = await createOneFieldMetadata<typeof fieldType>({
      expectToFail: false,
      input: {
        objectMetadataId: createOneObject.id,
        type: fieldType,
        name: 'statusField',
        label: 'Status Field',
        isLabelSyncedWithName: true,
        options: initialOptions,
      },
      gqlFields: 'id options',
    });

    const {
      data: { createCoreView: view },
    } = await createOneCoreView({
      input: {
        id: faker.string.uuid(),
        icon: 'IconTable',
        name: 'Test View',
        objectMetadataId: createOneObject.id,
        type: ViewType.TABLE,
      },
      expectToFail: false,
      gqlFields: 'id',
    });

    return {
      objectMetadataId: createOneObject.id,
      fieldMetadataId: createOneField.id,
      fieldOptions: createOneField.options ?? [],
      viewId: view.id,
    };
  };

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataIdToDelete,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataIdToDelete },
    });
  });

  describe.each(testFieldMetadataTypes)('%s field type', (fieldType) => {
    it('should delete all view groups when all enum field options are deleted', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, viewId } =
        await createObjectWithSelectFieldAndView(fieldType, initialOptions);

      for (const [index, option] of initialOptions.entries()) {
        await createOneCoreViewGroup({
          input: {
            viewId,
            fieldValue: option.value,
            isVisible: true,
            position: index,
          },
          expectToFail: false,
          gqlFields: 'id fieldValue',
        });
      }

      const {
        data: { getCoreViewGroups: initialViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue fieldMetadataId',
        expectToFail: false,
      });

      expect(
        initialViewGroups.filter((vg) => vg.fieldMetadataId === fieldMetadataId)
          .length,
      ).toBe(3);

      await updateOneFieldMetadata({
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: {
            options: [
              {
                color: 'blue',
                label: 'New option label',
                position: 42,
                value: 'NEW_OPTION_VALUE',
              },
            ],
          },
        },
        gqlFields: 'id options',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue fieldMetadataId',
        expectToFail: false,
      });

      expect(
        updatedViewGroups.filter((vg) => vg.fieldMetadataId === fieldMetadataId)
          .length,
      ).toBe(0);
    });

    it('should update view group when option value is updated', async () => {
      const initialOptions = generateOptions(1);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(fieldType, initialOptions);

      await createOneCoreViewGroup({
        input: {
          viewId,
          fieldValue: initialOptions[0].value,
          isVisible: true,
          position: 0,
        },
        expectToFail: false,
        gqlFields: 'id fieldValue',
      });

      const updatedOptions = [fakeOptionUpdate(fieldOptions[0])];

      await updateOneFieldMetadata({
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: {
            options: updatedOptions,
          },
        },
        gqlFields: 'id options',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue fieldMetadataId',
        expectToFail: false,
      });

      const viewGroupsForField = updatedViewGroups.filter(
        (vg) => vg.fieldMetadataId === fieldMetadataId,
      );

      expect(viewGroupsForField.length).toBe(1);
      expect(viewGroupsForField[0].fieldValue).toBe(
        `${initialOptions[0].value}_UPDATED`,
      );
    });

    it('should update multiple view groups when multiple option values are updated', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(fieldType, initialOptions);

      for (const [index, option] of initialOptions.entries()) {
        await createOneCoreViewGroup({
          input: {
            viewId,
            fieldValue: option.value,
            isVisible: true,
            position: index,
          },
          expectToFail: false,
          gqlFields: 'id fieldValue',
        });
      }

      const updatedOptions = fieldOptions.map((opt) => fakeOptionUpdate(opt));

      await updateOneFieldMetadata({
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: {
            options: updatedOptions,
          },
        },
        gqlFields: 'id options',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue fieldMetadataId',
        expectToFail: false,
      });

      const viewGroupsForField = updatedViewGroups.filter(
        (vg) => vg.fieldMetadataId === fieldMetadataId,
      );

      expect(viewGroupsForField.length).toBe(3);
      const actualFieldValues = viewGroupsForField
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedFieldValues = initialOptions
        .map((opt) => `${opt.value}_UPDATED`)
        .sort();

      expect(actualFieldValues).toEqual(expectedFieldValues);
    });

    it('should delete specific view groups when their options are removed', async () => {
      const initialOptions = generateOptions(5);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(fieldType, initialOptions);

      for (const [index, option] of initialOptions.entries()) {
        await createOneCoreViewGroup({
          input: {
            viewId,
            fieldValue: option.value,
            isVisible: true,
            position: index,
          },
          expectToFail: false,
          gqlFields: 'id fieldValue',
        });
      }

      const updatedOptions = fieldOptions.slice(2);

      await updateOneFieldMetadata({
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: {
            options: updatedOptions,
          },
        },
        gqlFields: 'id options',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue fieldMetadataId',
        expectToFail: false,
      });

      const viewGroupsForField = updatedViewGroups.filter(
        (vg) => vg.fieldMetadataId === fieldMetadataId,
      );

      expect(viewGroupsForField.length).toBe(3);
      const remainingFieldValues = viewGroupsForField.map(
        (vg) => vg.fieldValue,
      );

      expect(remainingFieldValues).not.toContain(initialOptions[0].value);
      expect(remainingFieldValues).not.toContain(initialOptions[1].value);
      expect(remainingFieldValues).toContain(initialOptions[2].value);
      expect(remainingFieldValues).toContain(initialOptions[3].value);
      expect(remainingFieldValues).toContain(initialOptions[4].value);
    });

    it('should preserve view groups when no options are changed', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(fieldType, initialOptions);

      for (const [index, option] of initialOptions.entries()) {
        await createOneCoreViewGroup({
          input: {
            viewId,
            fieldValue: option.value,
            isVisible: true,
            position: index,
          },
          expectToFail: false,
          gqlFields: 'id fieldValue',
        });
      }

      await updateOneFieldMetadata({
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: {
            options: fieldOptions,
          },
        },
        gqlFields: 'id options',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue fieldMetadataId',
        expectToFail: false,
      });

      const viewGroupsForField = updatedViewGroups.filter(
        (vg) => vg.fieldMetadataId === fieldMetadataId,
      );

      expect(viewGroupsForField.length).toBe(3);
      const actualFieldValues = viewGroupsForField
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedFieldValues = initialOptions.map((opt) => opt.value).sort();

      expect(actualFieldValues).toEqual(expectedFieldValues);
    });

    it('should handle adding new options while maintaining existing view groups', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(fieldType, initialOptions);

      for (const [index, option] of initialOptions.entries()) {
        await createOneCoreViewGroup({
          input: {
            viewId,
            fieldValue: option.value,
            isVisible: true,
            position: index,
          },
          expectToFail: false,
          gqlFields: 'id fieldValue',
        });
      }

      const newOptions = generateOptions(6).slice(3);
      const updatedOptions = [...fieldOptions, ...newOptions];

      await updateOneFieldMetadata({
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: {
            options: updatedOptions,
          },
        },
        gqlFields: 'id options',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue fieldMetadataId',
        expectToFail: false,
      });

      const viewGroupsForField = updatedViewGroups.filter(
        (vg) => vg.fieldMetadataId === fieldMetadataId,
      );

      expect(viewGroupsForField.length).toBe(6);
      const actualFieldValues = viewGroupsForField
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedFieldValues = updatedOptions.map((opt) => opt.value).sort();

      expect(actualFieldValues).toEqual(expectedFieldValues);
    });
  });
});
