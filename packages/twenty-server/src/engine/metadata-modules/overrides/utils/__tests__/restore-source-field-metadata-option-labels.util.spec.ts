import { FieldMetadataType } from 'twenty-shared/types';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { restoreSourceFieldMetadataOptionLabels } from 'src/engine/metadata-modules/overrides/utils/restore-source-field-metadata-option-labels.util';

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
      en: {
        [`options.${WEEK_OPTION_ID}.label`]: 'Week',
        [`options.${MONTH_OPTION_ID}.label`]: 'Month',
      },
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

const restoreLabels = (
  updatedOptions: { id?: string; value: string; label: string }[],
) =>
  restoreSourceFieldMetadataOptionLabels({
    fieldMetadataType: FieldMetadataType.SELECT,
    updatedOptions,
    existingOptions,
    overrides,
    i18nContext,
  }).map(({ label }) => label);

describe('restoreSourceFieldMetadataOptionLabels', () => {
  it('keeps the source label of options sent back with their translated label', () => {
    expect(
      restoreLabels([
        { id: WEEK_OPTION_ID, value: 'WEEK', label: 'Week' },
        { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Month' },
      ]),
    ).toEqual(['Неделя', 'Месяц']);
  });

  it('renames options whose label was edited', () => {
    expect(
      restoreLabels([
        { id: WEEK_OPTION_ID, value: 'WEEK', label: 'Weekly' },
        { id: MONTH_OPTION_ID, value: 'MONTH', label: 'Month' },
      ]),
    ).toEqual(['Weekly', 'Месяц']);
  });

  it('keeps labels of new options', () => {
    expect(
      restoreLabels([
        { value: 'YEAR', label: 'Month' },
        {
          id: '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a03',
          value: 'DAY',
          label: 'Day',
        },
      ]),
    ).toEqual(['Month', 'Day']);
  });
});
