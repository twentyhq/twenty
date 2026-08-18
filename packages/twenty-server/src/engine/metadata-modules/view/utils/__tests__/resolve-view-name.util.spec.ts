import { resolveViewName } from 'src/engine/metadata-modules/view/utils/resolve-view-name.util';

const mockI18n = {
  _: (id: string) => (id === 'known-id' ? 'Toutes les entreprises' : id),
};

const buildContext = ({
  isStandardApp = true,
  applicationCatalog,
}: {
  isStandardApp?: boolean;
  applicationCatalog?: Record<string, string>;
} = {}) => ({
  locale: 'fr-FR' as const,
  i18nInstance: mockI18n,
  isStandardApp,
  applicationCatalog,
});

describe('resolveViewName', () => {
  it('substitutes the object label into a templated name', () => {
    expect(
      resolveViewName({
        view: { name: 'All {objectLabelPlural}' },
        objectLabelPlural: 'Entreprises',
        i18nContext: buildContext(),
      }),
    ).toBe('All Entreprises');
  });

  it('leaves the placeholder alone when no object label is available', () => {
    expect(
      resolveViewName({
        view: { name: 'All {objectLabelPlural}' },
        objectLabelPlural: undefined,
        i18nContext: buildContext(),
      }),
    ).toBe('All {objectLabelPlural}');
  });

  // A view owned by the workspace-custom application is user copy: it must come
  // back verbatim rather than being matched against the standard catalog.
  it('returns a workspace-custom view name untranslated', () => {
    expect(
      resolveViewName({
        view: { name: 'My pipeline' },
        objectLabelPlural: undefined,
        i18nContext: buildContext({ isStandardApp: false }),
      }),
    ).toBe('My pipeline');
  });

  it('prefers a workspace override over the catalog', () => {
    expect(
      resolveViewName({
        view: { name: 'Renamed', overrides: { name: 'Renamed' } },
        objectLabelPlural: undefined,
        i18nContext: buildContext(),
      }),
    ).toBe('Renamed');
  });

  it('resolves an installed application view name from that application catalog', () => {
    const catalog = { 'O+uYD2': 'Toutes les fusees' };

    expect(
      resolveViewName({
        view: { name: 'All rockets' },
        objectLabelPlural: undefined,
        i18nContext: buildContext({
          isStandardApp: false,
          applicationCatalog: catalog,
        }),
      }),
    ).toBe('Toutes les fusees');
  });
});
