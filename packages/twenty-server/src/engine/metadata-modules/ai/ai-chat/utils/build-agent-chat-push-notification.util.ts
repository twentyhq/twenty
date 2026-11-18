import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type WebPushNotification } from 'src/engine/core-modules/web-push/types/web-push-notification.type';
import { getAgentChatPushNotificationPreviewText } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-push-notification-preview-text.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const buildAgentChatPushNotification = ({
  i18n,
  thread,
  recipientWorkspaceMemberId,
  workspaceMembers,
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
  workspaceMembers: Pick<
    WorkspaceMemberWorkspaceEntity,
    'id' | 'name' | 'userEmail'
  >[];
  isPreviewEnabled: boolean;
}): Omit<WebPushNotification, 'renotify'> => {
  const getWorkspaceMemberName = (workspaceMemberId: string) => {
    const workspaceMember = workspaceMembers.find(
      ({ id }) => id === workspaceMemberId,
    );

    if (!isDefined(workspaceMember)) {
      return i18n._(msg`Former member`);
    }

    const fullName =
      `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

    return isNonEmptyString(fullName) ? fullName : workspaceMember.userEmail;
  };

  const isDirectMessage =
    thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE;
  const peerNames = [
    thread.directMessageFirstWorkspaceMemberId,
    thread.directMessageSecondWorkspaceMemberId,
  ]
    .filter(
      (workspaceMemberId): workspaceMemberId is string =>
        isDefined(workspaceMemberId) &&
        workspaceMemberId !== recipientWorkspaceMemberId,
    )
    .map(getWorkspaceMemberName);
  const chatLabel = isNonEmptyString(thread.title)
    ? thread.title
    : i18n._(msg`New chat`);
  const threadLabel = isDirectMessage
    ? peerNames.join(', ') || i18n._(msg`Former member`)
    : chatLabel;
  const senderWorkspaceMemberId = thread.lastMessageSenderWorkspaceMemberId;
  const senderName = isDefined(senderWorkspaceMemberId)
    ? getWorkspaceMemberName(senderWorkspaceMemberId)
    : null;
  const previewText = isPreviewEnabled
    ? getAgentChatPushNotificationPreviewText(thread.lastMessageText ?? '')
    : '';

  return {
    title:
      isDefined(senderName) && !isDirectMessage
        ? i18n._(msg`${senderName} in ${threadLabel}`)
        : threadLabel,
    body: isNonEmptyString(previewText)
      ? previewText
      : i18n._(msg`New message`),
    url: `/inbox/${thread.id}`,
    tag: `inbox-${thread.id}`,
  };
};
