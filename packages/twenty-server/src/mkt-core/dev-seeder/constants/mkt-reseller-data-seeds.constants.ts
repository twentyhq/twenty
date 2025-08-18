import { MKT_RESELLER_TIER_DATA_SEEDS_IDS } from './mkt-reseller-tier-data-seeds.constants';

type MktResellerDataSeed = {
  id: string;
  companyName: string;
  companyShortName?: string;
  taxCode?: string;
  legalRepresentativeName?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  currentTierId?: string;
  commitmentAmount?: number;
  commissionRate?: number;
  subdomain: string;
  customDomain?: string;
  isCustomDomainEnabled?: boolean;
  status?: string;
  actualRevenue?: number;
  lastRevenueUpdate?: string;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_RESELLER_DATA_SEED_COLUMNS: (keyof MktResellerDataSeed)[] = [
  'id',
  'companyName',
  'companyShortName',
  'taxCode',
  'legalRepresentativeName',
  'contactEmail',
  'contactPhone',
  'address',
  'currentTierId',
  'commitmentAmount',
  'commissionRate',
  'subdomain',
  'customDomain',
  'isCustomDomainEnabled',
  'status',
  'actualRevenue',
  'lastRevenueUpdate',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const MKT_RESELLER_DATA_SEEDS_IDS = {
  TECH_SOLUTIONS: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d8',
  DIGITAL_MARKETING: '2b3c4d5e-6f7a-8b9c-0d1e-f2a3b4c5d6e9',
  BUSINESS_PARTNER: '3c4d5e6f-7a8b-9c0d-1e2f-a3b4c5d6e7fa',
  ENTERPRISE_SALES: '4d5e6f7a-8b9c-0d1e-2f3a-b4c5d6e7f8ab',
  STARTUP_ACCELERATOR: '5e6f7a8b-9c0d-1e2f-3a4b-c5d6e7f8a9bc',
};

export const MKT_RESELLER_DATA_SEEDS: MktResellerDataSeed[] = [
  {
    id: MKT_RESELLER_DATA_SEEDS_IDS.TECH_SOLUTIONS,
    companyName: 'Tech Solutions Viet Nam Co., Ltd',
    companyShortName: 'TechSolutions',
    taxCode: '0123456789',
    legalRepresentativeName: 'Nguyen Van Anh',
    contactEmail: 'contact@techsolutions.vn',
    contactPhone: '+84901234567',
    address: '123 Nguyen Trai Street, District 1, Ho Chi Minh City',
    currentTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
    commitmentAmount: 800000000, // 800M VND
    commissionRate: 15.0,
    subdomain: 'techsolutions',
    customDomain: undefined,
    isCustomDomainEnabled: false,
    status: 'ACTIVE',
    actualRevenue: 450000000, // 450M VND
    lastRevenueUpdate: '2024-01-15T10:30:00.000Z',
    position: 1,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_RESELLER_DATA_SEEDS_IDS.DIGITAL_MARKETING,
    companyName: 'Digital Marketing Hub Ltd',
    companyShortName: 'DigitalHub',
    taxCode: '0987654321',
    legalRepresentativeName: 'Tran Thi Mai',
    contactEmail: 'info@digitalhub.com.vn',
    contactPhone: '+84912345678',
    address: '456 Le Loi Boulevard, District 3, Ho Chi Minh City',
    currentTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.GOLD,
    commitmentAmount: 2000000000, // 2B VND
    commissionRate: 20.0,
    subdomain: 'digitalhub',
    customDomain: 'digitalhub.com.vn',
    isCustomDomainEnabled: true,
    status: 'ACTIVE',
    actualRevenue: 1200000000, // 1.2B VND
    lastRevenueUpdate: '2024-01-20T14:15:00.000Z',
    position: 2,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_RESELLER_DATA_SEEDS_IDS.BUSINESS_PARTNER,
    companyName: 'Business Partner Solutions JSC',
    companyShortName: 'BizPartner',
    taxCode: '0111222333',
    legalRepresentativeName: 'Le Van Duc',
    contactEmail: 'sales@bizpartner.vn',
    contactPhone: '+84923456789',
    address: '789 Dong Khoi Street, District 1, Ho Chi Minh City',
    currentTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.BRONZE,
    commitmentAmount: 300000000, // 300M VND
    commissionRate: 10.0,
    subdomain: 'bizpartner',
    customDomain: undefined,
    isCustomDomainEnabled: false,
    status: 'PENDING',
    actualRevenue: 150000000, // 150M VND
    lastRevenueUpdate: '2024-01-10T09:00:00.000Z',
    position: 3,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_RESELLER_DATA_SEEDS_IDS.ENTERPRISE_SALES,
    companyName: 'Enterprise Sales Corporation',
    companyShortName: 'EnterpriseSales',
    taxCode: '0444555666',
    legalRepresentativeName: 'Pham Minh Khoa',
    contactEmail: 'enterprise@esales.com.vn',
    contactPhone: '+84934567890',
    address: '321 Hai Ba Trung Street, District 3, Ho Chi Minh City',
    currentTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.DIAMOND,
    commitmentAmount: 5000000000, // 5B VND
    commissionRate: 25.0,
    subdomain: 'enterprise',
    customDomain: 'esales.com.vn',
    isCustomDomainEnabled: true,
    status: 'ACTIVE',
    actualRevenue: 3500000000, // 3.5B VND
    lastRevenueUpdate: '2024-01-25T16:45:00.000Z',
    position: 4,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
  {
    id: MKT_RESELLER_DATA_SEEDS_IDS.STARTUP_ACCELERATOR,
    companyName: 'Startup Accelerator Vietnam',
    companyShortName: 'StartupVN',
    taxCode: '0777888999',
    legalRepresentativeName: 'Hoang Thi Lan',
    contactEmail: 'accelerator@startup.vn',
    contactPhone: '+84945678901',
    address: '654 Nguyen Hue Street, District 1, Ho Chi Minh City',
    currentTierId: MKT_RESELLER_TIER_DATA_SEEDS_IDS.SILVER,
    commitmentAmount: 1000000000, // 1B VND
    commissionRate: 15.0,
    subdomain: 'startupvn',
    customDomain: undefined,
    isCustomDomainEnabled: false,
    status: 'SUSPENDED',
    actualRevenue: 200000000, // 200M VND
    lastRevenueUpdate: '2024-01-05T11:30:00.000Z',
    position: 5,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
];
