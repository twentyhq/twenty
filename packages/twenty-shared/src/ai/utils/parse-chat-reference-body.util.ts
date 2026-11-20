import { CHAT_REFERENCE_IDENTITY_SHAPE_BY_KIND } from '@/ai/constants/chat-reference-identity-shape-by-kind.const';
import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { type ChatReferenceKind } from '@/ai/types/ChatReferenceKind';
import { parseAgentChatAssistantReferenceBody } from '@/ai/utils/parse-agent-chat-assistant-reference-body.util';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { isDefined } from '@/utils/validation/isDefined';

type ParsedChatReferenceBody = ChatReferenceIdentity & { displayName: string };

const CHAT_REFERENCE_KINDS: string[] = Object.keys(
  CHAT_REFERENCE_IDENTITY_SHAPE_BY_KIND,
);

const isChatReferenceKind = (
  segment: string | undefined,
): segment is ChatReferenceKind =>
  isDefined(segment) && CHAT_REFERENCE_KINDS.includes(segment);

const getChatReferenceIdentity = ({
  kind,
  segments: [firstSegment = '', secondSegment = ''],
}: {
  kind: ChatReferenceKind;
  segments: string[];
}): ChatReferenceIdentity => {
  switch (kind) {
    case 'record':
      return {
        kind,
        objectNameSingular: firstSegment,
        recordId: secondSegment,
      };
    case 'records':
      return { kind, objectMetadataId: firstSegment };
    case 'object':
      return { kind, objectNameSingular: firstSegment };
    case 'field':
      return {
        kind,
        objectNameSingular: firstSegment,
        fieldName: secondSegment,
      };
    case 'view':
      return { kind, viewId: firstSegment };
    case 'role':
      return { kind, roleId: firstSegment };
    case 'app':
      return { kind, applicationId: firstSegment };
    case 'skill':
      return { kind, skillId: firstSegment };
    default:
      return assertUnreachable(kind);
  }
};

const parseSegments = ({
  kind,
  segments,
}: {
  kind: ChatReferenceKind;
  segments: string[];
}): ParsedChatReferenceBody | undefined => {
  const shape = CHAT_REFERENCE_IDENTITY_SHAPE_BY_KIND[kind];
  const identitySegments = segments.slice(0, shape.length);
  const hasLabel = segments.length > shape.length;

  if (
    !hasLabel ||
    !shape.every((regex, index) => regex.test(identitySegments[index] ?? ''))
  ) {
    return undefined;
  }

  return {
    ...getChatReferenceIdentity({ kind, segments: identitySegments }),
    displayName: segments.slice(shape.length).join(':'),
  };
};

export const parseChatReferenceBody = (
  body: string,
): ParsedChatReferenceBody | undefined => {
  const assistantReference = parseAgentChatAssistantReferenceBody(body);

  if (isDefined(assistantReference)) {
    return assistantReference;
  }

  const segments = body.split(':');
  const [kindPrefix, ...identityAndLabel] = segments;

  // A known prefix with a malformed identity is a retired marker, so it must not fall through to the unprefixed record form.
  if (isChatReferenceKind(kindPrefix)) {
    return parseSegments({ kind: kindPrefix, segments: identityAndLabel });
  }

  return parseSegments({ kind: 'record', segments });
};
