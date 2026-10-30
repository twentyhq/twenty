import { type IntegrityRule } from 'src/modules/integrity-rules/types/integrity-rule.type';

const LIVE_STATUS_CONDITION = { field: 'status', in: ['LIVE'] };

export const COMPANY_INTEGRITY_RULES: IntegrityRule[] = [
  {
    key: 'company-live-requires-complete-profile',
    objectName: 'company',
    category: 'REQUIRED_FIELDS',
    description: 'A company can only be Live once its profile is complete.',
    when: [LIVE_STATUS_CONDITION],
    fields: [
      'name',
      'shortName',
      'description',
      'domainName',
      'address',
      'accountOwner',
      'organizationType',
      'specialty',
      'providers',
      'ehr',
      'clearinghouse',
      'billingArrangement',
      'monthlyCollections',
      'servicesInterest',
      'source',
    ],
  },
  {
    key: 'company-live-requires-known-organization-type',
    objectName: 'company',
    category: 'ALLOWED_VALUES',
    description: 'A Live company must have a known organization type.',
    when: [LIVE_STATUS_CONDITION],
    constraint: { field: 'organizationType', notIn: ['UNKNOWN'] },
  },
  {
    key: 'company-live-requires-known-source',
    objectName: 'company',
    category: 'ALLOWED_VALUES',
    description: 'A Live company must have a known source.',
    when: [LIVE_STATUS_CONDITION],
    constraint: { field: 'source', notIn: ['UNKNOWN'] },
  },
];
