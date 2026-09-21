import { DateDisplayFormat, FieldMetadataType } from 'twenty-shared/types';

import { getNonUserOverridableSettingsChanges } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-non-user-overridable-settings-changes.util';

describe('getNonUserOverridableSettingsChanges', () => {
  it('returns no changes when only a presentation-only key changes', () => {
    expect(
      getNonUserOverridableSettingsChanges({
        fieldType: FieldMetadataType.DATE_TIME,
        incomingSettings: { displayFormat: DateDisplayFormat.USER_SETTINGS },
        existingSettings: { displayFormat: DateDisplayFormat.RELATIVE },
      }),
    ).toEqual([]);
  });

  it('returns no changes when nothing changed', () => {
    expect(
      getNonUserOverridableSettingsChanges({
        fieldType: FieldMetadataType.DATE,
        incomingSettings: { displayFormat: DateDisplayFormat.RELATIVE },
        existingSettings: { displayFormat: DateDisplayFormat.RELATIVE },
      }),
    ).toEqual([]);
  });

  it('allows clearing a presentation-only setting', () => {
    expect(
      getNonUserOverridableSettingsChanges({
        fieldType: FieldMetadataType.DATE,
        incomingSettings: null,
        existingSettings: { displayFormat: DateDisplayFormat.RELATIVE },
      }),
    ).toEqual([]);
  });

  it('flags a non-presentation key that changed alongside a presentation one', () => {
    expect(
      getNonUserOverridableSettingsChanges({
        fieldType: FieldMetadataType.DATE_TIME,
        incomingSettings: {
          displayFormat: DateDisplayFormat.USER_SETTINGS,
          foo: 'bar',
        },
        existingSettings: { displayFormat: DateDisplayFormat.RELATIVE },
      }),
    ).toEqual(['foo']);
  });

  it('flags every changed key for a field type with no overridable presentation settings', () => {
    expect(
      getNonUserOverridableSettingsChanges({
        fieldType: FieldMetadataType.NUMBER,
        incomingSettings: { decimals: 2 },
        existingSettings: { decimals: 0 },
      }),
    ).toEqual(['decimals']);
  });
});
