/**
 * Important notice:
 * - Never ever mutate an existing universal identifier
 * - Deleting an existing unniversal identifier should be very rare
 */

export const STANDARD_OBJECTS = {
  attachment: {
    universalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
    fields: {
      id: { universalIdentifier: '20202020-a01a-4001-8a01-1d5f8e3c7b2a' },
      createdAt: {
        universalIdentifier: '20202020-a01b-4002-9b02-2e6f9f4d8c3b',
      },
      updatedAt: {
        universalIdentifier: '20202020-a01c-4003-8c03-3f7fa05d9d4c',
      },
      deletedAt: {
        universalIdentifier: '20202020-a01d-4004-9d04-4f8fb16eae5d',
      },
      name: { universalIdentifier: '20202020-87a5-48f8-bbf7-ade388825a57' },
      file: { universalIdentifier: '20202020-15db-460e-8166-c7b5d87ad4be' },
      //deprecated
      fullPath: { universalIdentifier: '20202020-0d19-453d-8e8d-fbcda8ca3747' },
      //deprecated
      fileCategory: {
        universalIdentifier: '20202020-8c3f-4d9e-9a1b-2e5f7a8c9d0e',
      },
      createdBy: {
        universalIdentifier: '395be3bd-a5c9-463d-aafe-9bc3bbec3f15',
      },
      updatedBy: {
        universalIdentifier: '376239d1-3e65-4cb6-b5d8-e0917d43cc93',
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
      position: {
        universalIdentifier: 'cef8f62c-cd46-4444-8cbb-17d463b7464a',
      },
      searchVector: {
        universalIdentifier: 'e7b42835-cb2e-4456-8558-9225362aa52d',
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
        universalIdentifier: 'c9e5a0b4-1d36-4f8c-0a7b-3e4f5d6c7a81',
      },
      personIdIndex: {
        universalIdentifier: 'd0f6b1c5-2e47-4a9d-1b8c-4f5a6e7d8b92',
      },
      companyIdIndex: {
        universalIdentifier: 'e1a7c2d6-3f58-4b0e-2c9d-5a6b7f8e9c03',
      },
      opportunityIdIndex: {
        universalIdentifier: 'f2b8d3e7-4a69-4c1f-3d0e-6b7c8a9f0d14',
      },
      dashboardIdIndex: {
        universalIdentifier: '03c9e4f8-5b70-4d2a-4e1f-7c8d9b0a1e25',
      },
      workflowIdIndex: {
        universalIdentifier: '14d0f5a9-6c81-4e3b-5f2a-8d9e0c1b2f36',
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
      id: { universalIdentifier: '20202020-b01a-4011-8b11-5a9fc27fbf6e' },
      createdAt: {
        universalIdentifier: '20202020-b01b-4012-9c12-6bafd38fcf7f',
      },
      updatedAt: {
        universalIdentifier: '20202020-b01c-4013-8d13-7cbfe49fdf8f',
      },
      deletedAt: {
        universalIdentifier: '20202020-b01d-4014-9e14-8dcff5affef9',
      },
      handle: { universalIdentifier: '20202020-eef3-44ed-aa32-4641d7fd4a3e' },
      workspaceMember: {
        universalIdentifier: '20202020-548d-4084-a947-fa20a39f7c06',
      },
      createdBy: {
        universalIdentifier: 'b80db15d-8dc2-4f47-a072-15030941a9d1',
      },
      updatedBy: {
        universalIdentifier: '11aaa404-f04b-421d-a451-c453bf77cc78',
      },
      position: {
        universalIdentifier: '72a27e60-3542-46dc-90db-684d79bd7f11',
      },
      searchVector: {
        universalIdentifier: '5fa758da-30b4-412e-8a4f-975f2848ce60',
      },
    },
    indexes: {
      workspaceMemberIdIndex: {
        universalIdentifier: '25e1a6b0-7d92-4f4c-6a3b-9e0f1d2c3a47',
      },
    },
  },
  calendarChannelEventAssociation: {
    universalIdentifier: '20202020-491b-4aaa-9825-afd1bae6ae00',
    fields: {
      id: {
        universalIdentifier: '20202020-c01a-4021-8a21-9edf06bfef0a',
      },
      createdAt: {
        universalIdentifier: '20202020-c01b-4022-9b22-afefd7cffefb',
      },
      updatedAt: {
        universalIdentifier: '20202020-c01c-4023-8c23-bffef8dffef0',
      },
      deletedAt: {
        universalIdentifier: '20202020-c01d-4024-9d24-cffef9effef1',
      },
      calendarChannel: {
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
      createdBy: {
        universalIdentifier: '8daa2bc8-bce2-4309-8a48-b929f3ee2c34',
      },
      updatedBy: {
        universalIdentifier: '55d810d2-fe47-44b4-b1de-b9c32113b695',
      },
      position: {
        universalIdentifier: '4fa18346-bb2b-49b0-ab35-23df86eed1c8',
      },
      searchVector: {
        universalIdentifier: '1844a9cf-6d35-46d7-99ba-011626a6d71b',
      },
    },
    indexes: {
      calendarChannelIdIndex: {
        universalIdentifier: '36f2b7c1-8e03-4a5d-7b4c-0f1a2e3d4b58',
      },
      calendarEventIdIndex: {
        universalIdentifier: '47a3c8d2-9f14-4b6e-8c5d-1a2b3f4e5c69',
      },
    },
  },
  calendarChannel: {
    universalIdentifier: '20202020-e8f2-40e1-a39c-c0e0039c5034',
    fields: {
      id: { universalIdentifier: '20202020-c02a-4031-8a31-1a2f3b4c5d6e' },
      createdAt: {
        universalIdentifier: '20202020-c02b-4032-9b32-2b3f4c5d6e7f',
      },
      updatedAt: {
        universalIdentifier: '20202020-c02c-4033-8c33-3c4f5d6e7f8a',
      },
      deletedAt: {
        universalIdentifier: '20202020-c02d-4034-9d34-4d5f6e7f8a9b',
      },
      connectedAccount: {
        universalIdentifier: '20202020-95b1-4f44-82dc-61b042ae2414',
      },
      handle: {
        universalIdentifier: '20202020-1d08-420a-9aa7-22e0f298232d',
      },
      visibility: {
        universalIdentifier: '20202020-1b07-4796-9f01-d626bab7ca4d',
      },
      isContactAutoCreationEnabled: {
        universalIdentifier: '20202020-50fb-404b-ba28-369911a3793a',
      },
      contactAutoCreationPolicy: {
        universalIdentifier: '20202020-b55d-447d-b4df-226319058775',
      },
      isSyncEnabled: {
        universalIdentifier: '20202020-fe19-4818-8854-21f7b1b43395',
      },
      syncCursor: {
        universalIdentifier: '20202020-bac2-4852-a5cb-7a7898992b70',
      },
      calendarChannelEventAssociations: {
        universalIdentifier: '20202020-afb0-4a9f-979f-2d5087d71d09',
      },
      throttleFailureCount: {
        universalIdentifier: '20202020-525c-4b76-b9bd-0dd57fd11d61',
      },
      syncStatus: {
        universalIdentifier: '20202020-7116-41da-8b4b-035975c4eb6a',
      },
      syncStage: {
        universalIdentifier: '20202020-6246-42e6-b5cd-003bd921782c',
      },
      syncStageStartedAt: {
        universalIdentifier: '20202020-a934-46f1-a8e7-9568b1e3a53e',
      },
      syncedAt: {
        universalIdentifier: '20202020-2ff5-4f70-953a-3d0d36357576',
      },
      createdBy: {
        universalIdentifier: '664db1a0-76f4-4429-8452-f8e250ab7545',
      },
      updatedBy: {
        universalIdentifier: '6a397eab-3700-4b08-9eb9-d16b61876193',
      },
      position: {
        universalIdentifier: '566609c9-1c8b-4899-91bb-0af140a89004',
      },
      searchVector: {
        universalIdentifier: 'bc9a982c-c314-49d6-818a-2661ce7e918f',
      },
    },
    indexes: {
      connectedAccountIdIndex: {
        universalIdentifier: '58b4d9e3-0a25-4c7f-9d6e-2b3c4a5f6d70',
      },
    },
  },
  calendarEventParticipant: {
    universalIdentifier: '20202020-a1c3-47a6-9732-27e5b1e8436d',
    fields: {
      id: {
        universalIdentifier: '20202020-c03a-4041-8a41-5e6f7a8b9cad',
      },
      createdAt: {
        universalIdentifier: '20202020-c03b-4042-9b42-6f7a8b9cadbe',
      },
      updatedAt: {
        universalIdentifier: '20202020-c03c-4043-8c43-7a8b9cadbecf',
      },
      deletedAt: {
        universalIdentifier: '20202020-c03d-4044-9d44-8b9cadbecd0f',
      },
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
      createdBy: {
        universalIdentifier: '9e9ec14d-b889-448e-afe5-40e407be11d1',
      },
      updatedBy: {
        universalIdentifier: 'a2c6efda-06bf-418e-808a-dac9fd64ab58',
      },
      position: {
        universalIdentifier: 'fcfa672c-ce6d-4fc1-b978-db58a4cc14f4',
      },
      searchVector: {
        universalIdentifier: 'c9dccf32-64ea-433e-a9a7-09993343bae0',
      },
    },
    indexes: {
      calendarEventIdIndex: {
        universalIdentifier: '69c5e0f4-1b36-4d8a-0e7f-3c4d5b6a7e81',
      },
      personIdIndex: {
        universalIdentifier: '70d6f1a5-2c47-4e9b-1f8a-4d5e6c7b8f92',
      },
      workspaceMemberIdIndex: {
        universalIdentifier: '81e7a2b6-3d58-4f0c-2a9b-5e6f7d8c9003',
      },
    },
  },
  calendarEvent: {
    universalIdentifier: '20202020-8f1d-4eef-9f85-0d1965e27221',
    fields: {
      id: { universalIdentifier: '20202020-c04a-4051-8a51-9cadbe0f1e2d' },
      createdAt: {
        universalIdentifier: '20202020-c04b-4052-9b52-adbecf1f2e3e',
      },
      updatedAt: {
        universalIdentifier: '20202020-c04c-4053-8c53-becf0f2f3e4f',
      },
      deletedAt: {
        universalIdentifier: '20202020-c04d-4054-9d54-cd0f1f3f4e5f',
      },
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
      createdBy: {
        universalIdentifier: '664a9500-2641-4caa-8d95-069807bb2eb4',
      },
      updatedBy: {
        universalIdentifier: '1081c196-d675-4801-b9e1-7d8637b48eab',
      },
      position: {
        universalIdentifier: 'e9488e9a-0abe-4500-8c1d-bfbd6b8cffad',
      },
      searchVector: {
        universalIdentifier: 'b9e7825c-d491-4414-b904-910c00b5b93b',
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
    },
  },
  company: {
    universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
    fields: {
      id: { universalIdentifier: '20202020-c05a-4061-8a61-1e2f3a4b5c6d' },
      createdAt: {
        universalIdentifier: '20202020-c05b-4062-9b62-2f3a4b5c6d7e',
      },
      updatedAt: {
        universalIdentifier: '20202020-c05c-4063-8c63-3a4b5c6d7e8f',
      },
      deletedAt: {
        universalIdentifier: '20202020-c05d-4064-9d64-4b5c6d7e8f9a',
      },
      name: { universalIdentifier: '20202020-4d99-4e2e-a84c-4a27837b1ece' },
      domainName: {
        universalIdentifier: '20202020-0c28-43d8-8ba5-3659924d3489',
      },
      address: { universalIdentifier: '20202020-c5ce-4adc-b7b6-9c0979fc55e7' },
      employees: {
        universalIdentifier: '20202020-8965-464a-8a75-74bafc152a0b',
      },
      linkedinLink: {
        universalIdentifier: '20202020-ebeb-4beb-b9ad-6848036fb451',
      },
      xLink: { universalIdentifier: '20202020-6f64-4fd9-9580-9c1991c7d8c3' },
      annualRecurringRevenue: {
        universalIdentifier: '20202020-602a-495c-9776-f5d5b11d227b',
      },
      idealCustomerProfile: {
        universalIdentifier: '20202020-ba6b-438a-8213-2c5ba28d76a2',
      },
      position: { universalIdentifier: '20202020-9b4e-462b-991d-a0ee33326454' },
      createdBy: {
        universalIdentifier: '20202020-fabc-451d-ab7d-412170916baa',
      },
      updatedBy: {
        universalIdentifier: '7444022e-b38f-4d4f-801b-cd664abc4834',
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
      favorites: {
        universalIdentifier: '20202020-4d1d-41ac-b13b-621631298d55',
      },
      attachments: {
        universalIdentifier: '20202020-c1b5-4120-b0f0-987ca401ed53',
      },
      timelineActivities: {
        universalIdentifier: '20202020-0414-4daf-9c0d-64fe7b27f89f',
      },
      searchVector: {
        universalIdentifier: '85c71601-72f9-4b7b-b343-d46100b2c74d',
      },
    },
    indexes: {
      accountOwnerIdIndex: {
        universalIdentifier: '92f8b3c7-4e69-4a1d-3b0c-6f7a8e9d0114',
      },
      domainNameUniqueIndex: {
        universalIdentifier: 'a3a9c4d8-5f70-4b2e-4c1d-7a8b9f0e1225',
      },
      searchVectorGinIndex: {
        universalIdentifier: 'b4b0d5e9-6a81-4c3f-5d2e-8b9c0a1f2336',
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
      companyRecordPageFields: {
        universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1001',
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1101',
          },
          additional: {
            universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1102',
          },
          other: {
            universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c1103',
          },
        },
        viewFields: {
          domainName: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1201',
          },
          accountOwner: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1202',
          },
          annualRecurringRevenue: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1203',
          },
          idealCustomerProfile: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1204',
          },
          employees: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1205',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1206',
          },
          xLink: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11c1207',
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
        },
      },
    },
  },
  connectedAccount: {
    universalIdentifier: '20202020-977e-46b2-890b-c3002ddfd5c5',
    fields: {
      id: { universalIdentifier: '20202020-c06a-4071-8a71-5c6d7e8f9aab' },
      createdAt: {
        universalIdentifier: '20202020-c06b-4072-9b72-6d7e8f9aabbc',
      },
      updatedAt: {
        universalIdentifier: '20202020-c06c-4073-8c73-7e8f9aabbccd',
      },
      deletedAt: {
        universalIdentifier: '20202020-c06d-4074-9d74-8f9aabbccdde',
      },
      handle: {
        universalIdentifier: '20202020-c804-4a50-bb05-b3a9e24f1dec',
      },
      provider: {
        universalIdentifier: '20202020-ebb0-4516-befc-a9e95935efd5',
      },
      accessToken: {
        universalIdentifier: '20202020-707b-4a0a-8753-2ad42efe1e29',
      },
      refreshToken: {
        universalIdentifier: '20202020-532d-48bd-80a5-c4be6e7f6e49',
      },
      accountOwner: {
        universalIdentifier: '20202020-3517-4896-afac-b1d0aa362af6',
      },
      lastSyncHistoryId: {
        universalIdentifier: '20202020-115c-4a87-b50f-ac4367a971b9',
      },
      authFailedAt: {
        universalIdentifier: '20202020-d268-4c6b-baff-400d402b430a',
      },
      lastCredentialsRefreshedAt: {
        universalIdentifier: '20202020-aa5e-4e85-903b-fdf90a941941',
      },
      messageChannels: {
        universalIdentifier: '20202020-24f7-4362-8468-042204d1e445',
      },
      calendarChannels: {
        universalIdentifier: '20202020-af4a-47bb-99ec-51911c1d3977',
      },
      handleAliases: {
        universalIdentifier: '20202020-8a3d-46be-814f-6228af16c47b',
      },
      scopes: {
        universalIdentifier: '20202020-8a3d-46be-814f-6228af16c47c',
      },
      connectionParameters: {
        universalIdentifier: '20202020-a1b2-46be-814f-6228af16c481',
      },
      createdBy: {
        universalIdentifier: 'e09c2463-9ca6-4004-97ce-6039e3161a5d',
      },
      updatedBy: {
        universalIdentifier: '0a84c0e1-f9fc-47d5-8ac9-58538e50a9f9',
      },
      position: {
        universalIdentifier: '66b7bc3e-c99e-42b6-82e6-6f43142c0f2f',
      },
      searchVector: {
        universalIdentifier: '140767fe-0aa4-4573-a0bd-67cb657c9452',
      },
    },
    indexes: {
      accountOwnerIdIndex: {
        universalIdentifier: 'c5c1e6f0-7b92-4d4a-6e3f-9c0d1b2a3447',
      },
    },
  },
  dashboard: {
    universalIdentifier: '20202020-3840-4b6d-9425-0c5188b05ca8',
    fields: {
      id: { universalIdentifier: '20202020-da1a-41d1-8ad1-abcdefabcdef' },
      createdAt: {
        universalIdentifier: '20202020-da1b-41d2-9bd2-bcdefabcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-da1c-41d3-8cd3-cdefabcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-da1d-41d4-9dd4-defabcdefabc',
      },
      title: { universalIdentifier: '20202020-20ee-4091-95dc-44b57eda3a89' },
      position: { universalIdentifier: '20202020-38af-409b-95f0-7f08aa5f420f' },
      pageLayoutId: {
        universalIdentifier: '20202020-bb53-4648-aa36-1d9d54e6f7f2',
      },
      createdBy: {
        universalIdentifier: '20202020-ff32-4fa1-b7ad-407cc6aa0734',
      },
      updatedBy: {
        universalIdentifier: '53ee42e7-f157-42b5-b278-a5fa9b378307',
      },
      timelineActivities: {
        universalIdentifier: '20202020-9b0c-5d6e-7f8a-9b0c1d2e3f4a',
      },
      favorites: {
        universalIdentifier: '20202020-f032-478f-88fa-6426ff6f1e4c',
      },
      attachments: {
        universalIdentifier: '20202020-bf6f-4220-8c55-2764f1175870',
      },
      searchVector: {
        universalIdentifier: '20202020-0bcc-47a4-8360-2e35a7133f7a',
      },
    },
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: 'd6d2f7a1-8c03-4e5b-7f4a-0d1e2c3b4558',
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
  favorite: {
    universalIdentifier: '20202020-ab56-4e05-92a3-e2414a499860',
    fields: {
      id: { universalIdentifier: '20202020-f01a-4091-8a91-ddeeffaabbcc' },
      createdAt: {
        universalIdentifier: '20202020-f01b-4092-9b92-eeffaabbccdd',
      },
      updatedAt: {
        universalIdentifier: '20202020-f01c-4093-8c93-ffaabbccddee',
      },
      deletedAt: {
        universalIdentifier: '20202020-f01d-4094-9d94-aabbccddeeff',
      },
      position: { universalIdentifier: '20202020-dd26-42c6-8c3c-2a7598c204f6' },
      forWorkspaceMember: {
        universalIdentifier: '20202020-ce63-49cb-9676-fdc0c45892cd',
      },
      person: { universalIdentifier: '20202020-c428-4f40-b6f3-86091511c41c' },
      company: { universalIdentifier: '20202020-cff5-4682-8bf9-069169e08279' },
      opportunity: {
        universalIdentifier: '20202020-dabc-48e1-8318-2781a2b32aa2',
      },
      workflow: { universalIdentifier: '20202020-b11b-4dc8-999a-6bd0a947b463' },
      workflowVersion: {
        universalIdentifier: '20202020-e1b8-4caf-b55a-3ab4d4cbcd21',
      },
      workflowRun: {
        universalIdentifier: '20202020-db5a-4fe4-9a13-9afa22b1e762',
      },
      task: { universalIdentifier: '20202020-1b1b-4b3b-8b1b-7f8d6a1d7d5c' },
      note: { universalIdentifier: '20202020-1f25-43fe-8b00-af212fdde824' },
      viewId: { universalIdentifier: '20202020-5a93-4fa9-acce-e73481a0bbdf' },
      favoriteFolder: {
        universalIdentifier: '20202020-f658-4d12-8b4d-248356aa4bd9',
      },
      dashboard: {
        universalIdentifier: '20202020-6ef9-45e4-b440-cc986f687c91',
      },
      createdBy: {
        universalIdentifier: '6440dc3d-fa50-49cc-abd3-98eeccd79288',
      },
      updatedBy: {
        universalIdentifier: '6c117b1a-0470-499b-8fcb-d9059eafbd43',
      },
      searchVector: {
        universalIdentifier: 'cbb27ea1-5cf8-4fed-9e0a-e4152815bd6e',
      },
    },
    indexes: {
      forWorkspaceMemberIdIndex: {
        universalIdentifier: 'e7e3a8b2-9d14-4f6c-8a5b-1e2f3d4c5669',
      },
      personIdIndex: {
        universalIdentifier: 'f8f4b9c3-0e25-4a7d-9b6c-2f3a4e5d677a',
      },
      companyIdIndex: {
        universalIdentifier: '0905c0d4-1f36-4b8e-0c7d-3a4b5f6e788b',
      },
      favoriteFolderIdIndex: {
        universalIdentifier: '1016d1e5-2a47-4c9f-1d8e-4b5c6a7f899c',
      },
      opportunityIdIndex: {
        universalIdentifier: '2127e2f6-3b58-4d0a-2e9f-5c6d7b80900d',
      },
      workflowIdIndex: {
        universalIdentifier: '3238f3a7-4c69-4e1b-3f0a-6d7e8c91011e',
      },
      workflowVersionIdIndex: {
        universalIdentifier: '4349a4b8-5d70-4f2c-4a1b-7e8f9d02122f',
      },
      workflowRunIdIndex: {
        universalIdentifier: '5450b5c9-6e81-4a3d-5b2c-8f90ae132340',
      },
      taskIdIndex: {
        universalIdentifier: '6561c6d0-7f92-4b4e-6c3d-90a1bf243451',
      },
      noteIdIndex: {
        universalIdentifier: '7672d7e1-8003-4c5f-7d4e-01b2c0354562',
      },
      dashboardIdIndex: {
        universalIdentifier: '8783e8f2-9114-4d6a-8e5f-12c3d1465673',
      },
    },
  },
  favoriteFolder: {
    universalIdentifier: '20202020-7cf8-401f-8211-a9587d27fd2d',
    fields: {
      id: { universalIdentifier: '20202020-f02a-40a1-8aa1-1f2e3d4c5b6a' },
      createdAt: {
        universalIdentifier: '20202020-f02b-40a2-9ba2-2f3e4d5c6b7a',
      },
      updatedAt: {
        universalIdentifier: '20202020-f02c-40a3-8ca3-3f4e5d6c7b8a',
      },
      deletedAt: {
        universalIdentifier: '20202020-f02d-40a4-9da4-4f5e6d7c8b9a',
      },
      position: {
        universalIdentifier: '20202020-5278-4bde-8909-2cec74d43744',
      },
      name: { universalIdentifier: '20202020-82a3-4537-8ff0-dbce7eec35d6' },
      favorites: {
        universalIdentifier: '20202020-b5e3-4b42-8af2-03cd4fd2e4d2',
      },
      createdBy: {
        universalIdentifier: '1ec58922-7789-4832-a583-ec97f766f433',
      },
      updatedBy: {
        universalIdentifier: '6a53edc6-0ef2-4c35-9065-f91c4ddf7f01',
      },
      searchVector: {
        universalIdentifier: 'c5bb12e1-0cc3-428f-89f0-4c8747239ac3',
      },
    },
    indexes: {},
  },
  messageChannelMessageAssociation: {
    universalIdentifier: '20202020-ad1e-4127-bccb-d83ae04d2ccb',
    fields: {
      id: {
        universalIdentifier: '20202020-b01a-40b1-8ab1-5a6b7c8d9eaf',
      },
      createdAt: {
        universalIdentifier: '20202020-b01b-40b2-9bb2-6b7c8d9eafba',
      },
      updatedAt: {
        universalIdentifier: '20202020-b01c-40b3-8cb3-7c8d9eafbacb',
      },
      deletedAt: {
        universalIdentifier: '20202020-b01d-40b4-9db4-8d9eafbacbdc',
      },
      messageChannel: {
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
      createdBy: {
        universalIdentifier: 'ce7dc96f-dd33-4bce-9505-cbd381440cec',
      },
      updatedBy: {
        universalIdentifier: '334d2ad6-4bc4-4b51-9c92-8ad57652475e',
      },
      position: {
        universalIdentifier: '45d1e083-90d6-4507-b68a-454a9dc3a540',
      },
      searchVector: {
        universalIdentifier: 'edddd409-d9f0-4b93-8e3f-37faef6a3387',
      },
      messageFolders: {
        universalIdentifier: '20202020-c3d4-e5f6-a7b8-901234567890',
      },
    },
    indexes: {
      messageChannelIdIndex: {
        universalIdentifier: '9894f9a3-0225-4e7b-9f6a-23d4e2576784',
      },
      messageIdIndex: {
        universalIdentifier: '0905a0b4-1336-4f8c-0a7b-34e5f3687895',
      },
      messageChannelIdMessageIdUniqueIndex: {
        universalIdentifier: '1a16b1c5-2447-4a9d-1b8c-45f6a47989a6',
      },
    },
  },
  messageChannelMessageAssociationMessageFolder: {
    universalIdentifier: '20202020-a1b0-40b0-8ab0-5b6c7d8e9f0a',
    fields: {
      id: {
        universalIdentifier: '20202020-a1b2-40b1-8ab1-6b7c8d9e0f1a',
      },
      createdAt: {
        universalIdentifier: '20202020-a1b3-40b2-9bb2-7c8d9e0f1a2b',
      },
      updatedAt: {
        universalIdentifier: '20202020-a1b4-40b3-8cb3-8d9e0f1a2b3c',
      },
      deletedAt: {
        universalIdentifier: '20202020-a1b5-40b4-9db4-9e0f1a2b3c4d',
      },
      createdBy: {
        universalIdentifier: 'f882a070-3393-4197-8140-b5858c6f7284',
      },
      updatedBy: {
        universalIdentifier: '107d13dc-a8ff-493c-8d04-72688c68f8c1',
      },
      position: {
        universalIdentifier: '76fcf020-482a-4d6c-b7b1-ccd6410299fc',
      },
      searchVector: {
        universalIdentifier: '38633a97-0e88-44de-9903-b8c9e0f59a36',
      },
      messageChannelMessageAssociation: {
        universalIdentifier: '20202020-d4e5-f6a7-b8c9-012345678901',
      },
      messageFolder: {
        universalIdentifier: '20202020-e5f6-a7b8-c9d0-123456789012',
      },
    },
    indexes: {
      messageChannelMessageAssociationIdIndex: {
        universalIdentifier: '2b38d3e7-5779-4c1f-4e0f-78c9d70d1de9',
      },
      messageFolderIdIndex: {
        universalIdentifier: '3c49e4f8-6880-4d2a-5f1a-89d0e81e2ef0',
      },
      messageChannelMessageAssociationIdMessageFolderIdUniqueIndex: {
        universalIdentifier: '4d50f5a9-7991-4e3b-6a2b-90e1f92f3f01',
      },
    },
  },
  messageChannel: {
    universalIdentifier: '20202020-fe8c-40bc-a681-b80b771449b7',
    fields: {
      id: { universalIdentifier: '20202020-b02a-40c1-8ac1-9eafbacbdced' },
      createdAt: {
        universalIdentifier: '20202020-b02b-40c2-9bc2-afbacbdcedfe',
      },
      updatedAt: {
        universalIdentifier: '20202020-b02c-40c3-8cc3-bacbdcedfefa',
      },
      deletedAt: {
        universalIdentifier: '20202020-b02d-40c4-9dc4-cbdcedfefaab',
      },
      visibility: {
        universalIdentifier: '20202020-6a6b-4532-9767-cbc61b469453',
      },
      handle: {
        universalIdentifier: '20202020-2c96-43c3-93e3-ed6b1acb69bc',
      },
      connectedAccount: {
        universalIdentifier: '20202020-49a2-44a4-b470-282c0440d15d',
      },
      type: { universalIdentifier: '20202020-ae95-42d9-a3f1-797a2ea22122' },
      isContactAutoCreationEnabled: {
        universalIdentifier: '20202020-fabd-4f14-b7c6-3310f6d132c6',
      },
      contactAutoCreationPolicy: {
        universalIdentifier: '20202020-fc0e-4ba6-b259-a66ca89cfa38',
      },
      excludeNonProfessionalEmails: {
        universalIdentifier: '20202020-1df5-445d-b4f3-2413ad178431',
      },
      excludeGroupEmails: {
        universalIdentifier: '20202020-45a0-4be4-9164-5820a6a109fb',
      },
      messageChannelMessageAssociations: {
        universalIdentifier: '20202020-49b8-4766-88fd-75f1e21b3d5f',
      },
      messageFolders: {
        universalIdentifier: '20202020-cc39-4432-9fe8-ec8ab8bbed94',
      },
      messageFolderImportPolicy: {
        universalIdentifier: '20202020-cc39-4432-9fe8-ec8ab8bbed95',
      },
      pendingGroupEmailsAction: {
        universalIdentifier: '20202020-17c5-4e9f-bc50-af46a89fdd42',
      },
      isSyncEnabled: {
        universalIdentifier: '20202020-d9a6-48e9-990b-b97fdf22e8dd',
      },
      syncCursor: {
        universalIdentifier: '20202020-79d1-41cf-b738-bcf5ed61e256',
      },
      syncedAt: {
        universalIdentifier: '20202020-263d-4c6b-ad51-137ada56f7d4',
      },
      syncStatus: {
        universalIdentifier: '20202020-56a1-4f7e-9880-a8493bb899cc',
      },
      syncStage: {
        universalIdentifier: '20202020-7979-4b08-89fe-99cb5e698767',
      },
      syncStageStartedAt: {
        universalIdentifier: '20202020-8c61-4a42-ae63-73c1c3c52e06',
      },
      throttleFailureCount: {
        universalIdentifier: '20202020-0291-42be-9ad0-d578a51684ab',
      },
      throttleRetryAfter: {
        universalIdentifier: '20202020-a1e3-4d7f-b5c2-9f8e6d4c3b2a',
      },
      createdBy: {
        universalIdentifier: 'b7de8fcc-a7c6-4122-b3fa-1fcf8f30931c',
      },
      updatedBy: {
        universalIdentifier: '88bb6ff1-b8a1-4313-95d4-7879acca0b93',
      },
      position: {
        universalIdentifier: 'bc8a36af-8b9c-4548-a0da-c90e899e7243',
      },
      searchVector: {
        universalIdentifier: '5e84794c-6f14-4bdf-81a6-76ee11cda51f',
      },
    },
    indexes: {
      connectedAccountIdIndex: {
        universalIdentifier: '2b27c2d6-3558-4b0e-2c9d-56a7b58a9ab7',
      },
    },
  },
  messageFolder: {
    universalIdentifier: '20202020-4955-4fd9-8e59-2dbd373f2a46',
    fields: {
      id: { universalIdentifier: '20202020-b03a-40d1-8ad1-dcedfefaabbc' },
      createdAt: {
        universalIdentifier: '20202020-b03b-40d2-9bd2-edfefaabbccd',
      },
      updatedAt: {
        universalIdentifier: '20202020-b03c-40d3-8cd3-fefaabbccdde',
      },
      deletedAt: {
        universalIdentifier: '20202020-b03d-40d4-9dd4-faabbccddeef',
      },
      name: { universalIdentifier: '20202020-7cf8-40bc-a681-b80b771449b7' },
      parentFolderId: {
        universalIdentifier: '20202020-e45d-49de-a4aa-587bbf9601f3',
      },
      messageChannel: {
        universalIdentifier: '20202020-c9f8-43db-a3e7-7f2e8b5d9c1a',
      },
      syncCursor: {
        universalIdentifier: '20202020-98cd-49ed-8dfc-cb5796400e64',
      },
      isSentFolder: {
        universalIdentifier: '20202020-2af5-4a25-b2de-3c9386da941b',
      },
      isSynced: {
        universalIdentifier: '20202020-764f-4e09-8f95-cd46b6bfe3c4',
      },
      externalId: {
        universalIdentifier: '20202020-f3a8-4d2b-9c7e-1b5f9a8e4c6d',
      },
      pendingSyncAction: {
        universalIdentifier: '20202020-4f97-4c79-9517-16387fe237f7',
      },
      createdBy: {
        universalIdentifier: 'bfe19f84-b640-4ce3-b771-4e7bf18bad14',
      },
      updatedBy: {
        universalIdentifier: '7ec7eea8-8715-4656-a602-3cb4256aaca1',
      },
      position: {
        universalIdentifier: '5317d4f4-12c5-469d-8e47-0f3b2ffc95b4',
      },
      searchVector: {
        universalIdentifier: '5f2d3937-bafd-4d71-b4cb-b34037efd2e1',
      },
      messageChannelMessageAssociationMessageFolders: {
        universalIdentifier: '20202020-f6a7-b8c9-d0e1-234567890123',
      },
    },
    indexes: {
      messageChannelIdIndex: {
        universalIdentifier: '3c38d3e7-4669-4c1f-3d0e-67b8c69b0bc8',
      },
    },
  },
  messageParticipant: {
    universalIdentifier: '20202020-a433-4456-aa2d-fd9cb26b774a',
    fields: {
      id: { universalIdentifier: '20202020-b04a-40e1-8ae1-1a2b3c4d5e6f' },
      createdAt: {
        universalIdentifier: '20202020-b04b-40e2-9be2-2b3c4d5e6f7a',
      },
      updatedAt: {
        universalIdentifier: '20202020-b04c-40e3-8ce3-3c4d5e6f7a8b',
      },
      deletedAt: {
        universalIdentifier: '20202020-b04d-40e4-9de4-4d5e6f7a8b9c',
      },
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
      createdBy: {
        universalIdentifier: 'e0e6aa04-6ad5-4d12-8799-6febf00452c1',
      },
      updatedBy: {
        universalIdentifier: '6c90fd49-22b8-4f91-b4eb-4b9af630e988',
      },
      position: {
        universalIdentifier: 'f49ca74e-dcdf-445d-a707-3c22869b4e6c',
      },
      searchVector: {
        universalIdentifier: '80fec74f-cda7-46bd-ae37-8998bd4f992b',
      },
    },
    indexes: {
      messageIdIndex: {
        universalIdentifier: '4d49e4f8-5770-4d2a-4e1f-78c9d70c1cd9',
      },
      personIdIndex: {
        universalIdentifier: '5e50f5a9-6881-4e3b-5f2a-89d0e81d2de0',
      },
      workspaceMemberIdIndex: {
        universalIdentifier: '6f61a6b0-7992-4f4c-6a3b-90e1f92e3ef1',
      },
    },
  },
  messageThread: {
    universalIdentifier: '20202020-849a-4c3e-84f5-a25a7d802271',
    fields: {
      id: { universalIdentifier: '20202020-b05a-40f1-8af1-5e6f7a8b9cad' },
      createdAt: {
        universalIdentifier: '20202020-b05b-40f2-9bf2-6f7a8b9cadbe',
      },
      updatedAt: {
        universalIdentifier: '20202020-b05c-40f3-8cf3-7a8b9cadbecf',
      },
      deletedAt: {
        universalIdentifier: '20202020-b05d-40f4-9df4-8b9cadbecfda',
      },
      messages: {
        universalIdentifier: '20202020-3115-404f-aade-e1154b28e35a',
      },
      messageChannelMessageAssociations: {
        universalIdentifier: '20202020-314e-40a4-906d-a5d5d6c285f6',
      },
      createdBy: {
        universalIdentifier: 'b50ce369-9905-46d9-b95b-5e4034d252aa',
      },
      updatedBy: {
        universalIdentifier: '20fbafd0-0a16-4785-b5a6-f1ef45ef304c',
      },
      position: {
        universalIdentifier: '7490a440-7a62-466e-ba93-75a2f2edfb1e',
      },
      searchVector: {
        universalIdentifier: 'c63e091f-6528-4657-ad2a-b0a158f9e483',
      },
    },
    indexes: {},
    views: {
      allMessageThreads: {
        universalIdentifier: '20202020-d002-4d02-8d02-ae55a9ba2002',
        viewFields: {
          messages: {
            universalIdentifier: '20202020-df02-4d02-8d02-ae55a9ba2f01',
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
      id: { universalIdentifier: '20202020-b06a-4101-8a01-9cadbedfaeb1' },
      createdAt: {
        universalIdentifier: '20202020-b06b-4102-9b02-adbecfeafbc2',
      },
      updatedAt: {
        universalIdentifier: '20202020-b06c-4103-8c03-becfdfabfcd3',
      },
      deletedAt: {
        universalIdentifier: '20202020-b06d-4104-9d04-cfdfabecdde4',
      },
      headerMessageId: {
        universalIdentifier: '20202020-72b5-416d-aed8-b55609067d01',
      },
      messageThread: {
        universalIdentifier: '20202020-30f2-4ccd-9f5c-e41bb9d26214',
      },
      direction: {
        universalIdentifier: '20202020-0203-4118-8e2a-05b9bdae6dab',
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
      createdBy: {
        universalIdentifier: '6e52bde4-ed41-4462-aa70-121e496270b4',
      },
      updatedBy: {
        universalIdentifier: '7822dcc0-ee40-4af0-a6fe-f10a14e72b24',
      },
      position: {
        universalIdentifier: '06c5052d-3369-4d6d-8eaa-f9780eddb1fd',
      },
      searchVector: {
        universalIdentifier: '529b6008-4a12-4d48-bbc3-26a3f199bafd',
      },
    },
    indexes: {
      messageThreadIdIndex: {
        universalIdentifier: '7072b7c1-8003-4a5d-7b4c-01f2a03f4f02',
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
      id: { universalIdentifier: '20202020-c01a-4111-8a11-dfabcddeef12' },
      createdAt: {
        universalIdentifier: '20202020-c01b-4112-9b12-fabcddefe123',
      },
      updatedAt: {
        universalIdentifier: '20202020-c01c-4113-8c13-abcddeef1234',
      },
      deletedAt: {
        universalIdentifier: '20202020-c01d-4114-9d14-bcddeef12345',
      },
      position: { universalIdentifier: '20202020-368d-4dc2-943f-ed8a49c7fdfb' },
      title: { universalIdentifier: '20202020-faeb-4c76-8ba6-ccbb0b4a965f' },
      bodyV2: { universalIdentifier: '20202020-a7bb-4d94-be51-8f25181502c8' },
      createdBy: {
        universalIdentifier: '20202020-0d79-4e21-ab77-5a394eff97be',
      },
      updatedBy: {
        universalIdentifier: '9b446e89-2484-4044-a3b5-420f6b578c0c',
      },
      noteTargets: {
        universalIdentifier: '20202020-1f25-43fe-8b00-af212fdde823',
      },
      attachments: {
        universalIdentifier: '20202020-4986-4c92-bf19-39934b149b16',
      },
      timelineActivities: {
        universalIdentifier: '20202020-7030-42f8-929c-1a57b25d6bce',
      },
      favorites: {
        universalIdentifier: '20202020-4d1d-41ac-b13b-621631298d67',
      },
      searchVector: {
        universalIdentifier: '20202020-7ea8-44d4-9d4c-51dd2a757950',
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
          additional: {
            universalIdentifier: '20202020-a005-4a05-8a05-a0be5a115102',
          },
          other: {
            universalIdentifier: '20202020-a005-4a05-8a05-a0be5a115103',
          },
        },
        viewFields: {
          title: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115201',
          },
          createdAt: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115202',
          },
          createdBy: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a115203',
          },
        },
      },
    },
  },
  noteTarget: {
    universalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
    fields: {
      id: { universalIdentifier: '20202020-c02a-4121-8a21-cddeef123456' },
      createdAt: {
        universalIdentifier: '20202020-c02b-4122-9b22-ddeef1234567',
      },
      updatedAt: {
        universalIdentifier: '20202020-c02c-4123-8c23-eef12345678a',
      },
      deletedAt: {
        universalIdentifier: '20202020-c02d-4124-9d24-ef123456789b',
      },
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
      createdBy: {
        universalIdentifier: '820a3163-bb7d-41bc-93d9-81a464559c48',
      },
      updatedBy: {
        universalIdentifier: 'a48c2bae-fe78-4d9d-bc37-f56d1a462121',
      },
      position: {
        universalIdentifier: '082f7c9e-5ccd-4056-8748-a428f65fa6f6',
      },
      searchVector: {
        universalIdentifier: '0cc32d0f-99ab-4fee-bf66-9e84bc8bce00',
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
        universalIdentifier: '0305e0f4-1336-4d8a-0e7f-34c5d36c7c35',
      },
      companyIdIndex: {
        universalIdentifier: '1416f1a5-2447-4e9b-1f8a-45d6e47d8d46',
      },
      opportunityIdIndex: {
        universalIdentifier: '2527a2b6-3558-4f0c-2a9b-56e7f58e9e57',
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
      id: { universalIdentifier: '20202020-d01a-4131-8a31-f123456789ab' },
      createdAt: {
        universalIdentifier: '20202020-d01b-4132-9b32-123456789abc',
      },
      updatedAt: {
        universalIdentifier: '20202020-d01c-4133-8c33-23456789abcd',
      },
      deletedAt: {
        universalIdentifier: '20202020-d01d-4134-9d34-3456789abcde',
      },
      name: { universalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5' },
      amount: { universalIdentifier: '20202020-583e-4642-8533-db761d5fa82f' },
      closeDate: {
        universalIdentifier: '20202020-527e-44d6-b1ac-c4158d307b97',
      },
      stage: { universalIdentifier: '20202020-6f76-477d-8551-28cd65b2b4b9' },
      position: {
        universalIdentifier: '20202020-806d-493a-bbc6-6313e62958e2',
      },
      createdBy: {
        universalIdentifier: '20202020-a63e-4a62-8e63-42a51828f831',
      },
      updatedBy: {
        universalIdentifier: '3c8a6095-3f64-4e81-a59e-66c2bd181e11',
      },
      pointOfContact: {
        universalIdentifier: '20202020-8dfb-42fc-92b6-01afb759ed16',
      },
      company: { universalIdentifier: '20202020-cbac-457e-b565-adece5fc815f' },
      owner: { universalIdentifier: '20202020-be7e-4d1e-8e19-3d5c7c4b9f2a' },
      favorites: {
        universalIdentifier: '20202020-a1c2-4500-aaae-83ba8a0e827a',
      },
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
      searchVector: {
        universalIdentifier: '428a0da5-4b2e-4ce3-b695-89a8b384e6e3',
      },
    },
    indexes: {
      pointOfContactIdIndex: {
        universalIdentifier: '3638b3c7-4669-4a1d-3b0c-67f8a69f0f68',
      },
      companyIdIndex: {
        universalIdentifier: '4749c4d8-5770-4b2e-4c1d-78a9b70a1a79',
      },
      stageIndex: {
        universalIdentifier: '5850d5e9-6881-4c3f-5d2e-89b0c81b2b80',
      },
      searchVectorGinIndex: {
        universalIdentifier: '6961e6f0-7992-4d4a-6e3f-90c1d92c3c91',
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
          general: {
            universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca3101',
          },
          additional: {
            universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca3102',
          },
          other: {
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
        },
      },
    },
  },
  person: {
    universalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
    fields: {
      id: { universalIdentifier: '20202020-e01a-4141-8a41-456789abcdef' },
      createdAt: {
        universalIdentifier: '20202020-e01b-4142-9b42-56789abcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-e01c-4143-8c43-6789abcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-e01d-4144-9d44-789abcdefabc',
      },
      name: { universalIdentifier: '20202020-3875-44d5-8c33-a6239011cab8' },
      emails: { universalIdentifier: '20202020-3c51-43fa-8b6e-af39e29368ab' },
      linkedinLink: {
        universalIdentifier: '20202020-f1af-48f7-893b-2007a73dd508',
      },
      xLink: { universalIdentifier: '20202020-8fc2-487c-b84a-55a99b145cfd' },
      jobTitle: { universalIdentifier: '20202020-b0d0-415a-bef9-640a26dacd9b' },
      phones: { universalIdentifier: '20202020-0638-448e-8825-439134618022' },
      city: { universalIdentifier: '20202020-5243-4ffb-afc5-2c675da41346' },
      avatarUrl: {
        universalIdentifier: '20202020-b8a6-40df-961c-373dc5d2ec21',
      },
      avatarFile: {
        universalIdentifier: '20202020-a7c9-4e3d-8f1b-2d5a6b7c8e9f',
      },
      position: { universalIdentifier: '20202020-fcd5-4231-aff5-fff583eaa0b1' },
      createdBy: {
        universalIdentifier: '20202020-f6ab-4d98-af24-a3d5b664148a',
      },
      updatedBy: {
        universalIdentifier: 'e9e0dd35-184c-4742-84da-afadf45ce59a',
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
      favorites: {
        universalIdentifier: '20202020-4073-4117-9cf1-203bcdc91cbd',
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
      searchVector: {
        universalIdentifier: '57d1d7ad-fa10-44fc-82f3-ad0959ec2534',
      },
    },
    indexes: {
      companyIdIndex: {
        universalIdentifier: '7072f7a1-8003-4e5b-7f4a-01d2e03d4d02',
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
          city: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af6',
          },
          jobTitle: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af7',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af8',
          },
          xLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af9',
          },
        },
      },
      personRecordPageFields: {
        universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12001',
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12101',
          },
          additional: {
            universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12102',
          },
          other: {
            universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea12103',
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
          xLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12206',
          },
          city: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea12207',
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
        },
      },
    },
  },
  task: {
    universalIdentifier: '20202020-1ba1-48ba-bc83-ef7e5990ed10',
    fields: {
      id: { universalIdentifier: '20202020-a02a-4151-8a51-89abcdefabcd' },
      createdAt: {
        universalIdentifier: '20202020-a02b-4152-9b52-9abcdefabcde',
      },
      updatedAt: {
        universalIdentifier: '20202020-a02c-4153-8c53-abcdefabcdef',
      },
      deletedAt: {
        universalIdentifier: '20202020-a02d-4154-9d54-bcdefabcdefa',
      },
      position: { universalIdentifier: '20202020-7d47-4690-8a98-98b9a0c05dd8' },
      title: { universalIdentifier: '20202020-b386-4cb7-aa5a-08d4a4d92680' },
      bodyV2: { universalIdentifier: '20202020-4aa0-4ae8-898d-7df0afd47ab1' },
      dueAt: { universalIdentifier: '20202020-fd99-40da-951b-4cb9a352fce3' },
      status: { universalIdentifier: '20202020-70bc-48f9-89c5-6aa730b151e0' },
      createdBy: {
        universalIdentifier: '20202020-1a04-48ab-a567-576965ae5387',
      },
      updatedBy: {
        universalIdentifier: '9e8bf518-f4ab-433e-9674-efb75fba2802',
      },
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
      favorites: {
        universalIdentifier: '20202020-4d1d-41ac-b13b-621631298d65',
      },
      searchVector: {
        universalIdentifier: '20202020-4746-4e2f-870c-52b02c67c90d',
      },
    },
    indexes: {
      assigneeIdIndex: {
        universalIdentifier: '0305c0d4-1336-4b8e-0c7d-34a5b36a7a35',
      },
      searchVectorGinIndex: {
        universalIdentifier: '1416d1e5-2447-4c9f-1d8e-45b6c47b8b46',
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
          additional: {
            universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a6102',
          },
          other: {
            universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a6103',
          },
        },
        viewFields: {
          title: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a6201',
          },
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
        },
      },
    },
  },
  taskTarget: {
    universalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
    fields: {
      id: { universalIdentifier: '20202020-a03a-4161-8a61-cdefabcdefab' },
      createdAt: {
        universalIdentifier: '20202020-a03b-4162-9b62-defabcdefabc',
      },
      updatedAt: {
        universalIdentifier: '20202020-a03c-4163-8c63-efabcdefabcd',
      },
      deletedAt: {
        universalIdentifier: '20202020-a03d-4164-9d64-fabcdefabcde',
      },
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
      createdBy: {
        universalIdentifier: '65fe2a53-45e4-4225-9711-b827f55e51cc',
      },
      updatedBy: {
        universalIdentifier: 'bea3734f-aff2-49ed-9dc9-d4666a2e2178',
      },
      position: {
        universalIdentifier: '4216c06a-498b-4111-9577-d9bcbccdda39',
      },
      searchVector: {
        universalIdentifier: '8768a9c0-37c0-4465-b86d-c4c7f466ec23',
      },
    },
    morphIds: {
      targetMorphId: { morphId: '20202020-f636-435d-ab8d-e1168b375c71' },
    },
    indexes: {
      taskIdIndex: {
        universalIdentifier: '2527e2f6-3558-4d0a-2e9f-56c7d58c9c57',
      },
      personIdIndex: {
        universalIdentifier: '3638f3a7-4669-4e1b-3f0a-67d8e69d0d68',
      },
      companyIdIndex: {
        universalIdentifier: '4749a4b8-5770-4f2c-4a1b-78e9f70e1e79',
      },
      opportunityIdIndex: {
        universalIdentifier: '5850b5c9-6881-4a3d-5b2c-89f0a81f2f80',
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
      id: { universalIdentifier: '20202020-a01a-4081-8a81-9aabbccddeff' },
      createdAt: {
        universalIdentifier: '20202020-a01b-4082-9b82-aabbccddeeff',
      },
      updatedAt: {
        universalIdentifier: '20202020-a01c-4083-8c83-bbccddeeffaa',
      },
      deletedAt: {
        universalIdentifier: '20202020-a01d-4084-9d84-ccddeeffaabb',
      },
      happensAt: {
        universalIdentifier: '20202020-9526-4993-b339-c4318c4d39f0',
      },
      name: { universalIdentifier: '20202020-7207-46e8-9dab-849505ae8497' },
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
      linkedRecordCachedName: {
        universalIdentifier: '20202020-cfdb-4bef-bbce-a29f41230934',
      },
      linkedRecordId: {
        universalIdentifier: '20202020-2e0e-48c0-b445-ee6c1e61687d',
      },
      linkedObjectMetadataId: {
        universalIdentifier: '20202020-c595-449d-9f89-562758c9ee69',
      },
      createdBy: {
        universalIdentifier: '8f66191f-927d-4a6d-a15f-d0ff8cfc5a6d',
      },
      updatedBy: {
        universalIdentifier: '81dc29fc-c872-4efd-bf31-d07872cd260e',
      },
      position: {
        universalIdentifier: 'e245d799-3e4b-4c69-ab9a-6b7c91d71195',
      },
      searchVector: {
        universalIdentifier: 'bc1d1b67-903a-4354-8272-4a6efc4cbe63',
      },
    },
    morphIds: {
      targetMorphId: { morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1' },
    },
    indexes: {
      workspaceMemberIdIndex: {
        universalIdentifier: '6961c6d0-7992-4b4e-6c3d-90a1b92a3a91',
      },
      personIdIndex: {
        universalIdentifier: '7072d7e1-8003-4c5f-7d4e-01b2c03b4b02',
      },
      companyIdIndex: {
        universalIdentifier: '8183e8f2-9114-4d6a-8e5f-12c3d14c5c13',
      },
      opportunityIdIndex: {
        universalIdentifier: '9294f9a3-0225-4e7b-9f6a-23d4e25d6d24',
      },
      noteIdIndex: {
        universalIdentifier: '0305a0b4-1336-4f8c-0a7b-34e5f36e7e35',
      },
      taskIdIndex: {
        universalIdentifier: '1416b1c5-2447-4a9d-1b8c-45f6a47f8f46',
      },
      workflowIdIndex: {
        universalIdentifier: '2527c2d6-3558-4b0e-2c9d-56a7b58a9a57',
      },
      workflowVersionIdIndex: {
        universalIdentifier: '3638d3e7-4669-4c1f-3d0e-67b8c69b0b68',
      },
      workflowRunIdIndex: {
        universalIdentifier: '4749e4f8-5770-4d2a-4e1f-78c9d70c1c79',
      },
      dashboardIdIndex: {
        universalIdentifier: '5850f5a9-6881-4e3b-5f2a-89d0e81d2d80',
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
      id: { universalIdentifier: '20202020-f02a-4181-8a81-efabcdefabcd' },
      createdAt: {
        universalIdentifier: '20202020-f02b-4182-9b82-fabcdefabcde',
      },
      updatedAt: {
        universalIdentifier: '20202020-f02c-4183-8c83-abcdefabcdef',
      },
      deletedAt: {
        universalIdentifier: '20202020-f02d-4184-9d84-bcdefabcdefa',
      },
      name: { universalIdentifier: '20202020-b3d3-478f-acc0-5d901e725b20' },
      lastPublishedVersionId: {
        universalIdentifier: '20202020-326a-4fba-8639-3456c0a169e8',
      },
      statuses: { universalIdentifier: '20202020-357c-4432-8c50-8c31b4a552d9' },
      position: { universalIdentifier: '20202020-39b0-4d8c-8c5f-33c2326deb5f' },
      versions: { universalIdentifier: '20202020-9432-416e-8f3c-27ee3153d099' },
      runs: { universalIdentifier: '20202020-759b-4340-b58b-e73595c4df4f' },
      automatedTriggers: {
        universalIdentifier: '20202020-3319-4234-a34c-117ecad2b8a9',
      },
      favorites: {
        universalIdentifier: '20202020-c554-4c41-be7a-cf9cd4b0d512',
      },
      timelineActivities: {
        universalIdentifier: '20202020-906e-486a-a798-131a5f081faf',
      },
      attachments: {
        universalIdentifier: '20202020-4a8c-4e2d-9b1c-7e5f3a2b4c6d',
      },
      createdBy: {
        universalIdentifier: '20202020-6007-401a-8aa5-e6f48581a6f3',
      },
      updatedBy: {
        universalIdentifier: '3559831e-caf2-4eb5-9db1-b47bf968c774',
      },
      searchVector: {
        universalIdentifier: '20202020-535d-4ffa-b7f3-4fa0d5da1b7a',
      },
    },
    indexes: {
      searchVectorGinIndex: {
        universalIdentifier: '6961a6b0-7992-4f4c-6a3b-90e1f92e3e91',
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
      id: {
        universalIdentifier: '20202020-f01a-4171-8a71-abcdefabcdef',
      },
      createdAt: {
        universalIdentifier: '20202020-f01b-4172-9b72-bcdefabcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-f01c-4173-8c73-cdefabcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-f01d-4174-9d74-defabcdefabc',
      },
      type: {
        universalIdentifier: '20202020-3319-4234-a34c-3f92c1ab56e7',
      },
      settings: {
        universalIdentifier: '20202020-3319-4234-a34c-bac8f903de12',
      },
      workflow: {
        universalIdentifier: '20202020-3319-4234-a34c-8e1a4d2f7c03',
      },
      createdBy: {
        universalIdentifier: '5cea2f46-3779-4782-9fce-3062652e2dfd',
      },
      updatedBy: {
        universalIdentifier: '017d3587-98bd-43ad-b5a6-cb8125105641',
      },
      position: {
        universalIdentifier: 'f4c5eb0a-8a86-49a2-a775-941eaad98fc9',
      },
      searchVector: {
        universalIdentifier: 'dae934ca-bfca-4101-8211-8eae6e2b5513',
      },
    },
    indexes: {
      workflowIdIndex: {
        universalIdentifier: '7072b7c1-8003-4a5d-7b4c-01f2a03f4f03',
      },
    },
  },
  workflowRun: {
    universalIdentifier: '20202020-4e28-4e95-a9d7-6c00874f843c',
    fields: {
      id: { universalIdentifier: '20202020-f03a-4191-8a91-cdefabcdefab' },
      createdAt: {
        universalIdentifier: '20202020-f03b-4192-9b92-defabcdefabc',
      },
      updatedAt: {
        universalIdentifier: '20202020-f03c-4193-8c93-efabcdefabcd',
      },
      deletedAt: {
        universalIdentifier: '20202020-f03d-4194-9d94-fabcdefabcde',
      },
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
      position: {
        universalIdentifier: '20202020-7802-4c40-ae89-1f506fe3365c',
      },
      createdBy: {
        universalIdentifier: '20202020-6007-401a-8aa5-e6f38581a6f3',
      },
      updatedBy: {
        universalIdentifier: '730dc1c9-34f5-4c22-84a6-bcb55b7604e2',
      },
      output: { universalIdentifier: '20202020-7be4-4db2-8ac6-3ff0d740843d' },
      context: { universalIdentifier: '20202020-189c-478a-b867-d72feaf5926a' },
      state: { universalIdentifier: '20202020-611f-45f3-9cde-d64927e8ec57' },
      favorites: {
        universalIdentifier: '20202020-4baf-4604-b899-2f7fcfbbf90d',
      },
      timelineActivities: {
        universalIdentifier: '20202020-af4d-4eb0-babc-eb960a45b356',
      },
      searchVector: {
        universalIdentifier: '20202020-0b91-4ded-b1ac-cbd5efa58cb9',
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
        universalIdentifier: '0305e0f4-1336-4d8a-0e7f-34c5d36c7c36',
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
          name: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcf5',
          },
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
        },
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abcf2',
          },
          additional: {
            universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abcf3',
          },
          other: {
            universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abcf4',
          },
        },
      },
    },
  },
  workflowVersion: {
    universalIdentifier: '20202020-d65d-4ab9-9344-d77bfb376a3d',
    fields: {
      id: { universalIdentifier: '20202020-f04a-41a1-8aa1-abcdefabcdef' },
      createdAt: {
        universalIdentifier: '20202020-f04b-41a2-9ba2-bcdefabcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-f04c-41a3-8ca3-cdefabcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-f04d-41a4-9da4-defabcdefabc',
      },
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
      position: {
        universalIdentifier: '20202020-791d-4950-ab28-0e704767ae1c',
      },
      runs: { universalIdentifier: '20202020-1d08-46df-901a-85045f18099a' },
      steps: { universalIdentifier: '20202020-5988-4a64-b94a-1f9b7b989039' },
      favorites: {
        universalIdentifier: '20202020-b8e0-4e57-928d-b51671cc71f2',
      },
      timelineActivities: {
        universalIdentifier: '20202020-fcb0-4695-b17e-3b43a421c633',
      },
      searchVector: {
        universalIdentifier: '20202020-3f17-44ef-b8c1-b282ae8469b2',
      },
      createdBy: {
        universalIdentifier: '34f592a7-5c13-4c8b-8473-7bef00848b4e',
      },
      updatedBy: {
        universalIdentifier: '4f8777e6-c5eb-40c6-bb4c-ed9dcf0d81e9',
      },
    },
    indexes: {
      workflowIdIndex: {
        universalIdentifier: '1416f1a5-2447-4e9b-1f8a-45d6e47d8d47',
      },
      searchVectorGinIndex: {
        universalIdentifier: '2527a2b6-3558-4f0c-2a9b-56e7f58e9e58',
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
          name: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaef5',
          },
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
        },
        viewFieldGroups: {
          general: {
            universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aaef2',
          },
          additional: {
            universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aaef3',
          },
          other: {
            universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aaef4',
          },
        },
      },
    },
  },
  workspaceMember: {
    universalIdentifier: '20202020-3319-4234-a34c-82d5c0e881a6',
    fields: {
      id: { universalIdentifier: '20202020-fb1a-41b1-8ab1-efabcdefabcd' },
      createdAt: {
        universalIdentifier: '20202020-fb1b-41b2-9bb2-fabcdefabcde',
      },
      updatedAt: {
        universalIdentifier: '20202020-fb1c-41b3-8cb3-abcdefabcdef',
      },
      deletedAt: {
        universalIdentifier: '20202020-fb1d-41b4-9db4-bcdefabcdefa',
      },
      position: {
        universalIdentifier: '20202020-1810-4591-a93c-d0df97dca843',
      },
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
      userId: {
        universalIdentifier: '20202020-75a9-4dfc-bf25-2e4b43e89820',
      },
      assignedTasks: {
        universalIdentifier: '20202020-61dc-4a1c-99e8-38ebf8d2bbeb',
      },
      ownedOpportunities: {
        universalIdentifier: '20202020-9e4d-4b3a-8c1f-6d7e8f9a0b1c',
      },
      favorites: {
        universalIdentifier: '20202020-f3c1-4faf-b343-cf7681038757',
      },
      accountOwnerForCompanies: {
        universalIdentifier: '20202020-dc29-4bd4-a3c1-29eafa324bee',
      },
      connectedAccounts: {
        universalIdentifier: '20202020-e322-4bde-a525-727079b4a100',
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
      searchVector: {
        universalIdentifier: '20202020-46d0-4e7f-bc26-74c0edaeb619',
      },
      calendarStartDay: {
        universalIdentifier: '20202020-92d0-1d7f-a126-25ededa6b142',
      },
      numberFormat: {
        universalIdentifier: '20202020-7f40-4e7f-b126-11c0eda6b141',
      },
      createdBy: {
        universalIdentifier: '4a3f26d1-033e-4d84-b23a-9adc2fd0c2a8',
      },
      updatedBy: {
        universalIdentifier: '29f84ad0-509f-4aef-9f9c-2691dd60cd87',
      },
    },
    indexes: {
      userEmailUniqueIndex: {
        universalIdentifier: '3638b3c7-4669-4a1d-3b0c-67f8a69f0f69',
      },
      searchVectorGinIndex: {
        universalIdentifier: '4749c4d8-5770-4b2e-4c1d-78a9b70a1a7a',
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
