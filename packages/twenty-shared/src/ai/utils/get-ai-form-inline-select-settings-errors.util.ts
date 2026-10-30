import { isString } from '@sniptt/guards';

import { AI_FORM_INLINE_OPTION_SOURCE } from '@/ai/constants/ai-form-inline-option-source.const';
import { AI_FORM_MAX_INLINE_OPTIONS } from '@/ai/constants/ai-form-max-inline-options.const';
import { AI_FORM_MAX_LABEL_LENGTH } from '@/ai/constants/ai-form-max-label-length.const';
import { AI_FORM_MAX_OPTION_VALUE_LENGTH } from '@/ai/constants/ai-form-max-option-value-length.const';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const ALLOWED_SETTINGS_KEYS = new Set(['optionSource', 'options', 'required']);
const ALLOWED_OPTION_KEYS = new Set(['value', 'label']);

const isBoundedText = (value: unknown, maxLength: number) =>
  isString(value) && value.trim().length > 0 && value.length <= maxLength;

// Strict, so an inline field cannot also name a metadata select field or carry
// settings the renderer would silently ignore. Plain code rather than zod
// keeps this entrypoint light for the browser bundle.
export const getAiFormInlineSelectSettingsErrors = (
  settings: unknown,
): string[] => {
  if (!isPlainObject(settings)) {
    return ['Inline settings must be an object.'];
  }

  const errors: string[] = [];

  for (const key of Object.keys(settings)) {
    if (!ALLOWED_SETTINGS_KEYS.has(key)) {
      errors.push(`Inline options cannot be combined with ${key}.`);
    }
  }

  // Models often list options without naming their source; options alone
  // already mean inline choices.
  if (
    'optionSource' in settings &&
    settings.optionSource !== AI_FORM_INLINE_OPTION_SOURCE
  ) {
    errors.push(`optionSource must be "${AI_FORM_INLINE_OPTION_SOURCE}".`);
  }

  if ('required' in settings && typeof settings.required !== 'boolean') {
    errors.push('required must be true or false.');
  }

  const { options } = settings;

  if (
    !Array.isArray(options) ||
    options.length === 0 ||
    options.length > AI_FORM_MAX_INLINE_OPTIONS
  ) {
    errors.push(
      `List between 1 and ${AI_FORM_MAX_INLINE_OPTIONS} inline options.`,
    );

    return errors;
  }

  const values = new Set<string>();

  for (const option of options) {
    if (
      !isPlainObject(option) ||
      Object.keys(option).some((key) => !ALLOWED_OPTION_KEYS.has(key)) ||
      !isBoundedText(option.value, AI_FORM_MAX_OPTION_VALUE_LENGTH) ||
      !isBoundedText(option.label, AI_FORM_MAX_LABEL_LENGTH)
    ) {
      errors.push('Each inline option needs a short value and label only.');

      return errors;
    }

    if (values.has(option.value as string)) {
      errors.push('Each inline option needs its own value.');

      return errors;
    }

    values.add(option.value as string);
  }

  return errors;
};
