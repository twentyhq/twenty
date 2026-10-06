import {
  CREATE_CORE_WORKFLOW_MUTATION,
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const CREATE_CORE_WORKFLOW_WITH_NAME_MUTATION = `
  mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
    createCoreWorkflow(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_CORE_WORKFLOW_MUTATION = `
  mutation UpdateCoreWorkflow($input: UpdateCoreWorkflowInput!) {
    updateCoreWorkflow(input: $input) {
      id
      name
    }
  }
`;

describe('workflowsPermissions', () => {
  describe('createCoreWorkflow', () => {
    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const response = await workflowGraphqlRequest(
        CREATE_CORE_WORKFLOW_MUTATION,
        { input: { name: 'Test Workflow V2' } },
        APPLE_PHIL_GUEST_ACCESS_TOKEN,
      );

      expect(response.body.data?.createCoreWorkflow).toBeFalsy();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should create a workflow when user has permission (admin role)', async () => {
      const response = await workflowGraphqlRequest(
        CREATE_CORE_WORKFLOW_WITH_NAME_MUTATION,
        { input: { name: 'Test Workflow Admin' } },
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createCoreWorkflow.id).toBeDefined();
      expect(response.body.data.createCoreWorkflow.name).toBe(
        'Test Workflow Admin',
      );

      await deleteCoreWorkflows([response.body.data.createCoreWorkflow.id]);
    });

    it('should refuse to create a workflow when executed by api key', async () => {
      const response = await workflowGraphqlRequest(
        CREATE_CORE_WORKFLOW_MUTATION,
        { input: { name: 'Test Workflow API Key' } },
        API_KEY_ACCESS_TOKEN,
      );

      expect(response.body.data?.createCoreWorkflow).toBeFalsy();
      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        ErrorCode.FORBIDDEN,
      );
    });
  });

  describe('updateCoreWorkflow', () => {
    let coreWorkflowId: string;

    beforeAll(async () => {
      ({ coreWorkflowId } = await createCoreWorkflow({
        name: 'Original Workflow V2',
      }));
    });

    afterAll(async () => {
      await deleteCoreWorkflows([coreWorkflowId]);
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const response = await workflowGraphqlRequest(
        UPDATE_CORE_WORKFLOW_MUTATION,
        { input: { coreWorkflowId, name: 'Updated Workflow V2 Guest' } },
        APPLE_PHIL_GUEST_ACCESS_TOKEN,
      );

      expect(response.body.data?.updateCoreWorkflow).toBeFalsy();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should update a workflow when user has permission (admin role)', async () => {
      const response = await workflowGraphqlRequest(
        UPDATE_CORE_WORKFLOW_MUTATION,
        { input: { coreWorkflowId, name: 'Updated Workflow V2 Admin' } },
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCoreWorkflow.id).toBe(coreWorkflowId);
      expect(response.body.data.updateCoreWorkflow.name).toBe(
        'Updated Workflow V2 Admin',
      );
    });

    it('should refuse to update a workflow when executed by api key', async () => {
      const response = await workflowGraphqlRequest(
        UPDATE_CORE_WORKFLOW_MUTATION,
        { input: { coreWorkflowId, name: 'Updated Workflow API Key' } },
        API_KEY_ACCESS_TOKEN,
      );

      expect(response.body.data?.updateCoreWorkflow).toBeFalsy();
      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        ErrorCode.FORBIDDEN,
      );
    });
  });
});
