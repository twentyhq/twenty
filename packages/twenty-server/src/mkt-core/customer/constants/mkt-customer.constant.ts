import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum MKT_CUSTOMER_TYPE {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  ORGANIZATION = 'organization',
  OTHER = 'other',
}

export enum MKT_CUSTOMER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  PROSPECTIVE = 'prospective',
  OTHER = 'other',
}

export enum MKT_CUSTOMER_TIER {
  INDIVIDUAL = 'individual',
  SMALL = 'small',
  MEDIUM = 'medium',
  ENTERPRISE = 'enterprise',
  OTHER = 'other',
}

export enum MKT_CUSTOMER_LIFECYCLE_STAGE {
  PROSPECTIVE = 'prospective',
  TRIAL = 'trial',
  CUSTOMER = 'customer',
  LOYAL = 'loyal',
  CHURNED = 'churned',
  RETENTION = 'retention',
  UPSELL = 'upsell',
  CROSS_SELL = 'cross_sell',
  REACTIVATION = 'reactivation',
  OTHER = 'other',
}

export enum MKT_CUSTOMER_TAGS {
  NEW = 'new',
  RETURNING = 'returning',
  LOYAL = 'loyal',
  VIP = 'vip',
  CHURNED = 'churned',
  RETENTION = 'retention',
  TECHNICAL = 'technical',
  OTHER = 'other',
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
    value: MKT_CUSTOMER_TAGS.NEW,
    label: 'New',
    color: 'blue',
    position: 1,
  },
  {
    value: MKT_CUSTOMER_TAGS.RETURNING,
    label: 'Returning',
    color: 'green',
    position: 2,
  },
  {
    value: MKT_CUSTOMER_TAGS.LOYAL,
    label: 'Loyal',
    color: 'purple',
    position: 3,
  },
  {
    value: MKT_CUSTOMER_TAGS.VIP,
    label: 'VIP',
    color: 'pink',
    position: 4,
  },
  {
    value: MKT_CUSTOMER_TAGS.CHURNED,
    label: 'Churned',
    color: 'red',
    position: 5,
  },
  {
    value: MKT_CUSTOMER_TAGS.RETENTION,
    label: 'Retention',
    color: 'orange',
    position: 6,
  },
  {
    value: MKT_CUSTOMER_TAGS.TECHNICAL,
    label: 'Technical',
    color: 'green',
    position: 7,
  },
  {
    value: MKT_CUSTOMER_TAGS.OTHER,
    label: 'Other',
    color: 'gray',
    position: 8,
  },
];
