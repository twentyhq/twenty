import gql from 'graphql-tag';
import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeGraphqlApiRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const CREATE_CORE_WORKFLOW_MUTATION = gql`
  mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
    createCoreWorkflow(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_CORE_WORKFLOW_MUTATION = gql`
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
      const response = await makeGraphqlApiRequestWithGuestRole({
        query: CREATE_CORE_WORKFLOW_MUTATION,
        variables: { input: { name: 'Test Workflow V2' } },
      });

      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should create a workflow when user has permission (admin role)', async () => {
      const response = await makeGraphqlApiRequest({
        query: CREATE_CORE_WORKFLOW_MUTATION,
        variables: { input: { name: 'Test Workflow Admin' } },
      });

      expect(response.body.data).toBeDefined();
      expect(response.body.data.createCoreWorkflow).toBeDefined();
      expect(response.body.data.createCoreWorkflow.name).toBe(
        'Test Workflow Admin',
      );

      await deleteCoreWorkflows({
        coreWorkflowIds: [response.body.data.createCoreWorkflow.id],
      });
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
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const response = await makeGraphqlApiRequestWithGuestRole({
        query: UPDATE_CORE_WORKFLOW_MUTATION,
        variables: {
          input: { coreWorkflowId, name: 'Updated Workflow V2 Guest' },
        },
      });

      expect(response.body.data).toStrictEqual({ updateCoreWorkflow: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should update a workflow when user has permission (admin role)', async () => {
      const response = await makeGraphqlApiRequest({
        query: UPDATE_CORE_WORKFLOW_MUTATION,
        variables: {
          input: { coreWorkflowId, name: 'Updated Workflow V2 Admin' },
        },
      });

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateCoreWorkflow).toBeDefined();
      expect(response.body.data.updateCoreWorkflow.id).toBe(coreWorkflowId);
      expect(response.body.data.updateCoreWorkflow.name).toBe(
        'Updated Workflow V2 Admin',
      );
    });
  });
});
