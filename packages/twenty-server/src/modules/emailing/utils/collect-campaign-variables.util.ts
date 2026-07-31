import { type EmailDocumentNode } from 'twenty-shared/utils';

import { CAMPAIGN_VARIABLE_PATTERN } from 'src/modules/emailing/utils/render-campaign-template.util';

const collectFromString = (value: unknown, names: Set<string>): void => {
  if (typeof value !== 'string') {
    return;
  }

  for (const match of value.matchAll(CAMPAIGN_VARIABLE_PATTERN)) {
    names.add(match[1]);
  }
};

// Collects every {{variable}} referenced anywhere substitution happens at
// send time: text, variable chips, button and image URLs, link marks and raw
// HTML blocks. Mirrors the traversal in render-campaign-body.util so a
// variable this misses is a variable that would not be substituted either.
export const collectCampaignVariableNames = (
  node: EmailDocumentNode,
): Set<string> => {
  const names = new Set<string>();

  const walk = (currentNode: EmailDocumentNode): void => {
    collectFromString(currentNode.text, names);
    collectFromString(currentNode.attrs?.variable, names);
    collectFromString(currentNode.attrs?.href, names);
    collectFromString(currentNode.attrs?.html, names);

    if (Array.isArray(currentNode.marks)) {
      for (const mark of currentNode.marks) {
        if (typeof mark === 'object' && mark !== null && 'attrs' in mark) {
          collectFromString(
            (mark.attrs as Record<string, unknown> | undefined)?.href,
            names,
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
