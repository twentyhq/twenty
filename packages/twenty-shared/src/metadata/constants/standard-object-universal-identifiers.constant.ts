// Object universal identifiers referenced from another object's declaration
// (default relation builders need both the host and the source object
// identifiers, and an object literal cannot reference its sibling keys).
// Each STANDARD_OBJECTS entry involved in the default relations reads its own
// universalIdentifier from this record so there is a single source of truth.
export const STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = {
  timelineActivity: '20202020-6736-4337-b5c4-8b39fae325a5',
  attachment: '20202020-bd3d-4c60-8dca-571c71d4447a',
  noteTarget: '20202020-fff0-4b44-be82-bda313884400',
  taskTarget: '20202020-5a9a-44e8-95df-771cd06d0fb1',
  person: '20202020-e674-48e5-a542-72570eee7213',
  company: '20202020-b374-4779-a561-80086cb2e17f',
  opportunity: '20202020-9549-49dd-b2b2-883999db8938',
  note: '20202020-0b00-45cd-b6f6-6cd806fc6804',
  task: '20202020-1ba1-48ba-bc83-ef7e5990ed10',
  workflow: '20202020-62be-406c-b9ca-8caa50d51392',
  workflowVersion: '20202020-d65d-4ab9-9344-d77bfb376a3d',
  workflowRun: '20202020-4e28-4e95-a9d7-6c00874f843c',
  dashboard: '20202020-3840-4b6d-9425-0c5188b05ca8',
  messageList: '826561ea-4816-411c-baa0-eec5e6ca8866',
  messageCampaign: '238acb94-dd4c-4036-bc55-19b99d821efd',
} as const;

export type StandardObjectWithUniversalIdentifierName =
  keyof typeof STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS;
