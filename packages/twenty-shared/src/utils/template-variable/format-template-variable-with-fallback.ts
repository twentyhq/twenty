import { isNonEmptyString } from '@sniptt/guards';

import { type TemplateVariableWithFallback } from './template-variable-with-fallback';

export const formatTemplateVariableWithFallback = ({
  name,
  fallback,
}: TemplateVariableWithFallback): string =>
  isNonEmptyString(fallback)
    ? `{{${name} | default: "${fallback.replace(/["\\]/g, '\\$&')}"}}`
    : `{{${name}}}`;
