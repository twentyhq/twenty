export const LEGACY_WIDGET_JSON_LOGIC_CORPUS: Record<string, unknown>[] = [
  {
    '!': {
      or: Array.from({ length: 14 }, (_, index) => ({
        in: [
          `VALUE_${index + 1}`,
          { var: 'selectedRecords.0.multiSelectField' },
        ],
      })),
    },
  },
  { '==': [{ var: 'selectedRecords.0.selectField' }, 'VALUE_15'] },
  { '==': [{ var: 'selectedRecords.0.selectField' }, 'VALUE_16'] },
  { and: [{ '===': [{ var: 'device' }, 'MOBILE'] }] },
  { and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }] },
  ...[
    'VALUE_14',
    'VALUE_12',
    'VALUE_11',
    'VALUE_2',
    'VALUE_13',
    'VALUE_1',
    'VALUE_4',
  ].map((value) => ({
    in: [value, { var: 'selectedRecords.0.multiSelectField' }],
  })),
];
