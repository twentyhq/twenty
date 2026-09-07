import { buildViewNameObjectLabels } from 'src/engine/metadata-modules/view/utils/build-view-name-object-labels.util';

const objectMetadata = {
  labelSingular: 'widget',
  labelPlural: 'widgets',
};

const i18nContext = {
  locale: 'fr-FR' as const,
  i18nInstance: { _: (id: string) => id },
  isStandardApp: true,
};

describe('buildViewNameObjectLabels', () => {
  // Capitalization rides along: the value carries the casing because a
  // placeholder can start a label.
  it('resolves only the placeholder the name carries', () => {
    expect(
      buildViewNameObjectLabels({
        viewName: 'All {objectLabelPlural}',
        objectMetadata,
        i18nContext,
      }),
    ).toEqual({ objectLabelPlural: 'Widgets' });

    expect(
      buildViewNameObjectLabels({
        viewName: '{objectLabelSingular} Record Page',
        objectMetadata,
        i18nContext,
      }),
    ).toEqual({ objectLabelSingular: 'Widget' });
  });

  it('resolves both when the name carries both', () => {
    expect(
      buildViewNameObjectLabels({
        viewName: '{objectLabelSingular} of {objectLabelPlural}',
        objectMetadata,
        i18nContext,
      }),
    ).toEqual({ objectLabelSingular: 'Widget', objectLabelPlural: 'Widgets' });
  });

  it('resolves nothing for a name without placeholders', () => {
    expect(
      buildViewNameObjectLabels({
        viewName: 'My pipeline',
        objectMetadata,
        i18nContext,
      }),
    ).toEqual({});
  });
});
