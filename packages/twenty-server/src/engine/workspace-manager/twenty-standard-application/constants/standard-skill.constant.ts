export const STANDARD_SKILL = {
  'workflow-building': {
    universalIdentifier: '20202020-297a-4721-a1f3-c79a30b5420e',
  },
  'data-manipulation': {
    universalIdentifier: '20202020-0c39-4523-9543-e6c2a807937e',
  },
  'dashboard-building': {
    universalIdentifier: '20202020-ffdb-4623-abfb-036b9abeb121',
  },
  'metadata-building': {
    universalIdentifier: '20202020-7b80-4a14-8fb9-d1512b89c078',
  },
  research: {
    universalIdentifier: '20202020-6b44-417e-a31f-5560b59d300a',
  },
  'code-interpreter': {
    universalIdentifier: '20202020-a97a-4069-8e44-fc18faea7b97',
  },
  xlsx: {
    universalIdentifier: '20202020-b1ac-484f-bf27-82c2114f5707',
  },
  pdf: {
    universalIdentifier: '20202020-8c9e-454c-86a8-a0495f3c4f61',
  },
  docx: {
    universalIdentifier: '20202020-2d1f-43b6-b84e-ce8b1e7b2c3e',
  },
  pptx: {
    universalIdentifier: '20202020-13b5-4e60-9359-b8519ef1c07d',
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
  }
>;
