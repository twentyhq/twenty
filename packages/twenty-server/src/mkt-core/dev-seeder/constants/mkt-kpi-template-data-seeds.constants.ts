import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type MktKpiTemplateDataSeed = {
  id: string;
  templateName: string;
  templateCode: string;
  description?: string;
  targetRole?: string;
  kpiType: string;
  kpiCategory: string;
  unitOfMeasure?: string;
  defaultTargetValue?: number;
  periodType: string;
  isAutoCalculated?: boolean;
  calculationFormula?: string;
  isActive?: boolean;
  isDefault?: boolean;
  priority?: string;
  weight?: number;
  templateConfig?: object;
  position?: number;
  assignedToId?: string | null;
};

export const MKT_KPI_TEMPLATE_DATA_SEED_COLUMNS: (keyof MktKpiTemplateDataSeed)[] =
  [
    'id',
    'templateName',
    'templateCode',
    'description',
    'targetRole',
    'kpiType',
    'kpiCategory',
    'unitOfMeasure',
    'defaultTargetValue',
    'periodType',
    'isAutoCalculated',
    'calculationFormula',
    'isActive',
    'isDefault',
    'priority',
    'weight',
    'templateConfig',
    'position',
    'assignedToId',
  ];

export const MKT_KPI_TEMPLATE_DATA_SEEDS_IDS = {
  SALES_REP_REVENUE: '10101010-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
  SALES_REP_NEW_CUSTOMERS: '10101010-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  SENIOR_SALES_REVENUE: '10101010-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  SENIOR_SALES_CONVERSION: '10101010-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  TEAM_LEADER_TEAM_REVENUE: '10101010-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  SUPPORT_RESPONSE_TIME: '10101010-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  SUPPORT_SATISFACTION: '10101010-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  MARKETING_LEAD_GEN: '10101010-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  OPERATIONS_PROJECT_COMPLETION: '10101010-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  GENERAL_PRODUCTIVITY: '10101010-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
};

export const MKT_KPI_TEMPLATE_DATA_SEEDS: MktKpiTemplateDataSeed[] = [
  // Sales Rep Templates
  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.SALES_REP_REVENUE,
    templateName: 'Sales Rep - Doanh thu tháng',
    templateCode: 'SALES_REP_MONTHLY_REVENUE',
    description: 'Template KPI doanh thu hàng tháng cho Sales Representative',
    targetRole: 'SALES_REP',
    kpiType: 'REVENUE',
    kpiCategory: 'SALES',
    unitOfMeasure: 'VND',
    defaultTargetValue: 50000000, // 50M VND
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      'SUM(mktOrder.totalAmount WHERE assigneeId = @workspaceMemberId AND period = @period)',
    isActive: true,
    isDefault: true,
    priority: 'HIGH',
    weight: 100,
    templateConfig: {
      alertThresholds: {
        warning: 70,
        critical: 50,
      },
      autoAssignRules: {
        onNewEmployee: true,
        departments: ['SALES'],
      },
    },
    position: 1,
    assignedToId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
  },

  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.SALES_REP_NEW_CUSTOMERS,
    templateName: 'Sales Rep - Khách hàng mới',
    templateCode: 'SALES_REP_NEW_CUSTOMERS',
    description: 'Template KPI số lượng khách hàng mới cho Sales Rep',
    targetRole: 'SALES_REP',
    kpiType: 'NEW_CUSTOMERS',
    kpiCategory: 'SALES',
    unitOfMeasure: 'COUNT',
    defaultTargetValue: 10, // 10 khách hàng mới/tháng
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      'COUNT(person WHERE createdBy = @workspaceMemberId AND period = @period)',
    isActive: true,
    isDefault: false,
    priority: 'HIGH',
    weight: 80,
    templateConfig: {
      alertThresholds: {
        warning: 60,
        critical: 40,
      },
    },
    position: 2,
    assignedToId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
  },

  // Senior Sales Templates
  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.SENIOR_SALES_REVENUE,
    templateName: 'Senior Sales - Doanh thu tháng',
    templateCode: 'SENIOR_SALES_MONTHLY_REVENUE',
    description: 'Template KPI doanh thu cho Senior Sales (mục tiêu cao hơn)',
    targetRole: 'SENIOR_SALES',
    kpiType: 'REVENUE',
    kpiCategory: 'SALES',
    unitOfMeasure: 'VND',
    defaultTargetValue: 100000000, // 100M VND
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      'SUM(mktOrder.totalAmount WHERE assigneeId = @workspaceMemberId AND period = @period)',
    isActive: true,
    isDefault: true,
    priority: 'HIGH',
    weight: 100,
    templateConfig: {
      alertThresholds: {
        warning: 75,
        critical: 60,
      },
    },
    position: 3,
    assignedToId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
  },

  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.SENIOR_SALES_CONVERSION,
    templateName: 'Senior Sales - Tỷ lệ chuyển đổi',
    templateCode: 'SENIOR_SALES_CONVERSION_RATE',
    description: 'Template KPI tỷ lệ chuyển đổi từ lead thành khách hàng',
    targetRole: 'SENIOR_SALES',
    kpiType: 'CONVERSION_RATE',
    kpiCategory: 'SALES',
    unitOfMeasure: 'PERCENT',
    defaultTargetValue: 30, // 30%
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      '(COUNT(converted_customers) / COUNT(total_leads)) * 100 WHERE assigneeId = @workspaceMemberId',
    isActive: true,
    isDefault: false,
    priority: 'MEDIUM',
    weight: 70,
    templateConfig: {
      alertThresholds: {
        warning: 20,
        critical: 15,
      },
    },
    position: 4,
    assignedToId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
  },

  // Team Leader Templates
  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.TEAM_LEADER_TEAM_REVENUE,
    templateName: 'Team Leader - Doanh thu nhóm',
    templateCode: 'TEAM_LEADER_TEAM_REVENUE',
    description: 'Template KPI tổng doanh thu của cả nhóm cho Team Leader',
    targetRole: 'TEAM_LEADER',
    kpiType: 'REVENUE',
    kpiCategory: 'SALES',
    unitOfMeasure: 'VND',
    defaultTargetValue: 300000000, // 300M VND
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      'SUM(mktOrder.totalAmount WHERE team_leader = @workspaceMemberId AND period = @period)',
    isActive: true,
    isDefault: true,
    priority: 'HIGH',
    weight: 100,
    templateConfig: {
      alertThresholds: {
        warning: 80,
        critical: 65,
      },
      includeTeamMembers: true,
    },
    position: 5,
    assignedToId: null,
  },

  // Support Templates
  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.SUPPORT_RESPONSE_TIME,
    templateName: 'Support - Thời gian phản hồi',
    templateCode: 'SUPPORT_RESPONSE_TIME',
    description: 'Template KPI thời gian phản hồi trung bình của support agent',
    targetRole: 'SUPPORT_AGENT',
    kpiType: 'RESPONSE_TIME',
    kpiCategory: 'SUPPORT',
    unitOfMeasure: 'HOURS',
    defaultTargetValue: 2, // 2 giờ
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      'AVG(support_tickets.response_time WHERE assigneeId = @workspaceMemberId)',
    isActive: true,
    isDefault: true,
    priority: 'HIGH',
    weight: 90,
    templateConfig: {
      alertThresholds: {
        warning: 4,
        critical: 6,
      },
    },
    position: 6,
    assignedToId: null,
  },

  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.SUPPORT_SATISFACTION,
    templateName: 'Support - Điểm hài lòng',
    templateCode: 'SUPPORT_SATISFACTION_SCORE',
    description: 'Template KPI điểm hài lòng khách hàng cho support',
    targetRole: 'SUPPORT_AGENT',
    kpiType: 'SATISFACTION_SCORE',
    kpiCategory: 'SUPPORT',
    unitOfMeasure: 'COUNT',
    defaultTargetValue: 4.5, // 4.5/5
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      'AVG(support_ratings.score WHERE assigneeId = @workspaceMemberId)',
    isActive: true,
    isDefault: false,
    priority: 'MEDIUM',
    weight: 85,
    templateConfig: {
      alertThresholds: {
        warning: 4.0,
        critical: 3.5,
      },
    },
    position: 7,
    assignedToId: null,
  },

  // Marketing Templates
  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.MARKETING_LEAD_GEN,
    templateName: 'Marketing - Lead Generation',
    templateCode: 'MARKETING_LEAD_GENERATION',
    description: 'Template KPI số lượng lead được tạo bởi marketing specialist',
    targetRole: 'MARKETING_SPECIALIST',
    kpiType: 'NEW_CUSTOMERS',
    kpiCategory: 'MARKETING',
    unitOfMeasure: 'COUNT',
    defaultTargetValue: 50, // 50 leads/tháng
    periodType: 'MONTHLY',
    isAutoCalculated: true,
    calculationFormula:
      'COUNT(leads WHERE source = "MARKETING" AND createdBy = @workspaceMemberId)',
    isActive: true,
    isDefault: true,
    priority: 'HIGH',
    weight: 85,
    templateConfig: {
      alertThresholds: {
        warning: 70,
        critical: 50,
      },
    },
    position: 8,
    assignedToId: null,
  },

  // Operations Templates
  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.OPERATIONS_PROJECT_COMPLETION,
    templateName: 'Operations - Hoàn thành dự án',
    templateCode: 'OPERATIONS_PROJECT_COMPLETION',
    description: 'Template KPI tỷ lệ hoàn thành dự án đúng hạn',
    targetRole: 'OPERATIONS_MANAGER',
    kpiType: 'CUSTOM',
    kpiCategory: 'OPERATIONS',
    unitOfMeasure: 'PERCENT',
    defaultTargetValue: 90, // 90%
    periodType: 'QUARTERLY',
    isAutoCalculated: false,
    calculationFormula:
      'COUNT(leads WHERE source = "MARKETING" AND createdBy = @workspaceMemberId)',
    isActive: true,
    isDefault: true,
    priority: 'MEDIUM',
    weight: 75,
    templateConfig: {
      alertThresholds: {
        warning: 80,
        critical: 70,
      },
      manualTracking: true,
    },
    position: 9,
    assignedToId: null,
  },

  // General Templates
  {
    id: MKT_KPI_TEMPLATE_DATA_SEEDS_IDS.GENERAL_PRODUCTIVITY,
    templateName: 'General - Năng suất làm việc',
    templateCode: 'GENERAL_PRODUCTIVITY',
    description: 'Template KPI năng suất chung cho tất cả nhân viên',
    targetRole: 'GENERAL',
    kpiType: 'CUSTOM',
    kpiCategory: 'OPERATIONS',
    unitOfMeasure: 'PERCENT',
    defaultTargetValue: 85, // 85%
    periodType: 'MONTHLY',
    isAutoCalculated: false,
    calculationFormula:
      'COUNT(leads WHERE source = "MARKETING" AND createdBy = @workspaceMemberId)',
    isActive: true,
    isDefault: false,
    priority: 'LOW',
    weight: 50,
    templateConfig: {
      alertThresholds: {
        warning: 70,
        critical: 60,
      },
      selfAssessment: true,
    },
    position: 10,
    assignedToId: null,
  },
];
