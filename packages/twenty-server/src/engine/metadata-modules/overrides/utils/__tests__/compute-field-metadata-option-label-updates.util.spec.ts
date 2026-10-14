import { FieldMetadataType } from 'twenty-shared/types';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { computeFieldMetadataOptionLabelUpdates } from 'src/engine/metadata-modules/overrides/utils/compute-field-metadata-option-label-updates.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const WEEK_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a01';
const MONTH_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a02';

const existingOptions = [
  { id: WEEK_OPTION_ID, value: 'WEEK', label: 'Неделя', position: 0 },
  { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Месяц', position: 1 },
];

const overrides = {
  [CUSTOM]: {
    translations: {
      en: { [`options.${WEEK_OPTION_ID}.label`]: 'Week' },
    },
  },
};

const i18nContext: EffectiveEntityI18nContext = {
  locale: 'en',
  i18nInstance: { _: (messageId: string) => messageId },
  isStandardApp: false,
  applicationCatalog: undefined,
  workspaceCustomApplicationUniversalIdentifier: CUSTOM,
  ownerApplicationUniversalIdentifier: undefined,
};

const computeUpdates = (
  updatedOptions: { id?: string; value: string; label: string }[],
) =>
  computeFieldMetadataOptionLabelUpdates({
    fieldMetadataType: FieldMetadataType.SELECT,
    updatedOptions,
    existingOptions,
    overrides,
    i18nContext,
  });

describe('computeFieldMetadataOptionLabelUpdates', () => {
  it('keeps the source label of an option sent back with its translated label', () => {
    expect(
      computeUpdates([
        { id: WEEK_OPTION_ID, value: 'WEEK', label: 'Week' },
        { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Месяц' },
      ]),
    ).toEqual({
      options: [
        { id: WEEK_OPTION_ID, value: 'WEEK', label: 'Неделя' },
        { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Месяц' },
      ],
      translationEntries: [],
    });
  });

  it('saves an edited translated label as a translation of the request locale', () => {
    expect(
      computeUpdates([{ id: WEEK_OPTION_ID, value: 'WEEK', label: 'Weekly' }]),
    ).toEqual({
      options: [{ id: WEEK_OPTION_ID, value: 'WEEK', label: 'Неделя' }],
      translationEntries: [
        {
          locale: 'en',
          property: `options.${WEEK_OPTION_ID}.label`,
          value: 'Weekly',
        },
      ],
    });
  });

  it('renames an option shown with its source label', () => {
    expect(
      computeUpdates([
        { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Месяц!' },
      ]),
    ).toEqual({
      options: [{ id: MONTH_OPTION_ID, value: 'MONTH', label: 'Месяц!' }],
      translationEntries: [],
    });
  });

  it('treats an option with a translation equal to its source label as translated', () => {
    expect(
      computeFieldMetadataOptionLabelUpdates({
        fieldMetadataType: FieldMetadataType.SELECT,
        updatedOptions: [
          { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Monthly' },
        ],
        existingOptions,
        overrides: {
          [CUSTOM]: {
            translations: {
              en: { [`options.${MONTH_OPTION_ID}.label`]: 'Месяц' },
            },
          },
        },
        i18nContext,
      }),
    ).toEqual({
      options: [{ id: MONTH_OPTION_ID, value: 'MONTH', label: 'Месяц' }],
      translationEntries: [
        {
          locale: 'en',
          property: `options.${MONTH_OPTION_ID}.label`,
          value: 'Monthly',
        },
      ],
    });
  });

  it('leaves a blank label untouched so validation rejects it', () => {
    expect(
      computeUpdates([{ id: WEEK_OPTION_ID, value: 'WEEK', label: '  ' }]),
    ).toEqual({
      options: [{ id: WEEK_OPTION_ID, value: 'WEEK', label: '  ' }],
      translationEntries: [],
    });
  });

  it('keeps labels of new options', () => {
    expect(computeUpdates([{ value: 'YEAR', label: 'Week' }])).toEqual({
      options: [{ value: 'YEAR', label: 'Week' }],
      translationEntries: [],
    });
  });
});
