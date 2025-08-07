import {WORKSPACE_MEMBER_DATA_SEED_IDS} from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {MKT_ATTRIBUTE_DATA_SEEDS_IDS} from 'src/mkt-core/dev-seeder/constants/mkt-attribute-data-seeds.constants';
import {MKT_VARIANT_DATA_SEEDS_IDS} from 'src/mkt-core/dev-seeder/constants/mkt-variant-data-seeds.constants';

type MktVariantAttributeDataSeed = {
  id: string;
  name: string;
  position: number;
  mktAttributeId: string;
  mktVariantId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
};

// prettier-ignore
export const MKT_VARIANT_ATTRIBUTE_DATA_SEED_COLUMNS: (keyof MktVariantAttributeDataSeed)[] = [
  'id',
  'name',
  'position',
  'mktAttributeId',
  'mktVariantId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore
export const MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS = {
    // Product 1: Wireless Bluetooth Headphones variants (9 records - 3 variants × 3 attributes)
    ID_1: 'ed40a5ce-4bfd-4799-b853-c48e9339903a',
    ID_2: '7a48b9e8-036c-475b-bbb2-8ee68297eba9',
    ID_3: 'e23f5a6c-16f8-4ba3-ad00-c0cdb6332faf',
    ID_4: '13b69e4d-bcd0-492f-83fa-3a5dc890eb09',
    ID_5: '0e31d764-bfec-44c9-ac42-415c8ee91915',
    ID_6: '5f0f46c9-50a9-4fcf-9f11-edc840591083',
    ID_7: '5d826f93-e34d-499c-a40e-40fee09742da',
    ID_8: '8accd098-f067-40a6-8854-9bf66b8e7a9e',
    ID_9: 'ee613558-9c86-426c-b9ea-fbbbe8b977c4',
    
    // Product 2: Coffee Beans variants (4 records - 2 variants × 2 attributes)
    ID_10: '278b0e1c-b974-4ef2-a607-d59c577c496d',
    ID_11: '670bfc46-7d3a-4de1-aa76-742a2be8701f',
    ID_12: '21f39440-99b0-4b97-91e7-ced04183bc45',
    ID_13: 'ef4b7af1-1127-4c67-a966-a32921632671',
    
    // Product 3: Office Chair variants (9 records - 3 variants × 3 attributes)
    ID_14: 'fd07ad47-35f6-435a-a068-619ae9bb981d',
    ID_15: 'a7b033ab-e712-4af6-9585-ca8b94e66603',
    ID_16: 'ebb3d4e2-14a0-4836-bf50-433186ff7f2c',
    ID_17: '4777e767-d49f-4622-9336-5282b4923ef0',
    ID_18: '2ca6caad-b97f-4ff6-b70a-74408085be8a',
    ID_19: 'e4d457e8-df5c-4e27-b6f8-6b0091c11f81',
    ID_20: '92ded997-0bcd-45de-a36d-7ff3a821ff6a',
    ID_21: 'b1fa451c-6b84-430b-9922-567e15b28f13',
    ID_22: '3bae5cfc-5f2b-4f99-a687-30affb191bdc',
    
    // Product 4: Water Bottle variants (2 records - 1 variant × 2 attributes)
    ID_23: '1e8cd932-23bd-4b04-9c2d-021a7f6dd955',
    ID_24: 'cb9ac7d7-183b-4c1b-932a-679dd2230fd9',
    
    // Product 5: LED Desk Lamp variants (6 records - 2 variants × 3 attributes)
    ID_25: '5bfae7bc-546a-4ba6-b73f-5ee48576799e',
    ID_26: '210abb4c-c60e-4100-92ff-e15589374eef',
    ID_27: 'e18f031d-144c-48cf-b942-355bbba18ac8',
    ID_28: 'faa94a56-09b0-4508-a515-1f373c03dda4',
    ID_29: '4cd2715f-b512-48dd-b39b-9bd547744d99',
    ID_30: '31e7edb8-c513-4aec-b697-4321b61e5724',
    
    // Additional variant attributes for more detailed configurations (20 more records)
    ID_31: '602b9ccf-01eb-457d-951c-c0be6fcf2273',
    ID_32: '01bd8f88-2aff-4698-818c-576fa9a2dc08',
    ID_33: '83a49963-90e7-4a20-9ce9-72bc4195c479',
    ID_34: '753889b2-f251-474e-be34-8e1ebe560560',
    ID_35: 'b5149500-9346-4e01-8d09-041457ede195',
    ID_36: 'cdfa5462-5691-4407-9df4-e278d08a6178',
    ID_37: '95478b13-7839-4f26-8fa1-bffa2d7e51cd',
    ID_38: '900eaa7f-f06c-4e63-a007-840a33edc269',
    ID_39: '781c76d7-4cce-4142-8367-d71e8e9ae1ab',
    ID_40: '703abe27-8a0f-4f0d-b565-be655becab49',
    ID_41: '60e9f2ef-8f0a-40de-9dd6-46a0db263990',
    ID_42: 'b2f03715-6eb7-4a25-83c4-4f03ac29eb17',
    ID_43: '6459cc36-e401-4b9e-a94b-d59bcec77585',
    ID_44: '932e4120-05f3-4712-8004-e11e8d1e8ab0',
    ID_45: '3cc9be1f-9e83-4bec-a6bf-c612dbd27ca2',
    ID_46: '26d1a1e5-b137-494b-b6c5-55d9c3edf0d7',
    ID_47: '9a9cd66f-8ede-415b-ac92-d5981b48f4ae',
    ID_48: '8c83658f-d965-4aeb-80e7-179cf52ec3bc',
    ID_49: 'd0fe7dc9-f6d1-406f-867a-4a93e969c835',
    ID_50: '20a7ddd5-4a83-4b31-be69-9c6af837d898',
};

//prettier-ignore
export const MKT_VARIANT_ATTRIBUTE_DATA_SEEDS: MktVariantAttributeDataSeed[] = [
  // Product 1: Wireless Bluetooth Headphones - Black Standard (ID_1)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1,
    name: 'Black',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1, // Color
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2,
    name: '20 hours',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2, // Battery Life
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3,
    name: 'Passive',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3, // Noise Cancellation
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 1: Wireless Bluetooth Headphones - White Premium (ID_2)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4,
    name: 'White',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1, // Color
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_5,
    name: '30 hours',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2, // Battery Life
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6,
    name: 'Active',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3, // Noise Cancellation
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 1: Wireless Bluetooth Headphones - Blue Limited Edition (ID_3)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7,
    name: 'Blue',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1, // Color
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8,
    name: '40 hours',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2, // Battery Life
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9,
    name: 'Active',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3, // Noise Cancellation
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 2: Coffee Beans - Light Roast (ID_4)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_10,
    name: 'Light',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4, // Roast Level
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11,
    name: 'Colombia',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_5, // Origin
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 2: Coffee Beans - Dark Roast (ID_5)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12,
    name: 'Dark',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4, // Roast Level
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13,
    name: 'Brazil',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_5, // Origin
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 3: Office Chair - Black Mesh (ID_6)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_14,
    name: 'Mesh',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6, // Material
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_15,
    name: '250 lbs',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7, // Weight Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_16,
    name: 'Height',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8, // Adjustable Features
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 3: Office Chair - Gray Leather (ID_7)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_17,
    name: 'Leather',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6, // Material
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_18,
    name: '300 lbs',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7, // Weight Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_19,
    name: 'Armrests',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8, // Adjustable Features
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 3: Office Chair - Executive Model (ID_8)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_20,
    name: 'Leather',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6, // Material
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_21,
    name: '300 lbs',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7, // Weight Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_22,
    name: 'Lumbar Support',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8, // Adjustable Features
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 4: Water Bottle - Classic Silver (ID_9)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_23,
    name: '750ml',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9, // Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_9,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_24,
    name: 'Vacuum Insulated',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_10, // Insulation Type
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_9,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 5: LED Desk Lamp - White Base Touch Control (ID_10)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_25,
    name: 'Neutral (4000K)',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11, // Color Temperature
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_10,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_26,
    name: '3 Levels',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12, // Brightness Levels
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_10,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_27,
    name: 'Base Mount',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13, // Mounting Type
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_10,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 5: LED Desk Lamp - Black Base Remote Control (ID_11)
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_28,
    name: 'Warm (2700K)',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11, // Color Temperature
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_29,
    name: '5 Levels',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12, // Brightness Levels
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_30,
    name: 'Clamp Mount',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13, // Mounting Type
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Additional variant attributes for more detailed configurations
  // Product 1: Additional color options for existing variants
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_31,
    name: 'Black',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1, // Color
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_2, // White variant - additional black option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_32,
    name: 'White',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1, // Color
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_3, // Blue variant - additional white option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 2: Additional roast levels for coffee variants
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_33,
    name: 'Medium',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4, // Roast Level
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_4, // Light roast variant - additional medium option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_34,
    name: 'Light',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4, // Roast Level
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_5, // Dark roast variant - additional light option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 3: Additional material options for chair variants
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_35,
    name: 'Fabric',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6, // Material
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_6, // Black mesh variant - additional fabric option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_36,
    name: 'Mesh',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6, // Material
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_7, // Gray leather variant - additional mesh option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 4: Additional capacity options for water bottle
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_37,
    name: '500ml',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9, // Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_9, // 750ml variant - additional 500ml option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_38,
    name: '1L',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9, // Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_9, // 750ml variant - additional 1L option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 5: Additional color temperature options for lamp variants
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_39,
    name: 'Cool (6500K)',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11, // Color Temperature
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_10, // Neutral variant - additional cool option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_40,
    name: 'Cool (6500K)',
    position: 1,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11, // Color Temperature
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_11, // Warm variant - additional cool option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Additional brightness level options
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_41,
    name: '5 Levels',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12, // Brightness Levels
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_10, // 3 levels variant - additional 5 levels option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_42,
    name: '3 Levels',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12, // Brightness Levels
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_11, // 5 levels variant - additional 3 levels option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Additional mounting type options
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_43,
    name: 'Wall Mount',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13, // Mounting Type
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_10, // Base mount variant - additional wall mount option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_44,
    name: 'Wall Mount',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13, // Mounting Type
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_11, // Clamp mount variant - additional wall mount option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Additional battery life options for headphones
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_45,
    name: '40 hours',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2, // Battery Life
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_1, // 20 hours variant - additional 40 hours option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_46,
    name: '20 hours',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2, // Battery Life
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_2, // 30 hours variant - additional 20 hours option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Additional noise cancellation options
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_47,
    name: 'Active',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3, // Noise Cancellation
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_1, // Passive variant - additional active option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_48,
    name: 'Passive',
    position: 3,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3, // Noise Cancellation
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_3, // Active variant - additional passive option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Additional weight capacity options for chairs
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_49,
    name: '300 lbs',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7, // Weight Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_6, // 250 lbs variant - additional 300 lbs option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS_IDS.ID_50,
    name: '250 lbs',
    position: 2,
    mktAttributeId: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7, // Weight Capacity
    mktVariantId: MKT_VARIANT_DATA_SEEDS_IDS.ID_7, // 300 lbs variant - additional 250 lbs option
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
];
