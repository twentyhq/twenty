import { TEST_FIELD_METADATA_1_ID } from 'test/integration/constants/test-view-ids.constants';
import { createViewFieldOperationFactory } from 'test/integration/graphql/utils/create-view-field-operation-factory.util';
import { deleteViewFieldOperationFactory } from 'test/integration/graphql/utils/delete-view-field-operation-factory.util';
import { findViewFieldsOperationFactory } from 'test/integration/graphql/utils/find-view-fields-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewFieldOperationFactory } from 'test/integration/graphql/utils/update-view-field-operation-factory.util';
import {
  createViewFieldData,
  updateViewFieldData,
  viewScenarios,
} from 'test/integration/graphql/utils/view-data-factory.util';
import {
  assertErrorResponse,
  assertSuccessfulResponse,
  assertViewFieldStructure,
  cleanupViewRecords,
  createTestView,
} from 'test/integration/graphql/utils/view-test-utils';

describe('View Field Resolver', () => {
  let testViewId: string;

  beforeAll(async () => {
    await cleanupViewRecords();

    const view = await createTestView({
      name: 'Test View for Fields',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  afterEach(async () => {
    const operation = findViewFieldsOperationFactory({ viewId: testViewId });
    const viewFields = await makeGraphqlAPIRequest(operation);

    if (viewFields.body.data.getCoreViewFields.length > 0) {
      await Promise.all(
        viewFields.body.data.getCoreViewFields.map((field: any) => {
          const deleteOperation = deleteViewFieldOperationFactory({
            viewFieldId: field.id,
          });

          return makeGraphqlAPIRequest(deleteOperation);
        }),
      );
    }
  });

  describe('getCoreViewFields', () => {
    it('should return empty array when no view fields exist', async () => {
      const operation = findViewFieldsOperationFactory({ viewId: testViewId });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFields).toEqual([]);
    });

    it('should return view fields for a specific view', async () => {
      const fieldData = createViewFieldData(testViewId, {
        position: 0,
        isVisible: true,
        size: 150,
      });
      const createOperation = createViewFieldOperationFactory({
        data: fieldData,
      });

      await makeGraphqlAPIRequest(createOperation);

      const getOperation = findViewFieldsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFields).toHaveLength(1);
      assertViewFieldStructure(response.body.data.getCoreViewFields[0], {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        position: 0,
        isVisible: true,
        size: 150,
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewField', () => {
    it('should create a new view field', async () => {
      const fieldData = createViewFieldData(testViewId, {
        position: 1,
        isVisible: true,
        size: 200,
      });

      const operation = createViewFieldOperationFactory({ data: fieldData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFieldStructure(response.body.data.createCoreViewField, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        position: 1,
        isVisible: true,
        size: 200,
        viewId: testViewId,
      });
    });

    it('should create a hidden view field', async () => {
      const fieldData = viewScenarios.hiddenViewField(testViewId);

      const operation = createViewFieldOperationFactory({ data: fieldData });
      const response = await makeGraphqlAPIRequest(operation);

      assertSuccessfulResponse(response);
      assertViewFieldStructure(response.body.data.createCoreViewField, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        position: 2,
        isVisible: false,
        size: 100,
        viewId: testViewId,
      });
    });
  });

  describe('updateCoreViewField', () => {
    it('should update an existing view field', async () => {
      const fieldData = createViewFieldData(testViewId, {
        position: 0,
        isVisible: true,
        size: 150,
      });
      const createOperation = createViewFieldOperationFactory({
        data: fieldData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewField = createResponse.body.data.createCoreViewField;

      const updateInput = updateViewFieldData({
        position: 5,
        isVisible: false,
        size: 300,
      });
      const updateOperation = updateViewFieldOperationFactory({
        viewFieldId: viewField.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(updateOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewField).toMatchObject({
        id: viewField.id,
        position: 5,
        isVisible: false,
        size: 300,
      });
    });
  });

  describe('deleteCoreViewField', () => {
    it('should delete an existing view field', async () => {
      const fieldData = createViewFieldData(testViewId);
      const createOperation = createViewFieldOperationFactory({
        data: fieldData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewField = createResponse.body.data.createCoreViewField;

      const deleteOperation = deleteViewFieldOperationFactory({
        viewFieldId: viewField.id,
      });
      const response = await makeGraphqlAPIRequest(deleteOperation);

      assertSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewField).toBe(true);
    });
  });

  describe('validation', () => {
    const requiredFields = ['viewId', 'fieldMetadataId'];
    const validInput = {
      viewId: testViewId,
      fieldMetadataId: TEST_FIELD_METADATA_1_ID,
      position: 0,
      isVisible: true,
      size: 150,
    };

    requiredFields.forEach((field) => {
      it(`should require ${field} for creation`, async () => {
        const invalidInput = { ...validInput };

        delete invalidInput[field as keyof typeof invalidInput];

        const operation = createViewFieldOperationFactory({
          data: invalidInput,
        });
        const response = await makeGraphqlAPIRequest(operation);

        assertErrorResponse(response, field);
      });
    });
  });
});
