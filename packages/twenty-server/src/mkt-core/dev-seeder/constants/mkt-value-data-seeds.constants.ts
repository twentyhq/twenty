import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { MKT_ATTRIBUTE_DATA_SEEDS_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-attribute-data-seeds.constants';

type MktValueDataSeed = {
  id: string;
  name: string;
  position: number;
  mktAttributeId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
};

// prettier-ignore
export const MKT_VALUE_DATA_SEED_COLUMNS: (keyof MktValueDataSeed)[] = [
  'id',
  'name',
  'position',
  'mktAttributeId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore
export const MKT_VALUE_DATA_SEEDS_IDS = {
ID_1: '98ca6a89-6dfe-4d2e-8e91-f2b0e47c2e1d',
ID_2: 'e6857cc1-4fd7-46cd-902f-dbd74550eae4',
ID_3: '006a5014-7df5-4f97-961f-8ebb4b1b9097',
ID_4: 'fb2ebbff-79d7-4230-b960-f7d41f17ea4e',
ID_5: '671e1ee2-4eba-4629-8002-2b019b20c54a',
ID_6: 'c636da35-f3dc-4f3a-ad1c-d12e84ecd291',
ID_7: '09d3e4b9-513a-456b-bbdd-f3642e8e7c4c',
ID_8: 'b0e0d17f-acc8-4764-8a8c-2ec7471ee8e4',
ID_9: '44d2bc38-ec08-4b97-8766-64a092297020',
ID_10: '05cb1abb-ed34-4425-8e48-2b607c1d0fd4',
ID_11: 'f2261618-4425-4b0d-8a1a-fe7e275feb16',
ID_12: 'b6ebc442-fb62-4422-b912-b6619129dc0f',
ID_13: '83d0ff4d-9de1-46d7-916b-a27c89b1dc8c',
ID_14: '84ceed61-07b9-4b39-9287-8aa7e466242a',
ID_15: 'ecf8ef1f-c280-46d6-a65f-e099b6709993',
ID_16: 'acbebe16-0904-4746-9861-13d0cdef42b8',
ID_17: '7be369bb-5090-4709-872f-5d528ea26275',
ID_18: '32a2af10-fdd5-4c2d-9c9f-34883ba85ff3',
ID_19: '95598f90-dd14-402e-b363-390b2a8cfbdc',
ID_20: 'f7121ba9-962b-4a90-a6ea-d6c232da72e5',
ID_21: '9ce5a7fc-6efc-4f70-b1e4-98262445a1d1',
ID_22: '090aa6e3-4863-4948-8f2c-19685c70c20a',
ID_23: 'db69d2b0-24ad-4f37-82b4-1329031ab19e',
ID_24: '96550ec6-ff19-4c35-ae09-654c392a1258',
ID_25: 'aa79ffe3-2f4f-40f5-a378-2815052d70b2',
ID_26: '982be548-b3e1-4887-89e6-7040b234a749',
ID_27: 'd8b0e248-3076-45a4-a945-e499ab60ecd2',
ID_28: '73472d17-1211-4e85-a3b8-b4041126cf4d',
ID_29: 'b8d49128-ba35-4777-b1f8-dc9fc4e0255e',
ID_30: '2c702bc1-2e3c-46e2-8b15-67c00fa11ee0',
ID_31: '2ce2e81f-c7f9-464f-9c42-e4f09af094a6',
ID_32: '3f6cc145-3c83-416e-bc1d-7f5c15078666',
ID_33: '26e74d45-e85d-414f-97a6-66b6e5a20471',
ID_34: '82dff586-93db-4fe9-af37-2ef0e22833ba',
ID_35: 'd79ddcb0-4532-453c-9f1f-bb062858392b',
};

//prettier-ignore
export const MKT_VALUE_DATA_SEEDS: MktValueDataSeed[] = [
  // Color attribute (ID_1) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_1,
    name: 'Black',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_2,
    name: 'White',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_3,
    name: 'Blue',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Battery Life attribute (ID_2) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_4,
    name: '20 hours',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_5,
    name: '30 hours',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_6,
    name: '40 hours',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Noise Cancellation attribute (ID_3) - 2 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_7,
    name: 'Active',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_8,
    name: 'Passive',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Roast Level attribute (ID_4) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_9,
    name: 'Light',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_10,
    name: 'Medium',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_11,
    name: 'Dark',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Origin attribute (ID_5) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_12,
    name: 'Colombia',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_13,
    name: 'Ethiopia',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_14,
    name: 'Brazil',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Material attribute (ID_6) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_15,
    name: 'Leather',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_16,
    name: 'Mesh',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_17,
    name: 'Fabric',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Weight Capacity attribute (ID_7) - 2 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_18,
    name: '250 lbs',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_19,
    name: '300 lbs',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Adjustable Features attribute (ID_8) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_20,
    name: 'Height',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_21,
    name: 'Armrests',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_22,
    name: 'Lumbar Support',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Capacity attribute (ID_9) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_23,
    name: '500ml',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_24,
    name: '750ml',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_25,
    name: '1L',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Insulation Type attribute (ID_10) - 2 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_26,
    name: 'Vacuum Insulated',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_10,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_27,
    name: 'Double Wall',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_10,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Color Temperature attribute (ID_11) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_28,
    name: 'Warm (2700K)',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_29,
    name: 'Neutral (4000K)',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_30,
    name: 'Cool (6500K)',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Brightness Levels attribute (ID_12) - 2 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_31,
    name: '3 Levels',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_32,
    name: '5 Levels',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },

  // Mounting Type attribute (ID_13) - 3 values
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_33,
    name: 'Clamp Mount',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_34,
    name: 'Base Mount',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
  {
    id: MKT_VALUE_DATA_SEEDS_IDS.ID_35,
    name: 'Wall Mount',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'John Doe',
  },
];


