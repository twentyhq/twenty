import { generateMessageId } from 'twenty-shared/i18n';
import { FieldMetadataType } from 'twenty-shared/types';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveFieldMetadataOptions } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-field-metadata-options.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';
const WEEK_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a01';
const MONTH_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a02';

const options = [
  {
    id: WEEK_OPTION_ID,
    value: 'WEEK',
    label: 'Неделя',
    position: 0,
    color: 'blue' as const,
  },
  {
    id: MONTH_OPTION_ID,
    value: 'MONTH',
    label: 'Месяц',
    position: 1,
    color: 'green' as const,
  },
];

const buildI18nContext = (
  partial: Partial<EffectiveEntityI18nContext> = {},
): EffectiveEntityI18nContext => ({
  locale: 'en',
  i18nInstance: { _: (messageId: string) => messageId },
  isStandardApp: false,
  applicationCatalog: undefined,
  workspaceCustomApplicationUniversalIdentifier: CUSTOM,
  ownerApplicationUniversalIdentifier: OWNER,
  ...partial,
});

const resolveLabels = ({
  fieldMetadataType = FieldMetadataType.SELECT,
  overrides = null,
  i18nContext = buildI18nContext(),
}: {
  fieldMetadataType?: FieldMetadataType;
  overrides?: unknown;
  i18nContext?: EffectiveEntityI18nContext;
}) =>
  resolveEffectiveFieldMetadataOptions({
    fieldMetadataType,
    options,
    overrides,
    i18nContext,
  })?.map(({ label }) => label);

describe('resolveEffectiveFieldMetadataOptions', () => {
  it('keeps source labels of a custom field without translations', () => {
    expect(resolveLabels({})).toEqual(['Неделя', 'Месяц']);
  });

  it.each([FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT])(
    'applies workspace translations of the request locale to %s options',
    (fieldMetadataType) => {
      expect(
        resolveLabels({
          fieldMetadataType,
          overrides: {
            [CUSTOM]: {
              translations: {
                en: { [`options.${WEEK_OPTION_ID}.label`]: 'Week' },
                'fr-FR': { [`options.${MONTH_OPTION_ID}.label`]: 'Mois' },
              },
            },
          },
        }),
      ).toEqual(['Week', 'Месяц']);
    },
  );

  it('translates standard option labels through the standard catalog', () => {
    const weekMessageId = generateMessageId('Неделя', 'fieldMetadata.label');

    expect(
      resolveLabels({
        i18nContext: buildI18nContext({
          locale: 'fr-FR',
          isStandardApp: true,
          i18nInstance: {
            _: (messageId: string) =>
              messageId === weekMessageId ? 'Semaine' : messageId,
          },
        }),
      }),
    ).toEqual(['Semaine', 'Месяц']);
  });

  it('translates app option labels through the application catalog', () => {
    expect(
      resolveLabels({
        i18nContext: buildI18nContext({
          applicationCatalog: {
            [generateMessageId('Месяц', 'fieldMetadata.label')]: 'Month',
          },
        }),
      }),
    ).toEqual(['Неделя', 'Month']);
  });

  it('prefers a workspace translation over the application catalog', () => {
    expect(
      resolveLabels({
        overrides: {
          [CUSTOM]: {
            translations: {
              en: { [`options.${MONTH_OPTION_ID}.label`]: 'Monthly' },
            },
          },
        },
        i18nContext: buildI18nContext({
          applicationCatalog: {
            [generateMessageId('Месяц', 'fieldMetadata.label')]: 'Month',
          },
        }),
      }),
    ).toEqual(['Неделя', 'Monthly']);
  });

  it('leaves options of non-select fields untouched', () => {
    expect(
      resolveLabels({
        fieldMetadataType: FieldMetadataType.RATING,
        i18nContext: buildI18nContext({
          applicationCatalog: {
            [generateMessageId('Месяц', 'fieldMetadata.label')]: 'Month',
          },
        }),
      }),
    ).toEqual(['Неделя', 'Месяц']);
  });
});
