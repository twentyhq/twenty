type MktComboDataSeed = {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

// prettier-ignore
export enum MKT_COMBO_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

// prettier-ignore
export const MKT_COMBO_DATA_SEED_COLUMNS: (keyof MktComboDataSeed)[] = [
  'id',
  'name',
  'description',
  'price',
  'status',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore

export const MKT_COMBO_DATA_SEEDS_IDS = {
  ID_1: '58555c60-4ebc-4f91-a407-c0fe6365ea9a',
  ID_2: '7bc2b1e7-559a-4e9e-839b-1e58321a0875',
  ID_3: '2699c36d-4417-41c6-82e4-1977bd61fdcb',
  ID_4: '9c76ebc2-cdc2-472a-b2eb-17735e153c89',
  ID_5: 'edc7d701-af80-4d25-b88c-6d289a1986ec',
  ID_6: '6703fa6a-2685-465c-bb67-0c00d2e76f21',
  ID_7: '048c882b-b982-4e51-9fab-6e812d9ec4b1',
  ID_8: 'fd19b13f-af8f-4f6f-bee2-25557efc9f63',
  ID_9: '5b58d4c0-388f-4605-ade8-7223bd07e57d',
  ID_10: 'c662640a-5987-407e-8c47-0275aa85f204',
  ID_11: 'c50a9c21-9fa9-4e41-b86b-b5d5738e00b6',
  ID_12: '30128273-b4e3-4f6d-b2c5-b4ca4462bd3b',
  ID_13: 'fae0928a-aa88-495b-8e86-148c681ce0e3',
  ID_14: '688989ca-13d2-4bc4-b0df-fa89581b826a',
  ID_15: 'e2c9d760-228d-49ad-a758-13632804c2c0',
};

// prettier-ignore
export const MKT_COMBO_DATA_SEEDS: MktComboDataSeed[] = [
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_1,
    name: 'Gaming Setup Combo',
    description: 'Combo hoàn chỉnh cho setup gaming với tai nghe Bluetooth và đèn LED desk lamp',
    price: 180,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_2,
    name: 'Office Essentials Bundle',
    description: 'Bộ sản phẩm thiết yếu cho văn phòng: ghế ergonomic, đèn LED và bình nước',
    price: 350,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_3,
    name: 'Coffee Lover Package',
    description: 'Gói dành cho người yêu cà phê với 2 loại hạt Arabica và bình nước giữ nhiệt',
    price: 70,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_4,
    name: 'Premium Audio Setup',
    description: 'Setup âm thanh cao cấp với tai nghe Bluetooth premium và đèn LED điều khiển từ xa',
    price: 210,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_5,
    name: 'Executive Office Suite',
    description: 'Bộ sản phẩm dành cho văn phòng cấp cao với ghế executive và đèn LED premium',
    price: 480,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_6,
    name: 'Home Office Starter',
    description: 'Gói khởi đầu cho văn phòng tại nhà với các sản phẩm cơ bản',
    price: 200,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_7,
    name: 'Wellness & Productivity',
    description: 'Combo tăng cường sức khỏe và năng suất làm việc',
    price: 120,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_8,
    name: 'Student Essentials',
    description: 'Bộ sản phẩm thiết yếu cho sinh viên với giá cả phải chăng',
    price: 150,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_9,
    name: 'Creative Workspace',
    description: 'Không gian sáng tạo với ánh sáng tốt và âm thanh chất lượng',
    price: 190,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 9,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_10,
    name: 'Remote Work Pro',
    description: 'Gói chuyên nghiệp cho làm việc từ xa với đầy đủ tiện nghi',
    price: 280,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 10,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_11,
    name: 'Minimalist Setup',
    description: 'Setup tối giản với thiết kế đẹp và chức năng thiết yếu',
    price: 160,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_12,
    name: 'Luxury Office Collection',
    description: 'Bộ sưu tập cao cấp cho văn phòng sang trọng',
    price: 550,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 12,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_13,
    name: 'Budget-Friendly Bundle',
    description: 'Gói tiết kiệm với chất lượng tốt và giá cả hợp lý',
    price: 100,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 13,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_14,
    name: 'Tech Enthusiast Pack',
    description: 'Gói dành cho người đam mê công nghệ với các sản phẩm hiện đại',
    price: 220,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 14,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_COMBO_DATA_SEEDS_IDS.ID_15,
    name: 'Complete Workspace Solution',
    description: 'Giải pháp hoàn chỉnh cho không gian làm việc chuyên nghiệp',
    price: 400,
    status: MKT_COMBO_STATUS.ACTIVE,
    position: 15,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
];
