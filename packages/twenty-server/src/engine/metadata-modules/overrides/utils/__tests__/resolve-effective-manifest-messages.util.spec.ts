import { generateMessageId } from 'twenty-shared/i18n';

import {
  resolveEffectiveManifestMessage,
  resolveEffectiveManifestMessages,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';

const buildI18nContext = (applicationCatalog?: Record<string, string>) => ({
  isStandardApp: false,
  applicationCatalog,
  i18nInstance: { _: (messageId: string) => messageId },
});

const serverVariable = {
  key: 'DELIVERY_SPEED',
  description: 'Delivery speed requested from the provider',
  options: [
    { value: 'standard', label: 'Standard' },
    { value: 'express', label: 'Express' },
  ],
  value: 'express',
};

describe('resolveEffectiveManifestMessages', () => {
  it('translates every translatable value the catalog holds under its context', () => {
    expect(
      resolveEffectiveManifestMessages({
        entity: 'serverVariable',
        value: serverVariable,
        i18nContext: buildI18nContext({
          [generateMessageId(
            'Delivery speed requested from the provider',
            'serverVariable.description',
          )]: 'Vitesse de livraison',
          [generateMessageId('Express', 'serverVariable.label')]: 'Rapide',
        }),
      }),
    ).toEqual({
      ...serverVariable,
      description: 'Vitesse de livraison',
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'express', label: 'Rapide' },
      ],
    });
  });

  it('ignores catalog entries authored under another context', () => {
    expect(
      resolveEffectiveManifestMessages({
        entity: 'serverVariable',
        value: serverVariable,
        i18nContext: buildI18nContext({
          [generateMessageId('Express', 'applicationVariable.label')]: 'Rapide',
        }),
      }),
    ).toEqual(serverVariable);
  });

  it('keeps values untouched without a catalog', () => {
    expect(
      resolveEffectiveManifestMessages({
        entity: 'serverVariable',
        value: serverVariable,
        i18nContext: buildI18nContext(),
      }),
    ).toEqual(serverVariable);
  });
});

describe('resolveEffectiveManifestMessage', () => {
  it('translates one property with its entity context', () => {
    const i18nContext = buildI18nContext({
      [generateMessageId('Postcard sender', 'role.label')]: 'Expéditeur',
    });

    expect(
      resolveEffectiveManifestMessage({
        entity: 'role',
        property: 'label',
        sourceValue: 'Postcard sender',
        i18nContext,
      }),
    ).toBe('Expéditeur');
    expect(
      resolveEffectiveManifestMessage({
        entity: 'skill',
        property: 'label',
        sourceValue: 'Postcard sender',
        i18nContext,
      }),
    ).toBe('Postcard sender');
  });
});
