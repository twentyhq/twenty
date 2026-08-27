import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { resolveTranslatableProperties } from 'src/engine/metadata-modules/application-translation-catalog/utils/resolve-translatable-properties.util';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';

const i18nContext: EffectiveEntityI18nContext = {
  locale: 'fr-FR',
  i18nInstance: { _: (messageId: string) => messageId },
  isStandardApp: false,
  applicationCatalog: undefined,
};

describe('resolveTranslatableProperties', () => {
  it('resolves every translatable property the entity carries', () => {
    expect(
      resolveTranslatableProperties({
        metadataName: 'objectMetadata',
        entity: {
          labelSingular: 'Company',
          labelPlural: 'Companies',
          description: 'A company',
        },
        i18nContext,
      }),
    ).toEqual({
      labelSingular: 'Company',
      labelPlural: 'Companies',
      description: 'A company',
    });
  });

  it('omits properties the entity does not carry', () => {
    expect(
      resolveTranslatableProperties({
        metadataName: 'objectMetadata',
        entity: { labelSingular: 'Company' },
        i18nContext,
      }),
    ).toEqual({ labelSingular: 'Company' });
  });

  it('prefers a workspace translation for the resolved locale', () => {
    expect(
      resolveTranslatableProperties({
        metadataName: 'objectMetadata',
        entity: {
          labelSingular: 'Company',
          overrides: {
            translations: { 'fr-FR': { labelSingular: 'Entreprise' } },
          },
        },
        i18nContext: { ...i18nContext, isStandardApp: true },
      }),
    ).toEqual({ labelSingular: 'Entreprise' });
  });

  it('falls back to the canonical override when the locale has no translation', () => {
    expect(
      resolveTranslatableProperties({
        metadataName: 'objectMetadata',
        entity: {
          labelSingular: 'Company',
          overrides: { labelSingular: 'Client' },
        },
        i18nContext: {
          ...i18nContext,
          locale: SOURCE_LOCALE,
          isStandardApp: true,
        },
      }),
    ).toEqual({ labelSingular: 'Client' });
  });

  it('returns nothing for a metadata name with no translatable properties', () => {
    expect(
      resolveTranslatableProperties({
        metadataName: 'objectMetadata',
        entity: {},
        i18nContext,
      }),
    ).toEqual({});
  });
});
