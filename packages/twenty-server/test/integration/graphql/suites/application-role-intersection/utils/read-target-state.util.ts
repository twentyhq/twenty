import gql from 'graphql-tag';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Read back as the seeded admin, never as the caller under test, so a refusal
// to read can never be mistaken for a target that did not change.
const findWorkspaceMembers = async (
  workspaceMemberId: string,
  gqlFields: string,
): Promise<Record<string, unknown>[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      objectMetadataPluralName: 'workspaceMembers',
      gqlFields,
      filter: { id: { eq: workspaceMemberId } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workspaceMembers.edges.map(
    (edge: { node: Record<string, unknown> }) => edge.node,
  );
};

export const readWorkspaceMemberTimeZone = async (
  workspaceMemberId: string,
): Promise<string | undefined> => {
  const [workspaceMember] = await findWorkspaceMembers(
    workspaceMemberId,
    'id timeZone',
  );

  return workspaceMember?.timeZone as string | undefined;
};

export const workspaceMemberExists = async (
  workspaceMemberId: string,
): Promise<boolean> => {
  const workspaceMembers = await findWorkspaceMembers(workspaceMemberId, 'id');

  return workspaceMembers.length === 1;
};

export const readWorkspaceDisplayName = async (): Promise<string> => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query CurrentWorkspace {
        currentWorkspace {
          displayName
        }
      }
    `,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.currentWorkspace.displayName;
};

// A refused workspace-scoped blocklist entry must leave the count untouched.
export const countWorkspaceBlocklistEntries = async (): Promise<number> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: 'id',
      filter: {},
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.blocklists.edges.length;
};

// A refused delete is a soft delete that never happened, so the entry is
// still visible to the seeded admin.
export const workspaceBlocklistEntryExists = async (
  blocklistEntryId: string,
): Promise<boolean> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'blocklist',
      objectMetadataPluralName: 'blocklists',
      gqlFields: 'id',
      filter: { id: { eq: blocklistEntryId } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.blocklists.edges.length === 1;
};

// A successful picture upload adds exactly one core file row, and nothing else
// in this suite writes files.
export const countWorkspaceFiles = async (): Promise<number> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM core."file" WHERE "workspaceId" = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return row.count;
};
