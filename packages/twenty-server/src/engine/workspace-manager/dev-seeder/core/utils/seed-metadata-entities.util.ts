import { type QueryRunner } from 'typeorm';

import {
  CalendarChannelVisibility,
  MessageChannelSyncStage,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-channel-data-seeds.constant';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-data-seeds.constant';
import { MESSAGE_FOLDER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-folder-data-seeds.constant';

type SeedMetadataEntitiesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedMetadataEntities = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedMetadataEntitiesArgs) => {
  if (
    workspaceId !== SEED_APPLE_WORKSPACE_ID &&
    workspaceId !== SEED_YCOMBINATOR_WORKSPACE_ID
  ) {
    return;
  }

  if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    return;
  }

  await seedConnectedAccounts({ queryRunner, schemaName, workspaceId });
  await seedMessageChannels({ queryRunner, schemaName, workspaceId });
  await seedCalendarChannels({ queryRunner, schemaName, workspaceId });
  await seedMessageFolders({ queryRunner, schemaName, workspaceId });
};

const seedConnectedAccounts = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedMetadataEntitiesArgs) => {
  const connectedAccounts = [
    {
      id: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
      handle: 'tim@apple.dev',
      provider: 'google',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      workspaceId,
    },
    {
      id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
      handle: 'jony.ive@apple.dev',
      provider: 'google',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      workspaceId,
    },
    {
      id: CONNECTED_ACCOUNT_DATA_SEED_IDS.PHIL,
      handle: 'phil.schiler@apple.dev',
      provider: 'google',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
      workspaceId,
    },
    {
      id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
      handle: 'jane.austen@apple.dev',
      provider: 'google',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceId,
    },
    {
      id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE_DELETABLE,
      handle: 'jane-deletable@apple.dev',
      provider: 'google',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceId,
    },
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.connectedAccount`, [
      'id',
      'handle',
      'provider',
      'userWorkspaceId',
      'workspaceId',
    ])
    .orIgnore()
    .values(connectedAccounts)
    .execute();
};

const seedMessageChannels = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedMetadataEntitiesArgs) => {
  const messageChannels = [
    {
      id: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
      handle: 'tim@apple.dev',
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      type: MessageChannelType.EMAIL,
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: 'SENT_AND_RECEIVED',
      messageFolderImportPolicy: 'ALL_FOLDERS',
      excludeNonProfessionalEmails: false,
      excludeGroupEmails: false,
      pendingGroupEmailsAction: 'NONE',
      isSyncEnabled: true,
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
      workspaceId,
    },
    {
      id: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
      handle: 'jony.ive@apple.dev',
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      type: MessageChannelType.EMAIL,
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: 'SENT_AND_RECEIVED',
      messageFolderImportPolicy: 'ALL_FOLDERS',
      excludeNonProfessionalEmails: false,
      excludeGroupEmails: false,
      pendingGroupEmailsAction: 'NONE',
      isSyncEnabled: true,
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
      workspaceId,
    },
    {
      id: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
      handle: 'jane.austen@apple.dev',
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      type: MessageChannelType.EMAIL,
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: 'SENT_AND_RECEIVED',
      messageFolderImportPolicy: 'ALL_FOLDERS',
      excludeNonProfessionalEmails: false,
      excludeGroupEmails: false,
      pendingGroupEmailsAction: 'NONE',
      isSyncEnabled: true,
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
      workspaceId,
    },
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.messageChannel`, [
      'id',
      'handle',
      'visibility',
      'type',
      'syncStage',
      'isContactAutoCreationEnabled',
      'contactAutoCreationPolicy',
      'messageFolderImportPolicy',
      'excludeNonProfessionalEmails',
      'excludeGroupEmails',
      'pendingGroupEmailsAction',
      'isSyncEnabled',
      'connectedAccountId',
      'workspaceId',
    ])
    .orIgnore()
    .values(messageChannels)
    .execute();
};

const seedCalendarChannels = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedMetadataEntitiesArgs) => {
  const calendarChannels = [
    {
      id: CALENDAR_CHANNEL_DATA_SEED_IDS.TIM,
      handle: 'tim@apple.dev',
      visibility: CalendarChannelVisibility.METADATA,
      syncStage: 'CALENDAR_EVENT_LIST_FETCH_PENDING',
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: 'NONE',
      isSyncEnabled: true,
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
      workspaceId,
    },
    {
      id: CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
      handle: 'jony@apple.dev',
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      syncStage: 'CALENDAR_EVENT_LIST_FETCH_PENDING',
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: 'NONE',
      isSyncEnabled: true,
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
      workspaceId,
    },
    {
      id: CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
      handle: 'jane.austen@apple.dev',
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      syncStage: 'CALENDAR_EVENT_LIST_FETCH_PENDING',
      isContactAutoCreationEnabled: true,
      contactAutoCreationPolicy: 'NONE',
      isSyncEnabled: true,
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
      workspaceId,
    },
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.calendarChannel`, [
      'id',
      'handle',
      'visibility',
      'syncStage',
      'isContactAutoCreationEnabled',
      'contactAutoCreationPolicy',
      'isSyncEnabled',
      'connectedAccountId',
      'workspaceId',
    ])
    .orIgnore()
    .values(calendarChannels)
    .execute();
};

const seedMessageFolders = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedMetadataEntitiesArgs) => {
  const messageFolders = [
    {
      id: MESSAGE_FOLDER_DATA_SEED_IDS.TIM_INBOX,
      name: 'INBOX',
      isSynced: true,
      isSentFolder: false,
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
      workspaceId,
      pendingSyncAction: MessageFolderPendingSyncAction.NONE,
    },
    {
      id: MESSAGE_FOLDER_DATA_SEED_IDS.JONY_INBOX,
      name: 'INBOX',
      isSynced: true,
      isSentFolder: false,
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
      workspaceId,
      pendingSyncAction: MessageFolderPendingSyncAction.NONE,
    },
    {
      id: MESSAGE_FOLDER_DATA_SEED_IDS.JANE_INBOX,
      name: 'INBOX',
      isSynced: true,
      isSentFolder: false,
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
      workspaceId,
      pendingSyncAction: MessageFolderPendingSyncAction.NONE,
    },
    {
      id: MESSAGE_FOLDER_DATA_SEED_IDS.JANE_SENT,
      name: 'Sent',
      isSynced: true,
      isSentFolder: true,
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
      workspaceId,
      pendingSyncAction: MessageFolderPendingSyncAction.NONE,
    },
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.messageFolder`, [
      'id',
      'name',
      'isSynced',
      'isSentFolder',
      'messageChannelId',
      'workspaceId',
      'pendingSyncAction',
    ])
    .orIgnore()
    .values(messageFolders)
    .execute();
};
