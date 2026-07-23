import { STANDARD_OBJECT_FIELDS } from '@/metadata/constants/standard-object-fields.constant';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from '@/metadata/constants/standard-object-universal-identifiers.constant';
import { buildStandardObjectIndexView } from '@/metadata/utils/internal/build-standard-object-index-view.util';

// Important notice:
// - Never ever mutate an existing universal identifier
// - Deleting an existing universal identifier should be very rare
// - Field universal identifiers live in STANDARD_OBJECT_FIELDS (see
//   standard-object-fields.constant.ts), so both an object's `fields` and its
//   INDEX view can read the same values.
// - INDEX view universal identifiers (the "All {objectLabelPlural}" table view
//   keyed on ViewKey.INDEX) and their view-field universal identifiers are
//   deterministically derived by buildStandardObjectIndexView
//   (getSystemViewUniversalIdentifier for the view,
//   getViewFieldUniversalIdentifier for each view field).
export const STANDARD_OBJECTS = {
  attachment: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
    fields: STANDARD_OBJECT_FIELDS.attachment,
    morphIds: {
      targetMorphId: { morphId: '20202020-f634-435d-ab8d-e1168b375c69' },
    },
    indexes: {
      taskIdIndex: {
        universalIdentifier: 'b8d4f9a3-0c25-4e7b-9f6a-2d3e4c5b6f70',
      },
      noteIdIndex: {
        universalIdentifier: '9d31ea73-13b6-4e06-84ee-c66c72bf7787',
      },
      personIdIndex: {
        universalIdentifier: '55637a5a-1edc-4351-8d76-d40020bf8944',
      },
      companyIdIndex: {
        universalIdentifier: '4137ba06-184d-438f-b484-080f02a97659',
      },
      opportunityIdIndex: {
        universalIdentifier: '8cc162d1-c127-4981-878d-f78622f8f12d',
      },
      dashboardIdIndex: {
        universalIdentifier: 'c10eba2d-ff1a-4eab-9285-50481c12a003',
      },
      workflowIdIndex: {
        universalIdentifier: 'fadeab4b-79ee-4173-af79-72c51fbad888',
      },
    },
    views: {
      allAttachments: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
        fields: STANDARD_OBJECT_FIELDS.attachment,
        derivedViewFieldNames: [
          'name',
          'file',
          'createdBy',
          'createdAt',
          'targetPerson',
          'targetCompany',
          'targetOpportunity',
          'targetTask',
          'targetNote',
          'targetDashboard',
          'targetWorkflow',
        ],
      }),
    },
  },
  blocklist: {
    universalIdentifier: '20202020-0408-4f38-b8a8-4d5e3e26e24d',
    fields: STANDARD_OBJECT_FIELDS.blocklist,
    indexes: {
      workspaceMemberIdIndex: {
        universalIdentifier: '4daf320e-74d0-4f24-a45a-af3a09d741cb',
      },
    },
    views: {
      allBlocklists: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-0408-4f38-b8a8-4d5e3e26e24d',
        fields: STANDARD_OBJECT_FIELDS.blocklist,
        derivedViewFieldNames: ['handle', 'workspaceMember', 'createdAt'],
      }),
      blocklistRecordPageFields: {
        universalIdentifier: '5c679d04-7a1c-41be-9429-c9317ac7a0ea',
        viewFieldGroups: {
          general: {
            universalIdentifier: '94009e34-52fb-4534-89ce-6c6d0a774056',
          },
          system: {
            universalIdentifier: '35dace44-6e63-4cdb-b761-a92bcf126a7e',
          },
        },
        viewFields: {
          workspaceMember: {
            universalIdentifier: 'f2f5732f-7435-44be-986b-4c4d834fdfeb',
          },
          createdAt: {
            universalIdentifier: 'b2594a03-e00f-4de9-89da-b34bb95c2221',
          },
          createdBy: {
            universalIdentifier: '80a60507-6c7a-4713-b5de-b94ac293bf23',
          },
        },
      },
    },
  },
  calendarChannelEventAssociation: {
    universalIdentifier: '20202020-491b-4aaa-9825-afd1bae6ae00',
    fields: STANDARD_OBJECT_FIELDS.calendarChannelEventAssociation,
    indexes: {
      calendarChannelIdIndex: {
        universalIdentifier: 'ff6b86c1-3112-4dfa-b734-c4789111a716',
      },
      calendarEventIdIndex: {
        universalIdentifier: '47a3c8d2-9f14-4b6e-8c5d-1a2b3f4e5c69',
      },
    },
    views: {
      allCalendarChannelEventAssociations: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-491b-4aaa-9825-afd1bae6ae00',
        fields: STANDARD_OBJECT_FIELDS.calendarChannelEventAssociation,
        derivedViewFieldNames: [
          'calendarChannelId',
          'calendarEvent',
          'eventExternalId',
          'createdAt',
        ],
      }),
      calendarChannelEventAssociationRecordPageFields: {
        universalIdentifier: '766f254a-a0eb-45c8-b4d2-12311201e08f',
        viewFieldGroups: {
          general: {
            universalIdentifier: '9c27f771-9f85-492f-b1f1-9bc7a175f6f3',
          },
          system: {
            universalIdentifier: 'c7b18e05-dd60-4ee4-911a-290790e8c425',
          },
        },
        viewFields: {
          calendarChannelId: {
            universalIdentifier: 'cd6c6714-fc1d-4511-a664-ec5e8dfd8692',
          },
          calendarEvent: {
            universalIdentifier: '4790ca84-255e-4cb7-9b20-c17f4d94df8e',
          },
          eventExternalId: {
            universalIdentifier: 'dbe16c1b-ece2-4d2f-b634-094742ac3e16',
          },
          createdAt: {
            universalIdentifier: '2702ae80-9108-4757-8a25-317a4357484e',
          },
          createdBy: {
            universalIdentifier: '201e0c45-fddc-4217-bfd4-40c13d7f7916',
          },
        },
      },
    },
  },
  calendarEventParticipant: {
    universalIdentifier: '20202020-a1c3-47a6-9732-27e5b1e8436d',
    fields: STANDARD_OBJECT_FIELDS.calendarEventParticipant,
    indexes: {
      calendarEventIdIndex: {
        universalIdentifier: 'c458ad97-8b95-43de-9003-88eb68576049',
      },
      personIdIndex: {
        universalIdentifier: '30e9b75a-881f-4a85-aaf1-f2d2464be1cf',
      },
      workspaceMemberIdIndex: {
        universalIdentifier: '898aa202-428f-4a7a-a3b3-8f0a17a6658e',
      },
    },
    views: {
      allCalendarEventParticipants: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-a1c3-47a6-9732-27e5b1e8436d',
        fields: STANDARD_OBJECT_FIELDS.calendarEventParticipant,
        derivedViewFieldNames: [
          'calendarEvent',
          'handle',
          'displayName',
          'isOrganizer',
          'responseStatus',
          'person',
          'workspaceMember',
          'createdAt',
        ],
      }),
      calendarEventParticipantRecordPageFields: {
        universalIdentifier: 'e01ebdb3-8fb8-46d2-8230-82242d593f7a',
        viewFieldGroups: {
          general: {
            universalIdentifier: '3d842777-436e-467d-90ae-9e1fa0aa7e9c',
          },
          system: {
            universalIdentifier: '098836d8-15c1-44c1-a58e-2ff7fd6a05f9',
          },
        },
        viewFields: {
          calendarEvent: {
            universalIdentifier: '865a1278-c356-4b99-a5e9-1ca3d33c7665',
          },
          handle: {
            universalIdentifier: 'eb09af9c-b3f4-403c-8cb2-172243f83958',
          },
          displayName: {
            universalIdentifier: '23b97527-6ad3-4f07-bf68-559b97321673',
          },
          isOrganizer: {
            universalIdentifier: '3c126f3c-bd01-4029-b58a-724513fa5fff',
          },
          responseStatus: {
            universalIdentifier: 'cd02fc91-8fa4-4fa3-b0e3-1a1fc891e6ee',
          },
          person: {
            universalIdentifier: '46be729d-091c-4012-aeca-16a743008513',
          },
          workspaceMember: {
            universalIdentifier: 'c38c1111-f6e0-4698-9b36-db59f8d97de3',
          },
          createdAt: {
            universalIdentifier: '1447c7fa-fe2b-4ff7-8036-8de682537e23',
          },
          createdBy: {
            universalIdentifier: '6d7dff75-0230-45bd-8db9-dc25ef007e6e',
          },
        },
      },
    },
  },
  calendarEvent: {
    universalIdentifier: '20202020-8f1d-4eef-9f85-0d1965e27221',
    fields: STANDARD_OBJECT_FIELDS.calendarEvent,
    indexes: {},
    views: {
      allCalendarEvents: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-8f1d-4eef-9f85-0d1965e27221',
        fields: STANDARD_OBJECT_FIELDS.calendarEvent,
        derivedViewFieldNames: [
          'title',
          'startsAt',
          'endsAt',
          'isFullDay',
          'location',
          'conferenceLink',
          'isCanceled',
          'createdAt',
        ],
      }),
      calendarEventRecordPageFields: {
        universalIdentifier: 'c73668d1-022d-4eaf-b825-4e2548180db6',
        viewFieldGroups: {
          general: {
            universalIdentifier: 'aeadeb9e-3673-4c0c-8845-f59cb1e6ca42',
          },
          system: {
            universalIdentifier: 'eb1aadeb-7feb-44d1-9f9a-e9929e8690fc',
          },
        },
        viewFields: {
          title: {
            universalIdentifier: 'd17fc76f-2c3a-4c84-8249-27227bf71638',
          },
          startsAt: {
            universalIdentifier: '7bbd3744-d870-4704-882c-071732ed23d9',
          },
          endsAt: {
            universalIdentifier: 'ed7ca7e9-c8b3-4516-be4c-6491a27af847',
          },
          isFullDay: {
            universalIdentifier: '5d8f89b7-ec9e-41d6-9efe-96f9c32e6c20',
          },
          isCanceled: {
            universalIdentifier: 'a01f490d-cf67-4458-801e-13d81e74b45a',
          },
          conferenceLink: {
            universalIdentifier: '5ad748ae-e1bb-47bb-ac34-d82663c31b6e',
          },
          location: {
            universalIdentifier: '66c73e74-56e6-40c3-b776-0081ee757b8a',
          },
          description: {
            universalIdentifier: 'a09449be-b23f-48d4-b0dc-0bd36813220a',
          },
          externalCreatedAt: {
            universalIdentifier: '689c3eba-bedf-4a52-b9f1-3e34ce718251',
          },
          externalUpdatedAt: {
            universalIdentifier: '7823fa45-8cba-47ba-8dfb-5841bef44fc6',
          },
          iCalUid: {
            universalIdentifier: '8be763dd-6217-47fb-a7d2-ac223af881d2',
          },
          conferenceSolution: {
            universalIdentifier: '795905b6-c6f8-42cf-b8ea-3e5b6d32145f',
          },
        },
      },
    },
  },
  callRecording: {
    universalIdentifier: 'ce19efb9-710f-45b2-b141-473abbeea60b',
    fields: STANDARD_OBJECT_FIELDS.callRecording,
    indexes: {
      calendarEventIdIndex: {
        universalIdentifier: '8be3cc47-9352-4a1b-ad19-bb186bc0865d',
      },
    },
    views: {
      allCallRecordings: buildStandardObjectIndexView({
        objectUniversalIdentifier: 'ce19efb9-710f-45b2-b141-473abbeea60b',
        fields: STANDARD_OBJECT_FIELDS.callRecording,
        derivedViewFieldNames: [
          'status',
          'recordingRequestStatus',
          'title',
          'startedAt',
        ],
      }),
      callRecordingRecordPageFields: {
        universalIdentifier: '99fa8b47-3b11-4f9b-8fbc-e67a9e1da682',
        viewFieldGroups: {
          general: {
            universalIdentifier: '068426eb-dd20-49b0-ae9c-68727f3be2fb',
          },
        },
        viewFields: {
          title: {
            universalIdentifier: '6308d574-8579-4cf2-a020-c208df97cf3e',
          },
          status: {
            universalIdentifier: '93483569-fcd2-46cf-b576-9f0318ad2b3b',
          },
          recordingRequestStatus: {
            universalIdentifier: '364a90b1-e9aa-4606-996b-46e579ebeb28',
          },
          startedAt: {
            universalIdentifier: '3fd00fbb-c153-45e3-b6e6-43d18d34052a',
          },
          endedAt: {
            universalIdentifier: 'ba8c8d41-c112-4173-b927-5b5c5a5c047b',
          },
          video: {
            universalIdentifier: 'acc54ade-cd26-4be2-9391-a42715ad1523',
          },
          audio: {
            universalIdentifier: '9445a547-1d1e-4da3-916b-2c2269c951c9',
          },
          transcript: {
            universalIdentifier: '782c97f6-e6b1-472b-8992-bbb60d25791b',
          },
          summary: {
            universalIdentifier: 'a0ace064-cc72-4631-ade3-07cdded86b0e',
          },
        },
      },
    },
  },
  company: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
    fields: STANDARD_OBJECT_FIELDS.company,
    indexes: {
      accountOwnerIdIndex: {
        universalIdentifier: 'ec2ebfc9-0c9b-4597-a87d-aa295e2d8bfe',
      },
      domainNameUniqueIndex: {
        universalIdentifier: 'dd300c61-f422-467a-91f4-de4f83c4175b',
      },
      searchVectorGinIndex: {
        universalIdentifier: 'c3eb62df-2cc1-4cc3-b7aa-e96a4d65c633',
      },
    },
    views: {
      allCompanies: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
        fields: STANDARD_OBJECT_FIELDS.company,
        derivedViewFieldNames: [
          'name',
          'domainName',
          'createdBy',
          'accountOwner',
          'createdAt',
          'linkedinLink',
          'address',
        ],
      }),
      companyRecordPageFields: {
        universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1001',
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1101',
          },
          business: {
            universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1102',
          },
          contact: {
            universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1103',
          },
          system: {
            universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1104',
          },
        },
        viewFields: {
          domainName: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1201',
          },
          accountOwner: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1202',
          },
          annualRevenue: {
            universalIdentifier: '2a35f734-dea2-4de9-8395-acbce8df0f97',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1206',
          },
          address: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1208',
          },
          createdAt: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1209',
          },
          createdBy: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1210',
          },
          updatedAt: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1212',
          },
          updatedBy: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1213',
          },
          people: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1214',
          },
          taskTargets: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1215',
          },
          noteTargets: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1216',
          },
          opportunities: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1217',
          },
          attachments: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1219',
          },
          timelineActivities: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c121a',
          },
        },
      },
    },
  },
  dashboard: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.dashboard,
    fields: STANDARD_OBJECT_FIELDS.dashboard,
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: 'e69f71aa-de0f-4b70-845f-7a8369c47928',
      },
    },
    views: {
      allDashboards: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.dashboard,
        fields: STANDARD_OBJECT_FIELDS.dashboard,
        derivedViewFieldNames: ['title', 'createdBy', 'createdAt', 'updatedAt'],
      }),
    },
  },
  messageCampaign: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign,
    fields: STANDARD_OBJECT_FIELDS.messageCampaign,
    indexes: {
      unsubscribeTopicIdIndex: {
        universalIdentifier: 'efe8c20e-d12b-4475-969e-e86e0bbfe444',
      },
      listIdIndex: {
        universalIdentifier: '17bffd6a-714a-458d-a547-f9e2183d9520',
      },
      searchVectorGinIndex: {
        universalIdentifier: '975823ad-9b97-4f39-b2c7-fbd7d77f4bd1',
      },
    },
    views: {
      allMessageCampaigns: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign,
        fields: STANDARD_OBJECT_FIELDS.messageCampaign,
        derivedViewFieldNames: [
          'subject',
          'status',
          'list',
          'fromAddress',
          'sentAt',
          'sentCount',
          'failedCount',
          'bouncedCount',
          'complainedCount',
          'recipients',
          'createdAt',
        ],
      }),
    },
  },
  messageList: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageList,
    fields: STANDARD_OBJECT_FIELDS.messageList,
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: '8e205171-ed74-4620-b7d2-674aab85033a',
      },
    },
    views: {
      allMessageLists: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageList,
        fields: STANDARD_OBJECT_FIELDS.messageList,
        derivedViewFieldNames: ['name', 'members', 'campaigns', 'createdAt'],
      }),
    },
  },
  messageListMember: {
    universalIdentifier: '27773d24-8ce3-40f8-aa6c-1f590f2c08d2',
    fields: STANDARD_OBJECT_FIELDS.messageListMember,
    indexes: {
      listIdIndex: {
        universalIdentifier: '61188470-6dcb-4b2a-b1a9-baeb688bccae',
      },
      personListUniqueIndex: {
        universalIdentifier: 'e5497dc2-1d72-418c-a389-a0645ca0195a',
      },
    },
  },
  messageChannelMessageAssociation: {
    universalIdentifier: '20202020-ad1e-4127-bccb-d83ae04d2ccb',
    fields: STANDARD_OBJECT_FIELDS.messageChannelMessageAssociation,
    indexes: {
      messageChannelIdIndex: {
        universalIdentifier: '9894f9a3-0225-4e7b-9f6a-23d4e2576784',
      },
      messageIdIndex: {
        universalIdentifier: '9bb24d40-60dd-4beb-8c64-a74e8c67f9ee',
      },
      messageChannelIdMessageIdUniqueIndex: {
        universalIdentifier: '1b86ece8-7ce3-4df3-8771-fd4b5d45b2f2',
      },
    },
    views: {
      allMessageChannelMessageAssociations: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-ad1e-4127-bccb-d83ae04d2ccb',
        fields: STANDARD_OBJECT_FIELDS.messageChannelMessageAssociation,
        derivedViewFieldNames: [
          'messageChannelId',
          'message',
          'messageExternalId',
          'direction',
          'createdAt',
        ],
      }),
      messageChannelMessageAssociationRecordPageFields: {
        universalIdentifier: '680b43e2-5d50-49d8-bbdd-2d208e7b7071',
        viewFieldGroups: {
          general: {
            universalIdentifier: '86d7066c-ba38-4f6a-996f-77345bedd549',
          },
          system: {
            universalIdentifier: '6044c58c-a63c-4f3f-a283-b8803553628f',
          },
        },
        viewFields: {
          messageChannelId: {
            universalIdentifier: '376c7685-9ebe-4c95-b820-424b1c2f264f',
          },
          message: {
            universalIdentifier: '166aa5a0-d825-40dc-be6d-e94b87edd56d',
          },
          messageExternalId: {
            universalIdentifier: '1910bd21-2472-4a83-b8cd-7de51bdd2675',
          },
          direction: {
            universalIdentifier: '9edfbd44-4624-4cf8-b81c-8e169b4e8281',
          },
          createdAt: {
            universalIdentifier: '8651c5c4-db87-427c-8a57-6a9f75c74976',
          },
          createdBy: {
            universalIdentifier: 'af4adf31-f698-4aad-9f29-71908924fc9a',
          },
        },
      },
    },
  },
  messageChannelMessageAssociationMessageFolder: {
    universalIdentifier: '20202020-a1b0-40b0-8ab0-5b6c7d8e9f0a',
    fields:
      STANDARD_OBJECT_FIELDS.messageChannelMessageAssociationMessageFolder,
    indexes: {
      messageChannelMessageAssociationIdIndex: {
        universalIdentifier: '8e6038aa-1f79-4a84-87b5-f33caa172e98',
      },
      messageFolderIdIndex: {
        universalIdentifier: '905299c3-ca81-435d-901c-f68b87562516',
      },
      messageChannelMessageAssociationIdMessageFolderIdUniqueIndex: {
        universalIdentifier: 'a3de1788-5dff-4849-ac5a-0dabe5fab216',
      },
    },
    views: {
      allMessageChannelMessageAssociationMessageFolders:
        buildStandardObjectIndexView({
          objectUniversalIdentifier: '20202020-a1b0-40b0-8ab0-5b6c7d8e9f0a',
          fields:
            STANDARD_OBJECT_FIELDS.messageChannelMessageAssociationMessageFolder,
          derivedViewFieldNames: [
            'messageChannelMessageAssociation',
            'messageFolderId',
            'createdAt',
          ],
        }),
      messageChannelMessageAssociationMessageFolderRecordPageFields: {
        universalIdentifier: '331ec548-07d2-4f9d-a0a2-ef91a9f96184',
        viewFieldGroups: {
          general: {
            universalIdentifier: '4928521b-ae24-4013-a69a-1392017d57af',
          },
          system: {
            universalIdentifier: 'b76cebb3-39b2-477a-9212-8bf1190227a4',
          },
        },
        viewFields: {
          messageChannelMessageAssociation: {
            universalIdentifier: 'd34ed53e-5156-4a18-a8df-572269496aac',
          },
          messageFolderId: {
            universalIdentifier: '04f14582-caf9-49ee-81ea-e5d4f977bfe1',
          },
          createdAt: {
            universalIdentifier: '39297559-a747-481e-a4c5-b80b8faf1aac',
          },
          createdBy: {
            universalIdentifier: '4692eb91-7fc6-4436-9175-87caa5f6b668',
          },
        },
      },
    },
  },
  messageParticipant: {
    universalIdentifier: '20202020-a433-4456-aa2d-fd9cb26b774a',
    fields: STANDARD_OBJECT_FIELDS.messageParticipant,
    indexes: {
      messageIdIndex: {
        universalIdentifier: 'ab0863ba-f95e-493c-b86c-56e1bc7e5bc2',
      },
      personIdIndex: {
        universalIdentifier: 'df805c2e-3bfe-4d51-8309-75e5eb4052fe',
      },
      workspaceMemberIdIndex: {
        universalIdentifier: 'ce1e3a9e-afe9-439d-abb7-6cc98a6fa405',
      },
      messageCampaignIdIndex: {
        universalIdentifier: 'e9bcdd77-cc8b-4532-833c-124dfdc8e5ff',
      },
    },
    views: {
      allMessageParticipants: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-a433-4456-aa2d-fd9cb26b774a',
        fields: STANDARD_OBJECT_FIELDS.messageParticipant,
        derivedViewFieldNames: [
          'message',
          'role',
          'handle',
          'displayName',
          'person',
          'workspaceMember',
          'createdAt',
        ],
      }),
      messageParticipantRecordPageFields: {
        universalIdentifier: '209ab5c5-4a68-4d32-8255-515919a6c5f5',
        viewFieldGroups: {
          general: {
            universalIdentifier: '41c18430-34c3-430f-b86b-fc3963281277',
          },
          system: {
            universalIdentifier: 'add21830-a7c6-4cde-9eed-430afbcbf557',
          },
        },
        viewFields: {
          message: {
            universalIdentifier: 'dd8ccf4f-64d7-468c-bc0c-dc4e0efef08d',
          },
          role: {
            universalIdentifier: '5d1f9a65-85cc-41b2-a8bf-8e2c97aab4b3',
          },
          displayName: {
            universalIdentifier: 'c50748fe-9f54-4e09-b572-111f076ec7db',
          },
          person: {
            universalIdentifier: 'bf2e30dd-df03-4fb2-820a-166a93a2ce2c',
          },
          workspaceMember: {
            universalIdentifier: '00336686-0d63-43e2-b247-599f1227bd85',
          },
          createdAt: {
            universalIdentifier: '8d66ecb8-825d-4c6c-91c0-23a82c87ab46',
          },
          createdBy: {
            universalIdentifier: '17c3acfc-71f1-4b3c-820e-aea23871e850',
          },
        },
      },
    },
  },
  messageThread: {
    universalIdentifier: '20202020-849a-4c3e-84f5-a25a7d802271',
    fields: STANDARD_OBJECT_FIELDS.messageThread,
    indexes: {},
    views: {
      allMessageThreads: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-849a-4c3e-84f5-a25a7d802271',
        fields: STANDARD_OBJECT_FIELDS.messageThread,
        derivedViewFieldNames: [
          'subject',
          'messages',
          'updatedAt',
          'createdAt',
        ],
      }),
    },
  },
  message: {
    universalIdentifier: '20202020-3f6b-4425-80ab-e468899ab4b2',
    fields: STANDARD_OBJECT_FIELDS.message,
    indexes: {
      messageThreadIdIndex: {
        universalIdentifier: '7a05b45e-7aa6-4a7e-9bbc-299cbed53c96',
      },
      messageCampaignIdIndex: {
        universalIdentifier: '79e777ca-7008-46c5-b3a6-3108b7c7dfb6',
      },
    },
    views: {
      allMessages: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-3f6b-4425-80ab-e468899ab4b2',
        fields: STANDARD_OBJECT_FIELDS.message,
        derivedViewFieldNames: [
          'subject',
          'messageThread',
          'messageParticipants',
          'receivedAt',
          'headerMessageId',
          'text',
          'createdAt',
        ],
      }),
    },
  },
  note: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note,
    fields: STANDARD_OBJECT_FIELDS.note,
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: '8183c8d2-9114-4b6e-8c5d-12a3b14a5a13',
      },
    },
    views: {
      allNotes: buildStandardObjectIndexView({
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note,
        fields: STANDARD_OBJECT_FIELDS.note,
        derivedViewFieldNames: [
          'title',
          'noteTargets',
          'bodyV2',
          'createdBy',
          'createdAt',
        ],
      }),
      noteRecordPageFields: {
        universalIdentifier: '20202020-a005-4a05-8a05-a0be5a115001',
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a005-4a05-8a05-a0be5a115101',
          },
          system: {
            universalIdentifier: '20202020-a005-4a05-8a05-a0be5a115103',
          },
        },
        viewFields: {
          createdAt: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115202',
          },
          createdBy: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115203',
          },
          noteTargets: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115204',
          },
          bodyV2: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115205',
          },
          updatedAt: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115206',
          },
          updatedBy: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115207',
          },
          attachments: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115208',
          },
          timelineActivities: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115209',
          },
        },
      },
    },
  },
  noteTarget: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget,
    fields: STANDARD_OBJECT_FIELDS.noteTarget,
    morphIds: {
      targetMorphId: { morphId: '20202020-f635-435d-ab8d-e1168b375c70' },
    },
    indexes: {
      noteIdIndex: {
        universalIdentifier: '9294d9e3-0225-4c7f-9d6e-23b4c25b6b24',
      },
      personIdIndex: {
        universalIdentifier: '7c069dc0-e83b-4cd5-aaa2-cac7f3e00d80',
      },
      companyIdIndex: {
        universalIdentifier: '2d83909a-a383-4e82-b00a-8b7739f3f906',
      },
      opportunityIdIndex: {
        universalIdentifier: '0d1a59b4-cc87-4b7d-804a-656e8504f371',
      },
    },
    views: {
      allNoteTargets: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget,
        fields: STANDARD_OBJECT_FIELDS.noteTarget,
        derivedViewFieldNames: [
          'id',
          'note',
          'targetPerson',
          'targetCompany',
          'targetOpportunity',
        ],
      }),
    },
  },
  opportunity: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity,
    fields: STANDARD_OBJECT_FIELDS.opportunity,
    indexes: {
      pointOfContactIdIndex: {
        universalIdentifier: 'b8c2a673-a981-4357-a43d-313a358e4daa',
      },
      companyIdIndex: {
        universalIdentifier: 'e161072d-37b1-477a-b944-ef0d65289574',
      },
      stageIndex: {
        universalIdentifier: 'ae60d580-b562-44f2-a24d-7b8040063f83',
      },
      searchVectorGinIndex: {
        universalIdentifier: 'f53fdd28-a26b-47ba-81b5-6813ad622720',
      },
    },
    views: {
      allOpportunities: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity,
        fields: STANDARD_OBJECT_FIELDS.opportunity,
        derivedViewFieldNames: [
          'name',
          'amount',
          'createdBy',
          'closeDate',
          'company',
          'pointOfContact',
        ],
      }),
      byStage: {
        universalIdentifier: '20202020-a004-4a04-8a04-0aa0b1ca1ba0',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf',
          },
          amount: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb0',
          },
          createdBy: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb1',
          },
          closeDate: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb2',
          },
          company: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb3',
          },
          pointOfContact: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb4',
          },
        },
        viewGroups: {
          new: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf1',
          },
          screening: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf2',
          },
          meeting: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf3',
          },
          proposal: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf4',
          },
          customer: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf5',
          },
        },
      },
      opportunityRecordPageFields: {
        universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca3001',
        viewFieldGroups: {
          deal: {
            universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca3101',
          },
          relations: {
            universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca3102',
          },
          system: {
            universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca3103',
          },
        },
        viewFields: {
          amount: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3201',
          },
          closeDate: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3202',
          },
          stage: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3203',
          },
          company: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3204',
          },
          pointOfContact: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3205',
          },
          owner: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3206',
          },
          createdAt: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3207',
          },
          createdBy: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3208',
          },
          updatedAt: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca320a',
          },
          updatedBy: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca320b',
          },
          taskTargets: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca320d',
          },
          noteTargets: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca320e',
          },
          attachments: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca320f',
          },
          timelineActivities: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca3210',
          },
        },
      },
    },
  },
  person: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
    fields: STANDARD_OBJECT_FIELDS.person,
    indexes: {
      companyIdIndex: {
        universalIdentifier: '8a265a5c-d3ae-47dc-bdf9-b42cfa2ba639',
      },
      emailsUniqueIndex: {
        universalIdentifier: '8183a8b2-9114-4f6c-8a5b-12e3f14e5e13',
      },
      searchVectorGinIndex: {
        universalIdentifier: '9294b9c3-0225-4a7d-9b6c-23f4a25f6f24',
      },
    },
    views: {
      allPeople: buildStandardObjectIndexView({
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
        fields: STANDARD_OBJECT_FIELDS.person,
        derivedViewFieldNames: [
          'name',
          'emails',
          'createdBy',
          'company',
          'phones',
          'createdAt',
          'jobTitle',
          'linkedinLink',
        ],
      }),
      personRecordPageFields: {
        universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12001',
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12101',
          },
          work: {
            universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12102',
          },
          social: {
            universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12103',
          },
          system: {
            universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12104',
          },
        },
        viewFields: {
          emails: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12201',
          },
          phones: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12202',
          },
          company: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12203',
          },
          jobTitle: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12204',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12205',
          },
          avatarUrl: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12208',
          },
          createdAt: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12209',
          },
          createdBy: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12210',
          },
          updatedAt: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12212',
          },
          updatedBy: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12213',
          },
          avatarFile: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12214',
          },
          pointOfContactForOpportunities: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12215',
          },
          taskTargets: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12216',
          },
          noteTargets: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12217',
          },
          attachments: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12219',
          },
          messageParticipants: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea1221a',
          },
          calendarEventParticipants: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea1221b',
          },
          timelineActivities: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea1221c',
          },
        },
      },
    },
  },
  task: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task,
    fields: STANDARD_OBJECT_FIELDS.task,
    indexes: {
      assigneeIdIndex: {
        universalIdentifier: 'f48fa3b1-0cec-44da-a9e5-f8a5e766637e',
      },
      searchVectorGinIndex: {
        universalIdentifier: 'a86b32b3-01d3-4302-a152-8b7f247db7b4',
      },
    },
    views: {
      allTasks: buildStandardObjectIndexView({
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task,
        fields: STANDARD_OBJECT_FIELDS.task,
        derivedViewFieldNames: [
          'title',
          'status',
          'taskTargets',
          'createdBy',
          'dueAt',
          'assignee',
          'bodyV2',
          'createdAt',
        ],
      }),
      assignedToMe: {
        universalIdentifier: '20202020-a007-4a07-8a07-ba5ca551aaed',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaed',
          },
          taskTargets: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaee',
          },
          createdBy: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaef',
          },
          dueAt: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf0',
          },
          assignee: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf1',
          },
          bodyV2: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf2',
          },
          createdAt: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf3',
          },
        },
        viewFilters: {
          assigneeIsMe: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf1',
          },
        },
        viewGroups: {
          todo: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf2',
          },
          inProgress: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf3',
          },
          done: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf4',
          },
          empty: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf5',
          },
        },
      },
      byStatus: {
        universalIdentifier: '20202020-a008-4a08-8a08-ba5cba51aba5',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf0',
          },
          status: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf1',
          },
          dueAt: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf2',
          },
          assignee: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf3',
          },
          createdAt: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf4',
          },
        },
        viewGroups: {
          todo: {
            universalIdentifier: '20202020-af18-4a08-8a08-ba5cba5bbf01',
          },
          inProgress: {
            universalIdentifier: '20202020-af18-4a08-8a08-ba5cba5bbf02',
          },
          done: {
            universalIdentifier: '20202020-af18-4a08-8a08-ba5cba5bbf03',
          },
        },
      },
      taskRecordPageFields: {
        universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a6001',
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a6101',
          },
          system: {
            universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a6103',
          },
        },
        viewFields: {
          dueAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6202',
          },
          status: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6203',
          },
          assignee: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6204',
          },
          createdAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6205',
          },
          createdBy: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6206',
          },
          taskTargets: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6207',
          },
          bodyV2: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6208',
          },
          updatedAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6209',
          },
          updatedBy: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a620a',
          },
          attachments: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a620b',
          },
          timelineActivities: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a620c',
          },
        },
      },
    },
  },
  taskTarget: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget,
    fields: STANDARD_OBJECT_FIELDS.taskTarget,
    morphIds: {
      targetMorphId: { morphId: '20202020-f636-435d-ab8d-e1168b375c71' },
    },
    indexes: {
      taskIdIndex: {
        universalIdentifier: 'c882f7a4-b025-4d32-aa26-5ef2595bdbf9',
      },
      personIdIndex: {
        universalIdentifier: 'b7d305d1-6fae-4ed6-9bdc-354fe9032c0e',
      },
      companyIdIndex: {
        universalIdentifier: 'c0af54c7-751b-4bb2-b102-677cc4e47402',
      },
      opportunityIdIndex: {
        universalIdentifier: '6942e0ba-90f6-4c33-bf40-7f00b1ec35ab',
      },
    },
    views: {
      allTaskTargets: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget,
        fields: STANDARD_OBJECT_FIELDS.taskTarget,
        derivedViewFieldNames: [
          'id',
          'task',
          'targetPerson',
          'targetCompany',
          'targetOpportunity',
        ],
      }),
    },
  },
  timelineActivity: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.timelineActivity,
    fields: STANDARD_OBJECT_FIELDS.timelineActivity,
    morphIds: {
      targetMorphId: { morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1' },
    },
    indexes: {
      workspaceMemberIdIndex: {
        universalIdentifier: '5e0b2391-85ca-4a66-aef4-52d74245bec2',
      },
      personIdIndex: {
        universalIdentifier: '3e89a914-7bec-47bd-9cf9-743c6b83d001',
      },
      companyIdIndex: {
        universalIdentifier: '8183e8f2-9114-4d6a-8e5f-12c3d14c5c13',
      },
      opportunityIdIndex: {
        universalIdentifier: '9294f9a3-0225-4e7b-9f6a-23d4e25d6d24',
      },
      noteIdIndex: {
        universalIdentifier: '995db1d8-0d3e-40f7-b0eb-5e6897bc9966',
      },
      taskIdIndex: {
        universalIdentifier: '609cf622-86ef-48d1-812b-e1cab610a46c',
      },
      workflowIdIndex: {
        universalIdentifier: 'd6059ec2-92b0-4cfc-9fd8-78050f03108f',
      },
      workflowVersionIdIndex: {
        universalIdentifier: 'd94329b3-5dc8-4141-ae28-31afe28f7135',
      },
      workflowRunIdIndex: {
        universalIdentifier: '1a2bd046-7c23-4e0a-9f8a-c3ca3a16d3b9',
      },
      dashboardIdIndex: {
        universalIdentifier: 'e8821da9-728d-470a-bf5b-5a981fff7880',
      },
    },
    views: {
      allTimelineActivities: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.timelineActivity,
        fields: STANDARD_OBJECT_FIELDS.timelineActivity,
        derivedViewFieldNames: [
          'name',
          'happensAt',
          'workspaceMember',
          'targetPerson',
          'targetCompany',
          'targetOpportunity',
          'targetTask',
          'targetNote',
          'targetWorkflow',
          'targetWorkflowVersion',
          'targetWorkflowRun',
          'targetDashboard',
        ],
        preservedViewFields: {
          properties: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa019',
          },
          linkedRecordCachedName: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa017',
          },
        },
      }),
    },
  },
  workflow: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflow,
    fields: STANDARD_OBJECT_FIELDS.workflow,
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: 'c7e64c55-eb0c-4b93-b076-5cfcf2e2e042',
      },
    },
    views: {
      allWorkflows: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflow,
        fields: STANDARD_OBJECT_FIELDS.workflow,
        derivedViewFieldNames: [
          'name',
          'statuses',
          'updatedAt',
          'createdBy',
          'versions',
          'runs',
        ],
      }),
    },
  },
  workflowAutomatedTrigger: {
    universalIdentifier: '20202020-3319-4234-a34c-7f3b9d2e4d1f',
    fields: STANDARD_OBJECT_FIELDS.workflowAutomatedTrigger,
    indexes: {
      workflowIdIndex: {
        universalIdentifier: '7331ff89-a3f9-4ac0-9fa9-0de5663ae7b2',
      },
    },
    views: {
      allWorkflowAutomatedTriggers: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-3319-4234-a34c-7f3b9d2e4d1f',
        fields: STANDARD_OBJECT_FIELDS.workflowAutomatedTrigger,
        derivedViewFieldNames: ['type', 'workflow', 'createdAt'],
      }),
      workflowAutomatedTriggerRecordPageFields: {
        universalIdentifier: '10aff295-f7ac-475d-8528-661eb9aa9759',
        viewFieldGroups: {
          general: {
            universalIdentifier: 'c5261eae-f2fe-416e-8ef9-eda5d377f8ca',
          },
          system: {
            universalIdentifier: 'e6da0410-7f63-41b7-b977-421fc37d67f5',
          },
        },
        viewFields: {
          type: {
            universalIdentifier: '3b3a0cf7-f171-4ad8-9aad-aed84eca0250',
          },
          workflow: {
            universalIdentifier: 'ddc5a9f6-f577-4e4b-a258-3d656c32babc',
          },
          createdAt: {
            universalIdentifier: '98ef45e8-c6bf-42e6-96f6-e94cd17911bc',
          },
          createdBy: {
            universalIdentifier: 'd3933427-de7f-4fa1-b80c-47302273d848',
          },
        },
      },
    },
  },
  workflowRun: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowRun,
    fields: STANDARD_OBJECT_FIELDS.workflowRun,
    indexes: {
      workflowVersionIdIndex: {
        universalIdentifier: '8183c8d2-9114-4b6e-8c5d-12a3b14a5a14',
      },
      workflowIdIndex: {
        universalIdentifier: '9294d9e3-0225-4c7f-9d6e-23b4c25b6b25',
      },
      searchVectorGinIndex: {
        universalIdentifier: 'e0ac5ad2-d0c8-4f72-b710-8e53b9dc18d9',
      },
    },
    views: {
      allWorkflowRuns: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowRun,
        fields: STANDARD_OBJECT_FIELDS.workflowRun,
        derivedViewFieldNames: ['name', 'workflow', 'status'],
        preservedViewFields: {
          startedAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb2',
          },
          createdBy: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb3',
          },
          workflowVersion: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb4',
          },
        },
      }),
      workflowRunRecordPageFields: {
        universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abcf1',
        viewFields: {
          status: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcf6',
          },
          workflow: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcf7',
          },
          workflowVersion: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcf8',
          },
          startedAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcf9',
          },
          endedAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcfa',
          },
          createdAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcfb',
          },
          createdBy: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcfc',
          },
          enqueuedAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcfd',
          },
          state: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abd01',
          },
          updatedAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abd02',
          },
          updatedBy: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abd03',
          },
          timelineActivities: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abd05',
          },
        },
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abcf2',
          },
          system: {
            universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abcf4',
          },
        },
      },
    },
  },
  workflowVersion: {
    universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowVersion,
    fields: STANDARD_OBJECT_FIELDS.workflowVersion,
    indexes: {
      workflowIdIndex: {
        universalIdentifier: '8138c3b3-0b14-4ee1-be0e-debdde6b3219',
      },
      searchVectorGinIndex: {
        universalIdentifier: '6f3a65eb-2aee-4108-b8a0-c62da419d1dc',
      },
    },
    views: {
      allWorkflowVersions: buildStandardObjectIndexView({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowVersion,
        fields: STANDARD_OBJECT_FIELDS.workflowVersion,
        derivedViewFieldNames: [
          'name',
          'workflow',
          'status',
          'updatedAt',
          'runs',
        ],
      }),
      workflowVersionRecordPageFields: {
        universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aaef1',
        viewFields: {
          status: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaef6',
          },
          workflow: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaef7',
          },
          trigger: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaef8',
          },
          createdAt: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaef9',
          },
          steps: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaefa',
          },
          createdBy: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaefb',
          },
          updatedAt: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaefc',
          },
          updatedBy: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaefd',
          },
          runs: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaefe',
          },
          timelineActivities: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaf01',
          },
        },
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aaef2',
          },
          system: {
            universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aaef4',
          },
        },
      },
    },
  },
  workspaceMember: {
    universalIdentifier: '20202020-3319-4234-a34c-82d5c0e881a6',
    fields: STANDARD_OBJECT_FIELDS.workspaceMember,
    indexes: {
      userEmailUniqueIndex: {
        universalIdentifier: '76da5f27-523c-44b6-ad06-12954f6b949f',
      },
      searchVectorGinIndex: {
        universalIdentifier: '8678dde9-a804-4a9e-80e3-9af35e471ec5',
      },
    },
    views: {
      allWorkspaceMembers: buildStandardObjectIndexView({
        objectUniversalIdentifier: '20202020-3319-4234-a34c-82d5c0e881a6',
        fields: STANDARD_OBJECT_FIELDS.workspaceMember,
        derivedViewFieldNames: [
          'name',
          'createdAt',
          'ownedOpportunities',
          'assignedTasks',
        ],
        preservedViewFields: {
          userEmail: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f1',
          },
          avatarUrl: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f2',
          },
          colorScheme: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f3',
          },
          locale: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f4',
          },
          timeZone: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f5',
          },
          dateFormat: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f6',
          },
          timeFormat: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f7',
          },
        },
      }),
    },
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
    morphIds?: Record<string, { morphId: string }>;
    fields: Record<string, { universalIdentifier: string }>;
    indexes: Record<string, { universalIdentifier: string }>;
    views?: Record<
      string,
      {
        universalIdentifier: string;
        viewFields: Record<string, { universalIdentifier: string }>;
        viewFieldGroups?: Record<string, { universalIdentifier: string }>;
        viewFilters?: Record<string, { universalIdentifier: string }>;
        viewGroups?: Record<string, { universalIdentifier: string }>;
      }
    >;
  }
>;
