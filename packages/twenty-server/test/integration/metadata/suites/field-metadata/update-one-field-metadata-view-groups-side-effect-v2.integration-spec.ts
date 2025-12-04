import { faker } from '@faker-js/faker';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findCoreViewGroups } from 'test/integration/metadata/suites/view-group/utils/find-core-view-groups.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { FieldMetadataType } from 'twenty-shared/types';

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

describe('update-one-field-metadata-view-groups-side-effect-v2', () => {
  let objectMetadataIdToDelete: string;

  const createObjectWithSelectFieldAndView = async (
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
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createOneObject.id,
        type: FieldMetadataType.SELECT,
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
        mainGroupByFieldMetadataId: createOneField.id,
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

  describe('SELECT field type', () => {
    it('deleted and adds view groups when options are deleted and added', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, viewId } =
        await createObjectWithSelectFieldAndView(initialOptions);

      const {
        data: { getCoreViewGroups: initialViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(initialViewGroups.length).toBe(4);
      const initialFieldValues = [...initialViewGroups]
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedFieldValues = [
        ...initialOptions.map((opt) => opt.value),
        '',
      ].sort();

      expect(initialFieldValues).toEqual(expectedFieldValues);

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
        gqlFields: 'id fieldValue viewId',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(2);
      const updatedFieldValues = updatedViewGroups
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedUpdatedFieldValues = ['', 'NEW_OPTION_VALUE'].sort();

      expect(updatedFieldValues).toEqual(expectedUpdatedFieldValues);
    });
    it('updates specific view groups when some options are updated', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(initialOptions);

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
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(4);
      const updatedFieldValues = updatedViewGroups
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedUpdatedFieldValues = [
        ...updatedOptions.map((opt) => opt.value),
        '',
      ].sort();

      expect(updatedFieldValues).toEqual(expectedUpdatedFieldValues);
    });

    it('deletes specific view groups when some of all options are removed', async () => {
      const initialOptions = generateOptions(5);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(initialOptions);

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
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(4);
      const remainingFieldValues = updatedViewGroups
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedRemainingFieldValues = [
        ...updatedOptions.map((opt) => opt.value),
        '',
      ].sort();

      expect(remainingFieldValues).toEqual(expectedRemainingFieldValues);
    });

    it('preserves view groups when no options are changed', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(initialOptions);

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
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(4);
      const actualFieldValues = updatedViewGroups
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedFieldValues = [
        ...initialOptions.map((opt) => opt.value),
        '',
      ].sort();

      expect(actualFieldValues).toEqual(expectedFieldValues);
    });

    it('adds new view groups when new options are added', async () => {
      const initialOptions = generateOptions(3);
      const { fieldMetadataId, fieldOptions, viewId } =
        await createObjectWithSelectFieldAndView(initialOptions);

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
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(7);
      const actualFieldValues = updatedViewGroups
        .map((vg) => vg.fieldValue)
        .sort();
      const expectedFieldValues = [
        ...updatedOptions.map((opt) => opt.value),
        '',
      ].sort();

      expect(actualFieldValues).toEqual(expectedFieldValues);
    });
  });
});
