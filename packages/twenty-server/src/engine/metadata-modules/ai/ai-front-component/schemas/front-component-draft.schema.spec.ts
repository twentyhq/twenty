import { PageLayoutType } from 'twenty-shared/types';

import { frontComponentDraftSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft.schema';

const INPUT = {
  name: 'Companies',
  source: 'export const Component = () => <div />;',
  query: { objectName: 'company', select: ['name'], limit: 20 },
  sampleRecords: [],
};

describe('frontComponentDraftSchema', () => {
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
