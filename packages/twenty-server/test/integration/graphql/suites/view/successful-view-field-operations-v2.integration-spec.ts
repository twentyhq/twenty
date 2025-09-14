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
import { type DeleteViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-view-field.input';

import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from './utils/setup-view-field-test-v2.util';

describe('View Field Resolver - Successful Operations - v2', () => {
  let testSetup: ViewFieldTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

  beforeEach(async () => {
    await cleanupViewRecords();
  });

  const eachTestingContext = [
    {
      name: 'with standard setup',
      setup: () => testSetup,
    },
  ];

  describe('getCoreViewFields', () => {
    describe('when getting empty fields', () => {
      test.each(eachTestingContext)(
        '$name should return empty array',
        async ({ setup }) => {
          const context = setup();
          const operation = findViewFieldsOperationFactory({
            viewId: context.testViewId,
          });
          const response = await makeGraphqlAPIRequest(operation);

          assertGraphQLSuccessfulResponse(response);
          expect(response.body.data.getCoreViewFields).toEqual([]);
        },
      );
    });

    describe('when getting existing fields', () => {
      test.each(eachTestingContext)(
        '$name should return fields',
        async ({ setup }) => {
          const context = setup();
          const fieldData = createViewFieldData(context.testViewId, {
            position: 0,
            isVisible: true,
            size: 150,
            fieldMetadataId: context.testFieldMetadataId,
          });

          await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });

          const getOperation = findViewFieldsOperationFactory({
            viewId: context.testViewId,
          });
          const response = await makeGraphqlAPIRequest(getOperation);

          assertGraphQLSuccessfulResponse(response);
          expect(response.body.data.getCoreViewFields).toHaveLength(1);
          assertViewFieldStructure(response.body.data.getCoreViewFields[0], {
            fieldMetadataId: context.testFieldMetadataId,
            position: 0,
            isVisible: true,
            size: 150,
            viewId: context.testViewId,
          });
        },
      );
    });
  });

  describe('createCoreViewField', () => {
    describe('when creating visible field', () => {
      test.each(eachTestingContext)(
        '$name should create visible field',
        async ({ setup }) => {
          const context = setup();
          const fieldData = createViewFieldData(context.testViewId, {
            position: 1,
            isVisible: true,
            size: 200,
            fieldMetadataId: context.testFieldMetadataId,
          });

          const response = await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          assertViewFieldStructure(response.data.createCoreViewField, {
            fieldMetadataId: context.testFieldMetadataId,
            position: 1,
            isVisible: true,
            size: 200,
            viewId: context.testViewId,
          });
        },
      );
    });

    describe('when creating hidden field', () => {
      test.each(eachTestingContext)(
        '$name should create hidden field',
        async ({ setup }) => {
          const context = setup();
          const fieldData = {
            fieldMetadataId: context.testFieldMetadataId,
            position: 2,
            isVisible: false,
            size: 100,
            viewId: context.testViewId,
          };

          const response = await createOneCoreViewField({
            input: fieldData,
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          assertViewFieldStructure(response.data.createCoreViewField, {
            fieldMetadataId: context.testFieldMetadataId,
            position: 2,
            isVisible: false,
            size: 100,
            viewId: context.testViewId,
          });
        },
      );
    });
  });

  describe('updateCoreViewField', () => {
    describe('when updating field properties', () => {
      test.each(eachTestingContext)(
        '$name should update field',
        async ({ setup }) => {
          const context = setup();
          const fieldData = createViewFieldData(context.testViewId, {
            position: 0,
            isVisible: true,
            size: 150,
            fieldMetadataId: context.testFieldMetadataId,
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
      );
    });
  });

  describe('deleteCoreViewField', () => {
    describe('when deleting existing field', () => {
      test.each(eachTestingContext)(
        '$name should delete field',
        async ({ setup }) => {
          const context = setup();
          const fieldData = createViewFieldData(context.testViewId, {
            fieldMetadataId: context.testFieldMetadataId,
          });
          const createResponse = await createOneCoreViewField({
            input: fieldData as CreateViewFieldInput,
            expectToFail: false,
          });
          const viewField = createResponse.data.createCoreViewField;

          const response = await deleteOneCoreViewField({
            input: { id: viewField.id } as DeleteViewFieldInput,
            expectToFail: false,
          });

          assertGraphQLSuccessfulResponse({ body: response, status: 200 });
          expect(response.data.deleteCoreViewField).toMatchObject({
            id: viewField.id,
          });
        },
      );
    });
  });

  describe('destroyCoreViewField', () => {
    describe('when destroying existing field', () => {
      test.each(eachTestingContext)(
        '$name should destroy field',
        async ({ setup }) => {
          const context = setup();
          const fieldData = createViewFieldData(context.testViewId, {
            fieldMetadataId: context.testFieldMetadataId,
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
      );
    });
  });
});