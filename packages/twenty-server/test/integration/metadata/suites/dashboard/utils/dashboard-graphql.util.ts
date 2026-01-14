import gql from 'graphql-tag';
import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

import { DASHBOARD_GQL_FIELDS } from './dashboard-gql-fields.constants';

interface CreateDashboardResponse extends Record<string, unknown> {
  createDashboard: DashboardWorkspaceEntity;
}

interface CreateManyDashboardsResponse extends Record<string, unknown> {
  createDashboards: DashboardWorkspaceEntity[];
}

interface FindDashboardResponse extends Record<string, unknown> {
  dashboard: DashboardWorkspaceEntity | null;
}

interface DeleteDashboardResponse extends Record<string, unknown> {
  deleteDashboard: DashboardWorkspaceEntity;
}

interface DeleteManyDashboardsResponse extends Record<string, unknown> {
  deleteDashboards: DashboardWorkspaceEntity[];
}

interface RestoreDashboardResponse extends Record<string, unknown> {
  restoreDashboard: DashboardWorkspaceEntity;
}

interface RestoreManyDashboardsResponse extends Record<string, unknown> {
  restoreDashboards: DashboardWorkspaceEntity[];
}

interface DestroyManyDashboardsResponse extends Record<string, unknown> {
  destroyDashboards: DashboardWorkspaceEntity[];
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
      mutation DestroyDashboard($dashboardId: UUID!) {
        destroyDashboard(id: $dashboardId) {
          id
        }
      }
    `,
    variables: {
      dashboardId,
    },
  };

  await makeGraphqlAPIRequest(operation);
};

export const createManyDashboardsWithGraphQL = async (
  data: Array<{
    id?: string;
    title: string;
    position?: number;
    pageLayoutId?: string;
  }>,
): Promise<DashboardWorkspaceEntity[]> => {
  const operation = {
    query: gql`
      mutation CreateDashboards($data: [DashboardCreateInput!]!) {
        createDashboards(data: $data) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      data: data.map((item, index) => ({
        id: item.id,
        title: item.title,
        position: item.position ?? index,
        pageLayoutId: item.pageLayoutId,
      })),
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<CreateManyDashboardsResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to create dashboards: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from createManyDashboardsWithGraphQL');
  }

  return response.body.data.createDashboards;
};

export const deleteDashboardWithGraphQL = async (
  dashboardId: string,
): Promise<DashboardWorkspaceEntity> => {
  const operation = {
    query: gql`
      mutation DeleteDashboard($dashboardId: UUID!) {
        deleteDashboard(id: $dashboardId) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      dashboardId,
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<DeleteDashboardResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to delete dashboard: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from deleteDashboardWithGraphQL');
  }

  return response.body.data.deleteDashboard;
};

export const deleteManyDashboardsWithGraphQL = async (filter: {
  id: { in: string[] };
}): Promise<DashboardWorkspaceEntity[]> => {
  const operation = {
    query: gql`
      mutation DeleteDashboards($filter: DashboardFilterInput!) {
        deleteDashboards(filter: $filter) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      filter,
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<DeleteManyDashboardsResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to delete dashboards: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from deleteManyDashboardsWithGraphQL');
  }

  return response.body.data.deleteDashboards;
};

export const restoreDashboardWithGraphQL = async (
  dashboardId: string,
): Promise<DashboardWorkspaceEntity> => {
  const operation = {
    query: gql`
      mutation RestoreDashboard($dashboardId: UUID!) {
        restoreDashboard(id: $dashboardId) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      dashboardId,
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<RestoreDashboardResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to restore dashboard: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from restoreDashboardWithGraphQL');
  }

  return response.body.data.restoreDashboard;
};

export const restoreManyDashboardsWithGraphQL = async (filter: {
  id: { in: string[] };
}): Promise<DashboardWorkspaceEntity[]> => {
  const operation = {
    query: gql`
      mutation RestoreDashboards($filter: DashboardFilterInput!) {
        restoreDashboards(filter: $filter) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      filter,
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<RestoreManyDashboardsResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to restore dashboards: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from restoreManyDashboardsWithGraphQL');
  }

  return response.body.data.restoreDashboards;
};

export const destroyManyDashboardsWithGraphQL = async (filter: {
  id: { in: string[] };
}): Promise<DashboardWorkspaceEntity[]> => {
  const operation = {
    query: gql`
      mutation DestroyDashboards($filter: DashboardFilterInput!) {
        destroyDashboards(filter: $filter) {
          ${DASHBOARD_GQL_FIELDS}
        }
      }
    `,
    variables: {
      filter,
    },
  };

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<DestroyManyDashboardsResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to destroy dashboards: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from destroyManyDashboardsWithGraphQL');
  }

  return response.body.data.destroyDashboards;
};

export const findDeletedDashboardWithGraphQL = async (
  dashboardId: string,
): Promise<DashboardWorkspaceEntity | null> => {
  const operation = {
    query: gql`
      query FindDeletedDashboard($filter: DashboardFilterInput!) {
        dashboard(filter: $filter) {
          ${DASHBOARD_GQL_FIELDS}
          deletedAt
        }
      }
    `,
    variables: {
      filter: {
        id: { eq: dashboardId },
        deletedAt: { is: 'NOT_NULL' },
      },
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

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

export const cleanupDashboardRecords = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM "${TEST_SCHEMA_NAME}"."dashboard"`,
  );
};
