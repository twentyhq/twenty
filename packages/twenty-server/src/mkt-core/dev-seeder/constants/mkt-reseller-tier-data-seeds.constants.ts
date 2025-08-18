type MktResellerTierDataSeed = {
  id: string;
  tierCode: string;
  tierName: string;
  tierNameEn?: string;
  minCommitmentAmount: number;
  maxCommitmentAmount?: number;
  commissionRate: number;
  systemFeeRate?: number;
  allowedProducts?: string;
  specialBenefits?: string;
  displayOrder?: number;
  isActive?: boolean;
  description?: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_RESELLER_TIER_DATA_SEED_COLUMNS: (keyof MktResellerTierDataSeed)[] =
  [
    'id',
    'tierCode',
    'tierName',
    'tierNameEn',
    'minCommitmentAmount',
    'maxCommitmentAmount',
    'commissionRate',
    'systemFeeRate',
    'allowedProducts',
    'specialBenefits',
    'displayOrder',
    'isActive',
    'description',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_RESELLER_TIER_DATA_SEEDS_IDS = {
  BRONZE: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
  SILVER: '2b3c4d5e-6f7a-8b9c-0d1e-f2a3b4c5d6e7',
  GOLD: '3c4d5e6f-7a8b-9c0d-1e2f-a3b4c5d6e7f8',
  DIAMOND: '4d5e6f7a-8b9c-0d1e-2f3a-b4c5d6e7f8a9',
};

export const MKT_RESELLER_TIER_DATA_SEEDS: MktResellerTierDataSeed[] = [
  {
    id: MKT_RESELLER_TIER_DATA_SEEDS_IDS.BRONZE,
    tierCode: 'BRONZE',
    tierName: 'Bronze Partner',
    tierNameEn: 'Bronze Partner',
    minCommitmentAmount: 0,
    maxCommitmentAmount: 500000000, // 500M VND
    commissionRate: 10.0,
    systemFeeRate: 8.0,
    allowedProducts: JSON.stringify(['MKT_CARE']),
    specialBenefits: JSON.stringify({
      priority_support: false,
      early_access: false,
      training_program: true,
      quarterly_review: false,
    }),
    displayOrder: 1,
    isActive: true,
    description: 'Basic tier for new partners starting their journey',
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
    tierCode: 'SILVER',
    tierName: 'Silver Partner',
    tierNameEn: 'Silver Partner',
    minCommitmentAmount: 500000000, // 500M VND
    maxCommitmentAmount: 1500000000, // 1.5B VND
    commissionRate: 15.0,
    systemFeeRate: 6.0,
    allowedProducts: JSON.stringify(['MKT_CARE', 'MKT_POST']),
    specialBenefits: JSON.stringify({
      priority_support: true,
      early_access: false,
      training_program: true,
      quarterly_review: true,
      marketing_support: true,
    }),
    displayOrder: 2,
    isActive: true,
    description: 'Intermediate tier with enhanced benefits and support',
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_RESELLER_TIER_DATA_SEEDS_IDS.GOLD,
    tierCode: 'GOLD',
    tierName: 'Gold Partner',
    tierNameEn: 'Gold Partner',
    minCommitmentAmount: 1500000000, // 1.5B VND
    maxCommitmentAmount: 3000000000, // 3B VND
    commissionRate: 20.0,
    systemFeeRate: 4.0,
    allowedProducts: JSON.stringify(['MKT_CARE', 'MKT_POST', 'MKT_ANALYTICS']),
    specialBenefits: JSON.stringify({
      priority_support: true,
      early_access: true,
      training_program: true,
      quarterly_review: true,
      marketing_support: true,
      dedicated_account_manager: true,
      custom_pricing: true,
    }),
    displayOrder: 3,
    isActive: true,
    description: 'Premium tier with extensive benefits and special privileges',
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_RESELLER_TIER_DATA_SEEDS_IDS.DIAMOND,
    tierCode: 'DIAMOND',
    tierName: 'Diamond Partner',
    tierNameEn: 'Diamond Partner',
    minCommitmentAmount: 3000000000, // 3B VND
    maxCommitmentAmount: undefined, // Unlimited
    commissionRate: 25.0,
    systemFeeRate: 3.0,
    allowedProducts: JSON.stringify([
      'MKT_CARE',
      'MKT_POST',
      'MKT_ANALYTICS',
      'MKT_ENTERPRISE',
    ]),
    specialBenefits: JSON.stringify({
      priority_support: true,
      early_access: true,
      training_program: true,
      quarterly_review: true,
      marketing_support: true,
      dedicated_account_manager: true,
      custom_pricing: true,
      co_marketing: true,
      strategic_partnership: true,
      revenue_sharing: true,
    }),
    displayOrder: 4,
    isActive: true,
    description: 'Highest tier with all benefits and maximum privileges',
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
];
