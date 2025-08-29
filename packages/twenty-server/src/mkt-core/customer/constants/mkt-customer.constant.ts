import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum MKT_CUSTOMER_TYPE {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  ORGANIZATION = 'ORGANIZATION',
  OTHER = 'OTHER',
}

export enum MKT_CUSTOMER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  PROSPECTIVE = 'PROSPECTIVE',
  OTHER = 'OTHER',
}

export enum MKT_CUSTOMER_TIER {
  INDIVIDUAL = 'INDIVIDUAL',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  ENTERPRISE = 'ENTERPRISE',
  OTHER = 'OTHER',
}

export enum MKT_CUSTOMER_LIFECYCLE_STAGE {
  PROSPECTIVE = 'PROSPECTIVE',
  TRIAL = 'TRIAL',
  CUSTOMER = 'CUSTOMER',
  LOYAL = 'LOYAL',
  CHURNED = 'CHURNED',
  RETENTION = 'RETENTION',
  UPSELL = 'UPSELL',
  CROSS_SELL = 'CROSS_SELL',
  REACTIVATION = 'REACTIVATION',
  OTHER = 'OTHER',
}

export enum MKT_CUSTOMER_TAGS {
  VIP = 'VIP',
  HIGH_VALUE = 'HIGH_VALUE',
  POTENTIAL_CHURN = 'POTENTIAL_CHURN',
  SUPPORT_INTENSIVE = 'SUPPORT_INTENSIVE',
  REFERRAL_SOURCE = 'REFERRAL_SOURCE',
  QUICK_PAYER = 'QUICK_PAYER',
  NEGOTIATOR = 'NEGOTIATOR',
  ENTERPRISE_PROSPECT = 'ENTERPRISE_PROSPECT',
}

export const MKT_CUSTOMER_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_CUSTOMER_TYPE.INDIVIDUAL,
    label: 'Individual',
    color: 'blue',
    position: 1,
  },
  {
    value: MKT_CUSTOMER_TYPE.BUSINESS,
    label: 'Business',
    color: 'green',
    position: 2,
  },
  {
    value: MKT_CUSTOMER_TYPE.ORGANIZATION,
    label: 'Organization',
    color: 'red',
    position: 3,
  },
  {
    value: MKT_CUSTOMER_TYPE.OTHER,
    label: 'Other',
    color: 'gray',
    position: 4,
  },
];

export const MKT_CUSTOMER_STATUS_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_CUSTOMER_STATUS.ACTIVE,
    label: 'Active',
    color: 'blue',
    position: 1,
  },
  {
    value: MKT_CUSTOMER_STATUS.INACTIVE,
    label: 'Inactive',
    color: 'gray',
    position: 2,
  },
  {
    value: MKT_CUSTOMER_STATUS.BLOCKED,
    label: 'Blocked',
    color: 'red',
    position: 3,
  },
  {
    value: MKT_CUSTOMER_STATUS.PROSPECTIVE,
    label: 'Prospective',
    color: 'yellow',
    position: 4,
  },
  {
    value: MKT_CUSTOMER_STATUS.OTHER,
    label: 'Other',
    color: 'gray',
    position: 5,
  },
];

export const MKT_CUSTOMER_TIER_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_CUSTOMER_TIER.INDIVIDUAL,
    label: 'Individual',
    color: 'blue',
    position: 1,
  },
  {
    value: MKT_CUSTOMER_TIER.SMALL,
    label: 'Small',
    color: 'green',
    position: 2,
  },
  {
    value: MKT_CUSTOMER_TIER.MEDIUM,
    label: 'Medium',
    color: 'yellow',
    position: 3,
  },
  {
    value: MKT_CUSTOMER_TIER.ENTERPRISE,
    label: 'Enterprise',
    color: 'red',
    position: 4,
  },
  {
    value: MKT_CUSTOMER_TIER.OTHER,
    label: 'Other',
    color: 'gray',
    position: 5,
  },
];

export const MKT_CUSTOMER_LIFECYCLE_STAGE_OPTIONS: FieldMetadataComplexOption[] =
  [
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.PROSPECTIVE,
      label: 'Prospective',
      color: 'yellow',
      position: 1,
    },
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.TRIAL,
      label: 'Trial',
      color: 'green',
      position: 2,
    },
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.CUSTOMER,
      label: 'Customer',
      color: 'red',
      position: 3,
    },

    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.LOYAL,
      label: 'Loyal',
      color: 'purple',
      position: 4,
    },
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.CHURNED,
      label: 'Churned',
      color: 'gray',
      position: 5,
    },
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.RETENTION,
      label: 'Retention',
      color: 'orange',
      position: 6,
    },
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.UPSELL,
      label: 'Upsell',
      color: 'pink',
      position: 7,
    },
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.CROSS_SELL,
      label: 'Cross Sell',
      color: 'orange',
      position: 8,
    },
    {
      value: MKT_CUSTOMER_LIFECYCLE_STAGE.REACTIVATION,
      label: 'Reactivation',
      color: 'purple',
      position: 9,
    },
  ];

export const MKT_CUSTOMER_TAGS_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_CUSTOMER_TAGS.VIP,
    label: 'VIP',
    color: 'blue',
    position: 1,
  },
  {
    value: MKT_CUSTOMER_TAGS.HIGH_VALUE,
    label: 'High Value',
    color: 'green',
    position: 2,
  },
  {
    value: MKT_CUSTOMER_TAGS.POTENTIAL_CHURN,
    label: 'Potential Churn',
    color: 'red',
    position: 3,
  },
  {
    value: MKT_CUSTOMER_TAGS.SUPPORT_INTENSIVE,
    label: 'Support Intensive',
    color: 'orange',
    position: 4,
  },
  {
    value: MKT_CUSTOMER_TAGS.REFERRAL_SOURCE,
    label: 'Referral Source',
    color: 'green',
    position: 5,
  },
  {
    value: MKT_CUSTOMER_TAGS.QUICK_PAYER,
    label: 'Quick Payer',
    color: 'purple',
    position: 6,
  },
  {
    value: MKT_CUSTOMER_TAGS.NEGOTIATOR,
    label: 'Negotiator',
    color: 'pink',
    position: 7,
  },
  {
    value: MKT_CUSTOMER_TAGS.ENTERPRISE_PROSPECT,
    label: 'Enterprise Prospect',
    color: 'red',
    position: 8,
  },
];

export enum MKT_CUSTOMER_COMPANY_SIZE {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  OTHER = 'OTHER',
}

export const MKT_CUSTOMER_COMPANY_SIZE_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_CUSTOMER_COMPANY_SIZE.SMALL,
    label: 'Small (1-10 employees)',
    color: 'green',
    position: 1,
  },
  {
    value: MKT_CUSTOMER_COMPANY_SIZE.MEDIUM,
    label: 'Medium (11-50 employees)',
    color: 'yellow',
    position: 2,
  },
  {
    value: MKT_CUSTOMER_COMPANY_SIZE.LARGE,
    label: 'Large (51-200 employees)',
    color: 'red',
    position: 3,
  },
  {
    value: MKT_CUSTOMER_COMPANY_SIZE.OTHER,
    label: 'Other (201+ employees)',
    color: 'gray',
    position: 4,
  },
];

export enum MKT_CUSTOMER_INDUSTRY {
  IT = 'IT',
  FINANCE = 'FINANCE',
  MANUFACTURING = 'MANUFACTURING',
  OTHER = 'OTHER',
}

export const MKT_CUSTOMER_INDUSTRY_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_CUSTOMER_INDUSTRY.IT,
    label: 'Information Technology',
    color: 'blue',
    position: 1,
  },
  {
    value: MKT_CUSTOMER_INDUSTRY.FINANCE,
    label: 'Financial Services',
    color: 'green',
    position: 2,
  },
  {
    value: MKT_CUSTOMER_INDUSTRY.MANUFACTURING,
    label: 'Manufacturing',
    color: 'red',
    position: 3,
  },
  {
    value: MKT_CUSTOMER_INDUSTRY.OTHER,
    label: 'Other',
    color: 'gray',
    position: 4,
  },
];
