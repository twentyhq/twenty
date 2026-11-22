import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findCurrentUserObjectRecordsPermissions } from 'test/integration/permissions/channel-visibility/utils/find-current-user-object-records-permissions.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { updateMessageChannelVisibility } from 'test/integration/permissions/channel-visibility/utils/update-message-channel-visibility.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { syncChannelVisibilityRules } from 'test/integration/permissions/channel-visibility/utils/sync-channel-visibility-rules.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type RevokeRoleWideAccessToChannelObjectsCommand } from 'src/engine/permissions/channel-visibility/commands/revoke-role-wide-access-to-channel-objects.command';
import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const FLAGS = [
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
  FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
];

const revokeRoleWideAccessToChannelObjects = () =>
  getAppProviderByClassName<RevokeRoleWideAccessToChannelObjectsCommand>(
    'RevokeRoleWideAccessToChannelObjectsCommand',
  ).runOnWorkspace({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    options: {},
    index: 0,
    total: 1,
  });

const restoreRoleWideAccessToChannelObjects = async () => {
  await global.testDataSource.query(
    `DELETE FROM core."objectPermission" "objectPermission"
      USING core."objectMetadata" "objectMetadata"
      WHERE "objectMetadata".id = "objectPermission"."objectMetadataId"
        AND "objectPermission"."workspaceId" = $1
        AND "objectMetadata"."universalIdentifier" = ANY($2)`,
    [
      SEED_APPLE_WORKSPACE_ID,
      [
        STANDARD_OBJECTS.message.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.universalIdentifier,
        ...CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS,
        STANDARD_OBJECTS.attachment.universalIdentifier,
      ],
    ],
  );
  await global.testDataSource.query(
    `DELETE FROM core."rowLevelPermissionRule" "rule"
      USING core."objectMetadata" "objectMetadata", core."role" "role"
      WHERE "objectMetadata".id = "rule"."objectMetadataId"
        AND "role".id = "rule"."roleId"
        AND "role"."canBeAssignedToUsers"
        AND "rule"."workspaceId" = $1
        AND "objectMetadata"."universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, STANDARD_OBJECTS.attachment.universalIdentifier],
  );
  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatObjectPermissionMaps',
    'flatRowLevelPermissionRuleMaps',
    'flatRowLevelPermissionPredicateGroupMaps',
    'flatRowLevelPermissionPredicateMaps',
    'rolesPermissions',
  ]);
};

const createAttachment = async (
  data: Record<string, unknown>,
): Promise<string> => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createAttachment.id;
};

const destroyAttachment = async (attachmentId: string) => {
  const response = await makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: 'id',
      recordId: attachmentId,
    }),
  );

  expect(response.body.errors).toBeUndefined();
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
  let companyAttachmentId: string;
  let messageAttachmentId: string;

  beforeAll(async () => {
    const [jonyMessage] = await findMessagesOfChannel({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    companyAttachmentId = await createAttachment({
      name: 'Company attachment',
      targetCompanyId: COMPANY_DATA_SEED_IDS.ID_1,
    });
    messageAttachmentId = await createAttachment({
      name: 'Message attachment',
      targetMessageId: jonyMessage.id,
    });

    for (const featureFlag of FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: true,
        expectToFail: false,
      });
    }
    await syncChannelVisibilityRules();
    await revokeRoleWideAccessToChannelObjects();
    await waitForAllJobsToFinish();
  });

  afterAll(async () => {
    await restoreRoleWideAccessToChannelObjects();
    await destroyAttachment(companyAttachmentId);
    await destroyAttachment(messageAttachmentId);
    await setJonyChannelVisibility('SHARE_EVERYTHING');

    for (const featureFlag of [...FLAGS].reverse()) {
      await updateFeatureFlag({
        featureFlag,
        value: false,
        expectToFail: false,
      });
    }
    await syncChannelVisibilityRules();
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
