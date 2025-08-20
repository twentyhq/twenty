export enum MktEmploymentStatusCode {
  PROBATION = 'PROBATION',
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  PART_TIME = 'PART_TIME',
  INTERNSHIP = 'INTERNSHIP',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
}

type MktEmploymentStatusDataSeed = {
  id: string;
  statusCode: MktEmploymentStatusCode;
  statusName: string;
  statusNameEn?: string;
  description?: string;
  isInitialStatus?: boolean;
  isFinalStatus?: boolean;
  maxDuration?: number | null;
  requiresApproval?: boolean;
  restrictions?: string;
  allowedNextStatuses?: string;
  displayOrder: number;
  statusColor?: string;
  isActive?: boolean;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_EMPLOYMENT_STATUS_DATA_SEED_COLUMNS: (keyof MktEmploymentStatusDataSeed)[] =
  [
    'id',
    'statusCode',
    'statusName',
    'statusNameEn',
    'description',
    'isInitialStatus',
    'isFinalStatus',
    'maxDuration',
    'requiresApproval',
    'restrictions',
    'allowedNextStatuses',
    'displayOrder',
    'statusColor',
    'isActive',
    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS = {
  PROBATION: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
  PERMANENT: '2b3c4d5e-6f7a-8b9c-0d1e-f2a3b4c5d6e7',
  CONTRACT: '3c4d5e6f-7a8b-9c0d-1e2f-a3b4c5d6e7f8',
  PART_TIME: '4d5e6f7a-8b9c-0d1e-2f3a-b4c5d6e7f8a9',
  INTERNSHIP: '5e6f7a8b-9c0d-1e2f-3a4b-c5d6e7f8a9b0',
  RESIGNED: '6f7a8b9c-0d1e-2f3a-4b5c-d6e7f8a9b0c1',
  TERMINATED: '7a8b9c0d-1e2f-3a4b-5c6d-e7f8a9b0c1d2',
};

export const MKT_EMPLOYMENT_STATUS_DATA_SEEDS: MktEmploymentStatusDataSeed[] = [
  // Probation - Initial status
  {
    id: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PROBATION,
    statusCode: MktEmploymentStatusCode.PROBATION,
    statusName: 'Thử việc',
    statusNameEn: 'Probation',
    description:
      'Giai đoạn thử việc cho nhân viên mới, thường kéo dài 2-3 tháng',
    isInitialStatus: true,
    isFinalStatus: false,
    maxDuration: 90, // 3 months
    requiresApproval: false,
    restrictions: JSON.stringify({
      maxOrderValue: 5000000, // 5M VND
      canApproveLeave: false,
      canAccessFinancials: false,
      limitedSystemAccess: true,
    }),
    allowedNextStatuses: JSON.stringify([
      MktEmploymentStatusCode.PERMANENT,
      MktEmploymentStatusCode.CONTRACT,
      MktEmploymentStatusCode.RESIGNED,
    ]),
    displayOrder: 1,
    statusColor: '#FFA500', // Orange
    isActive: true,
    position: 1,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Permanent - Main status
  {
    id: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PERMANENT,
    statusCode: MktEmploymentStatusCode.PERMANENT,
    statusName: 'Nhân viên chính thức',
    statusNameEn: 'Permanent Employee',
    description:
      'Nhân viên chính thức với hợp đồng lao động không xác định thời hạn',
    isInitialStatus: false,
    isFinalStatus: false,
    maxDuration: null, // No limit
    requiresApproval: false,
    restrictions: JSON.stringify({
      maxOrderValue: -1, // No limit
      canApproveLeave: true,
      canAccessFinancials: true,
      fullSystemAccess: true,
    }),
    allowedNextStatuses: JSON.stringify([
      MktEmploymentStatusCode.CONTRACT,
      MktEmploymentStatusCode.PART_TIME,
      MktEmploymentStatusCode.RESIGNED,
      MktEmploymentStatusCode.TERMINATED,
    ]),
    displayOrder: 2,
    statusColor: '#008000', // Green
    isActive: true,
    position: 2,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Contract Employee
  {
    id: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.CONTRACT,
    statusCode: MktEmploymentStatusCode.CONTRACT,
    statusName: 'Nhân viên hợp đồng',
    statusNameEn: 'Contract Employee',
    description: 'Nhân viên làm việc theo hợp đồng có thời hạn xác định',
    isInitialStatus: false,
    isFinalStatus: false,
    maxDuration: 365, // 1 year
    requiresApproval: true,
    restrictions: JSON.stringify({
      maxOrderValue: 20000000, // 20M VND
      canApproveLeave: false,
      canAccessFinancials: false,
      limitedSystemAccess: true,
    }),
    allowedNextStatuses: JSON.stringify([
      MktEmploymentStatusCode.PERMANENT,
      MktEmploymentStatusCode.PART_TIME,
      MktEmploymentStatusCode.RESIGNED,
    ]),
    displayOrder: 3,
    statusColor: '#0066CC', // Blue
    isActive: true,
    position: 3,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Part-time
  {
    id: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.PART_TIME,
    statusCode: MktEmploymentStatusCode.PART_TIME,
    statusName: 'Nhân viên bán thời gian',
    statusNameEn: 'Part-time Employee',
    description: 'Nhân viên làm việc bán thời gian với giờ làm việc linh hoạt',
    isInitialStatus: false,
    isFinalStatus: false,
    maxDuration: null,
    requiresApproval: true,
    restrictions: JSON.stringify({
      maxOrderValue: 10000000, // 10M VND
      canApproveLeave: false,
      canAccessFinancials: false,
      limitedSystemAccess: true,
      maxWorkingHours: 20, // per week
    }),
    allowedNextStatuses: JSON.stringify([
      MktEmploymentStatusCode.PERMANENT,
      MktEmploymentStatusCode.CONTRACT,
      MktEmploymentStatusCode.RESIGNED,
    ]),
    displayOrder: 4,
    statusColor: '#9932CC', // Purple
    isActive: true,
    position: 4,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Internship
  {
    id: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.INTERNSHIP,
    statusCode: MktEmploymentStatusCode.INTERNSHIP,
    statusName: 'Thực tập sinh',
    statusNameEn: 'Intern',
    description: 'Sinh viên hoặc người mới tốt nghiệp đang thực tập',
    isInitialStatus: false,
    isFinalStatus: false,
    maxDuration: 180, // 6 months
    requiresApproval: false,
    restrictions: JSON.stringify({
      maxOrderValue: 1000000, // 1M VND
      canApproveLeave: false,
      canAccessFinancials: false,
      limitedSystemAccess: true,
      requiresSupervisor: true,
    }),
    allowedNextStatuses: JSON.stringify([
      MktEmploymentStatusCode.PROBATION,
      MktEmploymentStatusCode.CONTRACT,
      MktEmploymentStatusCode.RESIGNED,
    ]),
    displayOrder: 5,
    statusColor: '#FFD700', // Gold
    isActive: true,
    position: 5,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Resigned
  {
    id: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.RESIGNED,
    statusCode: MktEmploymentStatusCode.RESIGNED,
    statusName: 'Đã nghỉ việc',
    statusNameEn: 'Resigned',
    description: 'Nhân viên đã nghỉ việc theo đơn xin nghỉ',
    isInitialStatus: false,
    isFinalStatus: true,
    maxDuration: null,
    requiresApproval: true,
    restrictions: JSON.stringify({
      maxOrderValue: 0,
      canApproveLeave: false,
      canAccessFinancials: false,
      noSystemAccess: true,
    }),
    allowedNextStatuses: JSON.stringify([]), // No further transitions
    displayOrder: 6,
    statusColor: '#808080', // Gray
    isActive: true,
    position: 6,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },

  // Terminated
  {
    id: MKT_EMPLOYMENT_STATUS_DATA_SEEDS_IDS.TERMINATED,
    statusCode: MktEmploymentStatusCode.TERMINATED,
    statusName: 'Chấm dứt hợp đồng',
    statusNameEn: 'Terminated',
    description: 'Hợp đồng lao động bị chấm dứt bởi công ty',
    isInitialStatus: false,
    isFinalStatus: true,
    maxDuration: null,
    requiresApproval: true,
    restrictions: JSON.stringify({
      maxOrderValue: 0,
      canApproveLeave: false,
      canAccessFinancials: false,
      noSystemAccess: true,
    }),
    allowedNextStatuses: JSON.stringify([]), // No further transitions
    displayOrder: 7,
    statusColor: '#FF0000', // Red
    isActive: true,
    position: 7,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Admin User',
  },
];
