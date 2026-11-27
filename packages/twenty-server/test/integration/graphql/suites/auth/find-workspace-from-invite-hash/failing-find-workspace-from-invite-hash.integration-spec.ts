import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findWorkspaceFromInviteHash } from 'test/integration/graphql/utils/find-workspace-from-invite-hash.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEEDER_CREATE_WORKSPACE_INPUT,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_INVITE_HASH =
  SEEDER_CREATE_WORKSPACE_INPUT[SEED_APPLE_WORKSPACE_ID].inviteHash;

type UnselectableFieldTestContext = {
  gqlFields: string;
};

const UNSELECTABLE_FIELD_TEST_CASES: EachTestingContext<UnselectableFieldTestContext>[] =
  [
    { title: 'inviteHash', context: { gqlFields: 'inviteHash' } },
    {
      title: 'featureFlags',
      context: { gqlFields: 'featureFlags { key value }' },
    },
    {
      title: 'workspaceMembersCount',
      context: { gqlFields: 'workspaceMembersCount' },
    },
    {
      title: 'defaultRole',
      context: { gqlFields: 'defaultRole { id label }' },
    },
    {
      title: 'installedApplications',
      context: { gqlFields: 'installedApplications { id name }' },
    },
  ];

describe('findWorkspaceFromInviteHash should fail (integration)', () => {
  it.each(eachTestingContextFilter(UNSELECTABLE_FIELD_TEST_CASES))(
    'when an unauthenticated caller selects $title',
    async ({ context: { gqlFields } }) => {
      const { errors } = await findWorkspaceFromInviteHash({
        inviteHash: APPLE_INVITE_HASH,
        gqlFields: `id ${gqlFields}`,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );

  it('when the invite hash does not exist', async () => {
    const { errors } = await findWorkspaceFromInviteHash({
      inviteHash: 'unknown-invite-hash',
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
