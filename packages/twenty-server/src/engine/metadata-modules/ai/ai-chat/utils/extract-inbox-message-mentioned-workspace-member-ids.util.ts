import { extractRecordReferenceIds } from 'twenty-shared/ai';
import { getMarkdownTextChatReferences } from 'twenty-shared/markdown';

export const extractInboxMessageMentionedWorkspaceMemberIds = (
  text: string,
): string[] =>
  extractRecordReferenceIds({
    text: getMarkdownTextChatReferences(text)
      .map(({ fullMatch }) => fullMatch)
      .join('\n'),
    objectNameSingular: 'workspaceMember',
  });
