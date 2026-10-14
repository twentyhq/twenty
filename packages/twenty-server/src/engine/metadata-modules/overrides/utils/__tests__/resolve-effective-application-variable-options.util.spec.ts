import { generateMessageId } from 'twenty-shared/i18n';

import { resolveEffectiveApplicationVariableOptions } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';

const options = [
  { value: 'eu', label: 'Europe' },
  { value: 'us', label: 'United States' },
];

const buildI18nContext = (applicationCatalog?: Record<string, string>) => ({
  isStandardApp: false,
  applicationCatalog,
  i18nInstance: { _: (messageId: string) => messageId },
});

describe('resolveEffectiveApplicationVariableOptions', () => {
  it('translates the labels the catalog holds under the owner context', () => {
    expect(
      resolveEffectiveApplicationVariableOptions({
        owner: 'applicationVariable',
        options,
        i18nContext: buildI18nContext({
          [generateMessageId('Europe', 'applicationVariable.label')]: 'Europa',
        }),
      }),
    ).toEqual([
      { value: 'eu', label: 'Europa' },
      { value: 'us', label: 'United States' },
    ]);
  });

  it('ignores catalog entries authored under another owner context', () => {
    expect(
      resolveEffectiveApplicationVariableOptions({
        owner: 'serverVariable',
        options,
        i18nContext: buildI18nContext({
          [generateMessageId('Europe', 'applicationVariable.label')]: 'Europa',
        }),
      }),
    ).toEqual(options);
  });

  it('keeps options untouched without a catalog', () => {
    expect(
      resolveEffectiveApplicationVariableOptions({
        owner: 'serverVariable',
        options: null,
        i18nContext: buildI18nContext({}),
      }),
    ).toBeNull();
    expect(
      resolveEffectiveApplicationVariableOptions({
        owner: 'serverVariable',
        options,
        i18nContext: buildI18nContext(),
      }),
    ).toEqual(options);
  });
});
