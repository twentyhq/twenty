import { validateStandaloneRichTextPageLayoutType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-page-layout-type.util';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

type Args = Parameters<typeof validateStandaloneRichTextPageLayoutType>[0];

const buildArgs = (pageLayoutType: PageLayoutType): Args =>
  ({
    flatEntityToValidate: {
      pageLayoutTabUniversalIdentifier: 'tab-uid',
      universalOverrides: null,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: {
        byUniversalIdentifier: {
          'tab-uid': { pageLayoutUniversalIdentifier: 'layout-uid' },
        },
      },
      flatPageLayoutMaps: {
        byUniversalIdentifier: {
          'layout-uid': { type: pageLayoutType },
        },
      },
    },
  }) as unknown as Args;

describe('validateStandaloneRichTextPageLayoutType', () => {
  it('rejects a standalone rich text widget on a non-dashboard layout', () => {
    const errors = validateStandaloneRichTextPageLayoutType(
      buildArgs(PageLayoutType.RECORD_PAGE),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].value).toBe(PageLayoutType.RECORD_PAGE);
  });

  it('allows a standalone rich text widget on a dashboard layout', () => {
    const errors = validateStandaloneRichTextPageLayoutType(
      buildArgs(PageLayoutType.DASHBOARD),
    );

    expect(errors).toEqual([]);
  });
});
