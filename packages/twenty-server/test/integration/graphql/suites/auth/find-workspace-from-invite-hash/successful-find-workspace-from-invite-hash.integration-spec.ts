import { findWorkspaceFromInviteHash } from 'test/integration/graphql/utils/find-workspace-from-invite-hash.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEEDER_CREATE_WORKSPACE_INPUT,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_INVITE_HASH =
  SEEDER_CREATE_WORKSPACE_INPUT[SEED_APPLE_WORKSPACE_ID].inviteHash;

describe('findWorkspaceFromInviteHash should succeed (integration)', () => {
  it('should return the fields the invite page selects to an unauthenticated caller', async () => {
    const { data } = await findWorkspaceFromInviteHash({
      inviteHash: APPLE_INVITE_HASH,
      expectToFail: false,
    });

    expect(data.findWorkspaceFromInviteHash.id).toBe(SEED_APPLE_WORKSPACE_ID);
    expect(data.findWorkspaceFromInviteHash).toMatchSnapshot({
      ...extractRecordIdsAndDatesAsExpectAny({
        ...data.findWorkspaceFromInviteHash,
      }),
      logo: expect.any(String),
    });
  });
});
