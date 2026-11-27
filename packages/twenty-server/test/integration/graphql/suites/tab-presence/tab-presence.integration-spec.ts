import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { TabPresenceStatus } from 'src/engine/core-modules/tab-presence/enums/tab-presence-status.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const updateJonyTabPresence = ({
  tabId,
  status,
}: {
  tabId: string;
  status: TabPresenceStatus;
}) =>
  makeMetadataApiRequest(
    {
      query: gql`
        mutation UpdateTabPresence($input: UpdateTabPresenceInput!) {
          updateTabPresence(input: $input)
        }
      `,
      variables: { input: { tabId, status } },
    },
    APPLE_JONY_MEMBER_ACCESS_TOKEN,
  );

const findOnlineWorkspaceMemberIds = async (): Promise<string[]> => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query OnlineWorkspaceMemberIds {
        onlineWorkspaceMemberIds
      }
    `,
  });

  return response.body.data.onlineWorkspaceMemberIds;
};

describe('tab presence (integration)', () => {
  it('should show only members with a reporting tab as online', async () => {
    await updateJonyTabPresence({
      tabId: randomUUID(),
      status: TabPresenceStatus.OPEN,
    });

    const onlineWorkspaceMemberIds = await findOnlineWorkspaceMemberIds();

    expect(onlineWorkspaceMemberIds).toContain(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
    expect(onlineWorkspaceMemberIds).not.toContain(
      WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    );
  });
});
