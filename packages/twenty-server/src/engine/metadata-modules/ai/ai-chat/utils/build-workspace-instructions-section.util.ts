import { isNonEmptyString } from '@sniptt/guards';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

export const buildWorkspaceInstructionsSection = (
  instructions: string,
): string => {
  const projectedInstructions = tipTapDocumentToMarkdown(instructions).trim();

  if (!isNonEmptyString(projectedInstructions)) {
    return '';
  }

  return `
## Workspace Instructions

The following are custom instructions provided by the workspace administrator:

${projectedInstructions}`;
};
