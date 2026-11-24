import { PageLayoutType } from 'twenty-shared/types';

import { buildFrontComponentPreviewContext } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-preview-context.util';

const DRAFT = {
  pageLayoutType: PageLayoutType.RECORD_PAGE as const,
  query: { objectName: 'company', select: ['name'], limit: 20 },
  objectNamePlural: 'companies',
  objectMetadataId: 'company-object-id',
  sampleRecords: [
    { id: '11111111-1111-4111-8111-111111111111', name: 'Acme' },
    { id: '22222222-2222-4222-8222-222222222222', name: 'Nova' },
  ],
};

it('selects the first fictional record and its validated query object', () => {
  expect(buildFrontComponentPreviewContext(DRAFT)).toEqual({
    selectedRecordIds: [DRAFT.sampleRecords[0].id],
    selectedObjectMetadata: {
      id: DRAFT.objectMetadataId,
      nameSingular: DRAFT.query.objectName,
      namePlural: DRAFT.objectNamePlural,
    },
  });
});

it('leaves dashboards without record context', () => {
  expect(
    buildFrontComponentPreviewContext({
      ...DRAFT,
      pageLayoutType: PageLayoutType.DASHBOARD,
    }),
  ).toEqual({
    selectedRecordIds: [],
    selectedObjectMetadata: null,
  });
});

it('continues rendering drafts saved before record context was supported', () => {
  expect(
    buildFrontComponentPreviewContext({
      ...DRAFT,
      objectMetadataId: undefined,
      sampleRecords: [{ name: 'Acme' }],
    }),
  ).toEqual({ selectedRecordIds: [], selectedObjectMetadata: null });
});
