import { setupI18n } from '@lingui/core';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { buildAgentChatWebPushNotification } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-web-push-notification.util';

const i18n = setupI18n({ locale: 'en', messages: { en: {} } });

const ME = 'member-me';
const FELIX = 'member-felix';

const workspaceMemberById = {
  [FELIX]: {
    id: FELIX,
    name: { firstName: 'Felix', lastName: 'Martin' },
    userEmail: 'felix@example.com',
  },
  [ME]: {
    id: ME,
    name: { firstName: 'Grace', lastName: 'Hopper' },
    userEmail: 'grace@example.com',
  },
};

const channelThread = {
  id: 'thread-1',
  title: 'Roadmap',
  conversationType: AgentChatThreadConversationType.STANDARD,
  directMessageFirstWorkspaceMemberId: null,
  directMessageSecondWorkspaceMemberId: null,
  assigneeId: null,
  lastActivityAt: '2026-11-16T10:00:00.000Z',
  lastMessageText: 'Ship it on Friday',
  lastMessageSenderWorkspaceMemberId: FELIX,
  deletedAt: null,
};

const build = (
  overrides: Partial<Parameters<typeof buildAgentChatWebPushNotification>[0]>,
) =>
  buildAgentChatWebPushNotification({
    i18n,
    thread: channelThread,
    recipientWorkspaceMemberId: ME,
    workspaceMemberById,
    isPreviewEnabled: true,
    ...overrides,
  });

describe('buildAgentChatWebPushNotification', () => {
  it('should name the sender and the chat', () => {
    expect(build({})).toEqual({
      title: 'Felix Martin in Roadmap',
      body: 'Ship it on Friday',
      url: '/inbox/thread-1',
      tag: 'inbox-thread-1',
    });
  });

  it('should only name the other member of a direct message', () => {
    expect(
      build({
        thread: {
          ...channelThread,
          title: null,
          conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
          directMessageFirstWorkspaceMemberId: FELIX,
          directMessageSecondWorkspaceMemberId: ME,
        },
      }).title,
    ).toBe('Felix Martin');
  });

  it('should hide the sender, the chat and the message text when the preview is off', () => {
    expect(build({ isPreviewEnabled: false })).toEqual({
      title: 'New message',
      body: '',
      url: '/inbox/thread-1',
      tag: 'inbox-thread-1',
    });
  });
});
