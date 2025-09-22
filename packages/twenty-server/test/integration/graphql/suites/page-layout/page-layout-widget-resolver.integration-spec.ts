import { TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID } from 'test/integration/constants/test-page-layout-widget-ids.constants';
import { createPageLayoutWidgetOperationFactory } from 'test/integration/graphql/utils/create-page-layout-widget-operation-factory.util';
import { deletePageLayoutTabOperationFactory } from 'test/integration/graphql/utils/delete-page-layout-tab-operation-factory.util';
import { deletePageLayoutWidgetOperationFactory } from 'test/integration/graphql/utils/delete-page-layout-widget-operation-factory.util';
import { destroyPageLayoutWidgetOperationFactory } from 'test/integration/graphql/utils/destroy-page-layout-widget-operation-factory.util';
import { findPageLayoutWidgetOperationFactory } from 'test/integration/graphql/utils/find-page-layout-widget-operation-factory.util';
import { findPageLayoutWidgetsOperationFactory } from 'test/integration/graphql/utils/find-page-layout-widgets-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequestWithMember } from 'test/integration/graphql/utils/make-graphql-api-request-with-member.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  cleanupPageLayoutRecordsWithGraphQL,
  createTestPageLayoutWithGraphQL,
} from 'test/integration/graphql/utils/page-layout-graphql.util';
import { createTestPageLayoutTabWithGraphQL } from 'test/integration/graphql/utils/page-layout-tab-graphql.util';
import {
  cleanupPageLayoutWidgetRecordsWithGraphQL,
  createTestPageLayoutWidgetWithGraphQL,
} from 'test/integration/graphql/utils/page-layout-widget-graphql.util';
import { restorePageLayoutWidgetOperationFactory } from 'test/integration/graphql/utils/restore-page-layout-widget-operation-factory.util';
import {
  getMemberRoleId,
  setupObjectPermissionsForWidget,
} from 'test/integration/graphql/utils/setup-object-permissions-for-widget.util';
import { updatePageLayoutWidgetOperationFactory } from 'test/integration/graphql/utils/update-page-layout-widget-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { assertPageLayoutWidgetStructure } from 'test/integration/utils/page-layout-widget-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import {
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';

describe('Page Layout Widget Resolver', () => {
  let testObjectMetadataId: string;
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestPageLayoutWidgetObject',
        namePlural: 'myTestPageLayoutWidgetObjects',
        labelSingular: 'My Test Page Layout Widget Object',
        labelPlural: 'My Test Page Layout Widget Objects',
        icon: 'IconWidget',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const pageLayout = await createTestPageLayoutWithGraphQL({
      name: 'Test Page Layout for Widgets',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: testObjectMetadataId,
    });

    testPageLayoutId = pageLayout.id;

    const pageLayoutTab = await createTestPageLayoutTabWithGraphQL({
      title: 'Test Tab for Widgets',
      position: 0,
      pageLayoutId: testPageLayoutId,
    });

    testPageLayoutTabId = pageLayoutTab.id;
  });

  afterAll(async () => {
    await cleanupPageLayoutRecordsWithGraphQL();
    await deleteOneObjectMetadata({
      input: { idToDelete: testObjectMetadataId },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupPageLayoutWidgetRecordsWithGraphQL(testPageLayoutTabId);
  });

  describe('getPageLayoutWidgets', () => {
    it('should return empty array when no page layout widgets exist', async () => {
      const operation = findPageLayoutWidgetsOperationFactory({
        pageLayoutTabId: testPageLayoutTabId,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getPageLayoutWidgets).toEqual([]);
    });

    it('should return all page layout widgets for a specific page layout tab', async () => {
      const widgetTitle1 = 'Widget 1';
      const widgetTitle2 = 'Widget 2';

      await Promise.all([
        createTestPageLayoutWidgetWithGraphQL({
          title: widgetTitle1,
          type: WidgetType.VIEW,
          pageLayoutTabId: testPageLayoutTabId,
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
        }),
        createTestPageLayoutWidgetWithGraphQL({
          title: widgetTitle2,
          type: WidgetType.GRAPH,
          pageLayoutTabId: testPageLayoutTabId,
          gridPosition: { row: 0, column: 3, rowSpan: 1, columnSpan: 2 },
        }),
      ]);

      const operation = findPageLayoutWidgetsOperationFactory({
        pageLayoutTabId: testPageLayoutTabId,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      expect(response.body.data.getPageLayoutWidgets).toHaveLength(2);

      const widgets = response.body.data.getPageLayoutWidgets;

      assertPageLayoutWidgetStructure(widgets[0], {
        title: widgetTitle1,
        type: WidgetType.VIEW,
        pageLayoutTabId: testPageLayoutTabId,
      });
      assertPageLayoutWidgetStructure(widgets[1], {
        title: widgetTitle2,
        type: WidgetType.GRAPH,
        pageLayoutTabId: testPageLayoutTabId,
      });
    });
  });

  describe('getPageLayoutWidget', () => {
    it('should throw when page layout widget does not exist', async () => {
      const operation = findPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });

    it('should return page layout widget when it exists', async () => {
      const widgetTitle = 'Widget';

      const input = {
        title: widgetTitle,
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPageLayoutTabId,
        objectMetadataId: testObjectMetadataId,
        gridPosition: { row: 1, column: 1, rowSpan: 1, columnSpan: 2 },
        configuration: {},
      };

      const widget = await createTestPageLayoutWidgetWithGraphQL(input);

      const operation = findPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutWidgetStructure(
        response.body.data.getPageLayoutWidget,
        input,
      );
    });
  });

  describe('createPageLayoutWidget', () => {
    it('should create a new page layout widget with all properties', async () => {
      const input = {
        title: 'New Widget',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPageLayoutTabId,
        objectMetadataId: testObjectMetadataId,
        gridPosition: { row: 2, column: 1, rowSpan: 3, columnSpan: 4 },
        configuration: { theme: 'dark', showBorders: true },
      };

      const operation = createPageLayoutWidgetOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const createdWidget = response.body.data.createPageLayoutWidget;

      assertPageLayoutWidgetStructure(createdWidget, input);
    });

    it('should create a page layout widget with minimum required fields', async () => {
      const input = {
        title: 'Widget',
        type: WidgetType.VIEW,
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      };

      const operation = createPageLayoutWidgetOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const createdWidget = response.body.data.createPageLayoutWidget;

      assertPageLayoutWidgetStructure(createdWidget, input);
    });
  });

  describe('updatePageLayoutWidget', () => {
    it('should update an existing page layout widget', async () => {
      const widget = await createTestPageLayoutWidgetWithGraphQL({
        title: 'Widget',
        type: WidgetType.VIEW,
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      });

      const updateInput = {
        title: 'Updated Widget',
        type: WidgetType.IFRAME,
        gridPosition: { row: 1, column: 2, rowSpan: 2, columnSpan: 3 },
        configuration: { url: 'https://twenty.com' },
      };

      const operation = updatePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutWidgetStructure(
        response.body.data.updatePageLayoutWidget,
        updateInput,
      );
    });

    it('should update only provided fields', async () => {
      const widget = await createTestPageLayoutWidgetWithGraphQL({
        title: 'Widget',
        type: WidgetType.VIEW,
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      });

      const updateInput = {
        title: 'Updated Widget',
      };

      const operation = updatePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
        data: updateInput,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);
      assertPageLayoutWidgetStructure(
        response.body.data.updatePageLayoutWidget,
        updateInput,
      );
    });

    it('should throw error when updating non-existent page layout widget', async () => {
      const operation = updatePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        data: { title: 'Non-existent Widget' },
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });
  });

  describe('deletePageLayoutWidget', () => {
    it('should delete an existing page layout widget (soft delete)', async () => {
      const input = {
        title: 'Widget',
        type: WidgetType.VIEW,
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      };

      const widget = await createTestPageLayoutWidgetWithGraphQL(input);

      const deleteOperation = deletePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(deleteResponse);
      assertPageLayoutWidgetStructure(
        deleteResponse.body.data.deletePageLayoutWidget,
        input,
      );

      const getOperation = findPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLErrorResponse(
        getResponse,
        ErrorCode.NOT_FOUND,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          widget.id,
        ),
      );
    });

    it('should throw an error when deleting non-existent page layout widget', async () => {
      const operation = deletePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });
  });

  describe('destroyPageLayoutWidget', () => {
    it('should destroy an existing page layout widget (hard delete)', async () => {
      const input = {
        title: 'Widget',
        type: WidgetType.VIEW,
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
      };

      const widget = await createTestPageLayoutWidgetWithGraphQL(input);

      const destroyOperation = destroyPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const destroyResponse = await makeGraphqlAPIRequest(destroyOperation);

      assertGraphQLSuccessfulResponse(destroyResponse);
      expect(destroyResponse.body.data.destroyPageLayoutWidget).toBe(true);
    });

    it('should throw an error when destroying non-existent page layout widget', async () => {
      const operation = destroyPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });
  });

  describe('restorePageLayoutWidget', () => {
    it('should restore a soft deleted page layout widget', async () => {
      const input = {
        title: 'Widget',
        type: WidgetType.GRAPH,
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: { row: 2, column: 1, rowSpan: 1, columnSpan: 2 },
        configuration: {},
      };

      const widget = await createTestPageLayoutWidgetWithGraphQL(input);

      const deleteOperation = deletePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

      assertGraphQLSuccessfulResponse(deleteResponse);

      const restoreOperation = restorePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const restoreResponse = await makeGraphqlAPIRequest(restoreOperation);

      assertGraphQLSuccessfulResponse(restoreResponse);
      assertPageLayoutWidgetStructure(
        restoreResponse.body.data.restorePageLayoutWidget,
        input,
      );

      const getOperation = findPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const getResponse = await makeGraphqlAPIRequest(getOperation);

      assertGraphQLSuccessfulResponse(getResponse);
      assertPageLayoutWidgetStructure(
        getResponse.body.data.getPageLayoutWidget,
        input,
      );
    });

    it('should throw an error when restoring non-existent page layout widget', async () => {
      const operation = restorePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
      });
      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          TEST_NOT_EXISTING_PAGE_LAYOUT_WIDGET_ID,
        ),
      );
    });

    it('should throw an error when restoring widget with deleted parent tab', async () => {
      const separateTab = await createTestPageLayoutTabWithGraphQL({
        title: 'Tab for Widget Restore Test',
        pageLayoutId: testPageLayoutId,
        position: 1,
      });

      const input = {
        title: 'Widget with Deleted Tab',
        type: WidgetType.GRAPH,
        pageLayoutTabId: separateTab.id,
        gridPosition: { row: 1, column: 1, rowSpan: 1, columnSpan: 1 },
        configuration: {},
      };

      const widget = await createTestPageLayoutWidgetWithGraphQL(input);

      const deleteWidgetOperation = deletePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });

      await makeGraphqlAPIRequest(deleteWidgetOperation);

      const deleteTabOperation = deletePageLayoutTabOperationFactory({
        pageLayoutTabId: separateTab.id,
      });

      await makeGraphqlAPIRequest(deleteTabOperation);

      const restoreOperation = restorePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const restoreResponse = await makeGraphqlAPIRequest(restoreOperation);

      assertGraphQLErrorResponse(
        restoreResponse,
        ErrorCode.BAD_USER_INPUT,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
        ),
      );
    });
  });

  describe('Permission-based access', () => {
    let memberRoleId: string;
    let objectWithPermissionId: string;
    let objectWithoutPermissionId: string;
    let testPermissionPageLayoutId: string;
    let testPermissionPageLayoutTabId: string;

    beforeAll(async () => {
      // Create two test objects
      const {
        data: {
          createOneObject: { id: objectWithAccess },
        },
      } = await createOneObjectMetadata({
        input: {
          nameSingular: 'myTestObjectWithAccess',
          namePlural: 'myTestObjectsWithAccess',
          labelSingular: 'Object With Access',
          labelPlural: 'Objects With Access',
          icon: 'IconCheck',
        },
      });

      const {
        data: {
          createOneObject: { id: objectWithoutAccess },
        },
      } = await createOneObjectMetadata({
        input: {
          nameSingular: 'myTestObjectWithoutAccess',
          namePlural: 'myTestObjectsWithoutAccess',
          labelSingular: 'Object Without Access',
          labelPlural: 'Objects Without Access',
          icon: 'IconX',
        },
      });

      objectWithPermissionId = objectWithAccess;
      objectWithoutPermissionId = objectWithoutAccess;

      // Get member role ID
      memberRoleId = await getMemberRoleId();

      // Set up permissions: member has access to objectWithAccess but not objectWithoutAccess
      await setupObjectPermissionsForWidget({
        roleId: memberRoleId,
        objectMetadataIdWithAccess: objectWithPermissionId,
        objectMetadataIdWithoutAccess: objectWithoutPermissionId,
      });

      // Create page layout and tab for permission tests
      const permissionPageLayout = await createTestPageLayoutWithGraphQL({
        name: 'Test Page Layout for Permissions',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: objectWithPermissionId,
      });

      testPermissionPageLayoutId = permissionPageLayout.id;

      const permissionPageLayoutTab = await createTestPageLayoutTabWithGraphQL({
        title: 'Test Tab for Permissions',
        position: 0,
        pageLayoutId: testPermissionPageLayoutId,
      });

      testPermissionPageLayoutTabId = permissionPageLayoutTab.id;
    });

    afterAll(async () => {
      await cleanupPageLayoutRecordsWithGraphQL();
      await deleteOneObjectMetadata({
        input: { idToDelete: objectWithPermissionId },
      });
      await deleteOneObjectMetadata({
        input: { idToDelete: objectWithoutPermissionId },
      });
    });

    afterEach(async () => {
      await cleanupPageLayoutWidgetRecordsWithGraphQL(
        testPermissionPageLayoutTabId,
      );
    });

    it('should return widget without configuration when member lacks object permission', async () => {
      // Admin creates widget with objectMetadataId that member doesn't have access to
      const widget = await createTestPageLayoutWidgetWithGraphQL({
        title: 'Restricted Widget',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPermissionPageLayoutTabId,
        objectMetadataId: objectWithoutPermissionId,
        gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
        configuration: { sensitiveData: 'should not be visible' },
      });

      // Member tries to get the widget
      const operation = findPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const response = await makeGraphqlAPIRequestWithMember(operation);

      assertGraphQLSuccessfulResponse(response);
      const returnedWidget = response.body.data.getPageLayoutWidget;

      expect(returnedWidget.id).toBe(widget.id);
      expect(returnedWidget.title).toBe('Restricted Widget');
      expect(returnedWidget.canReadWidget).toBe(false);
      expect(returnedWidget.configuration).toBeNull(); // Configuration should be hidden
    });

    it('should return widget with configuration when member has object permission', async () => {
      // Admin creates widget with objectMetadataId that member has access to
      const widget = await createTestPageLayoutWidgetWithGraphQL({
        title: 'Accessible Widget',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPermissionPageLayoutTabId,
        objectMetadataId: objectWithPermissionId,
        gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
        configuration: { visibleData: 'should be visible' },
      });

      // Member tries to get the widget
      const operation = findPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const response = await makeGraphqlAPIRequestWithMember(operation);

      assertGraphQLSuccessfulResponse(response);
      const returnedWidget = response.body.data.getPageLayoutWidget;

      expect(returnedWidget.id).toBe(widget.id);
      expect(returnedWidget.title).toBe('Accessible Widget');
      expect(returnedWidget.canReadWidget).toBe(true);
      expect(returnedWidget.configuration).toEqual({
        visibleData: 'should be visible',
      }); // Configuration should be visible
    });

    it('should prevent member from creating widget with restricted objectMetadataId', async () => {
      const input = {
        title: 'Unauthorized Widget',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPermissionPageLayoutTabId,
        objectMetadataId: objectWithoutPermissionId,
        gridPosition: { row: 1, column: 1, rowSpan: 2, columnSpan: 2 },
      };

      const operation = createPageLayoutWidgetOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequestWithMember(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.FORBIDDEN,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.OBJECT_METADATA_ACCESS_FORBIDDEN,
          objectWithoutPermissionId,
        ),
      );
    });

    it('should allow member to create widget with permitted objectMetadataId', async () => {
      const input = {
        title: 'Authorized Widget',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPermissionPageLayoutTabId,
        objectMetadataId: objectWithPermissionId,
        gridPosition: { row: 1, column: 1, rowSpan: 2, columnSpan: 2 },
        configuration: { test: 'data' },
      };

      const operation = createPageLayoutWidgetOperationFactory({ data: input });
      const response = await makeGraphqlAPIRequestWithMember(operation);

      assertGraphQLSuccessfulResponse(response);
      const createdWidget = response.body.data.createPageLayoutWidget;

      expect(createdWidget.title).toBe('Authorized Widget');
      expect(createdWidget.objectMetadataId).toBe(objectWithPermissionId);
      expect(createdWidget.canReadWidget).toBe(true);
      expect(createdWidget.configuration).toEqual({ test: 'data' });
    });

    it('should prevent member from updating configuration without object permission', async () => {
      // Admin creates widget with restricted object
      const widget = await createTestPageLayoutWidgetWithGraphQL({
        title: 'Widget to Update',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPermissionPageLayoutTabId,
        objectMetadataId: objectWithoutPermissionId,
        gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
        configuration: { original: 'config' },
      });

      // Member tries to update configuration
      const operation = updatePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
        data: {
          configuration: { updated: 'config' },
        },
      });
      const response = await makeGraphqlAPIRequestWithMember(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.FORBIDDEN,
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.CONFIGURATION_UPDATE_FORBIDDEN,
        ),
      );
    });

    it('should allow member to update layout properties regardless of object permission', async () => {
      // Admin creates widget with restricted object
      const widget = await createTestPageLayoutWidgetWithGraphQL({
        title: 'Widget to Move',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPermissionPageLayoutTabId,
        objectMetadataId: objectWithoutPermissionId,
        gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
      });

      // Member updates only layout properties (not configuration)
      const operation = updatePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
        data: {
          title: 'Moved Widget',
          gridPosition: { row: 2, column: 2, rowSpan: 3, columnSpan: 4 },
        },
      });
      const response = await makeGraphqlAPIRequestWithMember(operation);

      assertGraphQLSuccessfulResponse(response);
      const updatedWidget = response.body.data.updatePageLayoutWidget;

      expect(updatedWidget.title).toBe('Moved Widget');
      expect(updatedWidget.gridPosition.row).toBe(2);
      expect(updatedWidget.gridPosition.column).toBe(2);
    });

    it('should allow member to delete widget regardless of object permission', async () => {
      // Admin creates widget with restricted object
      const widget = await createTestPageLayoutWidgetWithGraphQL({
        title: 'Widget to Delete',
        type: WidgetType.FIELDS,
        pageLayoutTabId: testPermissionPageLayoutTabId,
        objectMetadataId: objectWithoutPermissionId,
        gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
      });

      // Member deletes the widget
      const operation = deletePageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: widget.id,
      });
      const response = await makeGraphqlAPIRequestWithMember(operation);

      assertGraphQLSuccessfulResponse(response);
      const deletedWidget = response.body.data.deletePageLayoutWidget;

      expect(deletedWidget.id).toBe(widget.id);
      expect(deletedWidget.deletedAt).toBeDefined();
    });
  });
});
