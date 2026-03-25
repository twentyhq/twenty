import { isDefined } from '@/utils/validation';
import { evalFromContext } from './evalFromContext';

const VARIABLE_TAG_PATTERN =
  /\{"type":"variableTag","attrs":\{"variable":"(\{\{[^{}]+\}\})"\}\}|\{"attrs":\{"variable":"(\{\{[^{}]+\}\})"\},"type":"variableTag"\}/g;

const escapeJsonString = (text: string): string => {
  return JSON.stringify(text).slice(1, -1);
};

const buildTextNodesWithLineBreaks = (text: string): string => {
  const lines = text.split('\n');

  if (lines.length === 1) {
    return `{"type":"text","text":"${escapeJsonString(text)}"}`;
  }

  return lines
    .map((line, index) => {
      const textNode = `{"type":"text","text":"${escapeJsonString(line)}"}`;

      if (index < lines.length - 1) {
        return `${textNode},{"type":"hardBreak"}`;
      }

      return textNode;
    })
    .join(',');
};

export const resolveRichTextVariables = (
  input: string | null | undefined,
  context: Record<string, unknown>,
): string | undefined => {
  if (!isDefined(input)) {
    return undefined;
  }

  return input.replace(
    VARIABLE_TAG_PATTERN,
    (_, variableTypeFirst: string, variableAttrsFirst: string) => {
      const variable = variableTypeFirst ?? variableAttrsFirst;
      const resolvedValue = evalFromContext(variable, context);
      const textValue = isDefined(resolvedValue) ? String(resolvedValue) : '';

      return buildTextNodesWithLineBreaks(textValue);
    },
  );
};
