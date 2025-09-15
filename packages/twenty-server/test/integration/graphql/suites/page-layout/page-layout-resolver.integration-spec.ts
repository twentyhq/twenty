import gql from 'graphql-tag';
import { TEST_NOT_EXISTING_PAGE_LAYOUT_ID } from 'test/integration/constants/test-page-layout-ids.constants';
import { createPageLayoutOperationFactory } from 'test/integration/graphql/utils/create-page-layout-operation-factory.util';
import { deletePageLayoutOperationFactory } from 'test/integration/graphql/utils/delete-page-layout-operation-factory.util';
import { destroyPageLayoutOperationFactory } from 'test/integration/graphql/utils/destroy-page-layout-operation-factory.util';
import { findPageLayoutOperationFactory } from 'test/integration/graphql/utils/find-page-layout-operation-factory.util';
import { findPageLayoutsOperationFactory } from 'test/integration/graphql/utils/find-page-layouts-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createTestPageLayoutWithGraphQL } from 'test/integration/graphql/utils/page-layout-graphql.util';
import { restorePageLayoutOperationFactory } from 'test/integration/graphql/utils/restore-page-layout-operation-factory.util';
import { updatePageLayoutOperationFactory } from 'test/integration/graphql/utils/update-page-layout-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import {
  assertPageLayoutStructure,
  cleanupPageLayoutRecords,
} from 'test/integration/utils/page-layout-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';

describe('Page Layout Resolver', () => {
  let testObjectMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestPageLayoutObject',
        namePlural: 'myTestPageLayoutObjects',
        labelSingular: 'My Test Page Layout Object',
        labelPlural: 'My Test Page Layout Objects',
        icon: 'IconLayout',
      },
    });

    testObjectMetadataId = objectMetadataId;
  });

  afterAll(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
    await cleanupPageLayoutRecords();
  });

  beforeEach(async () => {
    await cleanupPageLayoutRecords();
  });

  describe('getPageLayouts', () => {
    it('should return all page layouts for workspace when no objectMetadataId provided', async () => {
      const pageLayoutName = 'Test Page Layout for Workspace';

      await createTestPageLayoutWithGraphQL({
        name: pageLayoutName,
        objectMetadataId: testObjectMetadataId,
      });

      const operation = findPageLayoutsOperationFactory();
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getPageLayouts).toHaveLength(1);
      assertPageLayoutStructure(response.body.data.getPageLayouts[0], {
        name: pageLayoutName,
        objectMetadataId: testObjectMetadataId,
        type: PageLayoutType.RECORD_PAGE,
      });
    });

    it('should filter page layouts by objectMetadataId when provided', async () => {
      const object1PageLayoutName = 'Page Layout for Object 1';
      const object2PageLayoutName = 'Page Layout for Object 2';

      const {
        data: {
          createOneObject: { id: objectMetadata2Id },
        },
      } = await createOneObjectMetadata({
        input: {
          nameSingular: 'myTestPageLayoutObject2',
          namePlural: 'myTestPageLayoutObjects2',
          labelSingular: 'My Test Page Layout Object 2',
          labelPlural: 'My Test Page Layout Objects 2',
          icon: 'IconLayout2',
          isLabelSyncedWithName: false,
        },
      });

      await Promise.all([
        createTestPageLayoutWithGraphQL({
          name: object1PageLayoutName,
          objectMetadataId: testObjectMetadataId,
        }),
        createTestPageLayoutWithGraphQL({
          name: object2PageLayoutName,
          objectMetadataId: objectMetadata2Id,
        }),
      ]);

      const operation = findPageLayoutsOperationFactory({
        objectMetadataId: testObjectMetadataId,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getPageLayouts).toHaveLength(1);
      assertPageLayoutStructure(response.body.data.getPageLayouts[0], {
        name: object1PageLayoutName,
        objectMetadataId: testObjectMetadataId,
      });

      await deleteOneObjectMetadata({
        input: { idToDelete: objectMetadata2Id },
      });
    });
  });

  describe('getPageLayout', () => {
    it('should throw when page layout does not exist', async () => {
      const operation = findPageLayoutOperationFactory({
        pageLayoutId: TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        ),
      );
    });

    it('should return page layout when it exists', async () => {
      const pageLayoutName = 'Test Page Layout for Get';

      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: pageLayoutName,
        objectMetadataId: testObjectMetadataId,
      });

      const operation = findPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutStructure(response.body.data.getPageLayout, {
        id: pageLayout.id,
        name: pageLayoutName,
        objectMetadataId: testObjectMetadataId,
        type: PageLayoutType.RECORD_PAGE,
      });
    });
  });

  describe('createPageLayout', () => {
    it('should create a new page layout with all properties', async () => {
      const input = {
        name: 'Dashboard Page Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: testObjectMetadataId,
      };

      const operation = createPageLayoutOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const createdPageLayout = response.body.data.createPageLayout;

      assertPageLayoutStructure(createdPageLayout, {
        name: input.name,
        type: input.type,
        objectMetadataId: input.objectMetadataId,
        deletedAt: null,
      });
    });

    it('should create a page layout with minimum required fields', async () => {
      const input = {
        name: 'Minimal Page Layout',
      };

      const operation = createPageLayoutOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const createdPageLayout = response.body.data.createPageLayout;

      assertPageLayoutStructure(createdPageLayout, {
        name: input.name,
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        deletedAt: null,
      });
    });
  });

  describe('updatePageLayout', () => {
    it('should update an existing page layout', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Original Page Layout',
        type: PageLayoutType.RECORD_PAGE,
      });

      const updateInput = {
        name: 'Updated Page Layout',
        type: PageLayoutType.DASHBOARD,
      };

      const operation = updatePageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutStructure(response.body.data.updatePageLayout, {
        id: pageLayout.id,
        name: updateInput.name,
        type: updateInput.type,
        deletedAt: null,
      });
    });

    it('should update only provided fields', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Original Page Layout',
        type: PageLayoutType.RECORD_PAGE,
      });

      const updateInput = {
        name: 'Updated Name Only',
      };

      const operation = updatePageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutStructure(response.body.data.updatePageLayout, {
        id: pageLayout.id,
        name: updateInput.name,
        type: PageLayoutType.RECORD_PAGE,
        deletedAt: null,
      });
    });

    it('should throw error when updating non-existent page layout', async () => {
      const operation = updatePageLayoutOperationFactory({
        pageLayoutId: TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        data: { name: 'Non-existent Page Layout' },
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        ),
      );
    });
  });

  describe('deletePageLayout', () => {
    it('should delete an existing page layout (soft delete)', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Page Layout to Delete',
      });

      const deleteOperation = deletePageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(deleteResponse);
      assertPageLayoutStructure(
        deleteResponse.body.data.deletePageLayout,
        pageLayout,
      );

      const getOperation = findPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLErrorResponse(
        getResponse,
        ErrorCode.NOT_FOUND,
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          pageLayout.id,
        ),
      );
    });

    it('should throw an error when deleting non-existent page layout', async () => {
      const operation = deletePageLayoutOperationFactory({
        pageLayoutId: TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        ),
      );
    });
  });

  describe('destroyPageLayout', () => {
    it('should destroy an existing page layout (hard delete)', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Page Layout to Destroy',
      });

      const destroyOperation = destroyPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const destroyResponse = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(destroyResponse);
      expect(destroyResponse.body.data.destroyPageLayout).toBe(true);
    });

    it('should throw an error when destroying non-existent page layout', async () => {
      const operation = destroyPageLayoutOperationFactory({
        pageLayoutId: TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        ),
      );
    });

    it('should destroy all associated dashboards when page layout is of type dashboard', async () => {
      const dashboardId = '20202020-304c-44f2-ba7b-070762ff0e8a';

      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Page Layout to Destroy',
        type: PageLayoutType.DASHBOARD,
      });

      const findOneDashboardOperation = {
        query: gql`
          query Dashboard($filter: DashboardFilterInput!) {
            dashboard(filter: $filter) {
              id
            }
          }
        `,
        variables: {
          filter: { id: { eq: dashboardId } },
        },
      };

      await makeGraphqlAPIRequest({
        query: gql`
          mutation CreateDashboard($input: CreateDashboardInput!) {
            createDashboard(input: $input) {
              pageLayoutId
              id
              title
            }
          }
        `,
        variables: {
          input: {
            id: dashboardId,
            name: 'Dashboard to Destroy',
            pageLayoutId: pageLayout.id,
          },
        },
      });

      const findOneDashboardResponseBeforeDestroy = await makeGraphqlAPIRequest(
        findOneDashboardOperation,
      );

      expect(
        findOneDashboardResponseBeforeDestroy.body.data.dashboard,
      ).toBeDefined();

      const destroyOperation = destroyPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const destroyResponse = await makeGraphqlAPIRequest(destroyOperation);

      const findOneDashboardResponseAfterDestroy = await makeGraphqlAPIRequest(
        findOneDashboardOperation,
      );

      assertGraphQLSuccessfulResponse(destroyResponse);
      expect(destroyResponse.body.data.destroyPageLayout).toBe(true);

      expect(findOneDashboardResponseAfterDestroy.body.errors).toBeDefined();
      expect(
        findOneDashboardResponseAfterDestroy.body.errors[0].extensions.code,
      ).toBe(ErrorCode.NOT_FOUND);
    });
  });

  describe('restorePageLayout', () => {
    it('should restore a soft deleted page layout', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Page Layout to Restore',
        type: PageLayoutType.RECORD_INDEX,
      });

      const deleteOperation = deletePageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(deleteResponse);

      const restoreOperation = restorePageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const restoreResponse = await makeGraphqlAPIRequest(restoreOperation);

      assertGraphQLSuccessfulResponse(restoreResponse);
      assertPageLayoutStructure(restoreResponse.body.data.restorePageLayout, {
        id: pageLayout.id,
        name: 'Page Layout to Restore',
        type: PageLayoutType.RECORD_INDEX,
        deletedAt: null,
      });

      const getOperation = findPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(getResponse);
      assertPageLayoutStructure(getResponse.body.data.getPageLayout, {
        id: pageLayout.id,
        name: 'Page Layout to Restore',
        type: PageLayoutType.RECORD_INDEX,
        deletedAt: null,
      });
    });

    it('should throw an error when restoring non-existent page layout', async () => {
      const operation = restorePageLayoutOperationFactory({
        pageLayoutId: TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_ID,
        ),
      );
    });
  });

  describe('tabs resolver field', () => {
    it('should resolve tabs field for page layout', async () => {
      const pageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Page Layout with Tabs',
      });

      const operation = findPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
        gqlFields: `
          id
          name
          type
          createdAt
          updatedAt
          deletedAt
          tabs {
            id
            title
            position
            pageLayoutId
          }
        `,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutStructure(response.body.data.getPageLayout, {
        id: pageLayout.id,
        name: 'Page Layout with Tabs',
        tabs: expect.any(Array),
      });
    });
  });
});
