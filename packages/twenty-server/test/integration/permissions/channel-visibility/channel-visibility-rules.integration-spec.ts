import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { findCurrentUserObjectRecordsPermissions } from 'test/integration/permissions/channel-visibility/utils/find-current-user-object-records-permissions.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { updateMessageChannelVisibility } from 'test/integration/permissions/channel-visibility/utils/update-message-channel-visibility.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { syncChannelVisibilityRules } from 'test/integration/permissions/channel-visibility/utils/sync-channel-visibility-rules.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  grantRoleWideAccessToChannelObjects,
  revokeRoleWideAccessToChannelObjects,
} from 'test/integration/utils/role-wide-access-to-channel-objects.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';

const createRecord = async ({
  objectMetadataSingularName,
  data,
}: {
  objectMetadataSingularName: string;
  data: Record<string, unknown>;
}): Promise<string> => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data[`create${capitalize(objectMetadataSingularName)}`]
    .id;
};

const destroyRecord = async ({
  objectMetadataSingularName,
  recordId,
}: {
  objectMetadataSingularName: string;
  recordId: string;
}) => {
  const response = await makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const findCalendarEventIdOfChannel = async (
  calendarChannelId: string,
): Promise<string> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      objectMetadataPluralName: 'calendarEvents',
      gqlFields: 'id',
      filter: {
        calendarChannelEventAssociations: {
          calendarChannelId: { eq: calendarChannelId },
        },
      },
    }),
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.calendarEvents.edges[0].node.id;
};

const setJonyChannelVisibility = (visibility: string) =>
  updateMessageChannelVisibility({
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
    visibility,
  });

const findMessagesOfChannel = async ({
  messageChannelId,
  token = APPLE_PHIL_GUEST_ACCESS_TOKEN,
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
  let companyId: string;
  let companyAttachmentId: string;
  let messageAttachmentId: string;
  let callRecordingWithoutEventId: string;
  let callRecordingOfOtherMemberMetadataEventId: string;
  let callRecordingOfOwnMetadataEventId: string;
  let callRecordingOfSharedEventId: string;

  beforeAll(async () => {
    await grantRoleWideAccessToChannelObjects();
    const [jonyMessage] = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    // Seeded companies may be gone: other suites of the same shard delete them all
    companyId = await createRecord({
      objectMetadataSingularName: 'company',
      data: { name: 'Channel visibility company' },
    });
    companyAttachmentId = await createRecord({
      objectMetadataSingularName: 'attachment',
      data: { name: 'Company attachment', targetCompanyId: companyId },
    });
    messageAttachmentId = await createRecord({
      objectMetadataSingularName: 'attachment',
      data: { name: 'Message attachment', targetMessageId: jonyMessage.id },
    });
    callRecordingWithoutEventId = await createRecord({
      objectMetadataSingularName: 'callRecording',
      data: { title: 'Call recording without event' },
    });
    callRecordingOfOtherMemberMetadataEventId = await createRecord({
      objectMetadataSingularName: 'callRecording',
      data: {
        title: 'Call recording of a metadata event of another member',
        calendarEventId: await findCalendarEventIdOfChannel(
          CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
        ),
      },
    });
    callRecordingOfOwnMetadataEventId = await createRecord({
      objectMetadataSingularName: 'callRecording',
      data: {
        title: 'Call recording of an own metadata event',
        calendarEventId: await findCalendarEventIdOfChannel(
          CALENDAR_CHANNEL_DATA_SEED_IDS.PHIL,
        ),
      },
    });
    callRecordingOfSharedEventId = await createRecord({
      objectMetadataSingularName: 'callRecording',
      data: {
        title: 'Call recording of a shared event',
        calendarEventId: await findCalendarEventIdOfChannel(
          CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
        ),
      },
    });

    await revokeRoleWideAccessToChannelObjects();
    await syncChannelVisibilityRules();
    await waitForAllJobsToFinish();
  });

  afterAll(async () => {
    await grantRoleWideAccessToChannelObjects();
    for (const attachmentId of [companyAttachmentId, messageAttachmentId]) {
      await destroyRecord({
        objectMetadataSingularName: 'attachment',
        recordId: attachmentId,
      });
    }
    for (const callRecordingId of [
      callRecordingWithoutEventId,
      callRecordingOfOtherMemberMetadataEventId,
      callRecordingOfOwnMetadataEventId,
      callRecordingOfSharedEventId,
    ]) {
      await destroyRecord({
        objectMetadataSingularName: 'callRecording',
        recordId: callRecordingId,
      });
    }
    await destroyRecord({
      objectMetadataSingularName: 'company',
      recordId: companyId,
    });
    await setJonyChannelVisibility('SHARE_EVERYTHING');

    await waitForAllJobsToFinish();
    await revokeRoleWideAccessToChannelObjects();
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

  it('reads the attachments of other records, and those of a message only when it is fully readable', async () => {
    const findAttachmentIds = async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'attachment',
          objectMetadataPluralName: 'attachments',
          gqlFields: 'id',
          filter: { id: { in: [companyAttachmentId, messageAttachmentId] } },
        }),
        APPLE_PHIL_GUEST_ACCESS_TOKEN,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.attachments.edges
        .map(({ node }: { node: { id: string } }) => node.id)
        .sort();
    };

    await setJonyChannelVisibility('METADATA');

    expect(await findAttachmentIds()).toEqual([companyAttachmentId]);

    await setJonyChannelVisibility('SHARE_EVERYTHING');

    expect(await findAttachmentIds()).toEqual(
      [companyAttachmentId, messageAttachmentId].sort(),
    );
  });

  it('shows a thread subject only through a message whose subject the reader can read', async () => {
    await setJonyChannelVisibility('METADATA');

    const findJonyMessageThreads = async (token: string) => {
      const messagesResponse = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'message',
          objectMetadataPluralName: 'messages',
          gqlFields: 'id messageThreadId',
          filter: {
            messageChannelMessageAssociations: {
              messageChannelId: { eq: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY },
            },
          },
        }),
        token,
      );

      expect(messagesResponse.body.errors).toBeUndefined();

      const messageThreadIds = [
        ...new Set<string>(
          messagesResponse.body.data.messages.edges
            .map(
              ({ node }: { node: { messageThreadId: string | null } }) =>
                node.messageThreadId,
            )
            .filter(isDefined),
        ),
      ];
      const messageThreadsResponse = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'messageThread',
          objectMetadataPluralName: 'messageThreads',
          gqlFields: 'id subject messages { edges { node { subject } } }',
          filter: { id: { in: messageThreadIds } },
        }),
        token,
      );

      expect(messageThreadsResponse.body.errors).toBeUndefined();

      return messageThreadsResponse.body.data.messageThreads.edges.map(
        ({
          node,
        }: {
          node: {
            subject: string;
            messages: { edges: { node: { subject: string } }[] };
          };
        }) => ({
          subject: node.subject,
          hasMessageWithReadableSubject: node.messages.edges.some(
            ({ node: message }) =>
              message.subject !==
              FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
          ),
        }),
      );
    };

    const ownerMessageThreads = await findJonyMessageThreads(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(ownerMessageThreads.length).toBeGreaterThan(0);
    expect(
      ownerMessageThreads.some(
        ({ subject }: { subject: string }) =>
          subject === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(false);

    const guestMessageThreads = await findJonyMessageThreads(
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(
      guestMessageThreads.some(
        ({ subject }: { subject: string }) =>
          subject === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(true);

    for (const {
      subject,
      hasMessageWithReadableSubject,
    } of guestMessageThreads) {
      expect(subject !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED).toBe(
        hasMessageWithReadableSubject,
      );
    }
  });

  it('reads the call recordings with no calendar event, and those of a calendar event only when it is fully readable', async () => {
    const findCallRecordingIds = async (token: string) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'callRecording',
          objectMetadataPluralName: 'callRecordings',
          gqlFields: 'id',
          filter: {
            id: {
              in: [
                callRecordingWithoutEventId,
                callRecordingOfOtherMemberMetadataEventId,
                callRecordingOfOwnMetadataEventId,
                callRecordingOfSharedEventId,
              ],
            },
          },
        }),
        token,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.callRecordings.edges
        .map(({ node }: { node: { id: string } }) => node.id)
        .sort();
    };

    expect(await findCallRecordingIds(APPLE_PHIL_GUEST_ACCESS_TOKEN)).toEqual(
      [
        callRecordingWithoutEventId,
        callRecordingOfOwnMetadataEventId,
        callRecordingOfSharedEventId,
      ].sort(),
    );
    expect(await findCallRecordingIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual(
      [callRecordingWithoutEventId, callRecordingOfSharedEventId].sort(),
    );
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

  it('tells the front it can read some records of an object reached only through related record paths', async () => {
    const response = await findCurrentUserObjectRecordsPermissions(
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const messageThreadObjectMetadataId =
      await findObjectMetadataIdByName('messageThread');

    expect(
      response.body.data.currentUser.currentUserWorkspace.objectRecordsPermissions.find(
        ({ objectMetadataId }: { objectMetadataId: string }) =>
          objectMetadataId === messageThreadObjectMetadataId,
      ),
    ).toMatchObject({
      canReadAllRecords: false,
      canReadSomeRecords: true,
    });
  });

  // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
  it('lets an API key on a role assignable to users read each channel as a member who does not own it, until channel visibility is enforced on API keys', async () => {
    const findJonyMessagesAsApiKey = async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'message',
          objectMetadataPluralName: 'messages',
          gqlFields: 'id subject text',
          filter: {
            messageChannelMessageAssociations: {
              messageChannelId: { eq: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY },
            },
          },
        }),
        API_KEY_ACCESS_TOKEN,
      );

      return (response.body.data?.messages?.edges ?? []).map(
        ({ node }: { node: { subject: string; text: string } }) => node,
      );
    };

    await setJonyChannelVisibility('SHARE_EVERYTHING');

    const sharedMessages = await findJonyMessagesAsApiKey();

    expect(sharedMessages.length).toBeGreaterThan(0);
    expect(
      sharedMessages.some(
        ({ subject }: { subject: string }) =>
          subject === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(false);

    await setJonyChannelVisibility('METADATA');

    const metadataMessages = await findJonyMessagesAsApiKey();

    expect(metadataMessages.length).toBeGreaterThan(0);
    expect(
      metadataMessages.every(
        ({ subject, text }: { subject: string; text: string }) =>
          subject === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED &&
          text === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(true);

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_API_KEYS,
      value: true,
      expectToFail: false,
    });

    try {
      await waitForAllJobsToFinish();

      expect(await findJonyMessagesAsApiKey()).toEqual([]);
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_API_KEYS,
        value: false,
        expectToFail: false,
      });
      await waitForAllJobsToFinish();
    }
  });

  it('lets an application read each channel it does not own as a member who does not own it', async () => {
    const { applicationAccessToken } =
      await generateAppleAdminApplicationTokenPair({
        applicationId: await findWorkspaceCustomApplicationId(),
      });

    const findJonyMessagesAsApplication = async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'message',
          objectMetadataPluralName: 'messages',
          gqlFields: 'id subject text',
          filter: {
            messageChannelMessageAssociations: {
              messageChannelId: { eq: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY },
            },
          },
        }),
        applicationAccessToken.token,
      );

      return (response.body.data?.messages?.edges ?? []).map(
        ({ node }: { node: { subject: string; text: string } }) => node,
      );
    };

    await setJonyChannelVisibility('SHARE_EVERYTHING');

    const sharedMessages = await findJonyMessagesAsApplication();

    expect(sharedMessages.length).toBeGreaterThan(0);
    expect(
      sharedMessages.some(
        ({ subject, text }: { subject: string; text: string }) =>
          subject === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED ||
          text === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(false);

    await setJonyChannelVisibility('METADATA');

    const metadataMessages = await findJonyMessagesAsApplication();

    expect(metadataMessages.length).toBeGreaterThan(0);
    expect(
      metadataMessages.every(
        ({ subject, text }: { subject: string; text: string }) =>
          subject === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED &&
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
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
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
