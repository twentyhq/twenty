import { PageLayoutType } from 'twenty-shared/types';

import { frontComponentDraftSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft.schema';

const INPUT = {
  name: 'Companies',
  source: 'export const Component = () => <div />;',
  query: { objectName: 'company', select: ['name'], limit: 20 },
  sampleRecords: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Acme' }],
};

describe('frontComponentDraftSchema', () => {
  it.each([undefined, null, 42, 'not-a-uuid'])(
    'requires a fictional record ID for record-page previews: %s',
    (id) => {
      const result = frontComponentDraftSchema.safeParse({
        ...INPUT,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        sampleRecords: [{ name: 'Acme', id }],
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toEqual(['sampleRecords', 0, 'id']);
    },
  );

  it('keeps record IDs optional for dashboard samples', () => {
    expect(
      frontComponentDraftSchema.safeParse({
        ...INPUT,
        pageLayoutType: PageLayoutType.DASHBOARD,
        sampleRecords: [{ name: 'Acme' }],
      }).success,
    ).toBe(true);
  });
  it('requires sample records to preview the component', () => {
    const result = frontComponentDraftSchema.safeParse({
      ...INPUT,
      pageLayoutType: PageLayoutType.DASHBOARD,
      sampleRecords: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['sampleRecords'], code: 'too_small' }),
    ]);
  });

  it.each([PageLayoutType.DASHBOARD, PageLayoutType.RECORD_PAGE])(
    'accepts one %s surface',
    (pageLayoutType) => {
      expect(
        frontComponentDraftSchema.safeParse({ ...INPUT, pageLayoutType })
          .success,
      ).toBe(true);
    },
  );
  it('rejects a component targeting multiple surfaces', () => {
    expect(
      frontComponentDraftSchema.safeParse({
        ...INPUT,
        pageLayoutType: [PageLayoutType.DASHBOARD, PageLayoutType.RECORD_PAGE],
      }).success,
    ).toBe(false);
  });
});
