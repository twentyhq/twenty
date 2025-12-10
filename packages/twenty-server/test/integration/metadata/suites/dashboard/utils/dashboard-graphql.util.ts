import gql from 'graphql-tag';
import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

import { DASHBOARD_GQL_FIELDS } from './dashboard-gql-fields.constants';

interface CreateDashboardResponse extends Record<string, unknown> {
  createDashboard: DashboardWorkspaceEntity;
}

interface FindDashboardResponse extends Record<string, unknown> {
  dashboard: DashboardWorkspaceEntity | null;
}

export const createTestDashboardWithGraphQL = async (data: {
  id?: string;
  title: string;
  position?: number;
  pageLayoutId?: string;
}): Promise<DashboardWorkspaceEntity> => {
  const operation = {
    query: gql`
      mutation CreateDashboard($input: DashboardCreateInput!) {
        createDashboard(data: $input) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      input: {
        id: data.id,
        title: data.title,
        position: data.position ?? 0,
        pageLayoutId: data.pageLayoutId,
      },
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<CreateDashboardResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to create test dashboard: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from createTestDashboardWithGraphQL');
  }

  return response.body.data.createDashboard;
};

export const findDashboardWithGraphQL = async (
  dashboardId: string,
): Promise<DashboardWorkspaceEntity | null> => {
  const operation = {
    query: gql`
      query FindDashboard($filter: DashboardFilterInput!) {
        dashboard(filter: $filter) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      filter: { id: { eq: dashboardId } },
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<FindDashboardResponse>;

  if (response.body.errors) {
    return null;
  }

  return response.body.data?.dashboard ?? null;
};

export const destroyDashboardWithGraphQL = async (
  dashboardId: string,
): Promise<void> => {
  const operation = {
    query: gql`
      mutation DestroyDashboard($filter: DashboardFilterInput!) {
        destroyDashboard(filter: $filter) {
          id
        }
      }
    `,
    variables: {
      filter: { id: { eq: dashboardId } },
    },
  };

  await makeGraphqlAPIRequest(operation);
};

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

export const cleanupDashboardRecords = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM "${TEST_SCHEMA_NAME}"."dashboard"`,
  );
};
