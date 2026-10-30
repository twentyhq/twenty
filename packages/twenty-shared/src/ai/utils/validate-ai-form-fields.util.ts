import { isNonEmptyString, isString } from '@sniptt/guards';

import { AI_FORM_MAX_LABEL_LENGTH } from '@/ai/constants/ai-form-max-label-length.const';
import { type RequestFormField } from '@/ai/types/RequestFormToolInput';
import { getAiFormInlineSelectSettingsErrors } from '@/ai/utils/get-ai-form-inline-select-settings-errors.util';
import { isDefined } from '@/utils/validation/isDefined';

const isSelectType = (type: RequestFormField['type']) =>
  type === 'SELECT' || type === 'MULTI_SELECT';

// Checks a form an agent asks for before it is shown. Metadata-backed selects
// and record pickers keep their existing settings; inline choices are the
// additive variant.
export const validateAiFormFields = (fields: RequestFormField[]): string[] => {
  const errors: string[] = [];

  for (const field of fields) {
    const settings = field.settings ?? {};

    if (field.label.length > AI_FORM_MAX_LABEL_LENGTH) {
      errors.push(`The label of ${field.name} is too long.`);
    }

    if (
      isDefined(settings.required) &&
      typeof settings.required !== 'boolean'
    ) {
      errors.push(`settings.required of ${field.name} must be true or false.`);
    }

    if (isDefined(settings.optionSource) || isDefined(settings.options)) {
      if (!isSelectType(field.type)) {
        errors.push(
          `${field.name} lists inline options but is not a SELECT or MULTI_SELECT field.`,
        );
        continue;
      }

      const settingsErrors = getAiFormInlineSelectSettingsErrors(settings);

      if (settingsErrors.length > 0) {
        errors.push(
          `${field.name} has invalid inline options: ${settingsErrors.join(' ')}`,
        );
      }

      continue;
    }

    if (
      isSelectType(field.type) &&
      !isNonEmptyString(settings.selectedFieldId)
    ) {
      errors.push(
        `${field.name} needs settings.selectedFieldId, or settings.optionSource "inline" with options.`,
      );
    }

    if (field.type === 'RECORD' && !isString(settings.objectName)) {
      errors.push(`${field.name} needs settings.objectName.`);
    }
  }

  return errors;
};
