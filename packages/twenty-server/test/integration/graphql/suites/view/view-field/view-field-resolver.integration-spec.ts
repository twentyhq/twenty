import { findViewFieldsOperationFactory } from 'test/integration/graphql/utils/find-view-fields-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createViewFieldData,
  updateViewFieldData,
} from 'test/integration/graphql/utils/view-data-factory.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { createOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-core-view-field.util';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { updateOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-core-view-field.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { assertViewFieldStructure } from 'test/integration/utils/view-test.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import {
  generateViewFieldExceptionMessage,
  ViewFieldExceptionMessageKey,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';

const TEST_NOT_EXISTING_VIEW_FIELD_ID = '20202020-0000-4000-8000-000000000001';

describe('View Field Resolver', () => {
  let testViewId: string;
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
    });
  });

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myFieldTestObject',
        namePlural: 'myFieldTestObjects',
        labelSingular: 'My Field Test Object',
        labelPlural: 'My Field Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const createFieldInput = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: testObjectMetadataId,
      isLabelSyncedWithName: true,
    };

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: createFieldInput,
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    testFieldMetadataId = fieldMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
    });
  });

  beforeEach(async () => {
    const view = await createTestViewWithGraphQL({
      name: 'Test View for Fields',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = view.id;
  });

  afterEach(async () => {
    await destroyOneCoreView({
      viewId: testViewId,
      expectToFail: false,
    });
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
        fieldMetadataId: testFieldMetadataId,
      });

      await createOneCoreViewField({
        input: fieldData as CreateViewFieldInput,
        expectToFail: false,
      });

      const getOperation = findViewFieldsOperationFactory({
        viewId: testViewId,
      });
      const response = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getCoreViewFields).toHaveLength(1);
      assertViewFieldStructure(response.body.data.getCoreViewFields[0], {
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
      });

      const response = await createOneCoreViewField({
        input: fieldData as CreateViewFieldInput,
        expectToFail: false,
      });

      assertGraphQLSuccessfulResponse({ body: response, status: 200 });
      assertViewFieldStructure(response.data.createCoreViewField, {
        fieldMetadataId: testFieldMetadataId,
        position: 1,
        isVisible: true,
        size: 200,
        viewId: testViewId,
      });
    });

    it('should create a hidden view field', async () => {
      const fieldData = {
        fieldMetadataId: testFieldMetadataId,
        position: 2,
        isVisible: false,
        size: 100,
        viewId: testViewId,
      };

      const response = await createOneCoreViewField({
        input: fieldData,
        expectToFail: false,
      });

      assertGraphQLSuccessfulResponse({ body: response, status: 200 });
      assertViewFieldStructure(response.data.createCoreViewField, {
        fieldMetadataId: testFieldMetadataId,
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
        fieldMetadataId: testFieldMetadataId,
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
    });

    it('should throw an error when updating non-existent view field', async () => {
      const response = await updateOneCoreViewField({
        input: {
          id: TEST_NOT_EXISTING_VIEW_FIELD_ID,
          update: {
            position: 1,
          },
        },
        expectToFail: true,
      });

      assertGraphQLErrorResponse(
        { body: response, status: 200 },
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
      const fieldData = createViewFieldData(testViewId, {
        fieldMetadataId: testFieldMetadataId,
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
    });

    it('should throw an error when deleting non-existent view field', async () => {
      const response = await deleteOneCoreViewField({
        input: { id: TEST_NOT_EXISTING_VIEW_FIELD_ID },
        expectToFail: true,
      });

      assertGraphQLErrorResponse(
        { body: response, status: 200 },
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
      const fieldData = createViewFieldData(testViewId, {
        fieldMetadataId: testFieldMetadataId,
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
    });

    it('should throw an error when destroying non-existent view field', async () => {
      const response = await destroyOneCoreViewField({
        input: {
          id: TEST_NOT_EXISTING_VIEW_FIELD_ID,
        },
        expectToFail: true,
      });

      assertGraphQLErrorResponse(
        { body: response, status: 200 },
        ErrorCode.NOT_FOUND,
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          TEST_NOT_EXISTING_VIEW_FIELD_ID,
        ),
      );
    });
  });
});
