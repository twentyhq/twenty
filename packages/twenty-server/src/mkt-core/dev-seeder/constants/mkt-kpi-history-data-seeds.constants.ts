import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { MKT_KPI_DATA_SEEDS_IDS } from './mkt-kpi-data-seeds.constants';

type MktKpiHistoryDataSeed = {
  id: string;
  kpiId: string;
  changeType: string;
  oldValue?: object;
  newValue?: object;
  changeReason?: string;
  changeDescription?: string;
  changeSource?: string;
  changeTimestamp: string;
  additionalData?: object;
  position?: number;
};

export const MKT_KPI_HISTORY_DATA_SEED_COLUMNS: (keyof MktKpiHistoryDataSeed)[] =
  [
    'id',
    'kpiId',
    'changeType',
    'oldValue',
    'newValue',
    'changeReason',
    'changeDescription',
    'changeSource',
    'changeTimestamp',
    'additionalData',
    'position',
  ];

export const MKT_KPI_HISTORY_DATA_SEEDS_IDS = {
  KPI_HISTORY_1: '60606060-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
  KPI_HISTORY_2: '60606060-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  KPI_HISTORY_3: '60606060-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  KPI_HISTORY_4: '60606060-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  KPI_HISTORY_5: '60606060-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  KPI_HISTORY_6: '60606060-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  KPI_HISTORY_7: '60606060-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  KPI_HISTORY_8: '60606060-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  KPI_HISTORY_9: '60606060-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  KPI_HISTORY_10: '60606060-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
};

export const MKT_KPI_HISTORY_DATA_SEEDS: MktKpiHistoryDataSeed[] = [
  // Target Value Updates
  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_1,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.CUSTOMER_RETENTION,
    changeType: 'TARGET_UPDATED',
    oldValue: { targetValue: 50000000 },
    newValue: { targetValue: 60000000 },
    changeReason: 'Điều chỉnh mục tiêu theo kế hoạch Q1',
    changeDescription:
      'Tăng mục tiêu doanh thu từ 50M lên 60M VND do thị trường khả quan',
    changeSource: 'MANUAL',
    changeTimestamp: '2025-01-15T09:30:00.000Z',
    additionalData: {
      approvedBy: 'Sales Manager',
      reason: 'market_expansion',
      previousQuarterPerformance: 95.5,
    },
    position: 1,
  },

  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_2,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.DEALS_CLOSED,
    changeType: 'TARGET_UPDATED',
    oldValue: { targetValue: 10 },
    newValue: { targetValue: 15 },
    changeReason: 'Mở rộng mục tiêu khách hàng mới',
    changeDescription: 'Tăng mục tiêu từ 10 lên 15 khách hàng mới/tháng',
    changeSource: 'MANUAL',
    changeTimestamp: '2025-01-15T10:15:00.000Z',
    additionalData: {
      department: 'Sales',
      targetAdjustmentReason: 'team_expansion',
    },
    position: 2,
  },

  // Actual Value Updates (Auto)
  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_3,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.DEMOS_COMPLETED,
    changeType: 'ACTUAL_UPDATED',
    oldValue: { actualValue: 25000000 },
    newValue: { actualValue: 35000000 },
    changeReason: 'Cập nhật từ hệ thống đơn hàng',
    changeDescription: 'Tự động cập nhật từ đơn hàng mới được tạo',
    changeSource: 'AUTOMATIC',
    changeTimestamp: '2025-01-20T14:22:00.000Z',
    additionalData: {
      triggerEvent: 'order_completed',
      orderId: 'ORD-2025-001',
      orderAmount: 10000000,
      automaticCalculation: true,
    },
    position: 3,
  },

  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_4,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.NEW_CUSTOMERS,
    changeType: 'ACTUAL_UPDATED',
    oldValue: { actualValue: 8 },
    newValue: { actualValue: 12 },
    changeReason: 'Khách hàng mới được thêm',
    changeDescription: 'Tự động cập nhật khi có khách hàng mới',
    changeSource: 'AUTOMATIC',
    changeTimestamp: '2025-01-22T16:45:00.000Z',
    additionalData: {
      triggerEvent: 'customer_created',
      newCustomerIds: ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-004'],
      source: 'sales_team',
    },
    position: 4,
  },

  // Status Changes
  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_5,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.SUPPORT_RESPONSE_TIME,
    changeType: 'STATUS_CHANGED',
    oldValue: { status: 'IN_PROGRESS' },
    newValue: { status: 'ACHIEVED' },
    changeReason: 'Đạt mục tiêu trước hạn',
    changeDescription: 'KPI doanh thu đã đạt 100% mục tiêu',
    changeSource: 'MANUAL',
    changeTimestamp: '2025-01-25T11:30:00.000Z',
    additionalData: {
      achievementPercentage: 105.2,
      daysAhead: 6,
      bonus: 'eligible',
    },
    position: 5,
  },

  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_6,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.SUPPORT_RESPONSE_TIME,
    changeType: 'STATUS_CHANGED',
    oldValue: { status: 'IN_PROGRESS' },
    newValue: { status: 'NOT_ACHIEVED' },
    changeReason: 'Không đạt thời gian phản hồi',
    changeDescription: 'Thời gian phản hồi trung bình vượt quá mục tiêu 2 giờ',
    changeSource: 'AUTOMATIC',
    changeTimestamp: '2025-01-28T09:00:00.000Z',
    additionalData: {
      currentAverage: 3.2,
      targetAverage: 2.0,
      affectedTickets: 45,
      recommendedAction: 'team_training',
    },
    position: 6,
  },

  // Assignment Changes
  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_7,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.DEMOS_COMPLETED,
    changeType: 'ASSIGNED',
    oldValue: { assigneeType: 'INDIVIDUAL', assigneeWorkspaceMemberId: null },
    newValue: {
      assigneeType: 'INDIVIDUAL',
      assigneeWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
    changeReason: 'Gán KPI cho Team Leader mới',
    changeDescription: 'Chuyển giao KPI doanh thu nhóm cho team leader mới',
    changeSource: 'MANUAL',
    changeTimestamp: '2025-01-10T08:00:00.000Z',
    additionalData: {
      previousAssignee: null,
      assignmentReason: 'new_team_leader',
      effectiveDate: '2025-01-10',
    },
    position: 7,
  },

  // Configuration Changes
  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_8,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.SUPPORT_RESPONSE_TIME,
    changeType: 'CONFIGURATION_CHANGED',
    oldValue: {
      calculationFormula: 'COUNT(leads WHERE source = "MARKETING")',
      alertThresholds: { warning: 70, critical: 50 },
    },
    newValue: {
      calculationFormula:
        'COUNT(leads WHERE source = "MARKETING" AND quality_score > 7)',
      alertThresholds: { warning: 75, critical: 60 },
    },
    changeReason: 'Cải thiện chất lượng lead',
    changeDescription:
      'Thêm điều kiện quality score và điều chỉnh ngưỡng cảnh báo',
    changeSource: 'MANUAL',
    changeTimestamp: '2025-01-18T13:45:00.000Z',
    additionalData: {
      configVersion: '2.1',
      approvedBy: 'Marketing Director',
      testPeriod: '2_weeks',
    },
    position: 8,
  },

  // Bulk Update Example
  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_9,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.SALES_CONVERSION_RATE,
    changeType: 'TARGET_UPDATED',
    oldValue: { targetValue: 85 },
    newValue: { targetValue: 90 },
    changeReason: 'Điều chỉnh hàng loạt KPI Q1',
    changeDescription: 'Cập nhật mục tiêu trong đợt review KPI hàng quý',
    changeSource: 'BULK_UPDATE',
    changeTimestamp: '2025-01-30T17:00:00.000Z',
    additionalData: {
      batchId: 'BULK_Q1_2025_001',
      totalKpisUpdated: 12,
      updateReason: 'quarterly_review',
      approvalProcess: 'management_approved',
    },
    position: 9,
  },

  // API Update Example
  {
    id: MKT_KPI_HISTORY_DATA_SEEDS_IDS.KPI_HISTORY_10,
    kpiId: MKT_KPI_DATA_SEEDS_IDS.DEALS_CLOSED,
    changeType: 'ACTUAL_UPDATED',
    oldValue: { actualValue: 75 },
    newValue: { actualValue: 82 },
    changeReason: 'Cập nhật từ hệ thống HR',
    changeDescription: 'Đồng bộ dữ liệu năng suất từ hệ thống quản lý nhân sự',
    changeSource: 'API',
    changeTimestamp: '2025-01-31T23:30:00.000Z',
    additionalData: {
      apiEndpoint: '/api/hr/productivity',
      dataSource: 'hr_system',
      syncBatchId: 'HR_SYNC_20250131',
      employeeCount: 45,
    },
    position: 10,
  },
];
