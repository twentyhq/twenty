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
    
    // MKT INTERNAL VARIANTS ATTRIBUTES
    MKT_CARE_BASIC_6_MONTHS_CHANNEL_ID: '984b9a1b-351a-41d4-8474-c5a3ff09f806',
    MKT_CARE_BASIC_6_MONTHS_MONTH_DURATION_ID: 'e10e9e7c-9fba-4ef8-9d82-7682317ec7f9',
    MKT_CARE_BASIC_6_MONTHS_LANGUAGE_ID: '252bbed7-12cb-4dd5-8e6e-28fc8a539d3e',
    MKT_CARE_BASIC_6_MONTHS_INTERNAL_TYPE_ID: '0140ebac-ffb2-4fa7-84dd-f160f3f94b0d',
    MKT_CARE_BASIC_12_MONTHS_CHANNEL_ID: '512d6d5a-97d4-4417-bc5c-f790567d9c76',
    MKT_CARE_BASIC_12_MONTHS_MONTH_DURATION_ID: '86123b99-4f13-4578-8557-67c653498c9a',
    MKT_CARE_BASIC_12_MONTHS_LANGUAGE_ID: '8cc23d35-7bd7-4166-a5a5-b8962765f6a6',
    MKT_CARE_BASIC_12_MONTHS_INTERNAL_TYPE_ID: '0884e5ad-c343-4edd-a069-35899f9009c8',
    MKT_CARE_PREMIUM_12_MONTHS_CHANNEL_ID: '60b604c2-b11e-4d4e-b499-a17ab6305f9e',
    MKT_CARE_PREMIUM_12_MONTHS_MONTH_DURATION_ID: '9958034d-0328-48ab-8468-706c7dc67200',
    MKT_CARE_PREMIUM_12_MONTHS_LANGUAGE_ID: '467914fb-e824-45c2-be3f-69195a7a972a',
    MKT_CARE_PREMIUM_12_MONTHS_INTERNAL_TYPE_ID: '7a80d886-3b7e-4631-a8eb-13ba5ec1b444',
    MKT_EMAIL_PLUS_VN_CHANNEL_ID: '9b498ccd-1a20-46a1-afbe-bfe1aef4c963',
    MKT_EMAIL_PLUS_VN_MONTH_DURATION_ID: 'd76f4e82-7226-4ee5-a04c-fb4bc41ab5d7',
    MKT_EMAIL_PLUS_VN_LANGUAGE_ID: '18b0b2a6-776b-4ee4-8c8c-8e6edaa9daa8',
    MKT_EMAIL_PLUS_VN_INTERNAL_TYPE_ID: '54c609fc-4bf9-47e6-885b-ea6df6da3e98',
    MKT_LICENSE_BIZ_1_YEAR_CHANNEL_ID: 'b8b8ba28-0c32-4796-91d5-935e4e63aa55',
    MKT_LICENSE_BIZ_1_YEAR_MONTH_DURATION_ID: '81fc7c7c-130c-420b-a415-044b1ef14da5',
    MKT_LICENSE_BIZ_1_YEAR_LANGUAGE_ID: '57a39e2d-e784-4a11-ac78-617c66d84b27',
    MKT_LICENSE_BIZ_1_YEAR_INTERNAL_TYPE_ID: 'f5892502-4ba1-462a-af2a-de976df018e4',
};

//prettier-ignore
export const MKT_VARIANT_ATTRIBUTE_DATA_SEEDS: MktVariantAttributeDataSeed[] = [
  
];
