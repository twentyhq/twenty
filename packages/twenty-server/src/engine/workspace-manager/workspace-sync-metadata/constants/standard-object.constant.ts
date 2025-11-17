import {
  ATTACHMENT_STANDARD_FIELD_IDS,
  BLOCKLIST_STANDARD_FIELD_IDS,
  CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS,
  CALENDAR_CHANNEL_STANDARD_FIELD_IDS,
  CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS,
  CALENDAR_EVENT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
  CONNECTED_ACCOUNT_STANDARD_FIELD_IDS,
  DASHBOARD_STANDARD_FIELD_IDS,
  FAVORITE_FOLDER_STANDARD_FIELD_IDS,
  FAVORITE_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
  MESSAGE_FOLDER_STANDARD_FIELD_IDS,
  MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS,
  MESSAGE_STANDARD_FIELD_IDS,
  MESSAGE_THREAD_STANDARD_FIELD_IDS,
  NOTE_STANDARD_FIELD_IDS,
  NOTE_TARGET_STANDARD_FIELD_IDS,
  OPPORTUNITY_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
  TASK_TARGET_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
  VIEW_FIELD_STANDARD_FIELD_IDS,
  VIEW_FILTER_GROUP_STANDARD_FIELD_IDS,
  VIEW_FILTER_STANDARD_FIELD_IDS,
  VIEW_GROUP_STANDARD_FIELD_IDS,
  VIEW_SORT_STANDARD_FIELD_IDS,
  VIEW_STANDARD_FIELD_IDS,
  WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS,
  WORKFLOW_RUN_STANDARD_FIELD_IDS,
  WORKFLOW_STANDARD_FIELD_IDS,
  WORKFLOW_VERSION_STANDARD_FIELD_IDS,
  WORKSPACE_MEMBER_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const STANDARD_OBJECTS = {
  attachment: {
    universalIdentifier: STANDARD_OBJECT_IDS.attachment,
    fields: {
      id: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.deletedAt,
      },
      name: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.name },
      fullPath: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.fullPath },
      type: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.type },
      fileCategory: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.fileCategory,
      },
      createdBy: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.createdBy,
      },
      author: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.author },
      activity: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.activity },
      task: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.task },
      note: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.note },
      person: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.opportunity,
      },
      dashboard: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.dashboard,
      },
      workflow: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.workflow },
      custom: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.custom },
    },
    views: {},
  },
  blocklist: {
    universalIdentifier: STANDARD_OBJECT_IDS.blocklist,
    fields: {
      id: { universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.deletedAt,
      },
      handle: { universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.handle },
      workspaceMember: {
        universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.workspaceMember,
      },
    },
    views: {},
  },
  calendarChannelEventAssociation: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarChannelEventAssociation,
    fields: {
      id: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.id,
      },
      createdAt: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.deletedAt,
      },
      calendarChannel: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarChannel,
      },
      calendarEvent: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarEvent,
      },
      eventExternalId: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.eventExternalId,
      },
      recurringEventExternalId: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.recurringEventExternalId,
      },
    },
    views: {},
  },
  calendarChannel: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarChannel,
    fields: {
      id: { universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.deletedAt,
      },
      connectedAccount: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
      },
      handle: { universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle },
      visibility: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.visibility,
      },
      isContactAutoCreationEnabled: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
      },
      contactAutoCreationPolicy: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
      },
      isSyncEnabled: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
      },
      syncCursor: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
      },
      calendarChannelEventAssociations: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
      },
      throttleFailureCount: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
      },
      syncStatus: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
      },
      syncStage: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStage,
      },
      syncStageStartedAt: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
      },
      syncedAt: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
      },
    },
    views: {},
  },
  calendarEventParticipant: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarEventParticipant,
    fields: {
      id: {
        universalIdentifier: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.id,
      },
      createdAt: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.deletedAt,
      },
      calendarEvent: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.calendarEvent,
      },
      handle: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.handle,
      },
      displayName: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
      },
      isOrganizer: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.isOrganizer,
      },
      responseStatus: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.responseStatus,
      },
      person: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.person,
      },
      workspaceMember: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
      },
    },
    views: {},
  },
  calendarEvent: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarEvent,
    fields: {
      id: { universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.deletedAt,
      },
      title: { universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.title },
      isCanceled: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.isCanceled,
      },
      isFullDay: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.isFullDay,
      },
      startsAt: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.startsAt,
      },
      endsAt: { universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.endsAt },
      externalCreatedAt: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.externalCreatedAt,
      },
      externalUpdatedAt: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.externalUpdatedAt,
      },
      description: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.description,
      },
      location: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.location,
      },
      iCalUID: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.iCalUID,
      },
      conferenceSolution: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceSolution,
      },
      conferenceLink: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceLink,
      },
      calendarChannelEventAssociations: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
      },
      calendarEventParticipants: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarEventParticipants,
      },
    },
    views: {},
  },
  company: {
    universalIdentifier: STANDARD_OBJECT_IDS.company,
    fields: {
      id: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.id },
      createdAt: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.createdAt },
      updatedAt: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.updatedAt },
      deletedAt: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.deletedAt },
      name: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.name },
      domainName: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.domainName,
      },
      address: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.address },
      addressOld: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.address_deprecated,
      },
      employees: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.employees },
      linkedinLink: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.linkedinLink,
      },
      xLink: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.xLink },
      annualRecurringRevenue: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
      },
      idealCustomerProfile: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.idealCustomerProfile,
      },
      position: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.position },
      createdBy: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.createdBy },
      people: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.people },
      accountOwner: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.accountOwner,
      },
      taskTargets: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.taskTargets,
      },
      noteTargets: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.noteTargets,
      },
      opportunities: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.opportunities,
      },
      favorites: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.favorites },
      attachments: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.attachments,
      },
      timelineActivities: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allCompanies: {
        universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c0001',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf001',
          },
          domainName: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf002',
          },
          createdBy: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf003',
          },
          accountOwner: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf004',
          },
          createdAt: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf005',
          },
          employees: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf006',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf007',
          },
          address: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf008',
          },
        },
      },
    },
  },
  connectedAccount: {
    universalIdentifier: STANDARD_OBJECT_IDS.connectedAccount,
    fields: {
      id: { universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.deletedAt,
      },
      handle: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
      },
      provider: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.provider,
      },
      accessToken: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accessToken,
      },
      refreshToken: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.refreshToken,
      },
      accountOwner: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accountOwner,
      },
      lastSyncHistoryId: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastSyncHistoryId,
      },
      authFailedAt: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.authFailedAt,
      },
      lastCredentialsRefreshedAt: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastCredentialsRefreshedAt,
      },
      messageChannels: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.messageChannels,
      },
      calendarChannels: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.calendarChannels,
      },
      handleAliases: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handleAliases,
      },
      scopes: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.scopes,
      },
      connectionParameters: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.connectionParameters,
      },
    },
    views: {},
  },
  dashboard: {
    universalIdentifier: STANDARD_OBJECT_IDS.dashboard,
    fields: {
      id: { universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.deletedAt,
      },
      title: { universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.title },
      position: { universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.position },
      pageLayoutId: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.pageLayoutId,
      },
      createdBy: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.createdBy,
      },
      timelineActivities: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.timelineActivities,
      },
      favorites: { universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.favorites },
      attachments: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.attachments,
      },
      searchVector: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allDashboards: {
        universalIdentifier: '20202020-a012-4a12-8a12-da5ab0ard0001',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0ardf001',
          },
          createdBy: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0ardf002',
          },
          createdAt: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0ardf003',
          },
          updatedAt: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0ardf004',
          },
        },
      },
    },
  },
  favorite: {
    universalIdentifier: STANDARD_OBJECT_IDS.favorite,
    fields: {
      id: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.deletedAt,
      },
      position: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.position },
      forWorkspaceMember: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.forWorkspaceMember,
      },
      person: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.opportunity,
      },
      workflow: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflow },
      workflowVersion: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflowVersion,
      },
      workflowRun: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflowRun,
      },
      task: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.task },
      note: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.note },
      view: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.view },
      custom: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.custom },
      favoriteFolder: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.favoriteFolder,
      },
      dashboard: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.dashboard },
    },
    views: {},
  },
  favoriteFolder: {
    universalIdentifier: STANDARD_OBJECT_IDS.favoriteFolder,
    fields: {
      id: { universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.deletedAt,
      },
      position: {
        universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.position,
      },
      name: { universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.name },
      favorites: {
        universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.favorites,
      },
    },
    views: {},
  },
  messageChannelMessageAssociation: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageChannelMessageAssociation,
    fields: {
      id: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.id,
      },
      createdAt: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.deletedAt,
      },
      messageChannel: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageChannel,
      },
      message: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.message,
      },
      messageExternalId: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageExternalId,
      },
      messageThread: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThread,
      },
      messageThreadExternalId: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThreadExternalId,
      },
    },
    views: {},
  },
  messageChannel: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageChannel,
    fields: {
      id: { universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.deletedAt,
      },
      visibility: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.visibility,
      },
      handle: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
      },
      connectedAccount: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
      },
      type: { universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.type },
      isContactAutoCreationEnabled: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
      },
      contactAutoCreationPolicy: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
      },
      excludeNonProfessionalEmails: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeNonProfessionalEmails,
      },
      excludeGroupEmails: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeGroupEmails,
      },
      messageChannelMessageAssociations: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
      },
      messageFolders: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageFolders,
      },
      messageFolderImportPolicy: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageFolderImportPolicy,
      },
      pendingGroupEmailsAction: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.pendingGroupEmailsAction,
      },
      isSyncEnabled: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
      },
      syncCursor: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
      },
      syncedAt: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
      },
      syncStatus: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
      },
      syncStage: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStage,
      },
      syncStageStartedAt: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
      },
      throttleFailureCount: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
      },
    },
    views: {},
  },
  messageFolder: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageFolder,
    fields: {
      id: { universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.deletedAt,
      },
      name: { universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.name },
      parentFolderId: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.parentFolderId,
      },
      messageChannel: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.messageChannel,
      },
      syncCursor: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.syncCursor,
      },
      isSentFolder: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSentFolder,
      },
      isSynced: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSynced,
      },
      externalId: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.externalId,
      },
      pendingSyncAction: {
        universalIdentifier:
          MESSAGE_FOLDER_STANDARD_FIELD_IDS.pendingSyncAction,
      },
    },
    views: {},
  },
  messageParticipant: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageParticipant,
    fields: {
      id: { universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.deletedAt,
      },
      message: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.message,
      },
      role: { universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.role },
      handle: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.handle,
      },
      displayName: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
      },
      person: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.person,
      },
      workspaceMember: {
        universalIdentifier:
          MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
      },
    },
    views: {},
  },
  messageThread: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageThread,
    fields: {
      id: { universalIdentifier: MESSAGE_THREAD_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: MESSAGE_THREAD_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: MESSAGE_THREAD_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: MESSAGE_THREAD_STANDARD_FIELD_IDS.deletedAt,
      },
      messages: {
        universalIdentifier: MESSAGE_THREAD_STANDARD_FIELD_IDS.messages,
      },
      messageChannelMessageAssociations: {
        universalIdentifier:
          MESSAGE_THREAD_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
      },
      messageThreadSubscribers: {
        universalIdentifier:
          MESSAGE_THREAD_STANDARD_FIELD_IDS.messageThreadSubscribers,
      },
    },
    views: {},
  },
  message: {
    universalIdentifier: STANDARD_OBJECT_IDS.message,
    fields: {
      id: { universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.deletedAt,
      },
      headerMessageId: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.headerMessageId,
      },
      messageThread: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.messageThread,
      },
      direction: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.direction,
      },
      subject: { universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.subject },
      text: { universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.text },
      receivedAt: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.receivedAt,
      },
      messageParticipants: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.messageParticipants,
      },
      messageChannelMessageAssociations: {
        universalIdentifier:
          MESSAGE_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
      },
    },
    views: {},
  },
  note: {
    universalIdentifier: STANDARD_OBJECT_IDS.note,
    fields: {
      id: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.id },
      createdAt: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.createdAt },
      updatedAt: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.updatedAt },
      deletedAt: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.deletedAt },
      position: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.position },
      title: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.title },
      body: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.body },
      bodyV2: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.bodyV2 },
      createdBy: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.createdBy },
      noteTargets: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.noteTargets },
      attachments: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.attachments },
      timelineActivities: {
        universalIdentifier: NOTE_STANDARD_FIELD_IDS.timelineActivities,
      },
      favorites: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.favorites },
      searchVector: {
        universalIdentifier: NOTE_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allNotes: {
        universalIdentifier: '20202020-a005-4a05-8a05-a0be5a11a0001',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af001',
          },
          noteTargets: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af002',
          },
          bodyV2: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af003',
          },
          createdBy: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af004',
          },
          createdAt: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af005',
          },
        },
      },
    },
  },
  noteTarget: {
    universalIdentifier: STANDARD_OBJECT_IDS.noteTarget,
    fields: {
      id: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.deletedAt,
      },
      note: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.note },
      person: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.opportunity,
      },
      custom: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.custom },
    },
    views: {},
  },
  opportunity: {
    universalIdentifier: STANDARD_OBJECT_IDS.opportunity,
    fields: {
      id: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.deletedAt,
      },
      name: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.name },
      amount: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.amount },
      closeDate: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
      },
      stage: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.stage },
      position: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.position },
      createdBy: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
      },
      pointOfContact: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
      },
      company: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.company },
      favorites: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.favorites,
      },
      taskTargets: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.taskTargets,
      },
      noteTargets: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.noteTargets,
      },
      attachments: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.attachments,
      },
      timelineActivities: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allOpportunities: {
        universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca1ba01',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf1',
          },
          amount: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf2',
          },
          createdBy: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf3',
          },
          closeDate: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf4',
          },
          company: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf5',
          },
          pointOfContact: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf6',
          },
        },
      },
      byStage: {
        universalIdentifier: '20202020-a004-4a04-8a04-0aa0b1ca1ba02',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf1',
          },
          amount: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf2',
          },
          createdBy: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf3',
          },
          closeDate: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf4',
          },
          company: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf5',
          },
          pointOfContact: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf6',
          },
        },
        viewGroups: {
          new: {
            universalIdentifier: '20202020-ag04-4a04-8a04-0aa0b2ca2bag1',
          },
          screening: {
            universalIdentifier: '20202020-ag04-4a04-8a04-0aa0b2ca2bag2',
          },
          meeting: {
            universalIdentifier: '20202020-ag04-4a04-8a04-0aa0b2ca2bag3',
          },
          proposal: {
            universalIdentifier: '20202020-ag04-4a04-8a04-0aa0b2ca2bag4',
          },
          customer: {
            universalIdentifier: '20202020-ag04-4a04-8a04-0aa0b2ca2bag5',
          },
        },
      },
    },
  },
  person: {
    universalIdentifier: STANDARD_OBJECT_IDS.person,
    fields: {
      id: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.id },
      createdAt: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.createdAt },
      updatedAt: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.updatedAt },
      deletedAt: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.deletedAt },
      name: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.name },
      email: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.email },
      emails: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.emails },
      linkedinLink: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.linkedinLink,
      },
      xLink: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.xLink },
      jobTitle: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.jobTitle },
      phone: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.phone },
      phones: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.phones },
      city: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.city },
      avatarUrl: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.avatarUrl },
      position: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.position },
      createdBy: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.createdBy },
      company: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.company },
      pointOfContactForOpportunities: {
        universalIdentifier:
          PERSON_STANDARD_FIELD_IDS.pointOfContactForOpportunities,
      },
      taskTargets: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.taskTargets,
      },
      noteTargets: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.noteTargets,
      },
      favorites: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.favorites },
      attachments: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.attachments,
      },
      messageParticipants: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.messageParticipants,
      },
      calendarEventParticipants: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.calendarEventParticipants,
      },
      timelineActivities: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allPeople: {
        universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea11a001',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af01',
          },
          emails: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af02',
          },
          createdBy: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af03',
          },
          company: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af04',
          },
          phones: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af05',
          },
          createdAt: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af06',
          },
          city: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af07',
          },
          jobTitle: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af08',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af09',
          },
          xLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af10',
          },
        },
      },
    },
  },
  task: {
    universalIdentifier: STANDARD_OBJECT_IDS.task,
    fields: {
      id: { universalIdentifier: TASK_STANDARD_FIELD_IDS.id },
      createdAt: { universalIdentifier: TASK_STANDARD_FIELD_IDS.createdAt },
      updatedAt: { universalIdentifier: TASK_STANDARD_FIELD_IDS.updatedAt },
      deletedAt: { universalIdentifier: TASK_STANDARD_FIELD_IDS.deletedAt },
      position: { universalIdentifier: TASK_STANDARD_FIELD_IDS.position },
      title: { universalIdentifier: TASK_STANDARD_FIELD_IDS.title },
      body: { universalIdentifier: TASK_STANDARD_FIELD_IDS.body },
      bodyV2: { universalIdentifier: TASK_STANDARD_FIELD_IDS.bodyV2 },
      dueAt: { universalIdentifier: TASK_STANDARD_FIELD_IDS.dueAt },
      status: { universalIdentifier: TASK_STANDARD_FIELD_IDS.status },
      createdBy: { universalIdentifier: TASK_STANDARD_FIELD_IDS.createdBy },
      taskTargets: { universalIdentifier: TASK_STANDARD_FIELD_IDS.taskTargets },
      attachments: { universalIdentifier: TASK_STANDARD_FIELD_IDS.attachments },
      assignee: { universalIdentifier: TASK_STANDARD_FIELD_IDS.assignee },
      timelineActivities: {
        universalIdentifier: TASK_STANDARD_FIELD_IDS.timelineActivities,
      },
      favorites: { universalIdentifier: TASK_STANDARD_FIELD_IDS.favorites },
      searchVector: {
        universalIdentifier: TASK_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allTasks: {
        universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a1ea01',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf1',
          },
          status: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf2',
          },
          taskTargets: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf3',
          },
          createdBy: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf4',
          },
          dueAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf5',
          },
          assignee: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf6',
          },
          bodyV2: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf7',
          },
          createdAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf8',
          },
        },
      },
      assignedToMe: {
        universalIdentifier: '20202020-a007-4a07-8a07-ba5ca551aaed1',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaedf1',
          },
          taskTargets: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaedf2',
          },
          createdBy: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaedf3',
          },
          dueAt: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaedf4',
          },
          assignee: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaedf5',
          },
          bodyV2: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaedf6',
          },
          createdAt: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaedf7',
          },
        },
        viewFilters: {
          assigneeIsMe: {
            universalIdentifier: '20202020-afl7-4a07-8a07-ba5ca551aaef1',
          },
        },
        viewGroups: {
          todo: {
            universalIdentifier: '20202020-ag07-4a07-8a07-ba5ca551aaeg1',
          },
          inProgress: {
            universalIdentifier: '20202020-ag07-4a07-8a07-ba5ca551aaeg2',
          },
          done: {
            universalIdentifier: '20202020-ag07-4a07-8a07-ba5ca551aaeg3',
          },
          empty: {
            universalIdentifier: '20202020-ag07-4a07-8a07-ba5ca551aaeg4',
          },
        },
      },
      byStatus: {
        universalIdentifier: '20202020-a008-4a08-8a08-ba5cba51aba51',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf01',
          },
          status: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf02',
          },
          dueAt: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf03',
          },
          assignee: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf04',
          },
          createdAt: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf05',
          },
        },
        viewGroups: {
          todo: {
            universalIdentifier: '20202020-ag08-4a08-8a08-ba5cba5babg01',
          },
          inProgress: {
            universalIdentifier: '20202020-ag08-4a08-8a08-ba5cba5babg02',
          },
          done: {
            universalIdentifier: '20202020-ag08-4a08-8a08-ba5cba5babg03',
          },
        },
      },
    },
  },
  taskTarget: {
    universalIdentifier: STANDARD_OBJECT_IDS.taskTarget,
    fields: {
      id: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.deletedAt,
      },
      task: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.task },
      person: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.opportunity,
      },
      custom: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.custom },
    },
    views: {},
  },
  timelineActivity: {
    universalIdentifier: STANDARD_OBJECT_IDS.timelineActivity,
    fields: {
      id: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.deletedAt,
      },
      happensAt: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.happensAt,
      },
      type: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.type },
      name: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.name },
      properties: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.properties,
      },
      workspaceMember: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workspaceMember,
      },
      person: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.person,
      },
      company: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.company,
      },
      opportunity: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.opportunity,
      },
      task: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.task },
      note: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.note },
      workflow: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflow,
      },
      workflowVersion: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflowVersion,
      },
      workflowRun: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflowRun,
      },
      dashboard: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.dashboard,
      },
      custom: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.custom,
      },
      linkedRecordCachedName: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordCachedName,
      },
      linkedRecordId: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordId,
      },
      linkedObjectMetadataId: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedObjectMetadataId,
      },
    },
    views: {},
  },
  view: {
    universalIdentifier: STANDARD_OBJECT_IDS.view,
    fields: {
      name: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.name },
      objectMetadataId: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.objectMetadataId,
      },
      type: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.type },
      key: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.key },
      icon: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.icon },
      kanbanFieldMetadataId: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.kanbanFieldMetadataId,
      },
      kanbanAggregateOperation: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperation,
      },
      kanbanAggregateOperationFieldMetadataId: {
        universalIdentifier:
          VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperationFieldMetadataId,
      },
      position: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.position },
      isCompact: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.isCompact },
      openRecordIn: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.openRecordIn,
      },
      viewFields: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewFields },
      viewGroups: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewGroups },
      viewFilters: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewFilters },
      viewFilterGroups: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewFilterGroups,
      },
      viewSorts: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewSorts },
      favorites: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.favorites },
      anyFieldFilterValue: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.anyFieldFilterValue,
      },
    },
    views: {},
  },
  viewField: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewField,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      isVisible: {
        universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.isVisible,
      },
      size: { universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.size },
      position: { universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.position },
      view: { universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.view },
      aggregateOperation: {
        universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.aggregateOperation,
      },
    },
    views: {},
  },
  viewFilter: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewFilter,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      operand: { universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.operand },
      value: { universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.value },
      displayValue: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.displayValue,
      },
      view: { universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.view },
      viewFilterGroupId: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.viewFilterGroupId,
      },
      positionInViewFilterGroup: {
        universalIdentifier:
          VIEW_FILTER_STANDARD_FIELD_IDS.positionInViewFilterGroup,
      },
      subFieldName: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.subFieldName,
      },
    },
    views: {},
  },
  viewFilterGroup: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewFilterGroup,
    fields: {
      view: { universalIdentifier: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.view },
      parentViewFilterGroupId: {
        universalIdentifier:
          VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.parentViewFilterGroupId,
      },
      logicalOperator: {
        universalIdentifier:
          VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.logicalOperator,
      },
      positionInViewFilterGroup: {
        universalIdentifier:
          VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.positionInViewFilterGroup,
      },
    },
    views: {},
  },
  viewGroup: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewGroup,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      fieldValue: {
        universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.fieldValue,
      },
      isVisible: {
        universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.isVisible,
      },
      position: { universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.position },
      view: { universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.view },
    },
    views: {},
  },
  viewSort: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewSort,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_SORT_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      direction: {
        universalIdentifier: VIEW_SORT_STANDARD_FIELD_IDS.direction,
      },
      view: { universalIdentifier: VIEW_SORT_STANDARD_FIELD_IDS.view },
    },
    views: {},
  },
  workflow: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflow,
    fields: {
      id: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.deletedAt,
      },
      name: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.name },
      lastPublishedVersionId: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.lastPublishedVersionId,
      },
      statuses: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.statuses },
      position: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.position },
      versions: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.versions },
      runs: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.runs },
      eventListeners: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.eventListeners,
      },
      automatedTriggers: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.automatedTriggers,
      },
      favorites: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.favorites },
      timelineActivities: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.timelineActivities,
      },
      attachments: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.attachments,
      },
      createdBy: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.createdBy },
      searchVector: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allWorkflows: {
        universalIdentifier: '20202020-a009-4a09-8a09-a0bcf10aa11a1',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11af1',
          },
          statuses: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11af2',
          },
          updatedAt: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11af3',
          },
          createdBy: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11af4',
          },
          versions: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11af5',
          },
          runs: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11af6',
          },
        },
      },
    },
  },
  workflowAutomatedTrigger: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflowAutomatedTrigger,
    fields: {
      id: {
        universalIdentifier: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.id,
      },
      createdAt: {
        universalIdentifier:
          WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier:
          WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier:
          WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.deletedAt,
      },
      type: {
        universalIdentifier: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.type,
      },
      settings: {
        universalIdentifier:
          WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.settings,
      },
      workflow: {
        universalIdentifier:
          WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.workflow,
      },
    },
    views: {},
  },
  workflowRun: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflowRun,
    fields: {
      id: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.deletedAt,
      },
      name: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.name },
      workflowVersion: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflowVersion,
      },
      workflow: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflow },
      enqueuedAt: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.enqueuedAt,
      },
      startedAt: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.startedAt,
      },
      endedAt: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.endedAt },
      status: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.status },
      position: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.position },
      createdBy: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.createdBy,
      },
      output: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.output },
      context: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.context },
      state: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.state },
      favorites: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.favorites,
      },
      timelineActivities: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allWorkflowRuns: {
        universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abca51',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf1',
          },
          workflow: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf2',
          },
          status: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf3',
          },
          startedAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf4',
          },
          createdBy: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf5',
          },
          workflowVersion: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf6',
          },
        },
      },
    },
  },
  workflowVersion: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflowVersion,
    fields: {
      id: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.deletedAt,
      },
      name: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name },
      workflow: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.workflow,
      },
      trigger: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.trigger,
      },
      status: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.status },
      position: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.position,
      },
      runs: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.runs },
      steps: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.steps },
      favorites: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.favorites,
      },
      timelineActivities: {
        universalIdentifier:
          WORKFLOW_VERSION_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allWorkflowVersions: {
        universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aae151',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeaf1',
          },
          workflow: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeaf2',
          },
          status: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeaf3',
          },
          updatedAt: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeaf4',
          },
          runs: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeaf5',
          },
        },
      },
    },
  },
  workspaceMember: {
    universalIdentifier: STANDARD_OBJECT_IDS.workspaceMember,
    fields: {
      id: { universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.id },
      createdAt: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.createdAt,
      },
      updatedAt: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.updatedAt,
      },
      deletedAt: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.deletedAt,
      },
      position: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.position,
      },
      name: { universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name },
      colorScheme: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.colorScheme,
      },
      locale: { universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.locale },
      avatarUrl: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
      },
      userEmail: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userEmail,
      },
      userId: { universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userId },
      authoredActivities: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredActivities,
      },
      assignedActivities: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedActivities,
      },
      assignedTasks: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedTasks,
      },
      favorites: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.favorites,
      },
      accountOwnerForCompanies: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.accountOwnerForCompanies,
      },
      authoredAttachments: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredAttachments,
      },
      authoredComments: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredComments,
      },
      connectedAccounts: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.connectedAccounts,
      },
      messageParticipants: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageParticipants,
      },
      blocklist: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.blocklist,
      },
      calendarEventParticipants: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarEventParticipants,
      },
      timelineActivities: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timelineActivities,
      },
      auditLogs: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.auditLogs,
      },
      messageThreadSubscribers: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageThreadSubscribers,
      },
      timeZone: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeZone,
      },
      dateFormat: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.dateFormat,
      },
      timeFormat: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeFormat,
      },
      searchVector: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.searchVector,
      },
      calendarStartDay: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarStartDay,
      },
      numberFormat: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.numberFormat,
      },
    },
    views: {},
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
    fields: Record<string, { universalIdentifier: string }>;
    views: Record<
      string,
      {
        universalIdentifier: string;
        viewFields: Record<string, { universalIdentifier: string }>;
        viewFilters?: Record<string, { universalIdentifier: string }>;
        viewGroups?: Record<string, { universalIdentifier: string }>;
      }
    >;
  }
>;
