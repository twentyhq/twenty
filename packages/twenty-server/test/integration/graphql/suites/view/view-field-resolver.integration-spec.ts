import {
  TEST_FIELD_METADATA_1_ID,
  TEST_NOT_EXISTING_VIEW_FIELD_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { createViewFieldOperationFactory } from 'test/integration/graphql/utils/create-view-field-operation-factory.util';
import { deleteViewFieldOperationFactory } from 'test/integration/graphql/utils/delete-view-field-operation-factory.util';
import { destroyViewFieldOperationFactory } from 'test/integration/graphql/utils/destroy-view-field-operation-factory.util';
import { findViewFieldsOperationFactory } from 'test/integration/graphql/utils/find-view-fields-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateViewFieldOperationFactory } from 'test/integration/graphql/utils/update-view-field-operation-factory.util';
import {
  createViewFieldData,
  updateViewFieldData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import {
  assertViewFieldStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  generateViewFieldExceptionMessage,
  ViewFieldExceptionMessageKey,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';

describe('View Field Resolver', () => {
  let testViewId: string;

  beforeEach(async () => {
    await cleanupViewRecords();

    const view = await createTestViewWithGraphQL({
      name: 'Test View for Fields',
    });

    testViewId = view.id;
  });

  afterAll(async () => {
    await cleanupViewRecords();
  });

  describe('getCoreViewFields', () => {
    it('should return empty array when no view fields exist', async () => {
      const operation = findViewFieldsOperationFactory({ viewId: testViewId });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
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

      assertGraphQLSuccessfulResponse(response);
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

      assertGraphQLSuccessfulResponse(response);
      assertViewFieldStructure(response.body.data.createCoreViewField, {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        position: 1,
        isVisible: true,
        size: 200,
        viewId: testViewId,
      });
    });

    it('should create a hidden view field', async () => {
      const fieldData = {
        fieldMetadataId: TEST_FIELD_METADATA_1_ID,
        position: 2,
        isVisible: false,
        size: 100,
        viewId: testViewId,
      };

      const operation = createViewFieldOperationFactory({ data: fieldData });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
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

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.updateCoreViewField).toMatchObject({
        id: viewField.id,
        position: 5,
        isVisible: false,
        size: 300,
      });
    });

    it('should throw an error when updating non-existent view field', async () => {
      const operation = updateViewFieldOperationFactory({
        viewFieldId: TEST_NOT_EXISTING_VIEW_FIELD_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FIELD_ID,
        ),
      );
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

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.deleteCoreViewField).toBe(true);
    });

    it('should throw an error when deleting non-existent view field', async () => {
      const operation = deleteViewFieldOperationFactory({
        viewFieldId: TEST_NOT_EXISTING_VIEW_FIELD_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FIELD_ID,
        ),
      );
    });
  });

  describe('destroyCoreViewField', () => {
    it('should destroy an existing view field', async () => {
      const fieldData = createViewFieldData(testViewId);
      const createOperation = createViewFieldOperationFactory({
        data: fieldData,
      });
      const createResponse = await makeGraphqlAPIRequest(createOperation);
      const viewField = createResponse.body.data.createCoreViewField;

      const destroyOperation = destroyViewFieldOperationFactory({
        viewFieldId: viewField.id,
      });
      const response = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.destroyCoreViewField).toBe(true);
    });

    it('should throw an error when destroying non-existent view field', async () => {
      const operation = destroyViewFieldOperationFactory({
        viewFieldId: TEST_NOT_EXISTING_VIEW_FIELD_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FIELD_ID,
        ),
      );
    });
  });
});
