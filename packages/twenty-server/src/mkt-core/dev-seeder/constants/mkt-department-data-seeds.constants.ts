export enum MktDepartmentCode {
  SALES = 'SALES',
  SUPPORT = 'SUPPORT',
  ACCOUNTING = 'ACCOUNTING',
  HR = 'HR',
  TECH = 'TECH',
  ADMIN = 'ADMIN',
}

type MktDepartmentDataSeed = {
  id: string;
  departmentCode: MktDepartmentCode;
  departmentName: string;
  departmentNameEn?: string;
  description?: string;
  budgetCode?: string;
  costCenter?: string;
  requiresKpiTracking?: boolean;
  allowsCrossDepartmentAccess?: boolean;
  defaultKpiCategory?: string;
  displayOrder: number;
  colorCode?: string;
  iconName?: string;
  isActive?: boolean;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_DEPARTMENT_DATA_SEED_COLUMNS: (keyof MktDepartmentDataSeed)[] =
  [
    'id',
    'departmentCode',
    'departmentName',
    'departmentNameEn',
    'description',
    'budgetCode',
    'costCenter',
    'requiresKpiTracking',
    'allowsCrossDepartmentAccess',
    'defaultKpiCategory',
    'displayOrder',
    'colorCode',
    'iconName',
    'isActive',
    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_DEPARTMENT_DATA_SEEDS_IDS = {
  SALES: '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a',
  SUPPORT: '2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b',
  ACCOUNTING: '3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c',
  HR: '4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d',
  TECH: '5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
  ADMIN: '6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f',
};

export const MKT_DEPARTMENT_DATA_SEEDS: MktDepartmentDataSeed[] = [
  // Sales Department
  {
    id: MKT_DEPARTMENT_DATA_SEEDS_IDS.SALES,
    departmentCode: MktDepartmentCode.SALES,
    departmentName: 'Phòng Kinh doanh',
    departmentNameEn: 'Sales Department',
    description:
      'Phụ trách bán hàng, tìm kiếm khách hàng và phát triển thị trường',
    budgetCode: 'BUD-SALES-2024',
    costCenter: 'CC-SALES',
    requiresKpiTracking: true,
    allowsCrossDepartmentAccess: true,
    defaultKpiCategory: 'SALES_PERFORMANCE',
    displayOrder: 1,
    colorCode: '#2196F3', // Blue
    iconName: 'IconTrendingUp',
    isActive: true,
    position: 1,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Support Department
  {
    id: MKT_DEPARTMENT_DATA_SEEDS_IDS.SUPPORT,
    departmentCode: MktDepartmentCode.SUPPORT,
    departmentName: 'Phòng Hỗ trợ khách hàng',
    departmentNameEn: 'Customer Support Department',
    description: 'Hỗ trợ khách hàng sử dụng sản phẩm và giải quyết vấn đề',
    budgetCode: 'BUD-SUPPORT-2024',
    costCenter: 'CC-SUPPORT',
    requiresKpiTracking: true,
    allowsCrossDepartmentAccess: false,
    defaultKpiCategory: 'SUPPORT_PERFORMANCE',
    displayOrder: 2,
    colorCode: '#4CAF50', // Green
    iconName: 'IconHeadphones',
    isActive: true,
    position: 2,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Accounting Department
  {
    id: MKT_DEPARTMENT_DATA_SEEDS_IDS.ACCOUNTING,
    departmentCode: MktDepartmentCode.ACCOUNTING,
    departmentName: 'Phòng Kế toán',
    departmentNameEn: 'Accounting Department',
    description: 'Quản lý tài chính, kế toán và báo cáo tài chính',
    budgetCode: 'BUD-ACC-2024',
    costCenter: 'CC-ACCOUNTING',
    requiresKpiTracking: false,
    allowsCrossDepartmentAccess: false,
    defaultKpiCategory: 'FINANCIAL_PERFORMANCE',
    displayOrder: 3,
    colorCode: '#FF9800', // Orange
    iconName: 'IconCalculator',
    isActive: true,
    position: 3,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // HR Department
  {
    id: MKT_DEPARTMENT_DATA_SEEDS_IDS.HR,
    departmentCode: MktDepartmentCode.HR,
    departmentName: 'Phòng Nhân sự',
    departmentNameEn: 'Human Resources Department',
    description: 'Quản lý nhân sự, tuyển dụng và phát triển nguồn nhân lực',
    budgetCode: 'BUD-HR-2024',
    costCenter: 'CC-HR',
    requiresKpiTracking: false,
    allowsCrossDepartmentAccess: true,
    defaultKpiCategory: 'HR_PERFORMANCE',
    displayOrder: 4,
    colorCode: '#9C27B0', // Purple
    iconName: 'IconUsers',
    isActive: true,
    position: 4,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Tech Department
  {
    id: MKT_DEPARTMENT_DATA_SEEDS_IDS.TECH,
    departmentCode: MktDepartmentCode.TECH,
    departmentName: 'Phòng Kỹ thuật',
    departmentNameEn: 'Technology Department',
    description: 'Phát triển sản phẩm, bảo trì hệ thống và hỗ trợ kỹ thuật',
    budgetCode: 'BUD-TECH-2024',
    costCenter: 'CC-TECH',
    requiresKpiTracking: true,
    allowsCrossDepartmentAccess: true,
    defaultKpiCategory: 'TECH_PERFORMANCE',
    displayOrder: 5,
    colorCode: '#607D8B', // Blue Grey
    iconName: 'IconCode',
    isActive: true,
    position: 5,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Admin Department
  {
    id: MKT_DEPARTMENT_DATA_SEEDS_IDS.ADMIN,
    departmentCode: MktDepartmentCode.ADMIN,
    departmentName: 'Phòng Hành chính',
    departmentNameEn: 'Administration Department',
    description: 'Quản lý hành chính, pháp chế và các vấn đề tổng hợp',
    budgetCode: 'BUD-ADMIN-2024',
    costCenter: 'CC-ADMIN',
    requiresKpiTracking: false,
    allowsCrossDepartmentAccess: true,
    defaultKpiCategory: 'ADMIN_PERFORMANCE',
    displayOrder: 6,
    colorCode: '#795548', // Brown
    iconName: 'IconBriefcase',
    isActive: true,
    position: 6,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
];
