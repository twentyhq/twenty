import {
  getFieldOptionLabelTranslationProperty,
  getOptionIdFromFieldOptionLabelTranslationProperty,
} from '@/i18n/field-option-label-translation-property';

describe('field option label translation property', () => {
  it('round-trips an option id', () => {
    const optionId = '20202020-8e01-4afd-9c39-d2063097587a';

    expect(
      getOptionIdFromFieldOptionLabelTranslationProperty(
        getFieldOptionLabelTranslationProperty(optionId),
      ),
    ).toBe(optionId);
  });

  it.each(['label', 'description', 'options..label', 'options.id.color'])(
    'does not read an option id from %p',
    (property) => {
      expect(
        getOptionIdFromFieldOptionLabelTranslationProperty(property),
      ).toBeUndefined();
    },
  );
});
