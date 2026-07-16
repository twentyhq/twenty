import { buildStandardObjectSystemFields } from '@/metadata/utils/internal/build-standard-object-system-fields.util';

// Important notice:
// - Never ever mutate an existing universal identifier
// - Deleting an existing universal identifier should be very rare
// - System field universal identifiers (id, createdAt, updatedAt,
//   deletedAt, createdBy, updatedBy, position, searchVector) are
//   deterministically derived from the standard application universal
//   identifier, the object universal identifier and the field name.
//   The name field is a default field, not a system field, and keeps its
//   hardcoded universal identifier.
export const STANDARD_OBJECTS = {
  attachment: {
    universalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-bd3d-4c60-8dca-571c71d4447a',
      ),
      name: { universalIdentifier: '20202020-87a5-48f8-bbf7-ade388825a57' },
      file: { universalIdentifier: '20202020-15db-460e-8166-c7b5d87ad4be' },
      //deprecated
      fullPath: { universalIdentifier: '20202020-0d19-453d-8e8d-fbcda8ca3747' },
      //deprecated
      fileCategory: {
        universalIdentifier: '20202020-8c3f-4d9e-9a1b-2e5f7a8c9d0e',
      },
      targetTask: {
        universalIdentifier: '20202020-51e5-4621-9cf8-215487951c4b',
      },
      targetNote: {
        universalIdentifier: '20202020-4f4b-4503-a6fc-6b982f3dffb5',
      },
      targetPerson: {
        universalIdentifier: '20202020-0158-4aa2-965c-5cdafe21ffa2',
      },
      targetCompany: {
        universalIdentifier: '20202020-ceab-4a28-b546-73b06b4c08d5',
      },
      targetOpportunity: {
        universalIdentifier: '20202020-7374-499d-bea3-9354890755b5',
      },
      targetDashboard: {
        universalIdentifier: '20202020-5324-43f3-9dbf-1a33e7de0ce6',
      },
      targetWorkflow: {
        universalIdentifier: '20202020-f1e8-4c9d-8a7b-3f5e1d2c9a8b',
      },
    },
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
      allAttachments: {
        universalIdentifier: '3f7f3363-7087-44cc-902d-5e8904262316',
        viewFields: {
          name: {
            universalIdentifier: 'be56712f-d7a6-4fbe-b92b-d750f0708a0a',
          },
          file: {
            universalIdentifier: '873cf114-5477-4b62-9023-7ea6ad69fbe5',
          },
          createdBy: {
            universalIdentifier: 'fa363372-0fdf-4bb3-bdf1-0ead354b9225',
          },
          createdAt: {
            universalIdentifier: '6c092c26-b1cb-488f-ae2e-5af4bec1162b',
          },
          targetPerson: {
            universalIdentifier: '73a4c3a7-c7f9-4ed6-a2b6-117d7efad0f3',
          },
          targetCompany: {
            universalIdentifier: 'b335ad04-059e-4c36-8666-f40431849044',
          },
          targetOpportunity: {
            universalIdentifier: '15f2d457-dc09-4c52-bf2a-47083d6bf017',
          },
          targetTask: {
            universalIdentifier: 'c2913c5e-6cc6-438d-9c2f-3212a9b2a82b',
          },
          targetNote: {
            universalIdentifier: 'fc8dba49-bcf2-41b8-a435-0c4a3bbf2af6',
          },
          targetDashboard: {
            universalIdentifier: 'bcc6d6e1-7c0b-4291-9270-66e42024d8dd',
          },
          targetWorkflow: {
            universalIdentifier: '11fcf58b-dbab-42dd-be67-689462111070',
          },
        },
      },
    },
  },
  blocklist: {
    universalIdentifier: '20202020-0408-4f38-b8a8-4d5e3e26e24d',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-0408-4f38-b8a8-4d5e3e26e24d',
      ),
      handle: { universalIdentifier: '20202020-eef3-44ed-aa32-4641d7fd4a3e' },
      workspaceMember: {
        universalIdentifier: '20202020-548d-4084-a947-fa20a39f7c06',
      },
    },
    indexes: {
      workspaceMemberIdIndex: {
        universalIdentifier: '4daf320e-74d0-4f24-a45a-af3a09d741cb',
      },
    },
    views: {
      allBlocklists: {
        universalIdentifier: '5a98e88c-67c2-4f61-a5ab-a0d3d6a836bb',
        viewFields: {
          handle: {
            universalIdentifier: '155ae00d-0def-4f62-9473-8a8efa209eee',
          },
          workspaceMember: {
            universalIdentifier: '05a2f0b9-f2ef-4729-bc42-9e2ad2a34fb2',
          },
          createdAt: {
            universalIdentifier: 'e7cfcf05-2676-4d43-9eee-4da1016b12ff',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-491b-4aaa-9825-afd1bae6ae00',
      ),
      calendarChannelId: {
        universalIdentifier: '20202020-93ee-4da4-8d58-0282c4a9cb7d',
      },
      calendarEvent: {
        universalIdentifier: '20202020-5aa5-437e-bb86-f42d457783e3',
      },
      eventExternalId: {
        universalIdentifier: '20202020-9ec8-48bb-b279-21d0734a75a1',
      },
      recurringEventExternalId: {
        universalIdentifier: '20202020-c58f-4c69-9bf8-9518fa31aa50',
      },
    },
    indexes: {
      calendarChannelIdIndex: {
        universalIdentifier: 'ff6b86c1-3112-4dfa-b734-c4789111a716',
      },
      calendarEventIdIndex: {
        universalIdentifier: '47a3c8d2-9f14-4b6e-8c5d-1a2b3f4e5c69',
      },
    },
    views: {
      allCalendarChannelEventAssociations: {
        universalIdentifier: '001893be-c06c-4ba1-9f18-53bd26f0179f',
        viewFields: {
          calendarChannelId: {
            universalIdentifier: 'e3adffd2-d820-4c89-912c-34908d90057e',
          },
          calendarEvent: {
            universalIdentifier: '35656a84-ecb8-4075-a610-8b538d6f8120',
          },
          eventExternalId: {
            universalIdentifier: 'f779d7e8-f1d8-44a7-b0ef-4409c9b6b466',
          },
          createdAt: {
            universalIdentifier: '8ca74f2f-210b-4afc-81f0-506047400e82',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-a1c3-47a6-9732-27e5b1e8436d',
      ),
      calendarEvent: {
        universalIdentifier: '20202020-fe3a-401c-b889-af4f4657a861',
      },
      handle: {
        universalIdentifier: '20202020-8692-4580-8210-9e09cbd031a7',
      },
      displayName: {
        universalIdentifier: '20202020-ee1e-4f9f-8ac1-5c0b2f69691e',
      },
      isOrganizer: {
        universalIdentifier: '20202020-66e7-4e00-9e06-d06c92650580',
      },
      responseStatus: {
        universalIdentifier: '20202020-cec0-4be8-8fba-c366abc23147',
      },
      person: {
        universalIdentifier: '20202020-5761-4842-8186-e1898ef93966',
      },
      workspaceMember: {
        universalIdentifier: '20202020-20e4-4591-93ed-aeb17a4dcbd2',
      },
    },
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
      allCalendarEventParticipants: {
        universalIdentifier: '5228d634-6b69-4a43-be5c-e778fa6fe779',
        viewFields: {
          calendarEvent: {
            universalIdentifier: 'd9c2f346-b83b-48ae-98d0-e344f97248cd',
          },
          handle: {
            universalIdentifier: '4140bd68-55e8-475c-8724-7f9f97634a9f',
          },
          displayName: {
            universalIdentifier: '3cadc470-9231-4027-9bbe-60e934edb483',
          },
          isOrganizer: {
            universalIdentifier: '684972f9-c5fe-4fff-bdec-2fc5511c938c',
          },
          responseStatus: {
            universalIdentifier: 'dd0ab0bd-7f33-48fa-9461-fb5d085a2f9f',
          },
          person: {
            universalIdentifier: '86546244-9e3d-40e4-87cd-cbc82a353d2e',
          },
          workspaceMember: {
            universalIdentifier: '542141b0-ac85-4c43-867b-8d7f559b07ae',
          },
          createdAt: {
            universalIdentifier: '63d9d40d-e40c-410c-a14c-2f36c64c3e69',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-8f1d-4eef-9f85-0d1965e27221',
      ),
      title: { universalIdentifier: '20202020-080e-49d1-b21d-9702a7e2525c' },
      isCanceled: {
        universalIdentifier: '20202020-335b-4e04-b470-43b84b64863c',
      },
      isFullDay: {
        universalIdentifier: '20202020-551c-402c-bb6d-dfe9efe86bcb',
      },
      startsAt: {
        universalIdentifier: '20202020-2c57-4c75-93c5-2ac950a6ed67',
      },
      endsAt: { universalIdentifier: '20202020-2554-4ee1-a617-17907f6bab21' },
      externalCreatedAt: {
        universalIdentifier: '20202020-9f03-4058-a898-346c62181599',
      },
      externalUpdatedAt: {
        universalIdentifier: '20202020-b355-4c18-8825-ef42c8a5a755',
      },
      description: {
        universalIdentifier: '20202020-52c4-4266-a98f-e90af0b4d271',
      },
      location: {
        universalIdentifier: '20202020-641a-4ffe-960d-c3c186d95b17',
      },
      iCalUid: {
        universalIdentifier: '20202020-f24b-45f4-b6a3-d2f9fcb98714',
      },
      conferenceSolution: {
        universalIdentifier: '20202020-1c3f-4b5a-b526-5411a82179eb',
      },
      conferenceLink: {
        universalIdentifier: '20202020-35da-43ef-9ca0-e936e9dc237b',
      },
      calendarChannelEventAssociations: {
        universalIdentifier: '20202020-bdf8-4572-a2cc-ecbb6bcc3a02',
      },
      calendarEventParticipants: {
        universalIdentifier: '20202020-e07e-4ccb-88f5-6f3d00458eec',
      },
      callRecordings: {
        universalIdentifier: '48d6d151-18e2-4111-b405-d85fb9d860d8',
      },
    },
    indexes: {},
    views: {
      allCalendarEvents: {
        universalIdentifier: '20202020-c001-4c01-8c01-ca1ebe0ca001',
        viewFields: {
          title: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf01',
          },
          startsAt: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf02',
          },
          endsAt: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf03',
          },
          isFullDay: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf04',
          },
          location: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf05',
          },
          conferenceLink: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf06',
          },
          isCanceled: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf07',
          },
          createdAt: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf08',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        'ce19efb9-710f-45b2-b141-473abbeea60b',
      ),
      title: {
        universalIdentifier: '4cff8863-a1d1-45fd-a370-4eb6aa1f2a5b',
      },
      status: {
        universalIdentifier: '3e617680-d93e-4309-a54f-90f69528bfd7',
      },
      recordingRequestStatus: {
        universalIdentifier: '7fd681c9-244c-4e98-8939-7b175d472638',
      },
      applicationId: {
        universalIdentifier: '24ec1239-1240-42cb-8a2d-302632378e09',
      },
      externalBotId: {
        universalIdentifier: '0a2da128-9bcc-488b-bc31-65318c41bdf9',
      },
      externalRecordingId: {
        universalIdentifier: '6d17fb71-324b-4625-a5be-b3580607e2c7',
      },
      startedAt: {
        universalIdentifier: '6c56c23f-1987-410a-860a-df3b2b3f9a33',
      },
      endedAt: {
        universalIdentifier: '7a38a9cf-8424-4d6e-b80a-6883d3c662ef',
      },
      video: {
        universalIdentifier: 'bb9523d3-457e-4f4b-8c79-27a77afb87da',
      },
      audio: {
        universalIdentifier: '2eafc2d0-8fec-430c-a939-65ca5fbc0f08',
      },
      transcript: {
        universalIdentifier: '27b86d68-57d1-4607-aca0-191896b1ad43',
      },
      summary: {
        universalIdentifier: 'adb0f472-756b-4d3f-b21e-ea32bf73a5e4',
      },
      calendarEvent: {
        universalIdentifier: '49e64b28-bd98-4775-80ea-4781bdd45e35',
      },
    },
    indexes: {
      calendarEventIdIndex: {
        universalIdentifier: '8be3cc47-9352-4a1b-ad19-bb186bc0865d',
      },
    },
    views: {
      allCallRecordings: {
        universalIdentifier: 'c395b55e-88f0-4d5b-a1fb-0d38b50e0b19',
        viewFields: {
          status: {
            universalIdentifier: '6c4a81a2-d9c1-4f82-984c-f97e083ca710',
          },
          recordingRequestStatus: {
            universalIdentifier: '3bdedacd-0fd5-4175-8d28-2fe41bb5aa77',
          },
          title: {
            universalIdentifier: 'b1d5051b-071d-4514-93cf-704724cdc8f6',
          },
          startedAt: {
            universalIdentifier: '3b96351f-66ed-4fa6-acb6-698647573af7',
          },
        },
      },
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
    universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-b374-4779-a561-80086cb2e17f',
      ),
      name: { universalIdentifier: '20202020-4d99-4e2e-a84c-4a27837b1ece' },
      domainName: {
        universalIdentifier: '20202020-0c28-43d8-8ba5-3659924d3489',
      },
      address: { universalIdentifier: '20202020-c5ce-4adc-b7b6-9c0979fc55e7' },
      linkedinLink: {
        universalIdentifier: '20202020-ebeb-4beb-b9ad-6848036fb451',
      },
      annualRevenue: {
        universalIdentifier: '60f533b7-2166-4071-a767-ceb0286822fd',
      },
      people: { universalIdentifier: '20202020-3213-4ddf-9494-6422bcff8d7c' },
      accountOwner: {
        universalIdentifier: '20202020-95b8-4e10-9881-edb5d4765f9d',
      },
      taskTargets: {
        universalIdentifier: '20202020-cb17-4a61-8f8f-3be6730480de',
      },
      noteTargets: {
        universalIdentifier: '20202020-bae0-4556-a74a-a9c686f77a88',
      },
      opportunities: {
        universalIdentifier: '20202020-add3-4658-8e23-d70dccb6d0ec',
      },
      attachments: {
        universalIdentifier: '20202020-c1b5-4120-b0f0-987ca401ed53',
      },
      timelineActivities: {
        universalIdentifier: '20202020-0414-4daf-9c0d-64fe7b27f89f',
      },
    },
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
          linkedinLink: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf007',
          },
          address: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf008',
          },
        },
      },
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
    universalIdentifier: '20202020-3840-4b6d-9425-0c5188b05ca8',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-3840-4b6d-9425-0c5188b05ca8',
      ),
      title: { universalIdentifier: '20202020-20ee-4091-95dc-44b57eda3a89' },
      pageLayoutId: {
        universalIdentifier: '20202020-bb53-4648-aa36-1d9d54e6f7f2',
      },
      timelineActivities: {
        universalIdentifier: '99c330c0-5b7d-4276-a764-aed84499dfb5',
      },
      attachments: {
        universalIdentifier: '20202020-bf6f-4220-8c55-2764f1175870',
      },
    },
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: 'e69f71aa-de0f-4b70-845f-7a8369c47928',
      },
    },
    views: {
      allDashboards: {
        universalIdentifier: '20202020-a012-4a12-8a12-da5ab0b0a001',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af01',
          },
          createdBy: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af02',
          },
          createdAt: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af03',
          },
          updatedAt: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af04',
          },
        },
      },
    },
  },
  messageCampaign: {
    universalIdentifier: '238acb94-dd4c-4036-bc55-19b99d821efd',
    fields: {
      ...buildStandardObjectSystemFields(
        '238acb94-dd4c-4036-bc55-19b99d821efd',
      ),
      subject: { universalIdentifier: '7251544c-b07a-4f0d-9d0a-48514367f230' },
      bodyTemplate: {
        universalIdentifier: 'b3a69d08-31ca-4a8d-8359-5ca462899342',
      },
      fromAddress: {
        universalIdentifier: '91e1a33c-c1ff-411a-b720-9085e13c05db',
      },
      status: { universalIdentifier: 'c7117256-3de6-48e1-87df-c99c32bad610' },
      sentAt: { universalIdentifier: 'e2315b4f-9edf-4df2-96b9-961e76368671' },
      sentCount: {
        universalIdentifier: '2f333d2b-37b8-4ddc-ad0d-c07c6ce066ad',
      },
      failedCount: {
        universalIdentifier: 'd373fcd7-b1ce-4c77-8031-a5785c475028',
      },
      bouncedCount: {
        universalIdentifier: '20d884a9-34dd-4667-8ecb-ceec224258e2',
      },
      complainedCount: {
        universalIdentifier: '82842cfa-f12a-4bab-bbde-b2cf587d0406',
      },
      unsubscribeTopicId: {
        universalIdentifier: '0648e7ad-1769-4ff6-a4d5-72da79ef169c',
      },
      list: { universalIdentifier: 'cb24dcdf-f0e8-4c71-8cff-70b714e86530' },
      timelineActivities: {
        universalIdentifier: 'd4e5f607-1829-4da3-8eb4-25f607182930',
      },
      messages: { universalIdentifier: 'e5a177a7-512b-4778-928e-69777a528f7c' },
      recipients: {
        universalIdentifier: '05a3271c-5b91-493c-8f30-2d27b31d019e',
      },
    },
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
      allMessageCampaigns: {
        universalIdentifier: 'ffedb368-33f0-43a7-b84e-e622b4e97be9',
        viewFields: {
          subject: {
            universalIdentifier: 'b017c851-e38d-4a81-ab38-0fb10e9f239e',
          },
          status: {
            universalIdentifier: 'ef35df97-b1a5-4f16-8b85-5751e5019f63',
          },
          list: {
            universalIdentifier: 'c0bf6a48-8695-4520-81e6-7462d35033b5',
          },
          fromAddress: {
            universalIdentifier: '553a0ea6-1f55-4143-a2d0-8c1ad0cf3dd1',
          },
          sentAt: {
            universalIdentifier: '7f4a9d81-afac-4d27-98de-0a2da65114f7',
          },
          sentCount: {
            universalIdentifier: '0be62e57-3955-49bd-a9ef-8f82f7a6e9aa',
          },
          failedCount: {
            universalIdentifier: 'ad346c8e-f462-499e-89c8-da01d5460dc6',
          },
          bouncedCount: {
            universalIdentifier: '135d3fb9-bc45-4426-980b-9836ed792e3a',
          },
          complainedCount: {
            universalIdentifier: '9957dc6d-05ae-4829-ae7d-7cdf9239cdd0',
          },
          recipients: {
            universalIdentifier: '2f99f444-4af3-44fd-b08d-46955c4ac2a2',
          },
          createdAt: {
            universalIdentifier: '6dffa47d-3128-4d54-924a-4f67676116c2',
          },
        },
      },
    },
  },
  messageList: {
    universalIdentifier: '826561ea-4816-411c-baa0-eec5e6ca8866',
    fields: {
      ...buildStandardObjectSystemFields(
        '826561ea-4816-411c-baa0-eec5e6ca8866',
      ),
      name: { universalIdentifier: '69b9ed8b-7b26-4108-894f-05700ef7e8ee' },
      members: {
        universalIdentifier: '92df3493-91cf-4665-8587-1b08917d299b',
      },
      campaigns: {
        universalIdentifier: 'e098d838-31ab-4812-91a8-f055f45a6832',
      },
      timelineActivities: {
        universalIdentifier: 'e0a5b2c3-4d6f-4e81-9a02-1b3c4d5e6f70',
      },
    },
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: '8e205171-ed74-4620-b7d2-674aab85033a',
      },
    },
    views: {
      allMessageLists: {
        universalIdentifier: 'c72bae18-75e9-4cb0-baeb-379d3529b98f',
        viewFields: {
          name: {
            universalIdentifier: 'c9767580-34e6-420b-923d-b4abd8c13d96',
          },
          members: {
            universalIdentifier: '6d314c4b-215a-4094-963a-ff9dd8221aea',
          },
          campaigns: {
            universalIdentifier: '037030a2-9dad-4bfd-957a-313b362172b4',
          },
          createdAt: {
            universalIdentifier: '29f3e7de-c40b-4597-8568-7318c146e4da',
          },
        },
      },
    },
  },
  messageListMember: {
    universalIdentifier: '27773d24-8ce3-40f8-aa6c-1f590f2c08d2',
    fields: {
      ...buildStandardObjectSystemFields(
        '27773d24-8ce3-40f8-aa6c-1f590f2c08d2',
      ),
      person: { universalIdentifier: '34288425-8805-42fb-8b98-ee13d09be3d3' },
      list: {
        universalIdentifier: 'd5402005-e8f9-4fbe-8696-b6723cd85018',
      },
    },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-ad1e-4127-bccb-d83ae04d2ccb',
      ),
      messageChannelId: {
        universalIdentifier: '20202020-b658-408f-bd46-3bd2d15d7e52',
      },
      message: {
        universalIdentifier: '20202020-da5d-4ac5-8743-342ab0a0336b',
      },
      messageExternalId: {
        universalIdentifier: '20202020-37d6-438f-b6fd-6503596c8f34',
      },
      messageThread: {
        universalIdentifier: '20202020-fac8-42a8-94dd-44dbc920ae16',
      },
      messageThreadExternalId: {
        universalIdentifier: '20202020-35fb-421e-afa0-0b8e8f7f9018',
      },
      direction: {
        universalIdentifier: '75c9b0f7-9e76-44d4-a2f9-47051e61eec7',
      },
      messageFolders: {
        universalIdentifier: '9bfc9da7-ae2d-44fd-9563-ede90c5d6222',
      },
    },
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
      allMessageChannelMessageAssociations: {
        universalIdentifier: 'a4f465ac-d5cb-4f24-93ac-7a24bafd398e',
        viewFields: {
          messageChannelId: {
            universalIdentifier: 'b86e652b-04ce-4089-9f71-e190eaf5b798',
          },
          message: {
            universalIdentifier: 'f9f2de0d-3db5-402b-a733-53be6a4667c8',
          },
          messageExternalId: {
            universalIdentifier: '7fb9801d-ca3d-4b2d-8d55-c922fcf7fefd',
          },
          direction: {
            universalIdentifier: 'ca38195e-985c-4880-85e0-26fa143c1ec7',
          },
          createdAt: {
            universalIdentifier: 'af239abd-2c55-4108-a9d8-b5a67f6ca2e2',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-a1b0-40b0-8ab0-5b6c7d8e9f0a',
      ),
      messageChannelMessageAssociation: {
        universalIdentifier: '7411cfa3-4fd9-4b90-a636-940015fd7243',
      },
      messageFolderId: {
        universalIdentifier: 'b3369d31-3856-4a7a-b007-ee353918127c',
      },
    },
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
      allMessageChannelMessageAssociationMessageFolders: {
        universalIdentifier: '775610fe-f1d1-4959-bdc3-0b437059cfeb',
        viewFields: {
          messageChannelMessageAssociation: {
            universalIdentifier: '1251e67a-e795-4bc2-a468-6cfc838b6a0a',
          },
          messageFolderId: {
            universalIdentifier: 'aff2203d-6439-43b8-9cb4-55e8d78bba43',
          },
          createdAt: {
            universalIdentifier: '9da7637e-25c7-4101-8169-b5f6ff159690',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-a433-4456-aa2d-fd9cb26b774a',
      ),
      message: {
        universalIdentifier: '20202020-985b-429a-9db9-9e55f4898a2a',
      },
      role: {
        universalIdentifier: '20202020-65d1-42f4-8729-c9ec1f52aecd',
      },
      handle: {
        universalIdentifier: '20202020-2456-464e-b422-b965a4db4a0b',
      },
      displayName: {
        universalIdentifier: '20202020-36dd-4a4f-ac02-228425be9fac',
      },
      person: {
        universalIdentifier: '20202020-249d-4e0f-82cd-1b9df5cd3da2',
      },
      workspaceMember: {
        universalIdentifier: '20202020-77a7-4845-99ed-1bcbb478be6f',
      },
      messageCampaign: {
        universalIdentifier: '5bc768db-919f-41da-8c43-df08084d526f',
      },
    },
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
      allMessageParticipants: {
        universalIdentifier: '8b7fbe7d-dae0-4285-8bdc-ec078a4de870',
        viewFields: {
          message: {
            universalIdentifier: 'ca491a31-8659-4202-9476-f0f72efc80b5',
          },
          role: {
            universalIdentifier: '55b74f7e-7c58-4fce-a44b-a8d9671ec541',
          },
          handle: {
            universalIdentifier: 'abcbb5d9-b8c2-46bb-b3cc-ea035be8f3be',
          },
          displayName: {
            universalIdentifier: '8d0c8202-b57f-4450-a090-a7eb26aa2299',
          },
          person: {
            universalIdentifier: '26d0f3f1-43d3-425c-930c-81147451d0f8',
          },
          workspaceMember: {
            universalIdentifier: 'df62dcbc-c22d-4d34-9fa5-6f70bae02161',
          },
          createdAt: {
            universalIdentifier: '636ff7b6-86b8-49fc-9442-39f4c24ff424',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-849a-4c3e-84f5-a25a7d802271',
      ),
      messages: {
        universalIdentifier: '20202020-3115-404f-aade-e1154b28e35a',
      },
      messageChannelMessageAssociations: {
        universalIdentifier: '20202020-314e-40a4-906d-a5d5d6c285f6',
      },
      subject: {
        universalIdentifier: 'a8ddbf8c-1137-45d1-b89e-5ffbd83f67c8',
      },
    },
    indexes: {},
    views: {
      allMessageThreads: {
        universalIdentifier: '20202020-d002-4d02-8d02-ae55a9ba2002',
        viewFields: {
          subject: {
            universalIdentifier: 'e5f0d32b-2b6a-47bc-b3bd-f32c96594ec1',
          },
          messages: {
            universalIdentifier: '20202020-df02-4d02-8d02-ae55a9ba2f01',
          },
          updatedAt: {
            universalIdentifier: 'af2c6ac9-7083-4609-8172-d518441f5e9e',
          },
          createdAt: {
            universalIdentifier: '20202020-df02-4d02-8d02-ae55a9ba2f02',
          },
        },
      },
    },
  },
  message: {
    universalIdentifier: '20202020-3f6b-4425-80ab-e468899ab4b2',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-3f6b-4425-80ab-e468899ab4b2',
      ),
      headerMessageId: {
        universalIdentifier: '20202020-72b5-416d-aed8-b55609067d01',
      },
      messageThread: {
        universalIdentifier: '20202020-30f2-4ccd-9f5c-e41bb9d26214',
      },
      subject: { universalIdentifier: '20202020-52d1-4036-b9ae-84bd722bb37a' },
      text: { universalIdentifier: '20202020-d2ee-4e7e-89de-9a0a9044a143' },
      receivedAt: {
        universalIdentifier: '20202020-140a-4a2a-9f86-f13b6a979afc',
      },
      messageParticipants: {
        universalIdentifier: '20202020-7cff-4a74-b63c-73228448cbd9',
      },
      messageChannelMessageAssociations: {
        universalIdentifier: '20202020-3cef-43a3-82c6-50e7cfbc9ae4',
      },
      messageCampaign: {
        universalIdentifier: '77cff00b-a0ba-48d6-80de-0d5ccf14e45b',
      },
      deliveryStatus: {
        universalIdentifier: '209254fa-2b89-429d-a72a-c401c4bd5a78',
      },
      isDraft: {
        universalIdentifier: '20202020-4d3a-4b6e-9c1f-2a5e7b9d0c34',
      },
    },
    indexes: {
      messageThreadIdIndex: {
        universalIdentifier: '7a05b45e-7aa6-4a7e-9bbc-299cbed53c96',
      },
      messageCampaignIdIndex: {
        universalIdentifier: '79e777ca-7008-46c5-b3a6-3108b7c7dfb6',
      },
    },
    views: {
      allMessages: {
        universalIdentifier: '20202020-d001-4d01-8d01-ae55a9e5a001',
        viewFields: {
          subject: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af01',
          },
          messageThread: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af02',
          },
          messageParticipants: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af03',
          },
          receivedAt: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af04',
          },
          headerMessageId: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af05',
          },
          text: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af06',
          },
          createdAt: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af07',
          },
        },
      },
    },
  },
  note: {
    universalIdentifier: '20202020-0b00-45cd-b6f6-6cd806fc6804',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-0b00-45cd-b6f6-6cd806fc6804',
      ),
      title: { universalIdentifier: '20202020-faeb-4c76-8ba6-ccbb0b4a965f' },
      bodyV2: { universalIdentifier: '20202020-a7bb-4d94-be51-8f25181502c8' },
      noteTargets: {
        universalIdentifier: '20202020-1f25-43fe-8b00-af212fdde823',
      },
      attachments: {
        universalIdentifier: '20202020-4986-4c92-bf19-39934b149b16',
      },
      timelineActivities: {
        universalIdentifier: '20202020-7030-42f8-929c-1a57b25d6bce',
      },
    },
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: '8183c8d2-9114-4b6e-8c5d-12a3b14a5a13',
      },
    },
    views: {
      allNotes: {
        universalIdentifier: '20202020-a005-4a05-8a05-a0be5a11a000',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af00',
          },
          noteTargets: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af01',
          },
          bodyV2: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af02',
          },
          createdBy: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af03',
          },
          createdAt: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af04',
          },
        },
      },
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
    universalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-fff0-4b44-be82-bda313884400',
      ),
      note: { universalIdentifier: '20202020-57f3-4f50-9599-fc0f671df003' },
      targetPerson: {
        universalIdentifier: '20202020-38ca-4aab-92f5-8a605ca2e4c5',
      },
      targetCompany: {
        universalIdentifier: 'c500fbc0-d6f2-4982-a959-5a755431696c',
      },
      targetOpportunity: {
        universalIdentifier: '20202020-4e42-417a-a705-76581c9ade79',
      },
    },
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
      allNoteTargets: {
        universalIdentifier: 'd124d587-ef78-402b-9341-7673e6cea033',
        viewFields: {
          id: {
            universalIdentifier: 'f2d912fe-7c6f-4a9c-b808-b7b5a18d2818',
          },
          note: {
            universalIdentifier: '9d4ac173-d32b-4a44-9dbd-8a47ab844f98',
          },
          targetPerson: {
            universalIdentifier: 'b6f67de5-c5cf-4235-b740-a6a007c8eae3',
          },
          targetCompany: {
            universalIdentifier: 'a9c7f370-4b22-4f29-8e3f-678e91a59576',
          },
          targetOpportunity: {
            universalIdentifier: '3efeb162-cd03-458b-9c7b-47032d045204',
          },
        },
      },
    },
  },
  opportunity: {
    universalIdentifier: '20202020-9549-49dd-b2b2-883999db8938',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-9549-49dd-b2b2-883999db8938',
      ),
      name: { universalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5' },
      amount: { universalIdentifier: '20202020-583e-4642-8533-db761d5fa82f' },
      closeDate: {
        universalIdentifier: '20202020-527e-44d6-b1ac-c4158d307b97',
      },
      stage: { universalIdentifier: '20202020-6f76-477d-8551-28cd65b2b4b9' },
      pointOfContact: {
        universalIdentifier: '20202020-8dfb-42fc-92b6-01afb759ed16',
      },
      company: { universalIdentifier: '20202020-cbac-457e-b565-adece5fc815f' },
      owner: { universalIdentifier: '20202020-be7e-4d1e-8e19-3d5c7c4b9f2a' },
      taskTargets: {
        universalIdentifier: '20202020-59c0-4179-a208-4a255f04a5be',
      },
      noteTargets: {
        universalIdentifier: '20202020-dd3f-42d5-a382-db58aabf43d3',
      },
      attachments: {
        universalIdentifier: '20202020-87c7-4118-83d6-2f4031005209',
      },
      timelineActivities: {
        universalIdentifier: '20202020-30e2-421f-96c7-19c69d1cf631',
      },
    },
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
      allOpportunities: {
        universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca1ba0',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf',
          },
          amount: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb0',
          },
          createdBy: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb1',
          },
          closeDate: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb2',
          },
          company: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb3',
          },
          pointOfContact: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb4',
          },
        },
      },
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
    universalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-e674-48e5-a542-72570eee7213',
      ),
      name: { universalIdentifier: '20202020-3875-44d5-8c33-a6239011cab8' },
      emails: { universalIdentifier: '20202020-3c51-43fa-8b6e-af39e29368ab' },
      linkedinLink: {
        universalIdentifier: '20202020-f1af-48f7-893b-2007a73dd508',
      },
      jobTitle: { universalIdentifier: '20202020-b0d0-415a-bef9-640a26dacd9b' },
      phones: { universalIdentifier: '20202020-0638-448e-8825-439134618022' },
      avatarUrl: {
        universalIdentifier: '20202020-b8a6-40df-961c-373dc5d2ec21',
      },
      avatarFile: {
        universalIdentifier: '20202020-a7c9-4e3d-8f1b-2d5a6b7c8e9f',
      },
      company: { universalIdentifier: '20202020-e2f3-448e-b34c-2d625f0025fd' },
      pointOfContactForOpportunities: {
        universalIdentifier: '20202020-911b-4a7d-b67b-918aa9a5b33a',
      },
      taskTargets: {
        universalIdentifier: '20202020-584b-4d3e-88b6-53ab1fa03c3a',
      },
      noteTargets: {
        universalIdentifier: '20202020-c8fc-4258-8250-15905d3fcfec',
      },
      attachments: {
        universalIdentifier: '20202020-cd97-451f-87fa-bcb789bdbf3a',
      },
      messageParticipants: {
        universalIdentifier: '20202020-498e-4c61-8158-fa04f0638334',
      },
      calendarEventParticipants: {
        universalIdentifier: '20202020-52ee-45e9-a702-b64b3753e3a9',
      },
      timelineActivities: {
        universalIdentifier: '20202020-a43e-4873-9c23-e522de906ce5',
      },
      listMemberships: {
        universalIdentifier: '8b8d1be0-4c94-4413-a2c9-c7ede205a81d',
      },
    },
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
      allPeople: {
        universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea11a00',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af0',
          },
          emails: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af1',
          },
          createdBy: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af2',
          },
          company: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af3',
          },
          phones: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af4',
          },
          createdAt: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af5',
          },
          jobTitle: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af7',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af8',
          },
        },
      },
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
    universalIdentifier: '20202020-1ba1-48ba-bc83-ef7e5990ed10',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-1ba1-48ba-bc83-ef7e5990ed10',
      ),
      title: { universalIdentifier: '20202020-b386-4cb7-aa5a-08d4a4d92680' },
      bodyV2: { universalIdentifier: '20202020-4aa0-4ae8-898d-7df0afd47ab1' },
      dueAt: { universalIdentifier: '20202020-fd99-40da-951b-4cb9a352fce3' },
      status: { universalIdentifier: '20202020-70bc-48f9-89c5-6aa730b151e0' },
      taskTargets: {
        universalIdentifier: '20202020-de9c-4d0e-a452-713d4a3e5fc7',
      },
      attachments: {
        universalIdentifier: '20202020-794d-4783-a8ff-cecdb15be139',
      },
      assignee: { universalIdentifier: '20202020-065a-4f42-a906-e20422c1753f' },
      timelineActivities: {
        universalIdentifier: '20202020-c778-4278-99ee-23a2837aee64',
      },
    },
    indexes: {
      assigneeIdIndex: {
        universalIdentifier: 'f48fa3b1-0cec-44da-a9e5-f8a5e766637e',
      },
      searchVectorGinIndex: {
        universalIdentifier: 'a86b32b3-01d3-4302-a152-8b7f247db7b4',
      },
    },
    views: {
      allTasks: {
        universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a1ea0',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf',
          },
          status: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb0',
          },
          taskTargets: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb1',
          },
          createdBy: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb2',
          },
          dueAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb3',
          },
          assignee: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb4',
          },
          bodyV2: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb5',
          },
          createdAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb6',
          },
        },
      },
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
    universalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-5a9a-44e8-95df-771cd06d0fb1',
      ),
      task: { universalIdentifier: '20202020-e881-457a-8758-74aaef4ae78a' },
      targetPerson: {
        universalIdentifier: '20202020-c8a0-4e85-a016-87e2349cfbec',
      },
      targetCompany: {
        universalIdentifier: '20202020-4703-4a4e-948c-487b0c60a92c',
      },
      targetOpportunity: {
        universalIdentifier: '20202020-6cb2-4c01-a9a5-aca3dbc11d41',
      },
    },
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
      allTaskTargets: {
        universalIdentifier: '1dbf1d24-6cca-4f55-ae2f-e3d1b425a495',
        viewFields: {
          id: {
            universalIdentifier: 'a49287c9-8aa6-4fca-9ec5-08d643f7239f',
          },
          task: {
            universalIdentifier: '1f79839e-42f6-4a69-839a-369e21a7497d',
          },
          targetPerson: {
            universalIdentifier: 'cadc7a33-1527-4ef8-ac00-7ed0b54d1bae',
          },
          targetCompany: {
            universalIdentifier: 'e9fa1305-4ba2-41c5-9198-fdc622b69f90',
          },
          targetOpportunity: {
            universalIdentifier: '526f3354-34d6-4e7e-a870-5f99c28353c2',
          },
        },
      },
    },
  },
  timelineActivity: {
    universalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-6736-4337-b5c4-8b39fae325a5',
      ),
      name: { universalIdentifier: '20202020-7207-46e8-9dab-849505ae8497' },
      happensAt: {
        universalIdentifier: '20202020-9526-4993-b339-c4318c4d39f0',
      },
      properties: {
        universalIdentifier: '20202020-f142-4b04-b91b-6a2b4af3bf11',
      },
      workspaceMember: {
        universalIdentifier: '20202020-af23-4479-9a30-868edc474b36',
      },
      targetPerson: {
        universalIdentifier: '20202020-c414-45b9-a60a-ac27aa96229f',
      },
      targetCompany: {
        universalIdentifier: '20202020-04ad-4221-a744-7a8278a5ce21',
      },
      targetOpportunity: {
        universalIdentifier: '20202020-7664-4a35-a3df-580d389fd527',
      },
      targetTask: {
        universalIdentifier: '20202020-b2f5-415c-9135-a31dfe49501b',
      },
      targetNote: {
        universalIdentifier: '20202020-ec55-4135-8da5-3a20badc0156',
      },
      targetWorkflow: {
        universalIdentifier: '20202020-616c-4ad3-a2e9-c477c341e295',
      },
      targetWorkflowVersion: {
        universalIdentifier: '20202020-74f1-4711-a129-e14ca0ecd744',
      },
      targetWorkflowRun: {
        universalIdentifier: '20202020-96f0-401b-9186-a3a0759225ac',
      },
      targetDashboard: {
        universalIdentifier: '20202020-7864-48f5-af7c-9e4b60140948',
      },
      targetMessageList: {
        universalIdentifier: 'd9f4a1b2-3c5e-4d70-8e91-0a2b3c4d5e6f',
      },
      targetMessageCampaign: {
        universalIdentifier: 'b2c3d4e5-6f70-4b81-8c92-03d4e5f60718',
      },
      linkedRecordCachedName: {
        universalIdentifier: '20202020-cfdb-4bef-bbce-a29f41230934',
      },
      linkedRecordId: {
        universalIdentifier: '20202020-2e0e-48c0-b445-ee6c1e61687d',
      },
      linkedObjectMetadataId: {
        universalIdentifier: '20202020-c595-449d-9f89-562758c9ee69',
      },
    },
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
      allTimelineActivities: {
        universalIdentifier: '20202020-b101-4b01-8b01-ba5cc01aa001',
        viewFields: {
          name: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa011',
          },
          happensAt: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa012',
          },
          properties: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa019',
          },
          workspaceMember: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa013',
          },
          linkedRecordCachedName: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa017',
          },
          targetPerson: {
            universalIdentifier: '37b38a8b-abd7-4f72-92d2-ad82bbef0296',
          },
          targetCompany: {
            universalIdentifier: '2015825f-0786-4b0d-88a7-dfce1b4b1c1a',
          },
          targetOpportunity: {
            universalIdentifier: 'f7b5ced9-eba6-4454-8849-7a92d27c11ca',
          },
          targetTask: {
            universalIdentifier: '3899138d-e6fa-414c-9432-214c9b797ebb',
          },
          targetNote: {
            universalIdentifier: 'ab74ed52-0195-4b65-987a-8367c07ee222',
          },
          targetWorkflow: {
            universalIdentifier: 'd2c3ddc3-afad-40b9-a2cb-d2765f2f5691',
          },
          targetWorkflowVersion: {
            universalIdentifier: '4a7e3213-afd5-4691-8bba-0a10e8697afb',
          },
          targetWorkflowRun: {
            universalIdentifier: '97910946-04f0-4634-804e-880bc0019225',
          },
          targetDashboard: {
            universalIdentifier: '538847e8-ab09-407c-a433-505f6d7be7a1',
          },
        },
      },
    },
  },
  workflow: {
    universalIdentifier: '20202020-62be-406c-b9ca-8caa50d51392',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-62be-406c-b9ca-8caa50d51392',
      ),
      name: { universalIdentifier: '20202020-b3d3-478f-acc0-5d901e725b20' },
      lastPublishedVersionId: {
        universalIdentifier: '20202020-326a-4fba-8639-3456c0a169e8',
      },
      statuses: { universalIdentifier: '20202020-357c-4432-8c50-8c31b4a552d9' },
      versions: { universalIdentifier: '20202020-9432-416e-8f3c-27ee3153d099' },
      runs: { universalIdentifier: '20202020-759b-4340-b58b-e73595c4df4f' },
      automatedTriggers: {
        universalIdentifier: '20202020-3319-4234-a34c-117ecad2b8a9',
      },
      timelineActivities: {
        universalIdentifier: '20202020-906e-486a-a798-131a5f081faf',
      },
      attachments: {
        universalIdentifier: '20202020-4a8c-4e2d-9b1c-7e5f3a2b4c6d',
      },
    },
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: 'c7e64c55-eb0c-4b93-b076-5cfcf2e2e042',
      },
    },
    views: {
      allWorkflows: {
        universalIdentifier: '20202020-a009-4a09-8a09-a0bcf10aa11a',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11a',
          },
          statuses: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11b',
          },
          updatedAt: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11c',
          },
          createdBy: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11d',
          },
          versions: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11e',
          },
          runs: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11f',
          },
        },
      },
    },
  },
  workflowAutomatedTrigger: {
    universalIdentifier: '20202020-3319-4234-a34c-7f3b9d2e4d1f',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-3319-4234-a34c-7f3b9d2e4d1f',
      ),
      type: {
        universalIdentifier: '20202020-3319-4234-a34c-3f92c1ab56e7',
      },
      settings: {
        universalIdentifier: '20202020-3319-4234-a34c-bac8f903de12',
      },
      workflow: {
        universalIdentifier: '20202020-3319-4234-a34c-8e1a4d2f7c03',
      },
    },
    indexes: {
      workflowIdIndex: {
        universalIdentifier: '7331ff89-a3f9-4ac0-9fa9-0de5663ae7b2',
      },
    },
    views: {
      allWorkflowAutomatedTriggers: {
        universalIdentifier: 'a0a9ef79-3d42-417a-8555-3ee54c18ea51',
        viewFields: {
          type: {
            universalIdentifier: '689b4749-aa40-489a-bf0b-475a197ca2e6',
          },
          workflow: {
            universalIdentifier: 'e5a46195-06fe-4f47-8844-128e35151d37',
          },
          createdAt: {
            universalIdentifier: 'bb35e66a-2a1e-416b-8105-5749d91ab65f',
          },
        },
      },
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
    universalIdentifier: '20202020-4e28-4e95-a9d7-6c00874f843c',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-4e28-4e95-a9d7-6c00874f843c',
      ),
      name: { universalIdentifier: '20202020-b840-4253-aef9-4e5013694587' },
      workflowVersion: {
        universalIdentifier: '20202020-2f52-4ba8-8dc4-d0d6adb9578d',
      },
      workflow: {
        universalIdentifier: '20202020-8c57-4e7f-84f5-f373f68e1b82',
      },
      enqueuedAt: {
        universalIdentifier: '20202020-f1e3-4de1-a461-b5c4fdbc861d',
      },
      startedAt: {
        universalIdentifier: '20202020-a234-4e2d-bd15-85bcea6bb183',
      },
      endedAt: { universalIdentifier: '20202020-e1c1-4b6b-bbbd-b2beaf2e159e' },
      status: { universalIdentifier: '20202020-6b3e-4f9c-8c2b-2e5b8e6d6f3b' },
      state: { universalIdentifier: '20202020-611f-45f3-9cde-d64927e8ec57' },
      stepLogs: {
        universalIdentifier: '20202020-7c4e-4e1a-8fc1-1e3a55d6c2a1',
      },
      timelineActivities: {
        universalIdentifier: '20202020-af4d-4eb0-babc-eb960a45b356',
      },
    },
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
      allWorkflowRuns: {
        universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abca5',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf',
          },
          workflow: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb0',
          },
          status: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb1',
          },
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
      },
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
    universalIdentifier: '20202020-d65d-4ab9-9344-d77bfb376a3d',
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-d65d-4ab9-9344-d77bfb376a3d',
      ),
      name: { universalIdentifier: '20202020-a12f-4cca-9937-a2e40cc65509' },
      workflow: {
        universalIdentifier: '20202020-afa3-46c3-91b0-0631ca6aa1c8',
      },
      trigger: {
        universalIdentifier: '20202020-4eae-43e7-86e0-212b41a30b48',
      },
      status: {
        universalIdentifier: '20202020-5a34-440e-8a25-39d8c3d1d4cf',
      },
      runs: { universalIdentifier: '20202020-1d08-46df-901a-85045f18099a' },
      steps: { universalIdentifier: '20202020-5988-4a64-b94a-1f9b7b989039' },
      timelineActivities: {
        universalIdentifier: '20202020-fcb0-4695-b17e-3b43a421c633',
      },
    },
    indexes: {
      workflowIdIndex: {
        universalIdentifier: '8138c3b3-0b14-4ee1-be0e-debdde6b3219',
      },
      searchVectorGinIndex: {
        universalIdentifier: '6f3a65eb-2aee-4108-b8a0-c62da419d1dc',
      },
    },
    views: {
      allWorkflowVersions: {
        universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aae15',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeaf',
          },
          workflow: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb0',
          },
          status: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb1',
          },
          updatedAt: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb2',
          },
          runs: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb3',
          },
        },
      },
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
    fields: {
      ...buildStandardObjectSystemFields(
        '20202020-3319-4234-a34c-82d5c0e881a6',
      ),
      name: { universalIdentifier: '20202020-e914-43a6-9c26-3603c59065f4' },
      colorScheme: {
        universalIdentifier: '20202020-66bc-47f2-adac-f2ef7c598b63',
      },
      locale: {
        universalIdentifier: '20202020-402e-4695-b169-794fa015afbe',
      },
      avatarUrl: {
        universalIdentifier: '20202020-0ced-4c4f-a376-c98a966af3f6',
      },
      userEmail: {
        universalIdentifier: '20202020-4c5f-4e09-bebc-9e624e21ecf4',
      },
      jobTitle: {
        universalIdentifier: '20202020-4dd4-4619-826e-08f6c06b374d',
      },
      userId: {
        universalIdentifier: '20202020-75a9-4dfc-bf25-2e4b43e89820',
      },
      assignedTasks: {
        universalIdentifier: '20202020-61dc-4a1c-99e8-38ebf8d2bbeb',
      },
      ownedOpportunities: {
        universalIdentifier: '20202020-9e4d-4b3a-8c1f-6d7e8f9a0b1c',
      },
      accountOwnerForCompanies: {
        universalIdentifier: '20202020-dc29-4bd4-a3c1-29eafa324bee',
      },
      messageParticipants: {
        universalIdentifier: '20202020-8f99-48bc-a5eb-edd33dd54188',
      },
      blocklist: {
        universalIdentifier: '20202020-6cb2-4161-9f29-a4b7f1283859',
      },
      calendarEventParticipants: {
        universalIdentifier: '20202020-0dbc-4841-9ce1-3e793b5b3512',
      },
      timelineActivities: {
        universalIdentifier: '20202020-e15b-47b8-94fe-8200e3c66615',
      },
      timeZone: {
        universalIdentifier: '20202020-2d33-4c21-a86e-5943b050dd54',
      },
      dateFormat: {
        universalIdentifier: '20202020-af13-4e11-b1e7-b8cf5ea13dc0',
      },
      timeFormat: {
        universalIdentifier: '20202020-8acb-4cf8-a851-a6ed443c8d81',
      },
      calendarStartDay: {
        universalIdentifier: '20202020-1ecc-4562-84c9-ff3a2f6cce85',
      },
      numberFormat: {
        universalIdentifier: '20202020-7f40-4e7f-b126-11c0eda6b141',
      },
    },
    indexes: {
      userEmailUniqueIndex: {
        universalIdentifier: '76da5f27-523c-44b6-ad06-12954f6b949f',
      },
      searchVectorGinIndex: {
        universalIdentifier: '8678dde9-a804-4a9e-80e3-9af35e471ec5',
      },
    },
    views: {
      allWorkspaceMembers: {
        universalIdentifier: '20202020-e001-4e01-8e01-a0bcaeabe100',
        viewFields: {
          name: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f0',
          },
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
          createdAt: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f8',
          },
          ownedOpportunities: {
            universalIdentifier: '8a0503f3-ba61-453e-86dc-6c79f7bc235b',
          },
          assignedTasks: {
            universalIdentifier: 'af16226e-6375-4676-8bd9-9d1a57076fc4',
          },
        },
      },
    },
  },
  externalEntityLink: {
    universalIdentifier: 'a8ea9890-3fb3-5ef9-8436-43f278ddda99',
    fields: {
      ...buildStandardObjectSystemFields(
        'a8ea9890-3fb3-5ef9-8436-43f278ddda99',
      ),
      workspaceId: {
        universalIdentifier: '84f2e0d0-14ff-57b4-9375-1a2f1f1db260',
      },
      twentyEntityName: {
        universalIdentifier: '04916c5d-1587-51f3-807f-ca15d9bcc2f6',
      },
      twentyRecordId: {
        universalIdentifier: '87467b36-2058-5c0c-97fb-a658a5a8dd5d',
      },
      externalSystemName: {
        universalIdentifier: 'eedb74e0-e13c-51d5-a62a-d67bced684b2',
      },
      externalEntityName: {
        universalIdentifier: '86c398f3-eb11-5e94-a492-69d7ddc18a35',
      },
      externalRecordId: {
        universalIdentifier: 'd5ccd676-5ad3-5c04-a4e8-3ba467707114',
      },
      authority: {
        universalIdentifier: 'e0cb928f-cad9-529f-a686-65b9f2e21626',
      },
      lastSyncedAt: {
        universalIdentifier: '6be4d82c-c9ef-5d91-a3c2-ec1ff6300fc4',
      },
    },
    indexes: {
      workspaceExternalEntityUniqueIndex: {
        universalIdentifier: 'a9994297-33f5-530e-8358-24ab1bbceebf',
      },
      workspaceTwentyEntityUniqueIndex: {
        universalIdentifier: '20b9d59d-a36c-5329-b261-fee3054d13a3',
      },
    },
  },
  externalSyncOutbox: {
    universalIdentifier: '4b9c0a9e-a701-5ed2-81cf-3b3b93fb52b4',
    fields: {
      ...buildStandardObjectSystemFields(
        '4b9c0a9e-a701-5ed2-81cf-3b3b93fb52b4',
      ),
      workspaceId: {
        universalIdentifier: '88507694-7ded-50a5-9760-206a6ae1e251',
      },
      eventId: {
        universalIdentifier: '8a41378d-81c9-58c6-90ff-45df9742e42c',
      },
      domainIdempotencyKey: {
        universalIdentifier: '363a7fa3-a1e6-5fdc-a3e5-3693c92f23ef',
      },
      eventType: {
        universalIdentifier: '3df6b980-c8da-502a-9f77-48f1af9e6ea3',
      },
      entityName: {
        universalIdentifier: '4da335bf-a278-595a-8d49-b4483cf718a3',
      },
      entityId: {
        universalIdentifier: 'acf2e4cf-6b60-5643-a91e-7d9cf536533f',
      },
      payload: {
        universalIdentifier: '967b3dd2-f63d-518b-970d-26cfeb74fb05',
      },
      status: {
        universalIdentifier: 'b8ced3ac-2125-5052-997c-68b432f59026',
      },
      retryCount: {
        universalIdentifier: '97e988e1-1018-5f16-8fdd-57bead11af54',
      },
      maxRetries: {
        universalIdentifier: '6d14a977-51f4-54fd-bd54-c58a7781e69b',
      },
      lastError: {
        universalIdentifier: '55a13084-6166-5861-b5d7-c4e2d57dc81c',
      },
      nextRetryAt: {
        universalIdentifier: '7cb5b492-03fb-59aa-93c5-0aba9adcaa49',
      },
    },
    indexes: {
      eventIdUniqueIndex: {
        universalIdentifier: 'd6353a88-f364-5848-ad3c-7a8380cfcc47',
      },
      statusNextRetryIndex: {
        universalIdentifier: 'c91cd01a-3600-5ee1-8c51-8b8e10f27bac',
      },
      domainIdempotencyKeyUniqueIndex: {
        universalIdentifier: 'd90db8cc-927b-59d9-a54a-6024159a221b',
      },
    },
  },
  externalSyncInbox: {
    universalIdentifier: 'f24a4ec0-7f54-5cf4-bef4-72f7503f008d',
    fields: {
      ...buildStandardObjectSystemFields(
        'f24a4ec0-7f54-5cf4-bef4-72f7503f008d',
      ),
      workspaceId: {
        universalIdentifier: '57eb6bb8-192e-526f-a7f0-67b85bd84593',
      },
      externalEventId: {
        universalIdentifier: 'a746aa13-f23d-51ed-ad44-832f470e4d01',
      },
      externalSystemName: {
        universalIdentifier: '69cc7ae3-e32a-5e1e-b3f1-16d93d1cacc0',
      },
      eventType: {
        universalIdentifier: 'a0bbb151-83bf-50c8-a26d-6df4686f55f1',
      },
      entityName: {
        universalIdentifier: '8377e954-3553-526a-b238-fc99f519e3f2',
      },
      entityId: {
        universalIdentifier: 'ecffae49-90fb-5f21-b218-268b3dca3792',
      },
      payload: {
        universalIdentifier: '67550dd3-43e2-5328-9213-2ff5053404f8',
      },
      status: {
        universalIdentifier: '2fb7ddbc-6fa7-51f7-ad76-cd71bf2adc83',
      },
      processedAt: {
        universalIdentifier: 'e70387cf-87f8-567f-b703-1d19c15ab01d',
      },
      error: {
        universalIdentifier: '3ccb225d-d7cc-5900-9012-200cfbf5adaf',
      },
    },
    indexes: {
      externalEventIdUniqueIndex: {
        universalIdentifier: '929c3e31-be0e-58f1-b8c3-0378dae98026',
      },
    },
  },
  externalSyncDLQ: {
    universalIdentifier: '5de649b2-e6d0-5d69-a495-e1868f9be148',
    fields: {
      ...buildStandardObjectSystemFields(
        '5de649b2-e6d0-5d69-a495-e1868f9be148',
      ),
      workspaceId: {
        universalIdentifier: 'c2041ea2-0c93-5f95-970e-669639c2942e',
      },
      sourceType: {
        universalIdentifier: 'a8038a8c-aa77-5268-b904-a99411668ff4',
      },
      sourceRecordId: {
        universalIdentifier: 'f979b391-563b-5b8f-bf2b-fbf28a4e1bcd',
      },
      eventId: {
        universalIdentifier: '2ed44e7d-c1f9-5ebf-be22-4c99764da1b6',
      },
      eventType: {
        universalIdentifier: '70363e45-14a9-52f6-8475-4aead2178a0f',
      },
      payload: {
        universalIdentifier: '478fed7f-b44f-53d6-ab5e-020fdfb45ab7',
      },
      error: {
        universalIdentifier: '56e485c0-ca09-5a15-9e38-6aebed9b73f0',
      },
      errorClass: {
        universalIdentifier: '4b536ad0-079a-50f0-8105-99dd378078dd',
      },
      failedAt: {
        universalIdentifier: 'f1e71e93-ff59-5883-8774-b561d51723b4',
      },
    },
    indexes: {},
  },
  externalSyncCheckpoint: {
    universalIdentifier: '7ceba588-602a-579a-afb8-d93daaec7951',
    fields: {
      ...buildStandardObjectSystemFields(
        '7ceba588-602a-579a-afb8-d93daaec7951',
      ),
      workspaceId: {
        universalIdentifier: 'ef9e261c-3d10-51af-9570-dc952716213f',
      },
      externalSystemName: {
        universalIdentifier: '2460a0ca-e246-532b-ab5d-5db3c72bb249',
      },
      entityName: {
        universalIdentifier: '843d63a9-c33a-57c5-8099-84f754777b01',
      },
      lastExternalEventId: {
        universalIdentifier: 'f8b9b8ba-e566-52f8-b29c-a41297413e72',
      },
      lastExternalEventTimestamp: {
        universalIdentifier: 'bb367e7a-9d3c-5c9f-95b4-0ee90f2eb1f9',
      },
      lastSyncStartedAt: {
        universalIdentifier: '77240574-82eb-5a9c-9685-737f277a2596',
      },
      lastSyncCompletedAt: {
        universalIdentifier: '5a0c4789-2c25-5577-ae1a-9a7c4f87e9fb',
      },
      status: {
        universalIdentifier: '01d0dff1-3134-55f5-9ad9-e4f6e80db032',
      },
    },
    indexes: {
      workspaceSystemEntityUniqueIndex: {
        universalIdentifier: '4072b4fc-1240-5051-883c-421531562aab',
      },
    },
  },
  externalSyncReconciliation: {
    universalIdentifier: 'ab5eb338-796f-5ca3-b5ac-dd46cbfbd649',
    fields: {
      ...buildStandardObjectSystemFields(
        'ab5eb338-796f-5ca3-b5ac-dd46cbfbd649',
      ),
      workspaceId: {
        universalIdentifier: '02955e9b-b765-5d0d-a622-756470e90a6e',
      },
      externalSystemName: {
        universalIdentifier: 'a7515f32-6bcb-532b-ad89-0d4e461ebc4a',
      },
      entityName: {
        universalIdentifier: '563bcff6-68cc-5805-b6ae-9f9cdebf75fd',
      },
      startedAt: {
        universalIdentifier: '1381d520-f2f5-52e3-86af-9a3dd81bf86d',
      },
      completedAt: {
        universalIdentifier: 'f2d2f365-2a9f-55d5-b38d-2c926ee2939e',
      },
      status: {
        universalIdentifier: 'fcac52ec-d0d4-5a06-b295-eb8cf830ec7d',
      },
      totalCompared: {
        universalIdentifier: '94473693-905f-5a36-880c-fb81dd25bb9d',
      },
      matched: {
        universalIdentifier: 'af9b78f7-90b7-5fbe-9bba-d1bcf35424f2',
      },
      onlyInTwenty: {
        universalIdentifier: '173a940c-6202-5623-aa96-b98061cf8acd',
      },
      onlyInExternal: {
        universalIdentifier: '0bdf2f1b-1f07-5e24-86ad-2c3149c51d3a',
      },
      differenceCount: {
        universalIdentifier: '82201e4e-363a-55dc-a73e-c83056fc1c78',
      },
      findings: {
        universalIdentifier: '3cce1a4a-b44c-5f8e-b201-947bd031f812',
      },
    },
    indexes: {},
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
