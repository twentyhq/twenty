import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import {
  type CreateStandardObjectArgs,
  createStandardObjectFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/create-standard-object-flat-metadata.util';

export const STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME = {
  attachment: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'attachment'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'attachment',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
        nameSingular: 'attachment',
        namePlural: 'attachments',
        labelSingular: i18nLabel(msg`Attachment`),
        labelPlural: i18nLabel(msg`Attachments`),
        description: i18nLabel(msg`An attachment`),
        icon: 'IconFileImport',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  blocklist: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'blocklist'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'blocklist',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.blocklist.universalIdentifier,
        nameSingular: 'blocklist',
        namePlural: 'blocklists',
        labelSingular: i18nLabel(msg`Blocklist`),
        labelPlural: i18nLabel(msg`Blocklists`),
        description: i18nLabel(msg`Blocklist`),
        icon: 'IconForbid2',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  calendarChannelEventAssociation: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'calendarChannelEventAssociation'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'calendarChannelEventAssociation',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
        nameSingular: 'calendarChannelEventAssociation',
        namePlural: 'calendarChannelEventAssociations',
        labelSingular: i18nLabel(msg`Calendar Channel Event Association`),
        labelPlural: i18nLabel(msg`Calendar Channel Event Associations`),
        description: i18nLabel(msg`Calendar Channel Event Associations`),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  calendarChannel: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'calendarChannel'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'calendarChannel',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.calendarChannel.universalIdentifier,
        nameSingular: 'calendarChannel',
        namePlural: 'calendarChannels',
        labelSingular: i18nLabel(msg`Calendar Channel`),
        labelPlural: i18nLabel(msg`Calendar Channels`),
        description: i18nLabel(msg`Calendar Channels`),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  calendarEventParticipant: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'calendarEventParticipant'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'calendarEventParticipant',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.calendarEventParticipant.universalIdentifier,
        nameSingular: 'calendarEventParticipant',
        namePlural: 'calendarEventParticipants',
        labelSingular: i18nLabel(msg`Calendar event participant`),
        labelPlural: i18nLabel(msg`Calendar event participants`),
        description: i18nLabel(msg`Calendar event participants`),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  calendarEvent: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'calendarEvent'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'calendarEvent',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
        nameSingular: 'calendarEvent',
        namePlural: 'calendarEvents',
        labelSingular: i18nLabel(msg`Calendar event`),
        labelPlural: i18nLabel(msg`Calendar events`),
        description: i18nLabel(msg`Calendar events`),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  company: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'company'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'company',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
        nameSingular: 'company',
        namePlural: 'companies',
        labelSingular: i18nLabel(msg`Company`),
        labelPlural: i18nLabel(msg`Companies`),
        description: i18nLabel(msg`A company`),
        icon: 'IconBuildingSkyscraper',
        isSearchable: true,
        shortcut: 'C',
        duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  connectedAccount: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'connectedAccount'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'connectedAccount',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.connectedAccount.universalIdentifier,
        nameSingular: 'connectedAccount',
        namePlural: 'connectedAccounts',
        labelSingular: i18nLabel(msg`Connected Account`),
        labelPlural: i18nLabel(msg`Connected Accounts`),
        description: i18nLabel(msg`A connected account`),
        icon: 'IconAt',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  dashboard: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'dashboard'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'dashboard',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.dashboard.universalIdentifier,
        nameSingular: 'dashboard',
        namePlural: 'dashboards',
        labelSingular: i18nLabel(msg`Dashboard`),
        labelPlural: i18nLabel(msg`Dashboards`),
        description: i18nLabel(msg`A dashboard`),
        icon: 'IconLayoutDashboard',
        isSearchable: true,
        shortcut: 'D',
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageChannelMessageAssociation: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageChannelMessageAssociation'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
        nameSingular: 'messageChannelMessageAssociation',
        namePlural: 'messageChannelMessageAssociations',
        labelSingular: i18nLabel(msg`Message Channel Message Association`),
        labelPlural: i18nLabel(msg`Message Channel Message Associations`),
        description: i18nLabel(msg`Message Synced with a Message Channel`),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageChannel: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageChannel'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageChannel',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageChannel.universalIdentifier,
        nameSingular: 'messageChannel',
        namePlural: 'messageChannels',
        labelSingular: i18nLabel(msg`Message Channel`),
        labelPlural: i18nLabel(msg`Message Channels`),
        description: i18nLabel(msg`Message Channels`),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageFolder: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageFolder'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageFolder',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.messageFolder.universalIdentifier,
        nameSingular: 'messageFolder',
        namePlural: 'messageFolders',
        labelSingular: i18nLabel(msg`Message Folder`),
        labelPlural: i18nLabel(msg`Message Folders`),
        description: i18nLabel(msg`Message Folders`),
        icon: 'IconFolder',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageChannelMessageAssociationMessageFolder: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageChannelMessageAssociationMessageFolder'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageChannelMessageAssociationMessageFolder',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder
            .universalIdentifier,
        nameSingular: 'messageChannelMessageAssociationMessageFolder',
        namePlural: 'messageChannelMessageAssociationMessageFolders',
        labelSingular: i18nLabel(
          msg`Message Channel Message Association Message Folder`,
        ),
        labelPlural: i18nLabel(
          msg`Message Channel Message Association Message Folders`,
        ),
        description: i18nLabel(
          msg`Join table linking message channel message associations to message folders`,
        ),
        icon: 'IconFolder',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageParticipant: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageParticipant'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageParticipant',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageParticipant.universalIdentifier,
        nameSingular: 'messageParticipant',
        namePlural: 'messageParticipants',
        labelSingular: i18nLabel(msg`Message Participant`),
        labelPlural: i18nLabel(msg`Message Participants`),
        description: i18nLabel(msg`Message Participants`),
        icon: 'IconUserCircle',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'handle',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageThread: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageThread'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageThread',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
        nameSingular: 'messageThread',
        namePlural: 'messageThreads',
        labelSingular: i18nLabel(msg`Message Thread`),
        labelPlural: i18nLabel(msg`Message Threads`),
        description: i18nLabel(msg`Message Thread`),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'subject',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  message: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'message'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'message',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
        nameSingular: 'message',
        namePlural: 'messages',
        labelSingular: i18nLabel(msg`Message`),
        labelPlural: i18nLabel(msg`Messages`),
        description: i18nLabel(msg`Message`),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'subject',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  note: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'note'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'note',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
        nameSingular: 'note',
        namePlural: 'notes',
        labelSingular: i18nLabel(msg`Note`),
        labelPlural: i18nLabel(msg`Notes`),
        description: i18nLabel(msg`A note`),
        icon: 'IconNotes',
        isSearchable: true,
        shortcut: 'N',
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  noteTarget: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'noteTarget'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'noteTarget',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
        nameSingular: 'noteTarget',
        namePlural: 'noteTargets',
        labelSingular: i18nLabel(msg`Note Target`),
        labelPlural: i18nLabel(msg`Note Targets`),
        description: i18nLabel(msg`A note target`),
        icon: 'IconCheckbox',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  opportunity: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'opportunity'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'opportunity',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
        labelSingular: i18nLabel(msg`Opportunity`),
        labelPlural: i18nLabel(msg`Opportunities`),
        description: i18nLabel(msg`An opportunity`),
        icon: 'IconTargetArrow',
        isSearchable: true,
        shortcut: 'O',
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  person: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'person'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'person',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        nameSingular: 'person',
        namePlural: 'people',
        labelSingular: i18nLabel(msg`Person`),
        labelPlural: i18nLabel(msg`People`),
        description: i18nLabel(msg`A person`),
        icon: 'IconUser',
        isSearchable: true,
        shortcut: 'P',
        duplicateCriteria: [
          ['nameFirstName', 'nameLastName'],
          ['linkedinLinkPrimaryLinkUrl'],
          ['emailsPrimaryEmail'],
        ],
        labelIdentifierFieldMetadataName: 'name',
        imageIdentifierFieldMetadataName: 'avatarUrl',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  task: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'task'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'task',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
        nameSingular: 'task',
        namePlural: 'tasks',
        labelSingular: i18nLabel(msg`Task`),
        labelPlural: i18nLabel(msg`Tasks`),
        description: i18nLabel(msg`A task`),
        icon: 'IconCheckbox',
        isSearchable: true,
        shortcut: 'T',
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  taskTarget: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'taskTarget'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'taskTarget',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
        nameSingular: 'taskTarget',
        namePlural: 'taskTargets',
        labelSingular: i18nLabel(msg`Task Target`),
        labelPlural: i18nLabel(msg`Task Targets`),
        description: i18nLabel(msg`A task target`),
        icon: 'IconCheckbox',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  timelineActivity: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'timelineActivity'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'timelineActivity',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
        nameSingular: 'timelineActivity',
        namePlural: 'timelineActivities',
        labelSingular: i18nLabel(msg`Timeline Activity`),
        labelPlural: i18nLabel(msg`Timeline Activities`),
        description: i18nLabel(
          msg`Aggregated / filtered event to be displayed on the timeline`,
        ),
        icon: 'IconTimelineEvent',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  workflow: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'workflow'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflow',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
        nameSingular: 'workflow',
        namePlural: 'workflows',
        labelSingular: i18nLabel(msg`Workflow`),
        labelPlural: i18nLabel(msg`Workflows`),
        description: i18nLabel(msg`A workflow`),
        icon: 'IconSettingsAutomation',
        isSearchable: true,
        shortcut: 'W',
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  workflowAutomatedTrigger: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'workflowAutomatedTrigger'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflowAutomatedTrigger',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
        nameSingular: 'workflowAutomatedTrigger',
        namePlural: 'workflowAutomatedTriggers',
        labelSingular: i18nLabel(msg`Workflow Automated Trigger`),
        labelPlural: i18nLabel(msg`Workflow Automated Triggers`),
        description: i18nLabel(msg`A workflow automated trigger`),
        icon: 'IconSettingsAutomation',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'id',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  workflowRun: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'workflowRun'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflowRun',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
        nameSingular: 'workflowRun',
        namePlural: 'workflowRuns',
        labelSingular: i18nLabel(msg`Workflow Run`),
        labelPlural: i18nLabel(msg`Workflow Runs`),
        description: i18nLabel(msg`A workflow run`),
        icon: 'IconHistoryToggle',
        isSystem: true,
        isAuditLogged: false,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  workflowVersion: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'workflowVersion'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'workflowVersion',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        nameSingular: 'workflowVersion',
        namePlural: 'workflowVersions',
        labelSingular: i18nLabel(msg`Workflow Version`),
        labelPlural: i18nLabel(msg`Workflow Versions`),
        description: i18nLabel(msg`A workflow version`),
        icon: 'IconVersions',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  workspaceMember: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'workspaceMember'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'workspaceMember',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.workspaceMember.universalIdentifier,
        nameSingular: 'workspaceMember',
        namePlural: 'workspaceMembers',
        labelSingular: i18nLabel(msg`Workspace Member`),
        labelPlural: i18nLabel(msg`Workspace Members`),
        description: i18nLabel(msg`A workspace member`),
        icon: 'IconUserCircle',
        isSystem: true,
        isSearchable: true,
        labelIdentifierFieldMetadataName: 'name',
        imageIdentifierFieldMetadataName: 'avatarUrl',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
} satisfies {
  [P in AllStandardObjectName]: (
    args: Omit<CreateStandardObjectArgs<P>, 'context' | 'objectName'>,
  ) => FlatObjectMetadata;
};
