import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/overrides/utils/merge-translations-into-overrides.util';

const AUTHOR = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const authorContext = {
  workspaceCustomApplicationUniversalIdentifier: AUTHOR,
  ownerApplicationUniversalIdentifier: OWNER,
};

const merge = (
  existingOverrides: unknown,
  translationEntries: Parameters<
    typeof mergeTranslationsIntoOverrides
  >[0]['translationEntries'],
) =>
  mergeTranslationsIntoOverrides({
    existingOverrides,
    translationEntries,
    authorUniversalIdentifier: AUTHOR,
    authorContext,
  });

describe('mergeTranslationsIntoOverrides', () => {
  it('returns existing overrides untouched when there is nothing to merge', () => {
    const existingOverrides = { [AUTHOR]: { labelSingular: 'Client' } };

    expect(merge(existingOverrides, [])).toBe(existingOverrides);
  });

  it('adds a translation to the author entry without touching other overrides', () => {
    expect(
      merge({ [AUTHOR]: { labelSingular: 'Client' } }, [
        { locale: 'fr-FR', property: 'labelSingular', value: 'Entreprise' },
      ]),
    ).toEqual({
      [AUTHOR]: {
        labelSingular: 'Client',
        translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
      },
    });
  });

  it('leaves other authors entries untouched', () => {
    expect(
      merge({ [OWNER]: { labelSingular: 'Account' } }, [
        { locale: 'fr-FR', property: 'labelSingular', value: 'Entreprise' },
      ]),
    ).toEqual({
      [OWNER]: { labelSingular: 'Account' },
      [AUTHOR]: {
        translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
      },
    });
  });

  it('lifts a flat blob under the workspace custom application before merging', () => {
    expect(
      merge({ labelSingular: 'Client' }, [
        { locale: 'fr-FR', property: 'labelSingular', value: 'Entreprise' },
      ]),
    ).toEqual({
      [AUTHOR]: {
        labelSingular: 'Client',
        translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
      },
    });
  });

  it('merges into an existing locale group without dropping siblings', () => {
    expect(
      merge(
        {
          [AUTHOR]: {
            translations: {
              'fr-FR': { labelSingular: 'Entreprise' },
              'de-DE': { labelSingular: 'Unternehmen' },
            },
          },
        },
        [{ locale: 'fr-FR', property: 'labelPlural', value: 'Entreprises' }],
      ),
    ).toEqual({
      [AUTHOR]: {
        translations: {
          'fr-FR': { labelSingular: 'Entreprise', labelPlural: 'Entreprises' },
          'de-DE': { labelSingular: 'Unternehmen' },
        },
      },
    });
  });

  it('deletes an entry on empty value and prunes the emptied locale group', () => {
    expect(
      merge(
        {
          [AUTHOR]: {
            labelSingular: 'Client',
            translations: {
              'fr-FR': { labelSingular: 'Entreprise' },
              'de-DE': { labelSingular: 'Unternehmen' },
            },
          },
        },
        [{ locale: 'fr-FR', property: 'labelSingular', value: null }],
      ),
    ).toEqual({
      [AUTHOR]: {
        labelSingular: 'Client',
        translations: { 'de-DE': { labelSingular: 'Unternehmen' } },
      },
    });
  });

  it('collapses to null when the last translation of an otherwise empty blob is removed', () => {
    expect(
      merge(
        {
          [AUTHOR]: {
            translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
          },
        },
        [{ locale: 'fr-FR', property: 'labelSingular', value: '' }],
      ),
    ).toBeNull();
  });

  it('removing an absent entry is a no-op that still returns null', () => {
    expect(
      merge(null, [
        { locale: 'fr-FR', property: 'labelSingular', value: null },
      ]),
    ).toBeNull();
  });

  it('does not mutate the existing overrides', () => {
    const existingOverrides = {
      [AUTHOR]: { translations: { 'fr-FR': { labelSingular: 'Entreprise' } } },
    };

    merge(existingOverrides, [
      { locale: 'fr-FR', property: 'labelSingular', value: 'Société' },
      { locale: 'it-IT', property: 'labelSingular', value: 'Azienda' },
    ]);

    expect(existingOverrides).toEqual({
      [AUTHOR]: { translations: { 'fr-FR': { labelSingular: 'Entreprise' } } },
    });
  });
});
