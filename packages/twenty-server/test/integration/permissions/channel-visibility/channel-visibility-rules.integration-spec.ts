import { gql } from 'graphql-tag';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';

const FLAGS = [
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
  FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
];

const setJonyChannelVisibility = async (visibility: string) => {
  const response = await makeMetadataApiRequestWithMemberRole({
    query: gql`
      mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
        updateMessageChannel(input: $input) {
          visibility
        }
      }
    `,
    variables: {
      input: {
        id: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
        update: { visibility },
      },
    },
  });

  expect(response.body.errors).toBeUndefined();
  await waitForAllJobsToFinish();
};

const findMessagesOfChannel = async ({
  messageChannelId,
  token,
  filter = {},
}: {
  messageChannelId: string;
  token?: string;
  filter?: Record<string, unknown>;
}) => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'message',
      objectMetadataPluralName: 'messages',
      gqlFields: 'id subject text',
      filter: {
        messageChannelMessageAssociations: {
          messageChannelId: { eq: messageChannelId },
        },
        ...filter,
      },
    }),
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.messages.edges.map(
    ({ node }: { node: { id: string; subject: string; text: string } }) => node,
  );
};

describe('channel visibility through row level rules (integration)', () => {
  beforeAll(async () => {
    for (const featureFlag of FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: true,
        expectToFail: false,
      });
    }
    await waitForAllJobsToFinish();
  });

  afterAll(async () => {
    await setJonyChannelVisibility('SHARE_EVERYTHING');

    for (const featureFlag of [...FLAGS].reverse()) {
      await updateFeatureFlag({
        featureFlag,
        value: false,
        expectToFail: false,
      });
    }
    await waitForAllJobsToFinish();
  });

  it('reads every field of a channel that shares everything', async () => {
    await setJonyChannelVisibility('SHARE_EVERYTHING');

    const messages = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
    });

    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.every(
        ({ subject, text }: { subject: string; text: string }) =>
          subject !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED &&
          text !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(true);
  });

  it('cannot read subject and text of a metadata channel of another member', async () => {
    await setJonyChannelVisibility('METADATA');

    const messages = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
    });

    expect(messages.length).toBeGreaterThan(0);
    expect(messages).toEqual(
      messages.map(({ id }: { id: string }) => ({
        id,
        subject: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      })),
    );
  });

  it('does not match an unreadable subject in a filter', async () => {
    await setJonyChannelVisibility('METADATA');

    const [readableMessage] = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const messages = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
      filter: { subject: { eq: readableMessage.subject } },
    });

    expect(messages).toEqual([]);
  });

  it('lets the owner of a metadata channel read every field', async () => {
    await setJonyChannelVisibility('METADATA');

    const messages = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.some(
        ({ subject }: { subject: string }) =>
          subject === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(false);
  });

  it('reads the subject but not the text of a subject channel', async () => {
    await setJonyChannelVisibility('SUBJECT');

    const messages = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
    });

    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.every(
        ({ subject, text }: { subject: string; text: string }) =>
          subject !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED &&
          text === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(true);
  });

  it('cannot read the title of an event of a metadata calendar of another member', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        objectMetadataPluralName: 'calendarEvents',
        gqlFields: 'id title',
        filter: {
          calendarChannelEventAssociations: {
            calendarChannelId: { eq: CALENDAR_CHANNEL_DATA_SEED_IDS.TIM },
          },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const titles = response.body.data.calendarEvents.edges.map(
      ({ node }: { node: { title: string } }) => node.title,
    );

    expect(titles.length).toBeGreaterThan(0);
    expect(new Set(titles)).toEqual(
      new Set([FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED]),
    );
  });
});
