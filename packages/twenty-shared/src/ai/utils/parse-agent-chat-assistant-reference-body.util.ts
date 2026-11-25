import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from '../constants/agent-chat-assistant-mention-object-name-singular.const';
import { CHAT_REFERENCE_BODY_PATTERN } from '../constants/chat-reference-body-pattern.const';
import { isDefined } from '../../utils/validation/isDefined';

type ParsedAgentChatAssistantReferenceBody = {
  kind: 'record';
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

const AGENT_CHAT_ASSISTANT_REFERENCE_BODY_REGEX = new RegExp(
  `^record:${AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR}:${AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR}:(${CHAT_REFERENCE_BODY_PATTERN})$`,
);

export const parseAgentChatAssistantReferenceBody = (
  body: string,
): ParsedAgentChatAssistantReferenceBody | undefined => {
  const match = body.match(AGENT_CHAT_ASSISTANT_REFERENCE_BODY_REGEX);

  if (!isDefined(match) || match[0] !== body) {
    return undefined;
  }

  const [, displayName] = match;

  if (!isDefined(displayName)) {
    return undefined;
  }

  return {
    kind: 'record',
    objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
    recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
    displayName,
  };
};
