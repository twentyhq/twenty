import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export const MKT_KPI_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  { value: 'REVENUE', label: 'Revenue', color: 'green', position: 0 },
  {
    value: 'NEW_CUSTOMERS',
    label: 'New Customers',
    color: 'blue',
    position: 1,
  },
  {
    value: 'CONVERSION_RATE',
    label: 'Conversion Rate',
    color: 'purple',
    position: 2,
  },
  { value: 'CALLS', label: 'Calls', color: 'orange', position: 3 },
  { value: 'DEMOS', label: 'Demos', color: 'pink', position: 4 },
  {
    value: 'DEALS_CLOSED',
    label: 'Deals Closed',
    color: 'turquoise',
    position: 5,
  },
  {
    value: 'RETENTION_RATE',
    label: 'Retention Rate',
    color: 'yellow',
    position: 6,
  },
  {
    value: 'SATISFACTION_SCORE',
    label: 'Satisfaction Score',
    color: 'red',
    position: 7,
  },
  {
    value: 'RESPONSE_TIME',
    label: 'Response Time',
    color: 'gray',
    position: 8,
  },
  { value: 'CUSTOM', label: 'Custom', color: 'sky', position: 9 },
];

export const MKT_KPI_CATEGORY_OPTIONS: FieldMetadataComplexOption[] = [
  { value: 'SALES', label: 'Sales', color: 'green', position: 0 },
  { value: 'MARKETING', label: 'Marketing', color: 'purple', position: 1 },
  { value: 'SUPPORT', label: 'Support', color: 'blue', position: 2 },
  { value: 'OPERATIONS', label: 'Operations', color: 'orange', position: 3 },
];

export const MKT_KPI_UNIT_OPTIONS: FieldMetadataComplexOption[] = [
  { value: 'VND', label: 'VND', color: 'green', position: 0 },
  { value: 'USD', label: 'USD', color: 'blue', position: 1 },
  { value: 'PERCENT', label: 'Percent (%)', color: 'purple', position: 2 },
  { value: 'COUNT', label: 'Count', color: 'orange', position: 3 },
  { value: 'HOURS', label: 'Hours', color: 'yellow', position: 4 },
  { value: 'DAYS', label: 'Days', color: 'red', position: 5 },
  { value: 'MINUTES', label: 'Minutes', color: 'gray', position: 6 },
];

export const MKT_KPI_PERIOD_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  { value: 'DAILY', label: 'Daily', color: 'green', position: 0 },
  { value: 'WEEKLY', label: 'Weekly', color: 'blue', position: 1 },
  { value: 'MONTHLY', label: 'Monthly', color: 'purple', position: 2 },
  { value: 'QUARTERLY', label: 'Quarterly', color: 'orange', position: 3 },
  { value: 'YEARLY', label: 'Yearly', color: 'red', position: 4 },
];

export const MKT_KPI_ASSIGNEE_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  { value: 'INDIVIDUAL', label: 'Individual', color: 'blue', position: 0 },
  { value: 'DEPARTMENT', label: 'Department', color: 'green', position: 1 },
  { value: 'TEAM', label: 'Team', color: 'purple', position: 2 },
];

export const MKT_KPI_STATUS_OPTIONS: FieldMetadataComplexOption[] = [
  { value: 'DRAFT', label: 'Draft', color: 'gray', position: 0 },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue', position: 1 },
  { value: 'ACHIEVED', label: 'Achieved', color: 'green', position: 2 },
  { value: 'NOT_ACHIEVED', label: 'Not Achieved', color: 'red', position: 3 },
  { value: 'EXCEEDED', label: 'Exceeded', color: 'purple', position: 4 },
  { value: 'CANCELLED', label: 'Cancelled', color: 'gray', position: 5 },
];

export const MKT_KPI_PRIORITY_OPTIONS: FieldMetadataComplexOption[] = [
  { value: 'HIGH', label: 'High', color: 'red', position: 0 },
  { value: 'MEDIUM', label: 'Medium', color: 'orange', position: 1 },
  { value: 'LOW', label: 'Low', color: 'gray', position: 2 },
];

export enum MktKpiCode {
  MONTHLY_REVENUE = 'MONTHLY_REVENUE',
  NEW_CUSTOMERS = 'NEW_CUSTOMERS',
  SALES_CONVERSION_RATE = 'SALES_CONVERSION_RATE',
  SUPPORT_RESPONSE_TIME = 'SUPPORT_RESPONSE_TIME',
  CUSTOMER_SATISFACTION = 'CUSTOMER_SATISFACTION',
  MONTHLY_CALLS = 'MONTHLY_CALLS',
  DEMOS_COMPLETED = 'DEMOS_COMPLETED',
  DEALS_CLOSED = 'DEALS_CLOSED',
  CUSTOMER_RETENTION = 'CUSTOMER_RETENTION',
  TECH_PROJECT_COMPLETION = 'TECH_PROJECT_COMPLETION',
}
