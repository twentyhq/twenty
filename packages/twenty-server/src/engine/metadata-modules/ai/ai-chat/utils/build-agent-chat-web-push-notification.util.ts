import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  AgentChatThreadConversationType,
  getAgentChatWebPushNotificationTag,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type WebPushNotification } from 'src/engine/core-modules/web-push/types/web-push-notification.type';
import { getAgentChatPreviewPlainText } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-preview-plain-text.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const buildAgentChatWebPushNotification = ({
  i18n,
  thread,
  recipientWorkspaceMemberId,
  workspaceMemberById,
  isPreviewEnabled,
}: {
  i18n: I18n;
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    | 'id'
    | 'title'
    | 'conversationType'
    | 'directMessageFirstWorkspaceMemberId'
    | 'directMessageSecondWorkspaceMemberId'
    | 'lastMessageText'
    | 'lastMessageSenderWorkspaceMemberId'
  >;
  recipientWorkspaceMemberId: string;
  workspaceMemberById: Partial<
    Record<string, Pick<WorkspaceMemberWorkspaceEntity, 'name' | 'userEmail'>>
  >;
  isPreviewEnabled: boolean;
}): Omit<WebPushNotification, 'renotify'> => {
  const url = `/inbox/${thread.id}`;
  const tag = getAgentChatWebPushNotificationTag(thread.id);
  const newMessageLabel = i18n._(msg`New message`);

  if (!isPreviewEnabled) {
    return { title: newMessageLabel, body: '', url, tag };
  }

  const formerMemberName = i18n._(msg`Former member`);

  const getWorkspaceMemberName = (workspaceMemberId: string | null): string => {
    const workspaceMember = isDefined(workspaceMemberId)
      ? workspaceMemberById[workspaceMemberId]
      : undefined;

    if (!isDefined(workspaceMember)) {
      return formerMemberName;
    }

    const fullName =
      `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

    return isNonEmptyString(fullName)
      ? fullName
      : (workspaceMember.userEmail ?? formerMemberName);
  };

  const isDirectMessage =
    thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE;
  const directMessagePeerWorkspaceMemberId =
    thread.directMessageFirstWorkspaceMemberId === recipientWorkspaceMemberId
      ? thread.directMessageSecondWorkspaceMemberId
      : thread.directMessageFirstWorkspaceMemberId;
  const chatLabel = isNonEmptyString(thread.title)
    ? thread.title
    : i18n._(msg`New chat`);
  const threadLabel = isDirectMessage
    ? getWorkspaceMemberName(directMessagePeerWorkspaceMemberId)
    : chatLabel;
  const senderWorkspaceMemberId = thread.lastMessageSenderWorkspaceMemberId;
  const senderName = isDefined(senderWorkspaceMemberId)
    ? getWorkspaceMemberName(senderWorkspaceMemberId)
    : null;
  const previewText = getAgentChatPreviewPlainText(
    thread.lastMessageText ?? '',
  );

  return {
    title:
      isDefined(senderName) && !isDirectMessage
        ? i18n._(msg`${senderName} in ${threadLabel}`)
        : threadLabel,
    body: isNonEmptyString(previewText) ? previewText : newMessageLabel,
    url,
    tag,
  };
};
