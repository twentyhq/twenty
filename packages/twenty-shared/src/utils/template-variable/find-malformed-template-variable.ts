import { replaceTemplateVariables } from './replace-template-variables';

export const findMalformedTemplateVariable = (
  template: string,
): string | undefined => {
  const templateWithoutValidVariables = replaceTemplateVariables(
    template,
    () => '',
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
