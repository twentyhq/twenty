import { generateMessageId } from 'twenty-shared/i18n';
import { FieldMetadataType } from 'twenty-shared/types';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveNestedTranslatableProperties } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-nested-translatable-properties.util';

const i18nContext: EffectiveEntityI18nContext = {
  locale: 'fr-FR',
  i18nInstance: { _: (messageId: string) => messageId },
  isStandardApp: false,
  applicationCatalog: {
    [generateMessageId('Week', 'fieldMetadata.label')]: 'Semaine',
  },
  workspaceCustomApplicationUniversalIdentifier:
    '20202020-aaaa-4aaa-8aaa-000000000001',
  ownerApplicationUniversalIdentifier: '20202020-bbbb-4bbb-8bbb-000000000002',
};

describe('resolveEffectiveNestedTranslatableProperties', () => {
  it('resolves the nested translatable properties of a field', () => {
    expect(
      resolveEffectiveNestedTranslatableProperties({
        metadataName: 'fieldMetadata',
        record: {
          type: FieldMetadataType.SELECT,
          options: [
            {
              id: '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a01',
              value: 'WEEK',
              label: 'Week',
              position: 0,
              color: 'blue',
            },
          ],
          overrides: null,
        },
        i18nContext,
      }),
    ).toEqual({
      options: [expect.objectContaining({ value: 'WEEK', label: 'Semaine' })],
    });
  });

  it('resolves nothing for metadata without nested translatable properties', () => {
    expect(
      resolveEffectiveNestedTranslatableProperties({
        metadataName: 'objectMetadata',
        record: { labelSingular: 'Week', options: [{ label: 'Week' }] },
        i18nContext,
      }),
    ).toEqual({});
  });
});
