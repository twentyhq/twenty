import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from '@/metadata/constants/standard-object-universal-identifiers.constant';
import { buildStandardObjectRecordPageLayout } from '@/metadata/utils/internal/build-standard-object-record-page-layout.util';

// Never mutate an existing universal identifier
// Deleting an existing universal identifier should be very rare
// Record-page layout universal identifiers are deterministically derived by
// buildStandardObjectRecordPageLayout (layout keyed on the object + the
// name-free RECORD_PAGE discriminator, tabs on their title within the layout,
// widgets on their title within their tab). The titles passed here MUST match
// the ones the server standard page-layout configs assign.

export const STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS = {
  myFirstDashboard: {
    universalIdentifier: '20202020-d001-4d01-8d01-da5ab0a00001',
    tabs: {
      tab1: {
        universalIdentifier: '20202020-d011-4d11-8d11-da5ab0a01001',
        widgets: {
          welcomeRichText: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11001',
          },
          dealsByCompany: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11002',
          },
          pipelineValueByStage: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11003',
          },
          revenueTimeline: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11004',
          },
          opportunitiesByOwner: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11005',
          },
          stockMarketIframe: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11006',
          },
          dealsCreatedThisMonth: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11007',
          },
          dealValueCreatedThisMonth: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11008',
          },
        },
      },
    },
  },
  companyRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          people: 'People',
          opportunities: 'Opportunities',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
      tasks: {
        title: 'Tasks',
        widgets: {
          tasks: 'Tasks',
        },
      },
      notes: {
        title: 'Notes',
        widgets: {
          notes: 'Notes',
        },
      },
      files: {
        title: 'Files',
        widgets: {
          files: 'Files',
        },
      },
      emails: {
        title: 'Emails',
        widgets: {
          emails: 'Emails',
        },
      },
      calendar: {
        title: 'Calendar',
        widgets: {
          calendar: 'Calendar',
        },
      },
    },
  }),
  personRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          company: 'Company',
          pointOfContactForOpportunities: 'Opportunities',
          listMemberships: 'Lists',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
      tasks: {
        title: 'Tasks',
        widgets: {
          tasks: 'Tasks',
        },
      },
      notes: {
        title: 'Notes',
        widgets: {
          notes: 'Notes',
        },
      },
      files: {
        title: 'Files',
        widgets: {
          files: 'Files',
        },
      },
      emails: {
        title: 'Emails',
        widgets: {
          emails: 'Emails',
        },
      },
      calendar: {
        title: 'Calendar',
        widgets: {
          calendar: 'Calendar',
        },
      },
    },
  }),
  opportunityRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          pointOfContact: 'Point of Contact',
          company: 'Company',
          owner: 'Owner',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
      tasks: {
        title: 'Tasks',
        widgets: {
          tasks: 'Tasks',
        },
      },
      notes: {
        title: 'Notes',
        widgets: {
          notes: 'Notes',
        },
      },
      files: {
        title: 'Files',
        widgets: {
          files: 'Files',
        },
      },
      emails: {
        title: 'Emails',
        widgets: {
          emails: 'Emails',
        },
      },
      calendar: {
        title: 'Calendar',
        widgets: {
          calendar: 'Calendar',
        },
      },
    },
  }),
  noteRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          noteRichText: 'Note',
        },
      },
      note: {
        title: 'Note',
        widgets: {
          noteRichText: 'Note',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
      files: {
        title: 'Files',
        widgets: {
          files: 'Files',
        },
      },
    },
  }),
  taskRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          taskRichText: 'Task',
        },
      },
      note: {
        title: 'Note',
        widgets: {
          taskRichText: 'Task',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
      files: {
        title: 'Files',
        widgets: {
          files: 'Files',
        },
      },
    },
  }),
  workflowRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflow,
    tabs: {
      flow: {
        title: 'Flow',
        widgets: {
          workflow: 'Flow',
        },
      },
    },
  }),
  workflowVersionRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowVersion,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          workflow: 'Workflow',
        },
      },
      flow: {
        title: 'Flow',
        widgets: {
          workflowVersion: 'Flow',
        },
      },
    },
  }),
  workflowRunRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowRun,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          workflow: 'Workflow',
        },
      },
      flow: {
        title: 'Flow',
        widgets: {
          workflowRun: 'Flow',
        },
      },
    },
  }),
  blocklistRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.blocklist,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
    },
  }),
  calendarChannelEventAssociationRecordPage:
    buildStandardObjectRecordPageLayout({
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarChannelEventAssociation,
      tabs: {
        home: {
          title: 'Home',
          widgets: {
            fields: 'Fields',
          },
        },
        timeline: {
          title: 'Timeline',
          widgets: {
            timeline: 'Timeline',
          },
        },
      },
    }),
  calendarEventRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          participants: 'Participants',
          callRecordings: 'Call Recordings',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
      callRecording: {
        title: 'Call Recording',
        widgets: {
          transcript: 'Transcript',
        },
      },
    },
  }),
  calendarEventParticipantRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEventParticipant,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
    },
  }),
  callRecordingRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
    },
  }),
  messageChannelMessageAssociationRecordPage:
    buildStandardObjectRecordPageLayout({
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageChannelMessageAssociation,
      tabs: {
        home: {
          title: 'Home',
          widgets: {
            fields: 'Fields',
          },
        },
        timeline: {
          title: 'Timeline',
          widgets: {
            timeline: 'Timeline',
          },
        },
      },
    }),
  messageChannelMessageAssociationMessageFolderRecordPage:
    buildStandardObjectRecordPageLayout({
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageChannelMessageAssociationMessageFolder,
      tabs: {
        home: {
          title: 'Home',
          widgets: {
            fields: 'Fields',
          },
        },
        timeline: {
          title: 'Timeline',
          widgets: {
            timeline: 'Timeline',
          },
        },
      },
    }),
  messageParticipantRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageParticipant,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
    },
  }),
  workflowAutomatedTriggerRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowAutomatedTrigger,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
        },
      },
      timeline: {
        title: 'Timeline',
        widgets: {
          timeline: 'Timeline',
        },
      },
    },
  }),
  messageThreadRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageThread,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          emailThread: 'Thread',
        },
      },
    },
  }),
  messageListRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageList,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          fields: 'Fields',
          members: 'Members',
        },
      },
    },
  }),
  messageCampaignRecordPage: buildStandardObjectRecordPageLayout({
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign,
    tabs: {
      home: {
        title: 'Home',
        widgets: {
          details: 'Details',
          list: 'List',
          recipients: 'Recipients',
          fields: 'Fields',
        },
      },
      composer: {
        title: 'Email',
        widgets: {
          messageCampaign: 'Email',
        },
      },
    },
  }),
} as const;
