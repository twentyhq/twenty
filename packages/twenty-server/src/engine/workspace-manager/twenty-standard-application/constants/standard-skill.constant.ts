// Using the pattern: 20202020-0003-XXXX for skills
// 0003 prefix indicates skills (0001 = objects, 0002 = agents)
export const STANDARD_SKILL = {
  'workflow-building': {
    universalIdentifier: '20202020-0003-0001-0000-000000000001',
  },
  'data-manipulation': {
    universalIdentifier: '20202020-0003-0002-0000-000000000002',
  },
  'dashboard-building': {
    universalIdentifier: '20202020-0003-0003-0000-000000000003',
  },
  'metadata-building': {
    universalIdentifier: '20202020-0003-0004-0000-000000000004',
  },
  research: {
    universalIdentifier: '20202020-0003-0005-0000-000000000005',
  },
  'code-interpreter': {
    universalIdentifier: '20202020-0003-0006-0000-000000000006',
  },
  xlsx: {
    universalIdentifier: '20202020-0003-0007-0000-000000000007',
  },
  pdf: {
    universalIdentifier: '20202020-0003-0008-0000-000000000008',
  },
  docx: {
    universalIdentifier: '20202020-0003-0009-0000-000000000009',
  },
  pptx: {
    universalIdentifier: '20202020-0003-000a-0000-00000000000a',
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
  }
>;
