type MKT_TAG_DATA_SEED = {
  id: string;
  name: string;
  type: MKT_TAGS;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export enum MKT_TAGS {
  SYSTEM = 'SYSTEM',
  CUSTOM = 'CUSTOM',
}

const MKT_TAG_SYSTEM_EXAMPLE = {
  VIP: 'VIP',
  HIGH_VALUE: 'HIGH_VALUE',
  POTENTIAL_CHURN: 'POTENTIAL_CHURN',
  SUPPORT_INTENSIVE: 'SUPPORT_INTENSIVE',
  REFERRAL_SOURCE: 'REFERRAL_SOURCE',
  QUICK_PAYER: 'QUICK_PAYER',
  NEGOTIATOR: 'NEGOTIATOR',
  ENTERPRISE_PROSPECT: 'ENTERPRISE_PROSPECT',
};

const MKT_TAG_CUSTOM_EXAMPLE = {
  INDUSTRY: 'INDUSTRY',
  BEHAVIOR: 'BEHAVIOR',
  CAMPAIGN: 'CAMPAIGN',
  GEOGRAPHIC: 'GEOGRAPHIC',
  SOURCE: 'SOURCE',
};

export const MKT_TAG_DATA_SEED_COLUMNS: (keyof MKT_TAG_DATA_SEED)[] = [
  'id',
  'name',
  'type',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore
export const MKT_TAG_DATA_SEEDS_IDS = {
  VIP: '5443cac3-c63c-4cca-9608-c2e8a3b38bb0',
  HIGH_VALUE: 'c29d6c85-389e-42ab-a8c5-211b9b762099',
  POTENTIAL_CHURN: '0da47f9a-63ae-41f9-bc54-ade5ae00ae2c',
  SUPPORT_INTENSIVE: '66b6ebf1-ef8f-4ce4-a9f6-4fc96c87472b',
  REFERRAL_SOURCE: 'bb1e2efe-7a5b-4ed3-8b6f-8244ce9ca2ac',
  QUICK_PAYER: '43757419-2172-4898-87a1-edc982d47cf3',
  NEGOTIATOR: '550277e9-9c9e-4612-8643-86cc205209bf',
  ENTERPRISE_PROSPECT: '0dfa7693-6374-419e-8f58-3e07cfbe4fd9',
  INDUSTRY: 'b9f71672-88bf-437f-9e71-5a3b7c103971',
  BEHAVIOR: 'c1a32654-dd4b-44fe-b4a1-ea2131251034',
  CAMPAIGN: '2760a5df-3c4a-44ad-8875-c2f04c0c4cde',
  GEOGRAPHIC: '5ea9036d-b77a-4a74-ac5a-3ddb9e9ddf64',
  SOURCE: '5bf28d30-0c48-4b2b-ad94-b506a3baf601',
}

export const MKT_TAG_DATA_SEEDS: MKT_TAG_DATA_SEED[] = [
  {
    id: MKT_TAG_DATA_SEEDS_IDS.VIP,
    name: MKT_TAG_SYSTEM_EXAMPLE.VIP,
    type: MKT_TAGS.SYSTEM,
    position: 1,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.HIGH_VALUE,
    name: MKT_TAG_SYSTEM_EXAMPLE.HIGH_VALUE,
    type: MKT_TAGS.SYSTEM,
    position: 2,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.POTENTIAL_CHURN,
    name: MKT_TAG_SYSTEM_EXAMPLE.POTENTIAL_CHURN,
    type: MKT_TAGS.SYSTEM,
    position: 3,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.SUPPORT_INTENSIVE,
    name: MKT_TAG_SYSTEM_EXAMPLE.SUPPORT_INTENSIVE,
    type: MKT_TAGS.SYSTEM,
    position: 4,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.SOURCE,
    name: MKT_TAG_CUSTOM_EXAMPLE.SOURCE,
    type: MKT_TAGS.CUSTOM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'Custom',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.REFERRAL_SOURCE,
    name: MKT_TAG_SYSTEM_EXAMPLE.REFERRAL_SOURCE,
    type: MKT_TAGS.SYSTEM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.QUICK_PAYER,
    name: MKT_TAG_SYSTEM_EXAMPLE.QUICK_PAYER,
    type: MKT_TAGS.SYSTEM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.NEGOTIATOR,
    name: MKT_TAG_SYSTEM_EXAMPLE.NEGOTIATOR,
    type: MKT_TAGS.SYSTEM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.ENTERPRISE_PROSPECT,
    name: MKT_TAG_SYSTEM_EXAMPLE.ENTERPRISE_PROSPECT,
    type: MKT_TAGS.SYSTEM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.INDUSTRY,
    name: MKT_TAG_CUSTOM_EXAMPLE.INDUSTRY,
    type: MKT_TAGS.CUSTOM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.BEHAVIOR,
    name: MKT_TAG_CUSTOM_EXAMPLE.BEHAVIOR,
    type: MKT_TAGS.CUSTOM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.CAMPAIGN,
    name: MKT_TAG_CUSTOM_EXAMPLE.CAMPAIGN,
    type: MKT_TAGS.CUSTOM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: MKT_TAG_DATA_SEEDS_IDS.GEOGRAPHIC,
    name: MKT_TAG_CUSTOM_EXAMPLE.GEOGRAPHIC,
    type: MKT_TAGS.CUSTOM,
    position: 5,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
];
