import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { findViewFilters } from 'test/integration/metadata/suites/view-filter/utils/find-view-filters.util';
import { createOneViewTab } from 'test/integration/metadata/suites/view-tab/utils/create-one-view-tab.util';
import { deleteOneViewTab } from 'test/integration/metadata/suites/view-tab/utils/delete-one-view-tab.util';
import { destroyOneViewTab } from 'test/integration/metadata/suites/view-tab/utils/destroy-one-view-tab.util';
import { findViewTabs } from 'test/integration/metadata/suites/view-tab/utils/find-view-tabs.util';
import { updateOneViewTab } from 'test/integration/metadata/suites/view-tab/utils/update-one-view-tab.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { ViewFilterOperand, ViewTabType } from 'twenty-shared/types';

import { type CreateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/create-view-tab.input';

type GraphqlErrors = { message: string; extensions?: { code?: string } }[];

const expectValidationError = (
  errors: GraphqlErrors | undefined,
  expectedMessage: string,
) => {
  expect(errors).toBeDefined();
  expect(errors?.[0]?.extensions?.code).not.toBe('INTERNAL_SERVER_ERROR');
  expect(JSON.stringify(errors)).toContain(expectedMessage);
};

describe('View tabs', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let testViewId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myViewTabTestObject',
        namePlural: 'myViewTabTestObjects',
        labelSingular: 'My View Tab Test Object',
        labelPlural: 'My View Tab Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const { selectFieldMetadataId } =
      await createOneSelectFieldMetadataForIntegrationTests({
        input: { objectMetadataId: testObjectMetadataId },
      });

    testFieldMetadataId = selectFieldMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  beforeEach(async () => {
    const view = await createTestViewWithGraphQL({
      name: 'Test View for Tabs',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = view.id;
  });

  afterEach(async () => {
    await destroyOneView({ viewId: testViewId, expectToFail: false });
  });

  describe('successful operations', () => {
    it('should create one tab of each type and list them by view', async () => {
      const inputs: Omit<CreateViewTabInput, 'viewId'>[] = [
        { type: ViewTabType.FIELD_VALUE, fieldValue: 'OPTION_1', position: 2 },
        { type: ViewTabType.NO_VALUE, isVisible: false, position: 3 },
        { type: ViewTabType.ALL, position: 0 },
        { type: ViewTabType.CUSTOM, name: 'Big deals', position: 1 },
      ];

      for (const input of inputs) {
        await createOneViewTab({
          expectToFail: false,
          input: { ...input, viewId: testViewId },
        });
      }

      const { data } = await findViewTabs({
        viewId: testViewId,
        expectToFail: false,
      });

      expect(data.getViewTabs).toHaveLength(4);
      expect(data.getViewTabs.map(({ type }) => type)).toEqual([
        ViewTabType.ALL,
        ViewTabType.CUSTOM,
        ViewTabType.FIELD_VALUE,
        ViewTabType.NO_VALUE,
      ]);
      expect(
        data.getViewTabs.find(({ type }) => type === ViewTabType.CUSTOM),
      ).toMatchObject({
        name: 'Big deals',
        fieldValue: null,
        isVisible: true,
        viewId: testViewId,
      });
    });

    it('should update the position and visibility of a tab', async () => {
      const { data: createData } = await createOneViewTab({
        expectToFail: false,
        input: {
          viewId: testViewId,
          type: ViewTabType.FIELD_VALUE,
          fieldValue: 'OPTION_2',
        },
      });

      const { data } = await updateOneViewTab({
        expectToFail: false,
        input: {
          id: createData.createViewTab.id,
          update: { position: 5, isVisible: false },
        },
      });

      expect(data.updateViewTab).toMatchObject({
        type: ViewTabType.FIELD_VALUE,
        fieldValue: 'OPTION_2',
        position: 5,
        isVisible: false,
      });
    });

    it('should delete and destroy tabs', async () => {
      const { data: firstTab } = await createOneViewTab({
        expectToFail: false,
        input: { viewId: testViewId, type: ViewTabType.ALL },
      });
      const { data: secondTab } = await createOneViewTab({
        expectToFail: false,
        input: { viewId: testViewId, type: ViewTabType.NO_VALUE },
      });

      await deleteOneViewTab({
        expectToFail: false,
        input: { id: firstTab.createViewTab.id },
      });
      await destroyOneViewTab({
        expectToFail: false,
        input: { id: secondTab.createViewTab.id },
      });

      const { data } = await findViewTabs({
        viewId: testViewId,
        expectToFail: false,
      });

      expect(data.getViewTabs).toHaveLength(0);
    });

    it('should attach a filter to a custom tab and cascade it on tab destroy', async () => {
      const { data: tabData } = await createOneViewTab({
        expectToFail: false,
        input: {
          viewId: testViewId,
          type: ViewTabType.CUSTOM,
          name: 'Option 1 only',
        },
      });

      const { data: filterData } = await createOneViewFilter({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          operand: ViewFilterOperand.IS,
          value: ['OPTION_1'],
          viewTabId: tabData.createViewTab.id,
        },
        gqlFields: 'id viewTabId',
      });

      expect(filterData.createViewFilter.viewTabId).toBe(
        tabData.createViewTab.id,
      );

      await destroyOneViewTab({
        expectToFail: false,
        input: { id: tabData.createViewTab.id },
      });

      const { data } = await findViewFilters({
        viewId: testViewId,
        expectToFail: false,
      });

      expect(data.getViewFilters).toHaveLength(0);
    });
  });

  describe('failing operations', () => {
    it.each<{
      title: string;
      input: Omit<CreateViewTabInput, 'viewId'>;
      expectedMessage: string;
    }>([
      {
        title: 'a field value tab without field value',
        input: { type: ViewTabType.FIELD_VALUE },
        expectedMessage: 'Field value is required for a field value tab',
      },
      {
        title: 'a field value tab with a name',
        input: {
          type: ViewTabType.FIELD_VALUE,
          fieldValue: 'OPTION_1',
          name: 'Option',
        },
        expectedMessage: 'A field value tab cannot have a name',
      },
      {
        title: 'a no value tab with a field value',
        input: { type: ViewTabType.NO_VALUE, fieldValue: 'OPTION_1' },
        expectedMessage: 'This tab type cannot have a field value or a name',
      },
      {
        title: 'an all tab with a name',
        input: { type: ViewTabType.ALL, name: 'All' },
        expectedMessage: 'This tab type cannot have a field value or a name',
      },
      {
        title: 'a custom tab without a name',
        input: { type: ViewTabType.CUSTOM },
        expectedMessage: 'Name is required for a custom tab',
      },
      {
        title: 'a custom tab with a field value',
        input: {
          type: ViewTabType.CUSTOM,
          name: 'Custom',
          fieldValue: 'OPTION_1',
        },
        expectedMessage: 'A custom tab cannot have a field value',
      },
    ])('should reject $title', async ({ input, expectedMessage }) => {
      const { errors } = await createOneViewTab({
        expectToFail: true,
        input: { ...input, viewId: testViewId },
      });

      expectValidationError(errors, expectedMessage);
    });

    it.each<Omit<CreateViewTabInput, 'viewId'>>([
      { type: ViewTabType.FIELD_VALUE, fieldValue: 'OPTION_3' },
      { type: ViewTabType.NO_VALUE },
      { type: ViewTabType.ALL },
    ])('should reject a duplicate $type tab on a view', async (input) => {
      await createOneViewTab({
        expectToFail: false,
        input: { ...input, viewId: testViewId },
      });

      const { errors } = await createOneViewTab({
        expectToFail: true,
        input: { ...input, viewId: testViewId },
      });

      expectValidationError(
        errors,
        'This view already has a tab for this value',
      );
    });

    it('should reject clearing the name of a custom tab', async () => {
      const { data } = await createOneViewTab({
        expectToFail: false,
        input: { viewId: testViewId, type: ViewTabType.CUSTOM, name: 'Mine' },
      });

      const { errors } = await updateOneViewTab({
        expectToFail: true,
        input: { id: data.createViewTab.id, update: { name: null } },
      });

      expectValidationError(errors, 'Name is required for a custom tab');
    });

    it('should reject a filter on a tab that is not custom', async () => {
      const { data } = await createOneViewTab({
        expectToFail: false,
        input: { viewId: testViewId, type: ViewTabType.ALL },
      });

      const { errors } = await createOneViewFilter({
        expectToFail: true,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          operand: ViewFilterOperand.IS,
          value: ['OPTION_1'],
          viewTabId: data.createViewTab.id,
        },
      });

      expectValidationError(
        errors,
        'View filters can only belong to a custom tab',
      );
    });

    it('should reject a filter on a custom tab of another view', async () => {
      const otherView = await createTestViewWithGraphQL({
        name: 'Other View for Tabs',
        objectMetadataId: testObjectMetadataId,
      });

      const { data } = await createOneViewTab({
        expectToFail: false,
        input: {
          viewId: otherView.id,
          type: ViewTabType.CUSTOM,
          name: 'Elsewhere',
        },
      });

      const { errors } = await createOneViewFilter({
        expectToFail: true,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          operand: ViewFilterOperand.IS,
          value: ['OPTION_1'],
          viewTabId: data.createViewTab.id,
        },
      });

      expectValidationError(
        errors,
        'View filter and view tab must belong to the same view',
      );

      await destroyOneView({ viewId: otherView.id, expectToFail: false });
    });
  });
});
