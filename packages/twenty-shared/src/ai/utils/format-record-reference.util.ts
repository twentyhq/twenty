import { isAgentChatAssistantReference } from './is-agent-chat-assistant-reference.util';

const UNENCODED_REFERENCE_LABEL_PUNCTUATION_REGEX = /[!'()*_~.-]/g;

export const formatRecordReference = ({
  objectNameSingular,
  recordId,
  displayName,
}: {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
}): string => {
  const label = isAgentChatAssistantReference({ objectNameSingular, recordId })
    ? encodeURIComponent(displayName).replace(
        UNENCODED_REFERENCE_LABEL_PUNCTUATION_REGEX,
        (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
      )
    : displayName;

  return `[[record:${objectNameSingular}:${recordId}:${label}]]`;
};
