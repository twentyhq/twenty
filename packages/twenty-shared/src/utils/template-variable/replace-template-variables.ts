import { isDefined } from '@/utils/validation/isDefined';

import { parseTemplateVariableWithFallback } from './parse-template-variable-with-fallback';
import { TEMPLATE_VARIABLE_PATTERN } from './template-variable-pattern';
import { type TemplateVariableWithFallback } from './template-variable-with-fallback';

export const replaceTemplateVariables = (
  template: string,
  replaceTemplateVariable: (
    templateVariable: TemplateVariableWithFallback,
  ) => string,
): string =>
  template.replace(TEMPLATE_VARIABLE_PATTERN, (rawTemplateVariable) => {
    const templateVariable =
      parseTemplateVariableWithFallback(rawTemplateVariable);

    return isDefined(templateVariable)
      ? replaceTemplateVariable(templateVariable)
      : rawTemplateVariable;
  });
