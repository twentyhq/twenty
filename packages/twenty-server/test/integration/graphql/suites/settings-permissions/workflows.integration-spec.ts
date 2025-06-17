import { randomUUID } from 'node:crypto';

import { WORKFLOW_GQL_FIELDS } from 'test/integration/constants/workflow-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('workflowsPermissions', () => {
  describe('createOne workflow', () => {
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

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ createWorkflow: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
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

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.createWorkflow).toBeDefined();
      expect(response.body.data.createWorkflow.id).toBe(workflowId);
      expect(response.body.data.createWorkflow.name).toBe(
        'Test Workflow Admin',
      );

      // Clean up - delete the created workflow
      const destroyWorkflowOperation = destroyOneOperationFactory({
        objectMetadataSingularName: 'workflow',
        gqlFields: `
              id
          `,
        recordId: response.body.data.createWorkflow.id,
      });

      await makeGraphqlAPIRequest(destroyWorkflowOperation);
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

      const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.createWorkflow).toBeDefined();
      expect(response.body.data.createWorkflow.id).toBe(workflowId);
      expect(response.body.data.createWorkflow.name).toBe(
        'Test Workflow API Key',
      );

      // Clean up - delete the created workflow
      const destroyWorkflowOperation = destroyOneOperationFactory({
        objectMetadataSingularName: 'workflow',
        gqlFields: `
              id
          `,
        recordId: response.body.data.createWorkflow.id,
      });

      await makeGraphqlAPIRequest(destroyWorkflowOperation);
    });
  });

  describe('updateOne workflow', () => {
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

      await makeGraphqlAPIRequest(createWorkflowOperation);
    });

    afterAll(async () => {
      const destroyWorkflowOperation = destroyOneOperationFactory({
        objectMetadataSingularName: 'workflow',
        gqlFields: `
              id
          `,
        recordId: workflowId,
      });

      await makeGraphqlAPIRequest(destroyWorkflowOperation);
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

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ updateWorkflow: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
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

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateWorkflow).toBeDefined();
      expect(response.body.data.updateWorkflow.id).toBe(workflowId);
      expect(response.body.data.updateWorkflow.name).toBe(
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

      const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateWorkflow).toBeDefined();
      expect(response.body.data.updateWorkflow.id).toBe(workflowId);
      expect(response.body.data.updateWorkflow.name).toBe(
        'Updated Workflow API Key',
      );
    });
  });
});
