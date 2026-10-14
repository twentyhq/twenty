export type FieldOptionLabelTranslationProperty = `options.${string}.label`;

const FIELD_OPTION_LABEL_TRANSLATION_PROPERTY_PATTERN =
  /^options\.([^.]+)\.label$/;

export const getFieldOptionLabelTranslationProperty = (
  optionId: string,
): FieldOptionLabelTranslationProperty => `options.${optionId}.label`;

export const getOptionIdFromFieldOptionLabelTranslationProperty = (
  property: string,
): string | undefined =>
  FIELD_OPTION_LABEL_TRANSLATION_PROPERTY_PATTERN.exec(property)?.[1];
