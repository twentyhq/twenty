import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { isDefined } from '@/utils/validation/isDefined';

import { type TemplateVariableWithFallback } from './template-variable-with-fallback';

const STANDALONE_TEMPLATE_VARIABLE_PATTERN = /^{{([^{}]+)}}$/;

const TEMPLATE_VARIABLE_NAME_PATTERN = /^[a-zA-Z]\w*(?:\.[a-zA-Z]\w*)*$/;

const DEFAULT_FILTER_PATTERN = /^default\s*:\s*"((?:[^"\\]|\\["\\])*)"$/;

export const parseTemplateVariableWithFallback = (
  rawTemplateVariable: string,
): TemplateVariableWithFallback | undefined => {
  const [, templateVariableContent] =
    rawTemplateVariable.match(STANDALONE_TEMPLATE_VARIABLE_PATTERN) ?? [];

  if (!isDefined(templateVariableContent)) {
    return undefined;
  }

  const [rawName = '', ...rawFilterParts] = templateVariableContent.split('|');
  const name = rawName.trim();

  if (!TEMPLATE_VARIABLE_NAME_PATTERN.test(name)) {
    return undefined;
  }

  if (!isNonEmptyArray(rawFilterParts)) {
    return { name };
  }

  const [, escapedFallback] =
    rawFilterParts.join('|').trim().match(DEFAULT_FILTER_PATTERN) ?? [];

  if (!isDefined(escapedFallback)) {
    return undefined;
  }

  return { name, fallback: escapedFallback.replace(/\\(["\\])/g, '$1') };
};
