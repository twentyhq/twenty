import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OPPORTUNITY_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  // #58 Earned Revenue - recognizedRevenue field
  {
    type: FieldMetadataType.CURRENCY,
    name: 'recognizedRevenue',
    label: 'Recognized Revenue',
    description: 'Revenue already recognized from this deal',
    icon: 'IconCurrencyDollar',
    isActive: true,
    isNullable: true,
    isUnique: false,
  },
  {
    type: FieldMetadataType.DATE,
    name: 'recognitionDate',
    label: 'Recognition Date',
    description: 'Date when revenue was recognized',
    icon: 'IconCalendar',
    isActive: true,
    isNullable: true,
    isUnique: false,
  },
  // #63 Expansion Revenue - expansion type
  {
    type: FieldMetadataType.SELECT,
    name: 'expansionType',
    label: 'Expansion Type',
    description: 'Type of expansion revenue',
    icon: 'IconTrendingUp',
    isActive: true,
    isNullable: true,
    isUnique: false,
    options: [
      { color: 'green', label: 'Upsell', position: 0, value: 'UPSELL' },
      { color: 'blue', label: 'Cross-Sell', position: 1, value: 'CROSS_SELL' },
      { color: 'purple', label: 'Add-on', position: 2, value: 'ADDON' },
      { color: 'orange', label: 'Renewal Increase', position: 3, value: 'RENEWAL_INCREASE' },
    ],
  },
  {
    type: FieldMetadataType.CURRENCY,
    name: 'expansionRevenue',
    label: 'Expansion Revenue',
    description: 'Additional revenue from expansion',
    icon: 'IconPlus',
    isActive: true,
    isNullable: true,
    isUnique: false,
  },
  // #52 Blueprint - Stage gates validation rules
  {
    type: FieldMetadataType.RAW_JSON,
    name: 'stageRequiredFields',
    label: 'Stage Required Fields',
    description: 'Fields required to advance to next stage',
    icon: 'IconChecklist',
    isActive: true,
    isNullable: true,
    isUnique: false,
  },
  {
    type: FieldMetadataType.RAW_JSON,
    name: 'stageValidationRules',
    label: 'Stage Validation Rules',
    description: 'Validation rules for this stage',
    icon: 'IconShieldCheck',
    isActive: true,
    isNullable: true,
    isUnique: false,
  },
  // #54 Competitor Tracking
  {
    type: FieldMetadataType.RELATION,
    name: 'competitor',
    label: 'Competitor',
    description: 'Competing company for this deal',
    icon: 'IconSwords',
    isActive: true,
    isNullable: true,
    isUnique: false,
    relation: {
      direction: 'toOne',
      entity: 'competitor',
      jointable: { schemaName: 'core', tableName: 'competitor', name: 'competitor' },
    },
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'winProbabilityReason',
    label: 'Win Probability Reason',
    description: 'Reason for probability percentage',
    icon: 'IconChartBar',
    isActive: true,
    isNullable: true,
    isUnique: false,
    options: [
      { color: 'green', label: 'Strong Product Fit', position: 0, value: 'PRODUCT_FIT' },
      { color: 'blue', label: 'Competitive Win', position: 1, value: 'COMPETITIVE_WIN' },
      { color: 'purple', label: 'Price Advantage', position: 2, value: 'PRICE_ADVANTAGE' },
      { color: 'orange', label: 'Relationship', position: 3, value: 'RELATIONSHIP' },
    ],
  },
];