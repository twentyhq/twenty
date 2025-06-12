import { randomUUID } from 'node:crypto';

import { WORKFLOW_GQL_FIELDS } from 'test/integration/constants/workflow-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

describe('workflowsPermissions', () => {
  describe('createOne workflow', () => {
    describe('permissions V2 disabled', () => {
      it('should throw a permission error when user does not have permission (guest role)', async () => {
        const workflowId = randomUUID();
        const graphqlOperation = createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          data: {
            id: workflowId,
            name: 'Test Workflow',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
          options: {
            testingToken: 'GUEST',
          },
        });

        expect(response.data).toStrictEqual({ createWorkflow: null });
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });

      it('should create a workflow when user has permission (admin role)', async () => {
        const workflowId = randomUUID();
        const graphqlOperation = createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          data: {
            id: workflowId,
            name: 'Test Workflow Admin',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
        });

        expect(response.rawResponse.status).toBe(200);
        expect(response.errors).toBeUndefined();

        expect(response.data).toBeDefined();
        expect(response.data.createWorkflow).toBeDefined();
        expect(response.data.createWorkflow.id).toBe(workflowId);
        expect(response.data.createWorkflow.name).toBe('Test Workflow Admin');

        // Clean up - delete the created workflow
        const destroyWorkflowOperation = destroyOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: `
            id
        `,
          recordId: response.data.createWorkflow.id,
        });

        await makeGraphqlAPIRequest({ operation: destroyWorkflowOperation });
      });
    });

    describe('permissions V2 enabled', () => {
      beforeAll(async () => {
        const enablePermissionsQuery = updateFeatureFlagFactory(
          SEED_APPLE_WORKSPACE_ID,
          'IS_PERMISSIONS_V2_ENABLED',
          true,
        );

        await makeGraphqlAPIRequest({ operation: enablePermissionsQuery });
      });

      afterAll(async () => {
        const disablePermissionsQuery = updateFeatureFlagFactory(
          SEED_APPLE_WORKSPACE_ID,
          'IS_PERMISSIONS_V2_ENABLED',
          false,
        );

        await makeGraphqlAPIRequest({ operation: disablePermissionsQuery });
      });

      it('should throw a permission error when user does not have permission (guest role)', async () => {
        const workflowId = randomUUID();
        const graphqlOperation = createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          data: {
            id: workflowId,
            name: 'Test Workflow V2',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
          options: {
            testingToken: 'GUEST',
          },
        });

        expect(response.data).toStrictEqual({ createWorkflow: null });
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });

      it('should create a workflow when user has permission (admin role)', async () => {
        const workflowId = randomUUID();
        const graphqlOperation = createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          data: {
            id: workflowId,
            name: 'Test Workflow Admin',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
        });

        expect(response.rawResponse.status).toBe(200);
        expect(response.errors).toBeUndefined();

        expect(response.data).toBeDefined();
        expect(response.data.createWorkflow).toBeDefined();
        expect(response.data.createWorkflow.id).toBe(workflowId);
        expect(response.data.createWorkflow.name).toBe('Test Workflow Admin');

        // Clean up - delete the created workflow
        const destroyWorkflowOperation = destroyOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: `
              id
          `,
          recordId: response.data.createWorkflow.id,
        });

        await makeGraphqlAPIRequest({ operation: destroyWorkflowOperation });
      });

      it('should create a workflow when executed by api key', async () => {
        const workflowId = randomUUID();
        const graphqlOperation = createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          data: {
            id: workflowId,
            name: 'Test Workflow API Key',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
          options: {
            testingToken: 'API_KEY',
          },
        });

        expect(response.rawResponse.status).toBe(200);
        expect(response.errors).toBeUndefined();

        expect(response.data).toBeDefined();
        expect(response.data.createWorkflow).toBeDefined();
        expect(response.data.createWorkflow.id).toBe(workflowId);
        expect(response.data.createWorkflow.name).toBe('Test Workflow API Key');

        // Clean up - delete the created workflow
        const destroyWorkflowOperation = destroyOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: `
              id
          `,
          recordId: response.data.createWorkflow.id,
        });

        await makeGraphqlAPIRequest({ operation: destroyWorkflowOperation });
      });
    });
  });

  describe('updateOne workflow', () => {
    describe('permissions V2 disabled', () => {
      const workflowId = randomUUID();

      beforeAll(async () => {
        const createWorkflowOperation = createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          data: {
            id: workflowId,
            name: 'Original Workflow Name',
          },
        });

        await makeGraphqlAPIRequest({ operation: createWorkflowOperation });
      });

      afterAll(async () => {
        const destroyWorkflowOperation = destroyOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: `
              id
          `,
          recordId: workflowId,
        });

        await makeGraphqlAPIRequest({ operation: destroyWorkflowOperation });
      });

      it('should throw a permission error when user does not have permission (guest role)', async () => {
        const graphqlOperation = updateOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          recordId: workflowId,
          data: {
            name: 'Updated Workflow Name Guest',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
          options: {
            testingToken: 'GUEST',
          },
        });

        expect(response.data).toStrictEqual({ updateWorkflow: null });
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });

      it('should update a workflow when user has permission (admin role)', async () => {
        const graphqlOperation = updateOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          recordId: workflowId,
          data: {
            name: 'Updated Workflow Name Admin',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
        });

        expect(response.rawResponse.status).toBe(200);
        expect(response.errors).toBeUndefined();

        expect(response.data).toBeDefined();
        expect(response.data.updateWorkflow).toBeDefined();
        expect(response.data.updateWorkflow.id).toBe(workflowId);
        expect(response.data.updateWorkflow.name).toBe(
          'Updated Workflow Name Admin',
        );
      });
    });

    describe('permissions V2 enabled', () => {
      const workflowId = randomUUID();

      beforeAll(async () => {
        const createWorkflowOperation = createOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          data: {
            id: workflowId,
            name: 'Original Workflow V2',
          },
        });

        await makeGraphqlAPIRequest({ operation: createWorkflowOperation });

        const enablePermissionsQuery = updateFeatureFlagFactory(
          SEED_APPLE_WORKSPACE_ID,
          'IS_PERMISSIONS_V2_ENABLED',
          true,
        );

        await makeGraphqlAPIRequest({ operation: enablePermissionsQuery });
      });

      afterAll(async () => {
        const destroyWorkflowOperation = destroyOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: `
              id
          `,
          recordId: workflowId,
        });

        await makeGraphqlAPIRequest({ operation: destroyWorkflowOperation });

        const disablePermissionsQuery = updateFeatureFlagFactory(
          SEED_APPLE_WORKSPACE_ID,
          'IS_PERMISSIONS_V2_ENABLED',
          false,
        );

        await makeGraphqlAPIRequest({ operation: disablePermissionsQuery });
      });

      it('should throw a permission error when user does not have permission (guest role)', async () => {
        const graphqlOperation = updateOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          recordId: workflowId,
          data: {
            name: 'Updated Workflow V2 Guest',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
          options: {
            testingToken: 'GUEST',
          },
        });

        expect(response.data).toStrictEqual({ updateWorkflow: null });
        expect(response.errors).toBeDefined();
        expect(response.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });

      it('should update a workflow when user has permission (admin role)', async () => {
        const graphqlOperation = updateOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          recordId: workflowId,
          data: {
            name: 'Updated Workflow V2 Admin',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
        });

        expect(response.rawResponse.status).toBe(200);
        expect(response.errors).toBeUndefined();

        expect(response.data).toBeDefined();
        expect(response.data.updateWorkflow).toBeDefined();
        expect(response.data.updateWorkflow.id).toBe(workflowId);
        expect(response.data.updateWorkflow.name).toBe(
          'Updated Workflow V2 Admin',
        );
      });

      it('should update a workflow when executed by api key', async () => {
        const graphqlOperation = updateOneOperationFactory({
          objectMetadataSingularName: 'workflow',
          gqlFields: WORKFLOW_GQL_FIELDS,
          recordId: workflowId,
          data: {
            name: 'Updated Workflow API Key',
          },
        });

        const response = await makeGraphqlAPIRequest<any>({
          operation: graphqlOperation,
          options: {
            testingToken: 'API_KEY',
          },
        });

        expect(response.rawResponse.status).toBe(200);
        expect(response.errors).toBeUndefined();

        expect(response.data).toBeDefined();
        expect(response.data.updateWorkflow).toBeDefined();
        expect(response.data.updateWorkflow.id).toBe(workflowId);
        expect(response.data.updateWorkflow.name).toBe(
          'Updated Workflow API Key',
        );
      });
    });
  });
});
