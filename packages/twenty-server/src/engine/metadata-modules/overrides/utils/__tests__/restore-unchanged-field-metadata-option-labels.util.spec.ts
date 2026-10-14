import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { restoreUnchangedFieldMetadataOptionLabels } from 'src/engine/metadata-modules/overrides/utils/restore-unchanged-field-metadata-option-labels.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const WEEK_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a01';
const MONTH_OPTION_ID = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a02';

const existingOptions = [
  { id: WEEK_OPTION_ID, value: 'WEEK', label: 'Неделя', position: 0 },
  { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Месяц', position: 1 },
];

const i18nContext: EffectiveEntityI18nContext = {
  locale: 'en',
  i18nInstance: { _: (messageId: string) => messageId },
  isStandardApp: true,
  applicationCatalog: undefined,
  workspaceCustomApplicationUniversalIdentifier: CUSTOM,
  ownerApplicationUniversalIdentifier: undefined,
};

const restore = ({
  updatedOptions,
  overrides,
}: {
  updatedOptions: { id?: string; value: string; label: string }[];
  overrides: unknown;
}) =>
  restoreUnchangedFieldMetadataOptionLabels({
    updatedOptions,
    existingOptions,
    overrides,
    i18nContext,
  });

describe('restoreUnchangedFieldMetadataOptionLabels', () => {
  it('restores the source label of an option sent back with its translated label', () => {
    expect(
      restore({
        updatedOptions: [{ id: WEEK_OPTION_ID, value: 'WEEK', label: 'Week' }],
        overrides: {
          [CUSTOM]: {
            translations: {
              en: { [`options.${WEEK_OPTION_ID}.label`]: 'Week' },
            },
          },
        },
      }),
    ).toEqual([{ id: WEEK_OPTION_ID, value: 'WEEK', label: 'Неделя' }]);
  });

  it('keeps the renamed label of an option sent back unchanged, so its override survives', () => {
    expect(
      restore({
        updatedOptions: [{ id: WEEK_OPTION_ID, value: 'WEEK', label: 'Week' }],
        overrides: {
          [CUSTOM]: {
            [`options.${WEEK_OPTION_ID}.label`]: 'Sprint',
            translations: {
              en: { [`options.${WEEK_OPTION_ID}.label`]: 'Week' },
            },
          },
        },
      }),
    ).toEqual([{ id: WEEK_OPTION_ID, value: 'WEEK', label: 'Sprint' }]);
  });

  it('passes a changed label through as a rename', () => {
    expect(
      restore({
        updatedOptions: [
          { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Monthly' },
        ],
        overrides: null,
      }),
    ).toEqual([{ id: MONTH_OPTION_ID, value: 'MONTH', label: 'Monthly' }]);
  });

  it('keeps labels of new options', () => {
    expect(
      restore({
        updatedOptions: [{ value: 'YEAR', label: 'Неделя' }],
        overrides: null,
      }),
    ).toEqual([{ value: 'YEAR', label: 'Неделя' }]);
  });
});
