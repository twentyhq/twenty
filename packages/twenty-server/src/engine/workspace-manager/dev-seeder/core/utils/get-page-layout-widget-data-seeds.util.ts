import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { PAGE_LAYOUT_WIDGET_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-widget-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

type PageLayoutWidgetDataSeed = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  type: WidgetType;
  gridPosition: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  };
  configuration: Record<string, unknown> | null;
  objectMetadataId: string | null;
};

export const getPageLayoutWidgetDataSeeds = (
  workspaceId: string,
): PageLayoutWidgetDataSeed[] => [
  // Sales Overview Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SALES_PIPELINE_NUMBER,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
    ),
    title: 'Pipeline Value',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SALES_CONVERSION_GAUGE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
    ),
    title: 'Conversion Rate',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 3, rowSpan: 4, columnSpan: 4 },
    configuration: { graphType: 'GAUGE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SALES_MONTHLY_REVENUE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
    ),
    title: 'Monthly Revenue',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 7, rowSpan: 8, columnSpan: 5 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SALES_DEALS_BY_STAGE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
    ),
    title: 'Deals by Stage',
    type: WidgetType.GRAPH,
    gridPosition: { row: 4, column: 0, rowSpan: 4, columnSpan: 6 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },

  // Sales Details Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SALES_TOP_PERFORMERS,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SALES_DETAILS,
    ),
    title: 'Top Sales Performers',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 5, columnSpan: 5 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SALES_FORECAST_LINE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SALES_DETAILS,
    ),
    title: 'Sales Forecast',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 5, rowSpan: 5, columnSpan: 7 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },

  // Customer Overview Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_TOTAL_COUNT,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
    ),
    title: 'Total Customers',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_ACQUISITION_TREND,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
    ),
    title: 'Customer Acquisition',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 3, rowSpan: 6, columnSpan: 5 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_SEGMENTS_PIE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
    ),
    title: 'Customer Segments',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 8, rowSpan: 6, columnSpan: 4 },
    configuration: { graphType: 'PIE' },
    objectMetadataId: null,
  },

  // Customer Analytics Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_SATISFACTION_GAUGE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS,
    ),
    title: 'Customer Satisfaction',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    configuration: { graphType: 'GAUGE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_RETENTION_RATE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS,
    ),
    title: 'Retention Rate',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_LIFETIME_VALUE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS,
    ),
    title: 'Lifetime Value',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 7, rowSpan: 6, columnSpan: 5 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },

  // Team Overview Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.TEAM_ACTIVITY_OVERVIEW,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW,
    ),
    title: 'Team Activity',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 5, columnSpan: 6 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.TEAM_PRODUCTIVITY_METRICS,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW,
    ),
    title: 'Productivity Metrics',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 6, rowSpan: 5, columnSpan: 6 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },

  // Team Metrics Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.TEAM_GOAL_PROGRESS,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS,
    ),
    title: 'Goal Progress',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 6 },
    configuration: { graphType: 'GAUGE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.TEAM_MEMBER_LEADERBOARD,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS,
    ),
    title: 'Team Leaderboard',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 6, rowSpan: 6, columnSpan: 6 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },

  // Revenue Main Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.REVENUE_TOTAL_NUMBER,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.REVENUE_MAIN,
    ),
    title: 'Total Revenue',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.REVENUE_GROWTH_TREND,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.REVENUE_MAIN,
    ),
    title: 'Revenue Growth',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 3, rowSpan: 6, columnSpan: 5 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.REVENUE_BY_PRODUCT,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.REVENUE_MAIN,
    ),
    title: 'Revenue by Product',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 8, rowSpan: 6, columnSpan: 4 },
    configuration: { graphType: 'PIE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_WIDGET_SEEDS.REVENUE_BY_REGION),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.REVENUE_MAIN,
    ),
    title: 'Revenue by Region',
    type: WidgetType.GRAPH,
    gridPosition: { row: 6, column: 0, rowSpan: 4, columnSpan: 12 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },

  // Marketing Main Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.MARKETING_LEADS_GENERATED,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.MARKETING_MAIN,
    ),
    title: 'Leads Generated',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.MARKETING_CAMPAIGN_ROI,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.MARKETING_MAIN,
    ),
    title: 'Campaign ROI',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 3, rowSpan: 4, columnSpan: 4 },
    configuration: { graphType: 'GAUGE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.MARKETING_CHANNEL_PERFORMANCE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.MARKETING_MAIN,
    ),
    title: 'Channel Performance',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 7, rowSpan: 6, columnSpan: 5 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.MARKETING_CONVERSION_FUNNEL,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.MARKETING_MAIN,
    ),
    title: 'Conversion Funnel',
    type: WidgetType.GRAPH,
    gridPosition: { row: 4, column: 0, rowSpan: 4, columnSpan: 7 },
    configuration: { graphType: 'FUNNEL' },
    objectMetadataId: null,
  },

  // Support Main Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SUPPORT_TICKET_COUNT,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SUPPORT_MAIN,
    ),
    title: 'Open Tickets',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SUPPORT_RESOLUTION_TIME,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SUPPORT_MAIN,
    ),
    title: 'Avg Resolution Time',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 3, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SUPPORT_SATISFACTION_SCORE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SUPPORT_MAIN,
    ),
    title: 'Satisfaction Score',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 6, rowSpan: 4, columnSpan: 4 },
    configuration: { graphType: 'GAUGE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.SUPPORT_TICKET_BY_PRIORITY,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.SUPPORT_MAIN,
    ),
    title: 'Tickets by Priority',
    type: WidgetType.GRAPH,
    gridPosition: { row: 2, column: 0, rowSpan: 4, columnSpan: 6 },
    configuration: { graphType: 'PIE' },
    objectMetadataId: null,
  },

  // Product Main Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.PRODUCT_ACTIVE_USERS,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.PRODUCT_MAIN,
    ),
    title: 'Active Users',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.PRODUCT_FEATURE_ADOPTION,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.PRODUCT_MAIN,
    ),
    title: 'Feature Adoption',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 3, rowSpan: 6, columnSpan: 5 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.PRODUCT_USAGE_HEATMAP,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.PRODUCT_MAIN,
    ),
    title: 'Usage Heatmap',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 8, rowSpan: 6, columnSpan: 4 },
    configuration: { graphType: 'HEATMAP' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.PRODUCT_USER_ENGAGEMENT,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.PRODUCT_MAIN,
    ),
    title: 'User Engagement',
    type: WidgetType.GRAPH,
    gridPosition: { row: 6, column: 0, rowSpan: 4, columnSpan: 12 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },

  // Operations Main Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.OPERATIONS_EFFICIENCY_GAUGE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.OPERATIONS_MAIN,
    ),
    title: 'Efficiency Score',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    configuration: { graphType: 'GAUGE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.OPERATIONS_COST_BREAKDOWN,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.OPERATIONS_MAIN,
    ),
    title: 'Cost Breakdown',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 4, rowSpan: 6, columnSpan: 4 },
    configuration: { graphType: 'PIE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.OPERATIONS_PROCESS_TIME,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.OPERATIONS_MAIN,
    ),
    title: 'Process Time',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 8, rowSpan: 6, columnSpan: 4 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.OPERATIONS_ERROR_RATE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.OPERATIONS_MAIN,
    ),
    title: 'Error Rate',
    type: WidgetType.GRAPH,
    gridPosition: { row: 4, column: 0, rowSpan: 2, columnSpan: 4 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },

  // Finance Main Tab Widgets
  {
    id: generateSeedId(workspaceId, PAGE_LAYOUT_WIDGET_SEEDS.FINANCE_CASH_FLOW),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.FINANCE_MAIN,
    ),
    title: 'Cash Flow',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 6 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.FINANCE_EXPENSES_PIE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.FINANCE_MAIN,
    ),
    title: 'Expenses Distribution',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 6, rowSpan: 6, columnSpan: 6 },
    configuration: { graphType: 'PIE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.FINANCE_PROFIT_MARGIN,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.FINANCE_MAIN,
    ),
    title: 'Profit Margin',
    type: WidgetType.GRAPH,
    gridPosition: { row: 6, column: 0, rowSpan: 2, columnSpan: 3 },
    configuration: { graphType: 'NUMBER' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.FINANCE_BUDGET_VARIANCE,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.FINANCE_MAIN,
    ),
    title: 'Budget Variance',
    type: WidgetType.GRAPH,
    gridPosition: { row: 6, column: 3, rowSpan: 4, columnSpan: 9 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },

  // Executive Main Tab Widgets
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.EXECUTIVE_KEY_METRICS,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.EXECUTIVE_MAIN,
    ),
    title: 'Key Business Metrics',
    type: WidgetType.GRAPH,
    gridPosition: { row: 0, column: 0, rowSpan: 3, columnSpan: 12 },
    configuration: { graphType: 'PIE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.EXECUTIVE_COMPANY_HEALTH,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.EXECUTIVE_MAIN,
    ),
    title: 'Company Health Score',
    type: WidgetType.GRAPH,
    gridPosition: { row: 3, column: 0, rowSpan: 4, columnSpan: 4 },
    configuration: { graphType: 'GAUGE' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.EXECUTIVE_QUARTERLY_REVIEW,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.EXECUTIVE_MAIN,
    ),
    title: 'Quarterly Performance',
    type: WidgetType.GRAPH,
    gridPosition: { row: 3, column: 4, rowSpan: 4, columnSpan: 4 },
    configuration: { graphType: 'BAR' },
    objectMetadataId: null,
  },
  {
    id: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_WIDGET_SEEDS.EXECUTIVE_STRATEGIC_GOALS,
    ),
    pageLayoutTabId: generateSeedId(
      workspaceId,
      PAGE_LAYOUT_TAB_SEEDS.EXECUTIVE_MAIN,
    ),
    title: 'Strategic Goals Progress',
    type: WidgetType.GRAPH,
    gridPosition: { row: 3, column: 8, rowSpan: 8, columnSpan: 4 },
    configuration: { graphType: 'LINE' },
    objectMetadataId: null,
  },
];
