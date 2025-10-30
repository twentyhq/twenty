import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  assertRestApiErrorNotFoundResponse,
  assertRestApiErrorResponse,
  assertRestApiSuccessfulResponse,
} from 'test/integration/rest/utils/rest-test-assertions.util';
import {
  createTestViewFieldWithRestApi,
  createTestViewWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { assertViewFieldStructure } from 'test/integration/utils/view-test.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';

import { type ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import {
  generateViewFieldExceptionMessage,
  ViewFieldExceptionMessageKey,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';

describe('View Field REST API', () => {
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;
  let testViewId: string;
  let testViewFieldId: string | undefined;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testViewFieldObject',
        namePlural: 'testViewFieldObjects',
        labelSingular: 'Test View Field Object',
        labelPlural: 'Test View Field Objects',
        icon: 'IconField',
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

    const testView = await createTestViewWithRestApi({
      name: 'Test View for Field Integration',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = testView.id;
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

  afterEach(async () => {
    if (!testViewFieldId) return;

    await destroyOneCoreViewField({
      expectToFail: false,
      input: {
        id: testViewFieldId,
      },
    });
    testViewFieldId = undefined;
  });

  describe('GET /metadata/viewFields', () => {
    it('should return empty array when no view fields exist', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields?viewId=${testViewId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(response.body).toEqual([]);
    });

    it('should return all view fields for workspace when no viewId provided', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/viewFields',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return view fields for a specific view after creating one', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        position: 0,
        isVisible: true,
        size: 150,
      });

      testViewFieldId = viewField.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields?viewId=${testViewId}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      expect(Array.isArray(response.body)).toBe(true);

      const returnedViewField = response.body.find(
        (el: ViewFieldDTO) => el.id === viewField.id,
      );

      jestExpectToBeDefined(returnedViewField);

      assertViewFieldStructure(returnedViewField, {
        id: viewField.id,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        position: 0,
        isVisible: true,
        size: 150,
      });
    });
  });

  describe('POST /metadata/viewFields', () => {
    it('should create a new view field', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        position: 1,
        isVisible: true,
        size: 200,
      });

      testViewFieldId = viewField.id;

      assertViewFieldStructure(viewField, {
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        position: 1,
        isVisible: true,
        size: 200,
      });
    });

    it('should create a hidden view field', async () => {
      const hiddenField = await createTestViewFieldWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        position: 2,
        isVisible: false,
        size: 100,
      });

      testViewFieldId = hiddenField.id;

      assertViewFieldStructure(hiddenField, {
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
        position: 2,
        isVisible: false,
        size: 100,
      });
    });
  });

  describe('GET /metadata/viewFields/:id', () => {
    it('should return a view field by id', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        position: 0,
        isVisible: true,
        size: 150,
      });

      testViewFieldId = viewField.id;

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields/${viewField.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFieldStructure(response.body, {
        id: viewField.id,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
      });
    });

    it('should return empty object for non-existent view field', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields/20202020-f891-4d2a-8b23-c1e4d7f6a9b2`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });

  describe('PATCH /metadata/viewFields/:id', () => {
    it('should update an existing view field', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        position: 0,
        isVisible: true,
        size: 150,
      });

      testViewFieldId = viewField.id;

      const updateData = {
        position: 5,
        isVisible: false,
        size: 300,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFields/${viewField.id}`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);
      assertViewFieldStructure(response.body, {
        id: viewField.id,
        position: 5,
        isVisible: false,
        size: 300,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
      });
    });

    it('should return 404 error when updating non-existent view field', async () => {
      const updateData = {
        position: 5,
        isVisible: false,
        size: 300,
      };

      const response = await makeRestAPIRequest({
        method: 'patch',
        path: `/metadata/viewFields/20202020-f891-4d2a-8b23-c1e4d7f6a9b2`,
        body: updateData,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorResponse(
        response,
        404,
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          '20202020-f891-4d2a-8b23-c1e4d7f6a9b2',
        ),
      );
    });
  });

  describe('DELETE /metadata/viewFields/:id', () => {
    it('should delete an existing view field', async () => {
      const viewField = await createTestViewFieldWithRestApi({
        viewId: testViewId,
        fieldMetadataId: testFieldMetadataId,
        position: 0,
        isVisible: true,
        size: 150,
      });

      testViewFieldId = viewField.id;

      const deleteResponse = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFields/${viewField.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/viewFields/${viewField.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(getResponse);
    });

    it('should return 404 error when deleting non-existent view field', async () => {
      const response = await makeRestAPIRequest({
        method: 'delete',
        path: `/metadata/viewFields/20202020-f891-4d2a-8b23-c1e4d7f6a9b2`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiErrorNotFoundResponse(response);
    });
  });
});
