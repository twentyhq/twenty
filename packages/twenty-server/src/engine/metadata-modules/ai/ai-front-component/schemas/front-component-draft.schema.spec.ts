import { PageLayoutType } from 'twenty-shared/types';

import { frontComponentDraftSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft.schema';

const INPUT = {
  name: 'Companies',
  source: 'export const Component = () => <div />;',
  query: { objectName: 'company', select: ['name'], limit: 20 },
  sampleRecords: [{ name: 'Acme' }],
};

describe('frontComponentDraftSchema', () => {
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
