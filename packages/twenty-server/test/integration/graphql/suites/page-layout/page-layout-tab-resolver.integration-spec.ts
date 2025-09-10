import { TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID } from 'test/integration/constants/test-page-layout-tab-ids.constants';
import { createPageLayoutTabOperationFactory } from 'test/integration/graphql/utils/create-page-layout-tab-operation-factory.util';
import { deletePageLayoutOperationFactory } from 'test/integration/graphql/utils/delete-page-layout-operation-factory.util';
import { deletePageLayoutTabOperationFactory } from 'test/integration/graphql/utils/delete-page-layout-tab-operation-factory.util';
import { destroyPageLayoutTabOperationFactory } from 'test/integration/graphql/utils/destroy-page-layout-tab-operation-factory.util';
import { findPageLayoutTabOperationFactory } from 'test/integration/graphql/utils/find-page-layout-tab-operation-factory.util';
import { findPageLayoutTabsOperationFactory } from 'test/integration/graphql/utils/find-page-layout-tabs-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  cleanupPageLayoutRecordsWithGraphQL,
  createTestPageLayoutWithGraphQL,
} from 'test/integration/graphql/utils/page-layout-graphql.util';
import {
  cleanupPageLayoutTabRecordsWithGraphQL,
  createTestPageLayoutTabWithGraphQL,
} from 'test/integration/graphql/utils/page-layout-tab-graphql.util';
import { restorePageLayoutTabOperationFactory } from 'test/integration/graphql/utils/restore-page-layout-tab-operation-factory.util';
import { updatePageLayoutTabOperationFactory } from 'test/integration/graphql/utils/update-page-layout-tab-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { assertPageLayoutTabStructure } from 'test/integration/utils/page-layout-tab-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutTabExceptionMessageKey,
  generatePageLayoutTabExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';

describe('Page Layout Tab Resolver', () => {
  let testObjectMetadataId: string;
  let testPageLayoutId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestPageLayoutTabObject',
        namePlural: 'myTestPageLayoutTabObjects',
        labelSingular: 'My Test Page Layout Tab Object',
        labelPlural: 'My Test Page Layout Tab Objects',
        icon: 'IconTab',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const pageLayout = await createTestPageLayoutWithGraphQL({
      name: 'Test Page Layout for Tabs',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: testObjectMetadataId,
    });

    testPageLayoutId = pageLayout.id;
  });

  afterAll(async () => {
    await cleanupPageLayoutRecordsWithGraphQL();
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  afterEach(async () => {
    await cleanupPageLayoutTabRecordsWithGraphQL(testPageLayoutId);
  });

  describe('getPageLayoutTabs', () => {
    it('should return empty array when no page layout tabs exist', async () => {
      const operation = findPageLayoutTabsOperationFactory({
        pageLayoutId: testPageLayoutId,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getPageLayoutTabs).toEqual([]);
    });

    it('should return all page layout tabs for a specific page layout', async () => {
      const input1 = {
        title: 'Tab 1',
        position: 0,
        pageLayoutId: testPageLayoutId,
      };
      const input2 = {
        title: 'Tab 2',
        position: 1,
        pageLayoutId: testPageLayoutId,
      };

      await Promise.all([
        createTestPageLayoutTabWithGraphQL(input1),
        createTestPageLayoutTabWithGraphQL(input2),
      ]);

      const operation = findPageLayoutTabsOperationFactory({
        pageLayoutId: testPageLayoutId,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getPageLayoutTabs).toHaveLength(2);

      const tabs = response.body.data.getPageLayoutTabs.sort(
        (a: { position: number }, b: { position: number }) =>
          a.position - b.position,
      );

      assertPageLayoutTabStructure(tabs[0], input1);
      assertPageLayoutTabStructure(tabs[1], input2);
    });
  });

  describe('getPageLayoutTab', () => {
    it('should throw when page layout tab does not exist', async () => {
      const operation = findPageLayoutTabOperationFactory({
        pageLayoutTabId: TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });

    it('should return page layout tab when it exists', async () => {
      const tabTitle = 'Tab';

      const input = {
        title: tabTitle,
        position: 2,
        pageLayoutId: testPageLayoutId,
      };

      const tab = await createTestPageLayoutTabWithGraphQL(input);

      const operation = findPageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutTabStructure(response.body.data.getPageLayoutTab, input);
    });
  });

  describe('createPageLayoutTab', () => {
    it('should create a new page layout tab with all properties', async () => {
      const input = {
        title: 'New Tab',
        position: 5,
        pageLayoutId: testPageLayoutId,
      };

      const operation = createPageLayoutTabOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const createdTab = response.body.data.createPageLayoutTab;

      assertPageLayoutTabStructure(createdTab, input);
    });

    it('should create a page layout tab with minimum required fields', async () => {
      const input = {
        title: 'Minimal Tab',
        pageLayoutId: testPageLayoutId,
      };

      const operation = createPageLayoutTabOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const createdTab = response.body.data.createPageLayoutTab;

      assertPageLayoutTabStructure(createdTab, {
        title: input.title,
        position: 0,
        pageLayoutId: input.pageLayoutId,
        deletedAt: null,
      });
    });
  });

  describe('updatePageLayoutTab', () => {
    it('should update an existing page layout tab', async () => {
      const input = {
        title: 'Original Tab',
        position: 1,
        pageLayoutId: testPageLayoutId,
      };

      const tab = await createTestPageLayoutTabWithGraphQL(input);

      const updateInput = {
        title: 'Updated Tab',
        position: 3,
      };

      const operation = updatePageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutTabStructure(
        response.body.data.updatePageLayoutTab,
        updateInput,
      );
    });

    it('should update only provided fields', async () => {
      const input = {
        title: 'Original Tab',
        position: 1,
        pageLayoutId: testPageLayoutId,
      };

      const tab = await createTestPageLayoutTabWithGraphQL(input);

      const updateInput = {
        title: 'Updated Title Only',
      };

      const operation = updatePageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutTabStructure(response.body.data.updatePageLayoutTab, {
        ...input,
        ...updateInput,
      });
    });

    it('should throw error when updating non-existent page layout tab', async () => {
      const operation = updatePageLayoutTabOperationFactory({
        pageLayoutTabId: TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        data: { title: 'Non-existent Tab' },
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });
  });

  describe('deletePageLayoutTab', () => {
    it('should delete an existing page layout tab (soft delete)', async () => {
      const tab = await createTestPageLayoutTabWithGraphQL({
        title: 'Tab to Delete',
        pageLayoutId: testPageLayoutId,
      });

      const deleteOperation = deletePageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(deleteResponse);
      expect(deleteResponse.body.data.deletePageLayoutTab).toBe(true);

      const getOperation = findPageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLErrorResponse(
        getResponse,
        ErrorCode.NOT_FOUND,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          tab.id,
        ),
      );
    });

    it('should throw an error when deleting non-existent page layout tab', async () => {
      const operation = deletePageLayoutTabOperationFactory({
        pageLayoutTabId: TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });
  });

  describe('destroyPageLayoutTab', () => {
    it('should destroy an existing page layout tab (hard delete)', async () => {
      const tab = await createTestPageLayoutTabWithGraphQL({
        title: 'Tab to Destroy',
        pageLayoutId: testPageLayoutId,
      });

      const destroyOperation = destroyPageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const destroyResponse = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(destroyResponse);
      expect(destroyResponse.body.data.destroyPageLayoutTab).toBe(true);
    });

    it('should throw an error when destroying non-existent page layout tab', async () => {
      const operation = destroyPageLayoutTabOperationFactory({
        pageLayoutTabId: TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });
  });

  describe('restorePageLayoutTab', () => {
    it('should restore a soft deleted page layout tab', async () => {
      const input = {
        title: 'Tab to Restore',
        position: 2,
        pageLayoutId: testPageLayoutId,
      };

      const tab = await createTestPageLayoutTabWithGraphQL(input);

      const deleteOperation = deletePageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(deleteResponse);

      const restoreOperation = restorePageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const restoreResponse = await makeGraphqlAPIRequest(restoreOperation);

      assertGraphQLSuccessfulResponse(restoreResponse);
      assertPageLayoutTabStructure(
        restoreResponse.body.data.restorePageLayoutTab,
        input,
      );

      const getOperation = findPageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(getResponse);
      assertPageLayoutTabStructure(
        getResponse.body.data.getPageLayoutTab,
        input,
      );
    });

    it('should throw an error when restoring non-existent page layout tab', async () => {
      const operation = restorePageLayoutTabOperationFactory({
        pageLayoutTabId: TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_TAB_ID,
        ),
      );
    });

    it('should throw an error when restoring tab with deleted parent page layout', async () => {
      const separatePageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Page Layout for Tab Restore Test',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: testObjectMetadataId,
      });

      const input = {
        title: 'Tab with Deleted Page Layout',
        pageLayoutId: separatePageLayout.id,
        position: 0,
      };

      const tab = await createTestPageLayoutTabWithGraphQL(input);

      const deleteTabOperation = deletePageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });

      await makeGraphqlAPIRequest(deleteTabOperation);

      const deletePageLayoutOperation = deletePageLayoutOperationFactory({
        pageLayoutId: separatePageLayout.id,
      });

      await makeGraphqlAPIRequest(deletePageLayoutOperation);

      const restoreOperation = restorePageLayoutTabOperationFactory({
        pageLayoutTabId: tab.id,
      });
      const restoreResponse = await makeGraphqlAPIRequest(restoreOperation);

      assertGraphQLErrorResponse(
        restoreResponse,
        ErrorCode.BAD_USER_INPUT,
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
        ),
      );
    });
  });
});
