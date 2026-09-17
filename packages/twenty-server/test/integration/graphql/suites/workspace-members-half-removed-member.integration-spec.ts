import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const JONY_USER_WORKSPACE_ID = USER_WORKSPACE_DATA_SEED_IDS.JONY;

const CURRENT_USER_WORKSPACE_MEMBERS_QUERY = gql`
  query CurrentUserWorkspaceMembers {
    currentUser {
      id
      workspaceMembers {
        id
      }
    }
  }
`;

describe('currentUser.workspaceMembers with a half-removed member', () => {
  const userWorkspaceRepository =
    getCoreRepository<UserWorkspaceEntity>(UserWorkspaceEntity);

  // A removal that soft-deletes the userWorkspace before the workspaceMember leaves the member in a torn state.
  beforeAll(async () => {
    await userWorkspaceRepository.softDelete({ id: JONY_USER_WORKSPACE_ID });
  });

  afterAll(async () => {
    await userWorkspaceRepository.restore({ id: JONY_USER_WORKSPACE_ID });
  });

  it('lists the other members instead of failing the whole query', async () => {
    const response = await makeMetadataAPIRequest({
      query: CURRENT_USER_WORKSPACE_MEMBERS_QUERY,
      variables: {},
    });

    expect(response.body.errors).toBeUndefined();

    const workspaceMemberIds: string[] =
      response.body.data.currentUser.workspaceMembers.map(
        (workspaceMember: { id: string }) => workspaceMember.id,
      );

    expect(workspaceMemberIds).toContain(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE);
    expect(workspaceMemberIds).not.toContain(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
  });
});
