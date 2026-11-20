import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { getAgentChatThreadDisplayLabel } from '@/ai/utils/get-agent-chat-thread-display-label.util';

const alice = {
  id: 'alice',
  name: { firstName: 'Alice', lastName: 'Smith' },
  userEmail: 'alice@example.com',
};

const bob = {
  id: 'bob',
  name: { firstName: 'Bob', lastName: 'Jones' },
  userEmail: 'bob@example.com',
};

const workspaceMembers = [alice, bob];

const directMessage = {
  title: 'An outdated pair name',
  conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
  directMessageFirstWorkspaceMemberId: 'alice',
  directMessageSecondWorkspaceMemberId: 'bob',
};

const displayOptions = {
  currentWorkspaceMemberId: 'alice',
  workspaceMembers,
  fallbackLabel: 'Untitled',
  formerMemberLabel: 'Former member',
};

describe('getAgentChatThreadDisplayLabel', () => {
  it('follows the current peer name and ignores stored titles', () => {
    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: directMessage,
      }),
    ).toBe('Bob Jones');

    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: directMessage,
        workspaceMembers: [
          alice,
          {
            ...bob,
            name: { firstName: 'Robert', lastName: 'Jones' },
          },
        ],
      }),
    ).toBe('Robert Jones');
  });

  it('selects the peer from either side of the canonical pair', () => {
    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: directMessage,
        currentWorkspaceMemberId: 'bob',
      }),
    ).toBe('Alice Smith');
  });

  it('falls back to email for unnamed peers and labels departed peers', () => {
    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: directMessage,
        workspaceMembers: [
          {
            ...bob,
            name: { firstName: '', lastName: '' },
          },
        ],
      }),
    ).toBe('bob@example.com');

    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: directMessage,
        workspaceMembers: [],
      }),
    ).toBe('Former member');
  });

  it('labels both pair members for another member who can read the conversation', () => {
    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: directMessage,
        currentWorkspaceMemberId: 'charlie',
      }),
    ).toBe('Alice Smith, Bob Jones');
  });

  it('preserves ordinary conversation titles and their fallback', () => {
    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: { title: 'Quarterly review' },
      }),
    ).toBe('Quarterly review');

    expect(
      getAgentChatThreadDisplayLabel({
        ...displayOptions,
        thread: { title: null },
      }),
    ).toBe('Untitled');
  });
});
