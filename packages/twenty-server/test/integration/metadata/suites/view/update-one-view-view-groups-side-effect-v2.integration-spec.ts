import { faker } from '@faker-js/faker';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findCoreViewGroups } from 'test/integration/metadata/suites/view-group/utils/find-core-view-groups.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { updateOneCoreView } from 'test/integration/metadata/suites/view/utils/update-one-core-view.util';
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

const testFieldMetadataTypes: EnumFieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
];

describe('update-one-view-view-groups-side-effect-v2', () => {
  let objectMetadataIdToDelete: string;

  const createObjectWithTwoSelectFieldsAndKanbanViewAndGroupedTableView =
    async (initialOptions: Option[]) => {
      const singular = 'viewSideEffect';
      const plural = 'viewSideEffects';

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
        data: { createOneField: createOneStatusField },
      } = await createOneFieldMetadata<typeof FieldMetadataType.SELECT>({
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

      const phaseFieldOptions = generateOptions(2);

      const {
        data: { createOneField: createOnePhaseField },
      } = await createOneFieldMetadata<typeof FieldMetadataType.SELECT>({
        expectToFail: false,
        input: {
          objectMetadataId: createOneObject.id,
          type: FieldMetadataType.SELECT,
          name: 'phaseField',
          label: 'Phase Field',
          isLabelSyncedWithName: true,
          options: phaseFieldOptions,
        },
        gqlFields: 'id options',
      });

      const {
        data: { createCoreView: view },
      } = await createOneCoreView({
        input: {
          id: faker.string.uuid(),
          icon: 'IconKanban',
          name: 'Kanban View',
          objectMetadataId: createOneObject.id,
          type: ViewType.KANBAN,
          mainGroupByFieldMetadataId: createOneStatusField.id,
        },
        expectToFail: false,
        gqlFields: 'id',
      });

      const {
        data: { createCoreView: groupedTableView },
      } = await createOneCoreView({
        input: {
          id: faker.string.uuid(),
          icon: 'IconKanban',
          name: 'Grouped Table View',
          objectMetadataId: createOneObject.id,
          type: ViewType.TABLE,
          mainGroupByFieldMetadataId: createOneStatusField.id,
        },
        expectToFail: false,
        gqlFields: 'id',
      });

      return {
        objectMetadataId: createOneObject.id,
        statusFieldMetadataId: createOneStatusField.id,
        phaseFieldMetadataId: createOnePhaseField.id,
        statusFieldOptions: createOneStatusField.options ?? [],
        viewId: view.id,
        groupedTableViewId: groupedTableView.id,
        phaseFieldOptions,
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

  describe.each(testFieldMetadataTypes)('%s field type', () => {
    it('should delete all view groups when mainGroupByFieldMetadataId is removed', async () => {
      const initialOptions = generateOptions(3);

      const { groupedTableViewId } =
        await createObjectWithTwoSelectFieldsAndKanbanViewAndGroupedTableView(
          initialOptions,
        );

      const {
        data: { getCoreViewGroups: initialViewGroups },
      } = await findCoreViewGroups({
        viewId: groupedTableViewId,
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(initialViewGroups.length).toBe(4);

      await updateOneCoreView({
        viewId: groupedTableViewId,
        input: {
          id: groupedTableViewId,
          mainGroupByFieldMetadataId: null,
        },
        gqlFields: 'id mainGroupByFieldMetadataId',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId: groupedTableViewId,
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(0);
    });

    it('should delete and recreate view groups when mainGroupByFieldMetadataId changes', async () => {
      const initialOptions = generateOptions(3);

      const { phaseFieldOptions, phaseFieldMetadataId, viewId } =
        await createObjectWithTwoSelectFieldsAndKanbanViewAndGroupedTableView(
          initialOptions,
        );

      const {
        data: { getCoreViewGroups: initialViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(initialViewGroups.length).toBe(initialOptions.length + 1); // null option

      await updateOneCoreView({
        viewId,
        input: {
          id: viewId,
          mainGroupByFieldMetadataId: phaseFieldMetadataId,
        },
        gqlFields: 'id mainGroupByFieldMetadataId',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(phaseFieldOptions.length + 1);

      const actualFieldValues = updatedViewGroups
        .map((viewGroup) => viewGroup.fieldValue)
        .sort();
      const expectedFieldValues = [...phaseFieldOptions, { value: '' }]
        .map((option) => option.value)
        .sort();

      expect(actualFieldValues).toEqual(expectedFieldValues);
    });

    it('should preserve view groups when mainGroupByFieldMetadataId does not change', async () => {
      const initialOptions = generateOptions(3);

      const { statusFieldOptions, viewId } =
        await createObjectWithTwoSelectFieldsAndKanbanViewAndGroupedTableView(
          initialOptions,
        );

      const {
        data: { getCoreViewGroups: initialViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(initialViewGroups.length).toBe(statusFieldOptions.length + 1);

      await updateOneCoreView({
        viewId,
        input: {
          id: viewId,
          name: 'Renamed Kanban View',
        },
        gqlFields: 'id name mainGroupByFieldMetadataId',
        expectToFail: false,
      });

      const {
        data: { getCoreViewGroups: updatedViewGroups },
      } = await findCoreViewGroups({
        viewId,
        gqlFields: 'id fieldValue',
        expectToFail: false,
      });

      expect(updatedViewGroups.length).toBe(statusFieldOptions.length + 1);
      const actualFieldValues = updatedViewGroups
        .map((viewGroup) => viewGroup.fieldValue)
        .sort();
      const expectedFieldValues = [...statusFieldOptions, { value: '' }]
        .map((option) => option.value)
        .sort();

      expect(actualFieldValues).toEqual(expectedFieldValues);
    });
  });
});
