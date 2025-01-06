/**
 * /!\ DO NOT EDIT THE IDS OF THIS FILE /!\
 * This file contains static ids for standard objects.
 * These ids are used to identify standard objects in the database and compare them even when renamed.
 * For readability keys can be edited but the values should not be changed.
 */

// TODO: check if this can be deleted
export const ACTIVITY_TARGET_STANDARD_FIELD_IDS = {
  activity: '20202020-ca58-478c-a4f5-ae825671c30e',
  person: '20202020-4afd-4ae7-99c2-de57d795a93f',
  company: '20202020-7cc0-44a1-8068-f11171fdd02e',
  opportunity: '20202020-1fc2-4af1-8c91-7901ee0fd38b',
  custom: '20202020-7f21-442f-94be-32462281b1ca',
};

// TODO: check if this can be deleted
export const ACTIVITY_STANDARD_FIELD_IDS = {
  title: '20202020-24a1-4d94-a071-617f3eeed7b0',
  body: '20202020-209b-440a-b2a8-043fa36a7d37',
  type: '20202020-0f2b-4aab-8827-ee5d3f07d993',
  reminderAt: '20202020-eb06-43e2-ba06-336be0e665a3',
  dueAt: '20202020-0336-4511-ba79-565b12801bd9',
  completedAt: '20202020-0f4d-4fca-9f2f-6309d9ecb85f',
  activityTargets: '20202020-7253-42cb-8586-8cf950e70b79',
  attachments: '20202020-5547-4197-bc2e-a07dfc4559ca',
  comments: '20202020-6b2e-4d29-bbd1-ecddb330e71a',
  author: '20202020-455f-44f2-8e89-1b0ef01cb7fb',
  assignee: '20202020-4259-48e4-9e77-6b92991906d5',
};

export const API_KEY_STANDARD_FIELD_IDS = {
  name: '20202020-72e6-4079-815b-436ce8a62f23',
  expiresAt: '20202020-659b-4241-af59-66515b8e7d40',
  revokedAt: '20202020-06ab-44b5-8faf-f6e407685001',
};

export const ATTACHMENT_STANDARD_FIELD_IDS = {
  name: '20202020-87a5-48f8-bbf7-ade388825a57',
  fullPath: '20202020-0d19-453d-8e8d-fbcda8ca3747',
  type: '20202020-a417-49b8-a40b-f6a7874caa0d',
  author: '20202020-6501-4ac5-a4ef-b2f8522ef6cd',
  activity: '20202020-b569-481b-a13f-9b94e47e54fe',
  task: '20202020-51e5-4621-9cf8-215487951c4b',
  note: '20202020-4f4b-4503-a6fc-6b982f3dffb5',
  person: '20202020-0158-4aa2-965c-5cdafe21ffa2',
  company: '20202020-ceab-4a28-b546-73b06b4c08d5',
  opportunity: '20202020-7374-499d-bea3-9354890755b5',
  custom: '20202020-302d-43b3-9aea-aa4f89282a9f',
};

export const BASE_OBJECT_STANDARD_FIELD_IDS = {
  id: '20202020-eda0-4cee-9577-3eb357e3c22b',
  createdAt: '20202020-66ac-4502-9975-e4d959c50311',
  updatedAt: '20202020-d767-4622-bdcf-d8a084834d86',
  deletedAt: '20202020-b9a7-48d8-8387-b9a3090a50ec',
};

export const BLOCKLIST_STANDARD_FIELD_IDS = {
  handle: '20202020-eef3-44ed-aa32-4641d7fd4a3e',
  workspaceMember: '20202020-548d-4084-a947-fa20a39f7c06',
};

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS = {
  calendarChannel: '20202020-93ee-4da4-8d58-0282c4a9cb7d',
  calendarEvent: '20202020-5aa5-437e-bb86-f42d457783e3',
  eventExternalId: '20202020-9ec8-48bb-b279-21d0734a75a1',
  recurringEventExternalId: '20202020-c58f-4c69-9bf8-9518fa31aa50',
};

export const CALENDAR_CHANNEL_STANDARD_FIELD_IDS = {
  connectedAccount: '20202020-95b1-4f44-82dc-61b042ae2414',
  handle: '20202020-1d08-420a-9aa7-22e0f298232d',
  visibility: '20202020-1b07-4796-9f01-d626bab7ca4d',
  isContactAutoCreationEnabled: '20202020-50fb-404b-ba28-369911a3793a',
  contactAutoCreationPolicy: '20202020-b55d-447d-b4df-226319058775',
  isSyncEnabled: '20202020-fe19-4818-8854-21f7b1b43395',
  syncCursor: '20202020-bac2-4852-a5cb-7a7898992b70',
  calendarChannelEventAssociations: '20202020-afb0-4a9f-979f-2d5087d71d09',
  throttleFailureCount: '20202020-525c-4b76-b9bd-0dd57fd11d61',
  syncStatus: '20202020-7116-41da-8b4b-035975c4eb6a',
  syncStage: '20202020-6246-42e6-b5cd-003bd921782c',
  syncStageStartedAt: '20202020-a934-46f1-a8e7-9568b1e3a53e',
  syncedAt: '20202020-2ff5-4f70-953a-3d0d36357576',
};

export const CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS = {
  calendarEvent: '20202020-fe3a-401c-b889-af4f4657a861',
  handle: '20202020-8692-4580-8210-9e09cbd031a7',
  displayName: '20202020-ee1e-4f9f-8ac1-5c0b2f69691e',
  isOrganizer: '20202020-66e7-4e00-9e06-d06c92650580',
  responseStatus: '20202020-cec0-4be8-8fba-c366abc23147',
  person: '20202020-5761-4842-8186-e1898ef93966',
  workspaceMember: '20202020-20e4-4591-93ed-aeb17a4dcbd2',
};

export const CALENDAR_EVENT_STANDARD_FIELD_IDS = {
  title: '20202020-080e-49d1-b21d-9702a7e2525c',
  isCanceled: '20202020-335b-4e04-b470-43b84b64863c',
  isFullDay: '20202020-551c-402c-bb6d-dfe9efe86bcb',
  startsAt: '20202020-2c57-4c75-93c5-2ac950a6ed67',
  endsAt: '20202020-2554-4ee1-a617-17907f6bab21',
  externalCreatedAt: '20202020-9f03-4058-a898-346c62181599',
  externalUpdatedAt: '20202020-b355-4c18-8825-ef42c8a5a755',
  description: '20202020-52c4-4266-a98f-e90af0b4d271',
  location: '20202020-641a-4ffe-960d-c3c186d95b17',
  iCalUID: '20202020-f24b-45f4-b6a3-d2f9fcb98714',
  conferenceSolution: '20202020-1c3f-4b5a-b526-5411a82179eb',
  conferenceLink: '20202020-35da-43ef-9ca0-e936e9dc237b',
  calendarChannelEventAssociations: '20202020-bdf8-4572-a2cc-ecbb6bcc3a02',
  calendarEventParticipants: '20202020-e07e-4ccb-88f5-6f3d00458eec',
};

// TODO: check if this can be deleted
export const COMMENT_STANDARD_FIELD_IDS = {
  body: '20202020-d5eb-49d2-b3e0-1ed04145ebb7',
  author: '20202020-2ab1-427e-a981-cf089de3a9bd',
  activity: '20202020-c8d9-4c30-a35e-dc7f44388070',
};

export const COMPANY_STANDARD_FIELD_IDS = {
  name: '20202020-4d99-4e2e-a84c-4a27837b1ece',
  domainName: '20202020-0c28-43d8-8ba5-3659924d3489',
  address_deprecated: '20202020-a82a-4ee2-96cc-a18a3259d953',
  address: '20202020-c5ce-4adc-b7b6-9c0979fc55e7',
  employees: '20202020-8965-464a-8a75-74bafc152a0b',
  linkedinLink: '20202020-ebeb-4beb-b9ad-6848036fb451',
  xLink: '20202020-6f64-4fd9-9580-9c1991c7d8c3',
  annualRecurringRevenue: '20202020-602a-495c-9776-f5d5b11d227b',
  idealCustomerProfile: '20202020-ba6b-438a-8213-2c5ba28d76a2',
  position: '20202020-9b4e-462b-991d-a0ee33326454',
  createdBy: '20202020-fabc-451d-ab7d-412170916baa',
  people: '20202020-3213-4ddf-9494-6422bcff8d7c',
  accountOwner: '20202020-95b8-4e10-9881-edb5d4765f9d',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-c2a5-4c9b-9d9a-582bcd57fbc8',
  taskTargets: '20202020-cb17-4a61-8f8f-3be6730480de',
  noteTargets: '20202020-bae0-4556-a74a-a9c686f77a88',
  opportunities: '20202020-add3-4658-8e23-d70dccb6d0ec',
  favorites: '20202020-4d1d-41ac-b13b-621631298d55',
  attachments: '20202020-c1b5-4120-b0f0-987ca401ed53',
  timelineActivities: '20202020-0414-4daf-9c0d-64fe7b27f89f',
  searchVector: '85c71601-72f9-4b7b-b343-d46100b2c74d',
};

export const CONNECTED_ACCOUNT_STANDARD_FIELD_IDS = {
  handle: '20202020-c804-4a50-bb05-b3a9e24f1dec',
  provider: '20202020-ebb0-4516-befc-a9e95935efd5',
  accessToken: '20202020-707b-4a0a-8753-2ad42efe1e29',
  refreshToken: '20202020-532d-48bd-80a5-c4be6e7f6e49',
  accountOwner: '20202020-3517-4896-afac-b1d0aa362af6',
  lastSyncHistoryId: '20202020-115c-4a87-b50f-ac4367a971b9',
  authFailedAt: '20202020-d268-4c6b-baff-400d402b430a',
  messageChannels: '20202020-24f7-4362-8468-042204d1e445',
  calendarChannels: '20202020-af4a-47bb-99ec-51911c1d3977',
  handleAliases: '20202020-8a3d-46be-814f-6228af16c47b',
  scopes: '20202020-8a3d-46be-814f-6228af16c47c',
};

export const EVENT_STANDARD_FIELD_IDS = {
  properties: '20202020-f142-4b04-b91b-6a2b4af3bf10',
  workspaceMember: '20202020-af23-4479-9a30-868edc474b35',
  person: '20202020-c414-45b9-a60a-ac27aa96229e',
  company: '20202020-04ad-4221-a744-7a8278a5ce20',
  opportunity: '20202020-7664-4a35-a3df-580d389fd5f0',
  custom: '20202020-4a71-41b0-9f83-9cdcca3f8b14',
};

export const AUDIT_LOGS_STANDARD_FIELD_IDS = {
  name: '20202020-2462-4b9d-b5d9-745febb3b095',
  properties: '20202020-5d36-470e-8fad-d56ea3ab2fd0',
  context: '20202020-b9d1-4058-9a75-7469cab5ca8c',
  objectName: '20202020-76ba-4c47-b7e5-96034005d00a',
  objectMetadataId: '20202020-127b-409d-9864-0ec44aa9ed98',
  recordId: '20202020-c578-4acf-bf94-eb53b035cea2',
  workspaceMember: '20202020-6e96-4300-b3f5-67a707147385',
};

export const BEHAVIORAL_EVENT_STANDARD_FIELD_IDS = {
  name: '20202020-2462-4b9d-b5d9-745febb3b095',
  properties: '20202020-5d36-470e-8fad-d56ea3ab2fd0',
  context: '20202020-bd62-4b5b-8385-6caeed8f8078',
  objectName: '20202020-a744-406c-a2e1-9d83d74f4341',
  recordId: '20202020-6d8b-4ca5-9869-f882cb335673',
};

export const TIMELINE_ACTIVITY_STANDARD_FIELD_IDS = {
  happensAt: '20202020-9526-4993-b339-c4318c4d39f0',
  type: '20202020-5e7b-4ccd-8b8a-86b94b474134',
  name: '20202020-7207-46e8-9dab-849505ae8497',
  properties: '20202020-f142-4b04-b91b-6a2b4af3bf11',
  workspaceMember: '20202020-af23-4479-9a30-868edc474b36',
  person: '20202020-c414-45b9-a60a-ac27aa96229f',
  company: '20202020-04ad-4221-a744-7a8278a5ce21',
  opportunity: '20202020-7664-4a35-a3df-580d389fd527',
  task: '20202020-b2f5-415c-9135-a31dfe49501b',
  note: '20202020-ec55-4135-8da5-3a20badc0156',
  workflow: '20202020-616c-4ad3-a2e9-c477c341e295',
  workflowVersion: '20202020-74f1-4711-a129-e14ca0ecd744',
  workflowRun: '20202020-96f0-401b-9186-a3a0759225ac',
  custom: '20202020-4a71-41b0-9f83-9cdcca3f8b14',
  linkedRecordCachedName: '20202020-cfdb-4bef-bbce-a29f41230934',
  linkedRecordId: '20202020-2e0e-48c0-b445-ee6c1e61687d',
  linkedObjectMetadataId: '20202020-c595-449d-9f89-562758c9ee69',
};

export const FAVORITE_STANDARD_FIELD_IDS = {
  position: '20202020-dd26-42c6-8c3c-2a7598c204f6',
  workspaceMember: '20202020-ce63-49cb-9676-fdc0c45892cd',
  person: '20202020-c428-4f40-b6f3-86091511c41c',
  company: '20202020-cff5-4682-8bf9-069169e08279',
  opportunity: '20202020-dabc-48e1-8318-2781a2b32aa2',
  workflow: '20202020-b11b-4dc8-999a-6bd0a947b463',
  workflowVersion: '20202020-e1b8-4caf-b55a-3ab4d4cbcd21',
  workflowRun: '20202020-db5a-4fe4-9a13-9afa22b1e762',
  task: '20202020-1b1b-4b3b-8b1b-7f8d6a1d7d5c',
  note: '20202020-1f25-43fe-8b00-af212fdde824',
  view: '20202020-5a93-4fa9-acce-e73481a0bbdf',
  custom: '20202020-855a-4bc8-9861-79deef37011f',
  favoriteFolder: '20202020-f658-4d12-8b4d-248356aa4bd9',
};

export const FAVORITE_FOLDER_STANDARD_FIELD_IDS = {
  position: '20202020-5278-4bde-8909-2cec74d43744',
  name: '20202020-82a3-4537-8ff0-dbce7eec35d6',
  favorites: '20202020-b5e3-4b42-8af2-03cd4fd2e4d2',
};

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS = {
  messageChannel: '20202020-b658-408f-bd46-3bd2d15d7e52',
  message: '20202020-da5d-4ac5-8743-342ab0a0336b',
  messageExternalId: '20202020-37d6-438f-b6fd-6503596c8f34',
  messageThread: '20202020-fac8-42a8-94dd-44dbc920ae16',
  messageThreadExternalId: '20202020-35fb-421e-afa0-0b8e8f7f9018',
};

export const MESSAGE_CHANNEL_STANDARD_FIELD_IDS = {
  visibility: '20202020-6a6b-4532-9767-cbc61b469453',
  handle: '20202020-2c96-43c3-93e3-ed6b1acb69bc',
  connectedAccount: '20202020-49a2-44a4-b470-282c0440d15d',
  type: '20202020-ae95-42d9-a3f1-797a2ea22122',
  isContactAutoCreationEnabled: '20202020-fabd-4f14-b7c6-3310f6d132c6',
  contactAutoCreationPolicy: '20202020-fc0e-4ba6-b259-a66ca89cfa38',
  excludeNonProfessionalEmails: '20202020-1df5-445d-b4f3-2413ad178431',
  excludeGroupEmails: '20202020-45a0-4be4-9164-5820a6a109fb',
  messageChannelMessageAssociations: '20202020-49b8-4766-88fd-75f1e21b3d5f',
  isSyncEnabled: '20202020-d9a6-48e9-990b-b97fdf22e8dd',
  syncCursor: '20202020-79d1-41cf-b738-bcf5ed61e256',
  syncedAt: '20202020-263d-4c6b-ad51-137ada56f7d4',
  syncStatus: '20202020-56a1-4f7e-9880-a8493bb899cc',
  syncStage: '20202020-7979-4b08-89fe-99cb5e698767',
  syncStageStartedAt: '20202020-8c61-4a42-ae63-73c1c3c52e06',
  throttleFailureCount: '20202020-0291-42be-9ad0-d578a51684ab',
};

export const MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS = {
  message: '20202020-985b-429a-9db9-9e55f4898a2a',
  role: '20202020-65d1-42f4-8729-c9ec1f52aecd',
  handle: '20202020-2456-464e-b422-b965a4db4a0b',
  displayName: '20202020-36dd-4a4f-ac02-228425be9fac',
  person: '20202020-249d-4e0f-82cd-1b9df5cd3da2',
  workspaceMember: '20202020-77a7-4845-99ed-1bcbb478be6f',
};

export const MESSAGE_THREAD_STANDARD_FIELD_IDS = {
  messages: '20202020-3115-404f-aade-e1154b28e35a',
  messageChannelMessageAssociations: '20202020-314e-40a4-906d-a5d5d6c285f6',
  messageThreadSubscribers: '20202020-3b3b-4b3b-8b3b-7f8d6a1d7d5b',
};

export const MESSAGE_THREAD_SUBSCRIBER_STANDARD_FIELD_IDS = {
  messageThread: '20202020-2c8f-4f3e-8b9a-7f8d6a1c7d5b',
  workspaceMember: '20202020-7f7b-4b3b-8b3b-7f8d6a1d7d5a',
};

export const MESSAGE_STANDARD_FIELD_IDS = {
  headerMessageId: '20202020-72b5-416d-aed8-b55609067d01',
  messageThread: '20202020-30f2-4ccd-9f5c-e41bb9d26214',
  direction: '20202020-0203-4118-8e2a-05b9bdae6dab',
  subject: '20202020-52d1-4036-b9ae-84bd722bb37a',
  text: '20202020-d2ee-4e7e-89de-9a0a9044a143',
  receivedAt: '20202020-140a-4a2a-9f86-f13b6a979afc',
  messageParticipants: '20202020-7cff-4a74-b63c-73228448cbd9',
  messageChannelMessageAssociations: '20202020-3cef-43a3-82c6-50e7cfbc9ae4',
};

export const NOTE_STANDARD_FIELD_IDS = {
  position: '20202020-368d-4dc2-943f-ed8a49c7fdfb',
  title: '20202020-faeb-4c76-8ba6-ccbb0b4a965f',
  body: '20202020-e63d-4e70-95be-a78cd9abe7ef',
  createdBy: '20202020-0d79-4e21-ab77-5a394eff97be',
  noteTargets: '20202020-1f25-43fe-8b00-af212fdde823',
  attachments: '20202020-4986-4c92-bf19-39934b149b16',
  timelineActivities: '20202020-7030-42f8-929c-1a57b25d6bce',
  favorites: '20202020-4d1d-41ac-b13b-621631298d67',
  searchVector: '20202020-7ea8-44d4-9d4c-51dd2a757950',
};

export const NOTE_TARGET_STANDARD_FIELD_IDS = {
  note: '20202020-57f3-4f50-9599-fc0f671df003',
  person: '20202020-38ca-4aab-92f5-8a605ca2e4c5',
  company: 'c500fbc0-d6f2-4982-a959-5a755431696c',
  opportunity: '20202020-4e42-417a-a705-76581c9ade79',
  custom: '20202020-3d12-4579-94ee-7117c1bad492',
};

export const OPPORTUNITY_STANDARD_FIELD_IDS = {
  name: '20202020-8609-4f65-a2d9-44009eb422b5',
  amount: '20202020-583e-4642-8533-db761d5fa82f',
  closeDate: '20202020-527e-44d6-b1ac-c4158d307b97',
  probabilityDeprecated: '20202020-69d4-45f3-9703-690b09fafcf0',
  stage: '20202020-6f76-477d-8551-28cd65b2b4b9',
  position: '20202020-806d-493a-bbc6-6313e62958e2',
  createdBy: '20202020-a63e-4a62-8e63-42a51828f831',
  pointOfContact: '20202020-8dfb-42fc-92b6-01afb759ed16',
  company: '20202020-cbac-457e-b565-adece5fc815f',
  favorites: '20202020-a1c2-4500-aaae-83ba8a0e827a',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-220a-42d6-8261-b2102d6eab35',
  taskTargets: '20202020-59c0-4179-a208-4a255f04a5be',
  noteTargets: '20202020-dd3f-42d5-a382-db58aabf43d3',
  attachments: '20202020-87c7-4118-83d6-2f4031005209',
  timelineActivities: '20202020-30e2-421f-96c7-19c69d1cf631',
  searchVector: '428a0da5-4b2e-4ce3-b695-89a8b384e6e3',
};

export const PERSON_STANDARD_FIELD_IDS = {
  name: '20202020-3875-44d5-8c33-a6239011cab8',
  email: '20202020-a740-42bb-8849-8980fb3f12e1',
  emails: '20202020-3c51-43fa-8b6e-af39e29368ab',
  linkedinLink: '20202020-f1af-48f7-893b-2007a73dd508',
  xLink: '20202020-8fc2-487c-b84a-55a99b145cfd',
  jobTitle: '20202020-b0d0-415a-bef9-640a26dacd9b',
  phone: '20202020-4564-4b8b-a09f-05445f2e0bce',
  phones: '20202020-0638-448e-8825-439134618022',
  city: '20202020-5243-4ffb-afc5-2c675da41346',
  avatarUrl: '20202020-b8a6-40df-961c-373dc5d2ec21',
  position: '20202020-fcd5-4231-aff5-fff583eaa0b1',
  createdBy: '20202020-f6ab-4d98-af24-a3d5b664148a',
  company: '20202020-e2f3-448e-b34c-2d625f0025fd',
  pointOfContactForOpportunities: '20202020-911b-4a7d-b67b-918aa9a5b33a',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-dee7-4b7f-b50a-1f50bd3be452',
  taskTargets: '20202020-584b-4d3e-88b6-53ab1fa03c3a',
  noteTargets: '20202020-c8fc-4258-8250-15905d3fcfec',
  favorites: '20202020-4073-4117-9cf1-203bcdc91cbd',
  attachments: '20202020-cd97-451f-87fa-bcb789bdbf3a',
  messageParticipants: '20202020-498e-4c61-8158-fa04f0638334',
  calendarEventParticipants: '20202020-52ee-45e9-a702-b64b3753e3a9',
  timelineActivities: '20202020-a43e-4873-9c23-e522de906ce5',
  searchVector: '57d1d7ad-fa10-44fc-82f3-ad0959ec2534',
};

export const TASK_STANDARD_FIELD_IDS = {
  position: '20202020-7d47-4690-8a98-98b9a0c05dd8',
  title: '20202020-b386-4cb7-aa5a-08d4a4d92680',
  body: '20202020-ce13-43f4-8821-69388fe1fd26',
  dueAt: '20202020-fd99-40da-951b-4cb9a352fce3',
  status: '20202020-70bc-48f9-89c5-6aa730b151e0',
  createdBy: '20202020-1a04-48ab-a567-576965ae5387',
  taskTargets: '20202020-de9c-4d0e-a452-713d4a3e5fc7',
  attachments: '20202020-794d-4783-a8ff-cecdb15be139',
  assignee: '20202020-065a-4f42-a906-e20422c1753f',
  timelineActivities: '20202020-c778-4278-99ee-23a2837aee64',
  favorites: '20202020-4d1d-41ac-b13b-621631298d65',
  searchVector: '20202020-4746-4e2f-870c-52b02c67c90d',
};

export const TASK_TARGET_STANDARD_FIELD_IDS = {
  task: '20202020-e881-457a-8758-74aaef4ae78a',
  person: '20202020-c8a0-4e85-a016-87e2349cfbec',
  company: '20202020-4703-4a4e-948c-487b0c60a92c',
  opportunity: '20202020-6cb2-4c01-a9a5-aca3dbc11d41',
  custom: '20202020-41c1-4c9a-8c75-be0971ef89af',
};

export const VIEW_FIELD_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-135f-4c5b-b361-15f24870473c',
  isVisible: '20202020-e966-473c-9c18-f00d3347e0ba',
  size: '20202020-6fab-4bd0-ae72-20f3ee39d581',
  position: '20202020-19e5-4e4c-8c15-3a96d1fd0650',
  view: '20202020-e8da-4521-afab-d6d231f9fa18',
  aggregateOperation: '20202020-2cd7-4f94-ae83-4a14f5731a04',
};

export const VIEW_GROUP_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-8f26-46ae-afed-fdacd7778682',
  fieldValue: '20202020-175e-4596-b7a4-1cd9d14e5a30',
  isVisible: '20202020-0fed-4b44-88fd-a064c4fcfce4',
  position: '20202020-748e-4645-8f32-84aae7726c04',
  view: '20202020-5bc7-4110-b23f-fb851fb133b4',
};

export const VIEW_FILTER_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-c9aa-4c94-8d0e-9592f5008fb0',
  operand: '20202020-bd23-48c4-9fab-29d1ffb80310',
  value: '20202020-1e55-4a1e-a1d2-fefb86a5fce5',
  displayValue: '20202020-1270-4ebf-9018-c0ec10d5038e',
  view: '20202020-4f5b-487e-829c-3d881c163611',
  viewFilterGroupId: '20202020-2580-420a-8328-cab1635c0296',
  positionInViewFilterGroup: '20202020-3bb0-4f66-a537-a46fe0dc468f',
};

export const VIEW_FILTER_GROUP_STANDARD_FIELD_IDS = {
  view: '20202020-ff7a-4b54-8be5-aa0249047b74',
  parentViewFilterGroupId: '20202020-edbf-4929-8ede-64f48d6bf2a7',
  logicalOperator: '20202020-64d9-4bc5-85ba-c250796ce9aa',
  positionInViewFilterGroup: '20202020-90d6-4299-ad87-d05ddd3a0a3f',
};

export const VIEW_SORT_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-8240-4657-aee4-7f0df8e94eca',
  direction: '20202020-b06e-4eb3-9b58-0a62e5d79836',
  view: '20202020-bd6c-422b-9167-5c105f2d02c8',
};

export const VIEW_STANDARD_FIELD_IDS = {
  name: '20202020-12c6-4f37-b588-c9b9bf57328d',
  objectMetadataId: '20202020-d6de-4fd5-84dd-47f9e730368b',
  type: '20202020-dd11-4607-9ec7-c57217262a7f',
  key: '20202020-298e-49fa-9f4a-7b416b110443',
  icon: '20202020-1f08-4fd9-929b-cbc07f317166',
  kanbanFieldMetadataId: '20202020-d09b-4f65-ac42-06a2f20ba0e8',
  kanbanAggregateOperation: '20202020-8da2-45de-a731-61bed84b17a8',
  kanbanAggregateOperationFieldMetadataId:
    '20202020-b1b3-4bf3-85e4-dc7d58aa9b02',
  position: '20202020-e9db-4303-b271-e8250c450172',
  isCompact: '20202020-674e-4314-994d-05754ea7b22b',
  viewFields: '20202020-542b-4bdc-b177-b63175d48edf',
  viewGroups: '20202020-e1a1-419f-ac81-1986a5ea59a8',
  viewFilters: '20202020-ff23-4154-b63c-21fb36cd0967',
  viewFilterGroups: '20202020-0318-474a-84a1-bac895ceaa5a',
  viewSorts: '20202020-891b-45c3-9fe1-80a75b4aa043',
  favorites: '20202020-c818-4a86-8284-9ec0ef0a59a5',
};

export const WEBHOOK_STANDARD_FIELD_IDS = {
  targetUrl: '20202020-1229-45a8-8cf4-85c9172aae12',
  operation: '20202020-15b7-458e-bf30-74770a54410c',
  operations: '20202020-15b7-458e-bf30-74770a54411c',
  description: '20202020-15b7-458e-bf30-74770a54410d',
  secret: '20202020-97ce-410f-bff9-e9ccb038fb67',
};

export const WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS = {
  eventName: '20202020-7318-4cf8-a6ac-2de75e3fd97d',
  workflow: '20202020-4082-4641-8569-dc08d5365002',
};

export const WORKFLOW_STANDARD_FIELD_IDS = {
  name: '20202020-b3d3-478f-acc0-5d901e725b20',
  lastPublishedVersionId: '20202020-326a-4fba-8639-3456c0a169e8',
  statuses: '20202020-357c-4432-8c50-8c31b4a552d9',
  position: '20202020-39b0-4d8c-8c5f-33c2326deb5f',
  versions: '20202020-9432-416e-8f3c-27ee3153d099',
  runs: '20202020-759b-4340-b58b-e73595c4df4f',
  eventListeners: '20202020-0229-4c66-832e-035c67579a38',
  favorites: '20202020-c554-4c41-be7a-cf9cd4b0d512',
  timelineActivities: '20202020-906e-486a-a798-131a5f081faf',
  createdBy: '20202020-6007-401a-8aa5-e6f48581a6f3',
};

export const WORKFLOW_RUN_STANDARD_FIELD_IDS = {
  name: '20202020-b840-4253-aef9-4e5013694587',
  workflowVersion: '20202020-2f52-4ba8-8dc4-d0d6adb9578d',
  workflow: '20202020-8c57-4e7f-84f5-f373f68e1b82',
  startedAt: '20202020-a234-4e2d-bd15-85bcea6bb183',
  endedAt: '20202020-e1c1-4b6b-bbbd-b2beaf2e159e',
  status: '20202020-6b3e-4f9c-8c2b-2e5b8e6d6f3b',
  position: '20202020-7802-4c40-ae89-1f506fe3365c',
  createdBy: '20202020-6007-401a-8aa5-e6f38581a6f3',
  output: '20202020-7be4-4db2-8ac6-3ff0d740843d',
  favorites: '20202020-4baf-4604-b899-2f7fcfbbf90d',
  timelineActivities: '20202020-af4d-4eb0-babc-eb960a45b356',
};

export const WORKFLOW_VERSION_STANDARD_FIELD_IDS = {
  name: '20202020-a12f-4cca-9937-a2e40cc65509',
  workflow: '20202020-afa3-46c3-91b0-0631ca6aa1c8',
  trigger: '20202020-4eae-43e7-86e0-212b41a30b48',
  status: '20202020-5a34-440e-8a25-39d8c3d1d4cf',
  position: '20202020-791d-4950-ab28-0e704767ae1c',
  runs: '20202020-1d08-46df-901a-85045f18099a',
  steps: '20202020-5988-4a64-b94a-1f9b7b989039',
  favorites: '20202020-b8e0-4e57-928d-b51671cc71f2',
  timelineActivities: '20202020-fcb0-4695-b17e-3b43a421c633',
};

export const WORKSPACE_MEMBER_STANDARD_FIELD_IDS = {
  name: '20202020-e914-43a6-9c26-3603c59065f4',
  colorScheme: '20202020-66bc-47f2-adac-f2ef7c598b63',
  locale: '20202020-402e-4695-b169-794fa015afbe',
  avatarUrl: '20202020-0ced-4c4f-a376-c98a966af3f6',
  userEmail: '20202020-4c5f-4e09-bebc-9e624e21ecf4',
  userId: '20202020-75a9-4dfc-bf25-2e4b43e89820',
  authoredActivities: '20202020-f139-4f13-a82f-a65a8d290a74',
  assignedActivities: '20202020-5c97-42b6-8ca9-c07622cbb33f',
  assignedTasks: '20202020-61dc-4a1c-99e8-38ebf8d2bbeb',
  favorites: '20202020-f3c1-4faf-b343-cf7681038757',
  accountOwnerForCompanies: '20202020-dc29-4bd4-a3c1-29eafa324bee',
  authoredAttachments: '20202020-000f-4947-917f-1b09851024fe',
  authoredComments: '20202020-5536-4f59-b837-51c45ef43b05',
  connectedAccounts: '20202020-e322-4bde-a525-727079b4a100',
  messageParticipants: '20202020-8f99-48bc-a5eb-edd33dd54188',
  blocklist: '20202020-6cb2-4161-9f29-a4b7f1283859',
  calendarEventParticipants: '20202020-0dbc-4841-9ce1-3e793b5b3512',
  timelineActivities: '20202020-e15b-47b8-94fe-8200e3c66615',
  auditLogs: '20202020-2f54-4739-a5e2-99563385e83d',
  messageThreadSubscribers: '20202020-4b3b-4b3b-9b3b-3b3b3b3b3b3b',
  timeZone: '20202020-2d33-4c21-a86e-5943b050dd54',
  dateFormat: '20202020-af13-4e11-b1e7-b8cf5ea13dc0',
  timeFormat: '20202020-8acb-4cf8-a851-a6ed443c8d81',
  searchVector: '20202020-46d0-4e7f-bc26-74c0edaeb619',
};

export const CUSTOM_OBJECT_STANDARD_FIELD_IDS = {
  name: '20202020-ba07-4ffd-ba63-009491f5749c',
  position: '20202020-c2bd-4e16-bb9a-c8b0411bf49d',
  createdBy: '20202020-be0e-4971-865b-32ca87cbb315',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-7f42-40ae-b96c-c8a61acc83bf',
  noteTargets: '20202020-01fd-4f37-99dc-9427a444018a',
  taskTargets: '20202020-0860-4566-b865-bff3c626c303',
  favorites: '20202020-a4a7-4686-b296-1c6c3482ee21',
  attachments: '20202020-8d59-46ca-b7b2-73d167712134',
  timelineActivities: '20202020-f1ef-4ba4-8f33-1a4577afa477',
  searchVector: '70e56537-18ef-4811-b1c7-0a444006b815',
};

export const STANDARD_OBJECT_FIELD_IDS = {
  activityTarget: ACTIVITY_TARGET_STANDARD_FIELD_IDS,
  activity: ACTIVITY_STANDARD_FIELD_IDS,
  apiKey: API_KEY_STANDARD_FIELD_IDS,
  attachment: ATTACHMENT_STANDARD_FIELD_IDS,
  blocklist: BLOCKLIST_STANDARD_FIELD_IDS,
  behavioralEvent: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS,
  calendarChannelEventAssociation:
    CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS,
  calendarChannel: CALENDAR_CHANNEL_STANDARD_FIELD_IDS,
  calendarEventParticipant: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS,
  calendarEvent: CALENDAR_EVENT_STANDARD_FIELD_IDS,
  comment: COMMENT_STANDARD_FIELD_IDS,
  company: COMPANY_STANDARD_FIELD_IDS,
  connectedAccount: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS,
  favorite: FAVORITE_STANDARD_FIELD_IDS,
  auditLog: AUDIT_LOGS_STANDARD_FIELD_IDS,
  messageChannelMessageAssociation:
    MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS,
  messageChannel: MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
  messageParticipant: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS,
  messageThread: MESSAGE_THREAD_STANDARD_FIELD_IDS,
  messageThreadSubscriber: MESSAGE_THREAD_SUBSCRIBER_STANDARD_FIELD_IDS,
  message: MESSAGE_STANDARD_FIELD_IDS,
  note: NOTE_STANDARD_FIELD_IDS,
  noteTarget: NOTE_TARGET_STANDARD_FIELD_IDS,
  opportunity: OPPORTUNITY_STANDARD_FIELD_IDS,
  person: PERSON_STANDARD_FIELD_IDS,
  task: TASK_STANDARD_FIELD_IDS,
  taskTarget: TASK_TARGET_STANDARD_FIELD_IDS,
  timelineActivity: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
  viewField: VIEW_FIELD_STANDARD_FIELD_IDS,
  viewGroup: VIEW_GROUP_STANDARD_FIELD_IDS,
  viewFilter: VIEW_FILTER_STANDARD_FIELD_IDS,
  viewSort: VIEW_SORT_STANDARD_FIELD_IDS,
  view: VIEW_STANDARD_FIELD_IDS,
  webhook: WEBHOOK_STANDARD_FIELD_IDS,
  workflow: WORKFLOW_STANDARD_FIELD_IDS,
  workflowEventListener: WORKFLOW_EVENT_LISTENER_STANDARD_FIELD_IDS,
  workflowRun: WORKFLOW_RUN_STANDARD_FIELD_IDS,
  workflowVersion: WORKFLOW_VERSION_STANDARD_FIELD_IDS,
  workspaceMember: WORKSPACE_MEMBER_STANDARD_FIELD_IDS,
};
