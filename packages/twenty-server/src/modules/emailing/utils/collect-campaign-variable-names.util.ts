import { type EmailDocumentNode } from 'twenty-shared/utils';

import { collectCampaignVariableNamesFromString } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-string.util';

// Collects every {{variable}} referenced anywhere substitution happens at
// send time: text, variable chips, button and image URLs, link marks and raw
// HTML blocks. Mirrors the traversal in render-campaign-body.util so a
// variable this misses is a variable that would not be substituted either.
export const collectCampaignVariableNames = (
  node: EmailDocumentNode,
): Set<string> => {
  const names = new Set<string>();

  const collectFrom = (value: unknown): void => {
    for (const name of collectCampaignVariableNamesFromString(value)) {
      names.add(name);
    }
  };

  const walk = (currentNode: EmailDocumentNode): void => {
    collectFrom(currentNode.text);
    collectFrom(currentNode.attrs?.variable);
    collectFrom(currentNode.attrs?.href);
    collectFrom(currentNode.attrs?.html);

    if (Array.isArray(currentNode.marks)) {
      for (const mark of currentNode.marks) {
        if (typeof mark === 'object' && mark !== null && 'attrs' in mark) {
          collectFrom(
            (mark.attrs as Record<string, unknown> | undefined)?.href,
          );
        }
      }
    }

    for (const childNode of currentNode.content ?? []) {
      walk(childNode);
    }
  };

  walk(node);

  return names;
};
