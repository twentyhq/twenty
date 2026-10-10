import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveMetadataEventRecord } from 'src/engine/subscriptions/metadata-event/utils/resolve-metadata-event-record.util';

const buildI18nContext = (
  overrides: Partial<EffectiveEntityI18nContext> = {},
): EffectiveEntityI18nContext => ({
  locale: SOURCE_LOCALE,
  i18nInstance: { _: (messageId: string) => `translated:${messageId}` },
  isStandardApp: true,
  applicationCatalog: undefined,
  workspaceCustomApplicationUniversalIdentifier:
    'workspace-custom-application-universal-identifier',
  ownerApplicationUniversalIdentifier: undefined,
  ...overrides,
});

describe('resolveMetadataEventRecord', () => {
  it('should translate every translatable property of the entity', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'commandMenuItem',
      record: {
        label: 'Export View',
        shortLabel: 'Export',
        icon: 'IconUpload',
      },
      i18nContext: buildI18nContext(),
    });

    expect(resolved.label).toMatch(/^translated:/);
    expect(resolved.shortLabel).toMatch(/^translated:/);
  });

  it('should leave non-translatable properties untouched', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'commandMenuItem',
      record: { label: 'Export View', icon: 'IconUpload', isPinned: true },
      i18nContext: buildI18nContext(),
    });

    expect(resolved.icon).toBe('IconUpload');
    expect(resolved.isPinned).toBe(true);
  });

  it('should prefer an override over the translated base value', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'pageLayoutTab',
      record: { title: 'Home', overrides: { title: 'Accueil maison' } },
      i18nContext: buildI18nContext(),
    });

    expect(resolved.title).toBe('Accueil maison');
  });

  it('should strip overrides from the delivered record', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'pageLayoutTab',
      record: { title: 'Home', overrides: { title: 'Accueil maison' } },
      i18nContext: buildI18nContext(),
    });

    expect(resolved).not.toHaveProperty('overrides');
  });

  it('should skip absent and empty values rather than emitting a translated empty string', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'commandMenuItem',
      record: { label: 'Export View', shortLabel: null },
      i18nContext: buildI18nContext(),
    });

    expect(resolved.shortLabel).toBeNull();
  });

  it("should keep custom-application values that Twenty's catalog does not know", () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'view',
      record: { name: 'My custom view' },
      i18nContext: buildI18nContext({
        isStandardApp: false,
        applicationCatalog: undefined,
        // Lingui returns the message id itself when its catalog has no entry
        i18nInstance: { _: (messageId: string) => messageId },
      }),
    });

    expect(resolved.name).toBe('My custom view');
  });
  // Delivery strips `overrides`, so any it does not apply is lost
  it('should apply an override on a non-translatable property', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'pageLayoutTab',
      record: {
        title: 'Home',
        position: 0,
        icon: 'IconHome',
        overrides: { position: 3, icon: 'IconStar' },
      },
      i18nContext: buildI18nContext(),
    });

    expect(resolved.position).toBe(3);
    expect(resolved.icon).toBe('IconStar');
    expect(resolved).not.toHaveProperty('overrides');
  });

  it('should apply an override on a translatable property whose base value is empty', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'commandMenuItem',
      record: { label: '', overrides: { label: 'Workspace label' } },
      i18nContext: buildI18nContext(),
    });

    expect(resolved.label).toBe('Workspace label');
  });

  it('should not leak the per-locale translations override onto the record', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'objectMetadata',
      record: {
        labelSingular: 'Company',
        overrides: { translations: { 'fr-FR': { labelSingular: 'Société' } } },
      },
      i18nContext: buildI18nContext({ locale: 'fr-FR' }),
    });

    expect(resolved.labelSingular).toBe('Société');
    expect(resolved).not.toHaveProperty('translations');
    expect(resolved).not.toHaveProperty('overrides');
  });

  it('should apply overrides for an entity that has nothing translatable', () => {
    const resolved = resolveMetadataEventRecord({
      metadataName: 'viewField',
      record: {
        isVisible: true,
        size: 120,
        position: 3,
        overrides: { isVisible: false, size: 240 },
      },
      i18nContext: buildI18nContext(),
    });

    expect(resolved.isVisible).toBe(false);
    expect(resolved.size).toBe(240);
    expect(resolved.position).toBe(3);
    expect(resolved).not.toHaveProperty('overrides');
  });
});
