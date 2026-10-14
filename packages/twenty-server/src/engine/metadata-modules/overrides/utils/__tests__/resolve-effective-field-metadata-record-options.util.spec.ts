import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveFieldMetadataRecordOptions } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-field-metadata-record-options.util';

const i18nContext: EffectiveEntityI18nContext = {
  locale: 'fr-FR',
  i18nInstance: { _: (messageId: string) => messageId },
  isStandardApp: false,
  applicationCatalog: undefined,
  workspaceCustomApplicationUniversalIdentifier:
    'workspace-custom-application-universal-identifier',
  ownerApplicationUniversalIdentifier: undefined,
};

describe('resolveEffectiveFieldMetadataRecordOptions', () => {
  it('resolves option labels of a field record', () => {
    expect(
      resolveEffectiveFieldMetadataRecordOptions({
        record: {
          type: 'MULTI_SELECT',
          options: [{ id: 'buyer-option-id', value: 'BUYER', label: 'Buyer' }],
          overrides: {
            translations: {
              'fr-FR': { 'options.buyer-option-id.label': 'Acheteur' },
            },
          },
        },
        i18nContext,
      }),
    ).toEqual({
      options: [{ id: 'buyer-option-id', value: 'BUYER', label: 'Acheteur' }],
    });
  });

  it('returns nothing for a record without options', () => {
    expect(
      resolveEffectiveFieldMetadataRecordOptions({
        record: { type: 'TEXT', options: null },
        i18nContext,
      }),
    ).toEqual({});
  });
});
