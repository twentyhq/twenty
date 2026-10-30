import { FieldMetadataType } from 'twenty-shared/types';

import { type IntegrityRule } from 'src/modules/integrity-rules/types/integrity-rule.type';
import { type IntegrityRuleField } from 'src/modules/integrity-rules/types/integrity-rule-field.type';
import { findNewIntegrityViolations } from 'src/modules/integrity-rules/utils/find-new-integrity-violations.util';

const FIELDS_BY_NAME: Record<string, IntegrityRuleField> = {
  status: {
    name: 'status',
    label: 'Status',
    type: FieldMetadataType.SELECT,
    recordKey: 'status',
    optionLabels: {
      PROSPECT: 'Prospect',
      SIGNED: 'Signed',
      LIVE: 'Live',
    },
  },
  description: {
    name: 'description',
    label: 'Description',
    type: FieldMetadataType.TEXT,
    recordKey: 'description',
    optionLabels: {},
  },
  domainName: {
    name: 'domainName',
    label: 'Website',
    type: FieldMetadataType.LINKS,
    recordKey: 'domainName',
    optionLabels: {},
  },
  accountOwner: {
    name: 'accountOwner',
    label: 'Account owner',
    type: FieldMetadataType.RELATION,
    recordKey: 'accountOwnerId',
    optionLabels: {},
  },
  source: {
    name: 'source',
    label: 'Source',
    type: FieldMetadataType.SELECT,
    recordKey: 'source',
    optionLabels: { UNKNOWN: 'Unknown', INBOUND: 'Inbound' },
  },
};

const RULES: IntegrityRule[] = [
  {
    key: 'live-requires-profile',
    objectName: 'company',
    category: 'REQUIRED_FIELDS',
    description: '',
    when: [{ field: 'status', in: ['LIVE'] }],
    fields: [
      'description',
      'domainName',
      'accountOwner',
      'fieldNotInWorkspace',
    ],
  },
  {
    key: 'live-requires-known-source',
    objectName: 'company',
    category: 'ALLOWED_VALUES',
    description: '',
    when: [{ field: 'status', in: ['LIVE'] }],
    constraint: { field: 'source', notIn: ['UNKNOWN'] },
  },
  {
    key: 'status-flow',
    objectName: 'company',
    category: 'STATUS_TRANSITION',
    description: '',
    field: 'status',
    allowedTransitions: { PROSPECT: ['SIGNED'] },
  },
];

const COMPLETE_RECORD = {
  description: 'Clinic',
  domainName: { primaryLinkUrl: 'clinic.com' },
  accountOwnerId: 'owner-id',
  source: 'INBOUND',
};

describe('findNewIntegrityViolations', () => {
  it('blocks moving an incomplete record to Live and lists missing fields', () => {
    const violations = findNewIntegrityViolations({
      rules: RULES,
      fieldsByName: FIELDS_BY_NAME,
      previousRecord: { status: 'SIGNED', description: 'Clinic' },
      record: {
        status: 'LIVE',
        description: 'Clinic',
        domainName: { primaryLinkUrl: '' },
      },
    });

    expect(violations).toEqual([
      expect.objectContaining({
        ruleKey: 'live-requires-profile',
        fields: ['domainName', 'accountOwner'],
        message: 'Website, Account owner must be filled when Status is Live',
      }),
    ]);
  });

  it('allows Live once every required field is filled', () => {
    expect(
      findNewIntegrityViolations({
        rules: RULES,
        fieldsByName: FIELDS_BY_NAME,
        previousRecord: { ...COMPLETE_RECORD, status: 'SIGNED' },
        record: { ...COMPLETE_RECORD, status: 'LIVE' },
      }),
    ).toEqual([]);
  });

  it('ignores rules when their condition does not match', () => {
    expect(
      findNewIntegrityViolations({
        rules: RULES,
        fieldsByName: FIELDS_BY_NAME,
        record: { status: 'PROSPECT' },
      }),
    ).toEqual([]);
  });

  it('blocks clearing a required field on a Live record', () => {
    const violations = findNewIntegrityViolations({
      rules: RULES,
      fieldsByName: FIELDS_BY_NAME,
      previousRecord: { ...COMPLETE_RECORD, status: 'LIVE' },
      record: { ...COMPLETE_RECORD, status: 'LIVE', description: '  ' },
    });

    expect(violations.map(({ fields }) => fields)).toEqual([['description']]);
  });

  it('keeps already-incomplete Live records editable', () => {
    expect(
      findNewIntegrityViolations({
        rules: RULES,
        fieldsByName: FIELDS_BY_NAME,
        previousRecord: { status: 'LIVE', description: 'Clinic' },
        record: { status: 'LIVE', description: 'Updated clinic' },
      }),
    ).toEqual([]);
  });

  it('rejects forbidden values', () => {
    const violations = findNewIntegrityViolations({
      rules: RULES,
      fieldsByName: FIELDS_BY_NAME,
      record: { ...COMPLETE_RECORD, status: 'LIVE', source: 'UNKNOWN' },
    });

    expect(violations).toEqual([
      expect.objectContaining({
        ruleKey: 'live-requires-known-source',
        message: "Source can't be Unknown when Status is Live",
      }),
    ]);
  });

  it('rejects transitions that are not allowed', () => {
    const violations = findNewIntegrityViolations({
      rules: RULES,
      fieldsByName: FIELDS_BY_NAME,
      previousRecord: { ...COMPLETE_RECORD, status: 'PROSPECT' },
      record: { ...COMPLETE_RECORD, status: 'LIVE' },
    });

    expect(violations).toEqual([
      expect.objectContaining({
        ruleKey: 'status-flow',
        message: "Status can't go from Prospect to Live",
      }),
    ]);
  });
});
