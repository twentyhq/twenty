import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ObjectOpenRecordIn } from 'twenty-shared/types';

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
        labelSingular: i18nLabel(
          msg({
            message: `Attachment`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Attachments`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `An attachment`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconFileImport',
        isSystem: true,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Blocklist`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Blocklists`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({ message: `Blocklist`, context: 'objectMetadata.description' }),
        ),
        icon: 'IconForbid2',
        isSystem: true,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Calendar Channel Event Association`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Calendar Channel Event Associations`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Calendar Channel Event Associations`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'id',
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
        labelSingular: i18nLabel(
          msg({
            message: `Calendar event participant`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Calendar event participants`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Calendar event participants`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
        openRecordIn: ObjectOpenRecordIn.SIDE_PANEL,
        namePlural: 'calendarEvents',
        labelSingular: i18nLabel(
          msg({
            message: `Calendar event`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Calendar events`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Calendar events`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'title',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  callRecording: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'callRecording'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'callRecording',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
        nameSingular: 'callRecording',
        namePlural: 'callRecordings',
        labelSingular: i18nLabel(
          msg({
            message: `Call Recording`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Call Recordings`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A recording of a meeting`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconVideo',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({ message: `Company`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Companies`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({ message: `A company`, context: 'objectMetadata.description' }),
        ),
        icon: 'IconBuildingSkyscraper',
        isSearchable: true,
        shortcut: 'C',
        duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
        labelIdentifierFieldMetadataName: 'name',
        imageIdentifierFieldMetadataName: 'domainName',
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
        openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
        namePlural: 'dashboards',
        labelSingular: i18nLabel(
          msg({
            message: `Dashboard`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Dashboards`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({
            message: `A dashboard`,
            context: 'objectMetadata.description',
          }),
        ),
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
  messageCampaign: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageCampaign'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageCampaign',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageCampaign.universalIdentifier,
        nameSingular: 'messageCampaign',
        openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
        namePlural: 'messageCampaigns',
        labelSingular: i18nLabel(
          msg({ message: `Campaign`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Campaigns`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({
            message: `A bulk email send to an audience, with delivery stats`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconSend',
        isSystem: true,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageList: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<CreateStandardObjectArgs<'messageList'>, 'context' | 'objectName'>) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageList',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier: STANDARD_OBJECTS.messageList.universalIdentifier,
        nameSingular: 'messageList',
        namePlural: 'messageLists',
        labelSingular: i18nLabel(
          msg({ message: `List`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Lists`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({
            message: `A hand-picked audience of people`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconUsersGroup',
        isSystem: true,
        isSearchable: true,
        labelIdentifierFieldMetadataName: 'name',
      },
      workspaceId,
      standardObjectMetadataRelatedEntityIds,
      twentyStandardApplicationId,
      now,
    }),
  messageListMember: ({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps,
  }: Omit<
    CreateStandardObjectArgs<'messageListMember'>,
    'context' | 'objectName'
  >) =>
    createStandardObjectFlatMetadata({
      objectName: 'messageListMember',
      dependencyFlatEntityMaps,
      context: {
        universalIdentifier:
          STANDARD_OBJECTS.messageListMember.universalIdentifier,
        nameSingular: 'messageListMember',
        namePlural: 'messageListMembers',
        labelSingular: i18nLabel(
          msg({
            message: `List Member`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `List Members`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A person's membership in a list`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconUser',
        isSystem: true,
        labelIdentifierFieldMetadataName: 'id',
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
        labelSingular: i18nLabel(
          msg({
            message: `Message Channel Message Association`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Message Channel Message Associations`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Message Synced with a Message Channel`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
          msg({
            message: `Message Channel Message Association Message Folder`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Message Channel Message Association Message Folders`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Join table linking message channel message associations to message folders`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconFolder',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Message Participant`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Message Participants`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Message Participants`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconUserCircle',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Message Thread`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Message Threads`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Message Thread`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({ message: `Message`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Messages`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({ message: `Message`, context: 'objectMetadata.description' }),
        ),
        icon: 'IconMessage',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({ message: `Note`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Notes`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({ message: `A note`, context: 'objectMetadata.description' }),
        ),
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
        labelSingular: i18nLabel(
          msg({
            message: `Note Target`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Note Targets`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A note target`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconCheckbox',
        isSystem: true,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Opportunity`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Opportunities`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `An opportunity`,
            context: 'objectMetadata.description',
          }),
        ),
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
        labelSingular: i18nLabel(
          msg({ message: `Person`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `People`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({ message: `A person`, context: 'objectMetadata.description' }),
        ),
        icon: 'IconUser',
        isSearchable: true,
        shortcut: 'P',
        duplicateCriteria: [
          ['nameFirstName', 'nameLastName'],
          ['linkedinLinkPrimaryLinkUrl'],
          ['emailsPrimaryEmail'],
        ],
        labelIdentifierFieldMetadataName: 'name',
        imageIdentifierFieldMetadataName: 'avatarFile',
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
        labelSingular: i18nLabel(
          msg({ message: `Task`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Tasks`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({ message: `A task`, context: 'objectMetadata.description' }),
        ),
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
        labelSingular: i18nLabel(
          msg({
            message: `Task Target`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Task Targets`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A task target`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconCheckbox',
        isSystem: true,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Timeline Activity`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Timeline Activities`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `Aggregated / filtered event to be displayed on the timeline`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconTimelineEvent',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
        labelIdentifierFieldMetadataName: 'linkedRecordCachedName',
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
        openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
        namePlural: 'workflows',
        labelSingular: i18nLabel(
          msg({ message: `Workflow`, context: 'objectMetadata.labelSingular' }),
        ),
        labelPlural: i18nLabel(
          msg({ message: `Workflows`, context: 'objectMetadata.labelPlural' }),
        ),
        description: i18nLabel(
          msg({ message: `A workflow`, context: 'objectMetadata.description' }),
        ),
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
        labelSingular: i18nLabel(
          msg({
            message: `Workflow Automated Trigger`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Workflow Automated Triggers`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A workflow automated trigger`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconSettingsAutomation',
        isSystem: true,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Workflow Run`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Workflow Runs`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A workflow run`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconHistoryToggle',
        isSystem: true,
        isAuditLogged: false,
        isUICreatable: false,
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
        openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
        namePlural: 'workflowVersions',
        labelSingular: i18nLabel(
          msg({
            message: `Workflow Version`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Workflow Versions`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A workflow version`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconVersions',
        isSystem: true,
        isUICreatable: false,
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
        labelSingular: i18nLabel(
          msg({
            message: `Workspace Member`,
            context: 'objectMetadata.labelSingular',
          }),
        ),
        labelPlural: i18nLabel(
          msg({
            message: `Workspace Members`,
            context: 'objectMetadata.labelPlural',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `A workspace member`,
            context: 'objectMetadata.description',
          }),
        ),
        icon: 'IconUserCircle',
        isSystem: true,
        isSearchable: true,
        isUICreatable: false,
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
