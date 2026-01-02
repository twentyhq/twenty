export const STANDARD_SKILL = {
  'workflow-building': {
    universalIdentifier: '20202020-6155-838a-b64e-44a791fbdc13',
  },
  'data-manipulation': {
    universalIdentifier: '20202020-e225-f5c7-3d56-45feaa36f2e6',
  },
  'dashboard-building': {
    universalIdentifier: '20202020-398f-0d7a-82db-4f43bc7e7044',
  },
  'metadata-building': {
    universalIdentifier: '20202020-c66a-5fed-4a74-46e0b42a6332',
  },
  research: {
    universalIdentifier: '20202020-db75-4fca-6813-4c7db0f964a0',
  },
  'code-interpreter': {
    universalIdentifier: '20202020-5eb9-e775-cf4e-4f22be7be362',
  },
  xlsx: {
    universalIdentifier: '20202020-2c7f-5b77-dfa4-494b84752ab7',
  },
  pdf: {
    universalIdentifier: '20202020-c3d1-e0c9-2f93-45648b8bbd26',
  },
  docx: {
    universalIdentifier: '20202020-6f15-2432-0537-4e23a2efd1cb',
  },
  pptx: {
    universalIdentifier: '20202020-c81b-baf8-5255-4c34bd0eac9b',
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
  }
>;
