import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export const MKT_KPI_TEMPLATE_TARGET_ROLE_OPTIONS: FieldMetadataComplexOption[] =
  [
    {
      value: 'SALES_REP',
      label: 'Sales Representative',
      color: 'blue',
      position: 0,
    },
    {
      value: 'SENIOR_SALES',
      label: 'Senior Sales',
      color: 'green',
      position: 1,
    },
    {
      value: 'TEAM_LEADER',
      label: 'Team Leader',
      color: 'purple',
      position: 2,
    },
    {
      value: 'SALES_MANAGER',
      label: 'Sales Manager',
      color: 'orange',
      position: 3,
    },
    {
      value: 'SUPPORT_AGENT',
      label: 'Support Agent',
      color: 'yellow',
      position: 4,
    },
    {
      value: 'MARKETING_SPECIALIST',
      label: 'Marketing Specialist',
      color: 'pink',
      position: 5,
    },
    {
      value: 'OPERATIONS_MANAGER',
      label: 'Operations Manager',
      color: 'red',
      position: 6,
    },
    { value: 'GENERAL', label: 'General', color: 'gray', position: 7 },
  ];

// Re-export the KPI options that are also used in templates
export {
  MKT_KPI_TYPE_OPTIONS,
  MKT_KPI_CATEGORY_OPTIONS,
  MKT_KPI_UNIT_OPTIONS,
  MKT_KPI_PERIOD_TYPE_OPTIONS,
  MKT_KPI_PRIORITY_OPTIONS,
} from 'src/mkt-core/mkt-kpi/constants/mkt-kpi-options';
