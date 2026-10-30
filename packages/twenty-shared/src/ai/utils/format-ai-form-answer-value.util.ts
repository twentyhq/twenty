import { isString } from '@sniptt/guards';

import { type RequestFormField } from '@/ai/types/RequestFormToolInput';
import { isAiFormInlineSelectSettings } from '@/ai/utils/is-ai-form-inline-select-settings.util';

// Shows an inline choice by the label the person picked rather than its
// stored value; everything else keeps its existing presentation.
export const formatAiFormAnswerValue = (
  field: RequestFormField,
  value: unknown,
): string => {
  if (isAiFormInlineSelectSettings(field.settings)) {
    const labelByValue = new Map(
      field.settings.options.map((option) => [option.value, option.label]),
    );
    const selectedValues = Array.isArray(value) ? value : [value];

    if (selectedValues.every(isString)) {
      return selectedValues
        .map(
          (selectedValue) => labelByValue.get(selectedValue) ?? selectedValue,
        )
        .join(', ');
    }
  }

  return isString(value) ? value : JSON.stringify(value);
};
