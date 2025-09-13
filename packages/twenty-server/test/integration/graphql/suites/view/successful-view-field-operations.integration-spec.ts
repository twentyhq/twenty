import { findViewFieldsOperationFactory } from 'test/integration/graphql/utils/find-view-fields-operation-factory.util';
import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createViewFieldData,
  updateViewFieldData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import { createOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-core-view-field.util';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { updateOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-core-view-field.util';
import {
  assertViewFieldStructure,
  cleanupViewRecords,
} from 'test/integration/utils/view-test.util';

import { type CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';

import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from './utils/setup-view-field-test-v2.util';

describe('View Field Resolver - Successful Operations', () => {
  let testSetup: ViewFieldTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testSetup.testObjectMetadataId);
  });

  beforeEach(async () => {
    await cleanupViewRecords();
  });

  describe('successful operations', () => {
    const testCases = [
      {
        name: 'getCoreViewFields - empty array',
        operation: async () => {
          const operation = findViewFieldsOperationFactory({
            viewId: testSetup.testViewId,
          });
          const response = await makeGraphqlAPIRequest(operation);

          assertGraphQLSuccessfulResponse(response);
          expect(response.body.data.getCoreViewFields).toEqual([]);
        },
      },
      {
        name: 'getCoreViewFields - with fields',
        operation: async () => {
          const fieldData = createViewFieldData(testSetup.testViewId, {
            position: 0,
            isVisible: true,
            size: 150,
            fieldMetadataId: testSetup.testFieldMetadataId,
          });

          await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });

          const getOperation = findViewFieldsOperationFactory({
            viewId: testSetup.testViewId,
          });
          const response = await makeGraphqlAPIRequest(getOperation);

          assertGraphQLSuccessfulResponse(response);
          expect(response.body.data.getCoreViewFields).toHaveLength(1);
          assertViewFieldStructure(response.body.data.getCoreViewFields[0], {
            fieldMetadataId: testSetup.testFieldMetadataId,
            position: 0,
            isVisible: true,
            size: 150,
            viewId: testSetup.testViewId,
          });
        },
      },
      {
        name: 'createCoreViewField - visible field',
        operation: async () => {
          const fieldData = createViewFieldData(testSetup.testViewId, {
            position: 1,
            isVisible: true,
            size: 200,
            fieldMetadataId: testSetup.testFieldMetadataId,
          });

          const response = await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          assertViewFieldStructure(response.data.createCoreViewField, {
            fieldMetadataId: testSetup.testFieldMetadataId,
            position: 1,
            isVisible: true,
            size: 200,
            viewId: testSetup.testViewId,
          });
        },
      },
      {
        name: 'createCoreViewField - hidden field',
        operation: async () => {
          const fieldData = {
            fieldMetadataId: testSetup.testFieldMetadataId,
            position: 2,
            isVisible: false,
            size: 100,
            viewId: testSetup.testViewId,
          };

          const response = await createOneCoreViewField({
            input: fieldData,
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          assertViewFieldStructure(response.data.createCoreViewField, {
            fieldMetadataId: testSetup.testFieldMetadataId,
            position: 2,
            isVisible: false,
            size: 100,
            viewId: testSetup.testViewId,
          });
        },
      },
      {
        name: 'updateCoreViewField',
        operation: async () => {
          const fieldData = createViewFieldData(testSetup.testViewId, {
            position: 0,
            isVisible: true,
            size: 150,
            fieldMetadataId: testSetup.testFieldMetadataId,
          });
          const createResponse = await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });
          const viewField = createResponse.data.createCoreViewField;

          const updateInput = updateViewFieldData({
            position: 5,
            isVisible: false,
            size: 300,
          });
          const response = await updateOneCoreViewField({
            input: {
              id: viewField.id,
              update: updateInput,
            },
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          expect(response.data.updateCoreViewField).toMatchObject({
            id: viewField.id,
            position: 5,
            isVisible: false,
            size: 300,
          });
        },
      },
      {
        name: 'deleteCoreViewField',
        operation: async () => {
          const fieldData = createViewFieldData(testSetup.testViewId, {
            fieldMetadataId: testSetup.testFieldMetadataId,
          });
          const createResponse = await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });
          const viewField = createResponse.data.createCoreViewField;

          const response = await deleteOneCoreViewField({
            input: { id: viewField.id },
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          expect(response.data.deleteCoreViewField).toMatchObject({
            id: viewField.id,
          });
        },
      },
      {
        name: 'destroyCoreViewField',
        operation: async () => {
          const fieldData = createViewFieldData(testSetup.testViewId, {
            fieldMetadataId: testSetup.testFieldMetadataId,
          });
          const createResponse = await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });
          const viewField = createResponse.data.createCoreViewField;

          const response = await destroyOneCoreViewField({
            input: {
              id: viewField.id,
            },
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          expect(response.data.destroyCoreViewField).toMatchObject({
            id: viewField.id,
          });
        },
      },
    ];

    test.each(testCases)('$name should succeed', async ({ operation }) => {
      await operation();
    });
  });
});
