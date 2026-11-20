import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  TAB_PRESENCE_STATUS,
  type TabPresenceStatus,
} from 'twenty-shared/constants';

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
  it('should keep a member online until their last open tab closes', async () => {
    const firstTabId = randomUUID();
    const secondTabId = randomUUID();

    await updateJonyTabPresence({
      tabId: firstTabId,
      status: TAB_PRESENCE_STATUS.OPEN,
    });
    await updateJonyTabPresence({
      tabId: secondTabId,
      status: TAB_PRESENCE_STATUS.FOCUSED,
    });

    expect(await findOnlineWorkspaceMemberIds()).toContain(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );

    await updateJonyTabPresence({
      tabId: firstTabId,
      status: TAB_PRESENCE_STATUS.CLOSED,
    });

    expect(await findOnlineWorkspaceMemberIds()).toContain(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );

    await updateJonyTabPresence({
      tabId: secondTabId,
      status: TAB_PRESENCE_STATUS.CLOSED,
    });

    expect(await findOnlineWorkspaceMemberIds()).not.toContain(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
  });
});
