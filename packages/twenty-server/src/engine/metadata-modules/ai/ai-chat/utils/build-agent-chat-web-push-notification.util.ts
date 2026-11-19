import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  AgentChatThreadConversationType,
  getAgentChatPreviewPlainText,
  getAgentChatThreadDisplayLabel,
  getAgentChatWebPushNotificationTag,
} from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

import { type WebPushNotification } from 'src/engine/core-modules/web-push/types/web-push-notification.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const buildAgentChatWebPushNotification = ({
  i18n,
  thread,
  recipientWorkspaceMemberId,
  workspaceMemberById,
  isPreviewEnabled,
  assistantDisplayName,
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
    Record<
      string,
      Pick<WorkspaceMemberWorkspaceEntity, 'id' | 'name' | 'userEmail'>
    >
  >;
  isPreviewEnabled: boolean;
  assistantDisplayName: string;
}): Omit<WebPushNotification, 'renotify'> => {
  const url = getAppPath(AppPath.AiChatInbox, { threadId: thread.id });
  const tag = getAgentChatWebPushNotificationTag(thread.id);
  const newMessageLabel = i18n._(msg`New message`);

  if (!isPreviewEnabled) {
    return { title: newMessageLabel, body: '', url, tag };
  }

  const formerMemberName = i18n._(msg`Former member`);
  const isDirectMessage =
    thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE;
  const threadLabel = getAgentChatThreadDisplayLabel({
    thread,
    currentWorkspaceMemberId: recipientWorkspaceMemberId,
    workspaceMembers: Object.values(workspaceMemberById).filter(isDefined),
    fallbackLabel: i18n._(msg`New chat`),
    formerMemberLabel: formerMemberName,
  });
  const senderWorkspaceMemberId = thread.lastMessageSenderWorkspaceMemberId;
  const senderWorkspaceMember = isDefined(senderWorkspaceMemberId)
    ? workspaceMemberById[senderWorkspaceMemberId]
    : undefined;
  const senderName =
    (isDefined(senderWorkspaceMember)
      ? getWorkspaceMemberNameOrEmail(senderWorkspaceMember)
      : null) ?? formerMemberName;
  const previewText = getAgentChatPreviewPlainText({
    markdown: thread.lastMessageText ?? '',
    assistantDisplayName,
  });

  return {
    title:
      isDirectMessage || !isDefined(senderWorkspaceMemberId)
        ? threadLabel
        : i18n._(msg`${senderName} in ${threadLabel}`),
    body: isNonEmptyString(previewText) ? previewText : newMessageLabel,
    url,
    tag,
  };
};
