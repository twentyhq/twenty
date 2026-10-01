import { resolveDeprecatedViewDateFieldInput } from 'src/engine/metadata-modules/view/utils/resolve-deprecated-view-date-field-input.util';

describe('resolveDeprecatedViewDateFieldInput', () => {
  it('maps deprecated calendar field ids onto start and end field ids', () => {
    expect(
      resolveDeprecatedViewDateFieldInput({
        name: 'Calendar',
        calendarFieldMetadataId: 'start-id',
        calendarEndFieldMetadataId: null,
      }),
    ).toEqual({
      name: 'Calendar',
      startFieldMetadataId: 'start-id',
      endFieldMetadataId: null,
    });
  });

  it('prefers the new field ids when both are provided', () => {
    expect(
      resolveDeprecatedViewDateFieldInput({
        startFieldMetadataId: 'new-start-id',
        calendarFieldMetadataId: 'old-start-id',
      }),
    ).toEqual({ startFieldMetadataId: 'new-start-id' });
  });

  it('leaves inputs without deprecated fields untouched', () => {
    expect(
      resolveDeprecatedViewDateFieldInput({
        name: 'Table',
        startFieldMetadataId: undefined,
      }),
    ).toEqual({ name: 'Table', startFieldMetadataId: undefined });
  });
});
