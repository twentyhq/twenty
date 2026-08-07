// Single source of truth for standard object universal identifiers: an object
// identifier is referenced from its own STANDARD_OBJECTS entry, from its
// STANDARD_OBJECT_FIELDS entry (system fields and INDEX view derivation), and
// sometimes from another object's declaration (default relation builders need
// both the host and the source object identifiers, and an object literal
// cannot reference its sibling keys).
export const STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = {
  timelineActivity: '20202020-6736-4337-b5c4-8b39fae325a5',
  attachment: '20202020-bd3d-4c60-8dca-571c71d4447a',
  blocklist: '20202020-0408-4f38-b8a8-4d5e3e26e24d',
  calendarChannelEventAssociation: '20202020-491b-4aaa-9825-afd1bae6ae00',
  calendarEvent: '20202020-8f1d-4eef-9f85-0d1965e27221',
  calendarEventParticipant: '20202020-a1c3-47a6-9732-27e5b1e8436d',
  callRecording: 'ce19efb9-710f-45b2-b141-473abbeea60b',
  noteTarget: '20202020-fff0-4b44-be82-bda313884400',
  taskTarget: '20202020-5a9a-44e8-95df-771cd06d0fb1',
  person: '20202020-e674-48e5-a542-72570eee7213',
  company: '20202020-b374-4779-a561-80086cb2e17f',
  opportunity: '20202020-9549-49dd-b2b2-883999db8938',
  note: '20202020-0b00-45cd-b6f6-6cd806fc6804',
  task: '20202020-1ba1-48ba-bc83-ef7e5990ed10',
  workflow: '20202020-62be-406c-b9ca-8caa50d51392',
  workflowAutomatedTrigger: '20202020-3319-4234-a34c-7f3b9d2e4d1f',
  workflowVersion: '20202020-d65d-4ab9-9344-d77bfb376a3d',
  workflowRun: '20202020-4e28-4e95-a9d7-6c00874f843c',
  workspaceMember: '20202020-3319-4234-a34c-82d5c0e881a6',
  dashboard: '20202020-3840-4b6d-9425-0c5188b05ca8',
  message: '20202020-3f6b-4425-80ab-e468899ab4b2',
  messageChannelMessageAssociation: '20202020-ad1e-4127-bccb-d83ae04d2ccb',
  messageChannelMessageAssociationMessageFolder:
    '20202020-a1b0-40b0-8ab0-5b6c7d8e9f0a',
  messageList: '826561ea-4816-411c-baa0-eec5e6ca8866',
  messageListMember: '27773d24-8ce3-40f8-aa6c-1f590f2c08d2',
  messageCampaign: '238acb94-dd4c-4036-bc55-19b99d821efd',
  messageParticipant: '20202020-a433-4456-aa2d-fd9cb26b774a',
  messageThread: '20202020-849a-4c3e-84f5-a25a7d802271',
  notification: 'c386061a-80c9-4be1-a99a-caae54d30c08',
} as const;

export type StandardObjectWithUniversalIdentifierName =
  keyof typeof STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS;
