import { isDefined } from '@/utils/validation/isDefined';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/constants/CaptureAllVariableTagInnerRegex';

import { parseTemplateVariableWithFallback } from './parse-template-variable-with-fallback';

export const findMalformedTemplateVariable = (
  template: string,
): string | undefined => {
  const templateWithoutValidVariables = template.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (rawTemplateVariable) =>
      isDefined(parseTemplateVariableWithFallback(rawTemplateVariable))
        ? ''
        : rawTemplateVariable,
  );
  const malformedStartIndex = templateWithoutValidVariables.indexOf('{{');

  if (malformedStartIndex === -1) {
    return undefined;
  }

  const malformedEndIndex = templateWithoutValidVariables.indexOf(
    '}}',
    malformedStartIndex,
  );

  return templateWithoutValidVariables.slice(
    malformedStartIndex,
    malformedEndIndex === -1 ? undefined : malformedEndIndex + 2,
  );
};
