import { FileFolder } from 'twenty-shared/types';

import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const APPLICATION_ID = 'application-id';
const MEMBER_A = 'user-workspace-a';
const MEMBER_B = 'user-workspace-b';

const buildTurn = ({
  turnId,
  senderUserWorkspaceId,
  question,
  answer,
}: {
  turnId: string;
  senderUserWorkspaceId: string | null;
  question: string;
  answer: string;
}) => [
  {
    id: `${turnId}-user`,
    turnId,
    role: 'user',
    senderUserWorkspaceId,
    senderApplicationId: APPLICATION_ID,
    parts: [{ type: 'text', textContent: question }],
  },
  {
    id: `${turnId}-assistant`,
    turnId,
    role: 'assistant',
    senderUserWorkspaceId: null,
    senderApplicationId: null,
    parts: [
      {
        type: 'tool-find_companies',
        toolCallId: `${turnId}-call`,
        toolInput: {},
        toolOutput: { records: [{ name: 'Private Co' }] },
        state: 'output-available',
      },
      { type: 'text', textContent: answer },
    ],
  },
];

const buildService = (messages: unknown[]) => {
  const messageRepository = { find: jest.fn().mockResolvedValue(messages) };
  const fileUrlService = {
    signFileByIdUrl: jest
      .fn()
      .mockImplementation(({ fileId }) => `https://files/${fileId}`),
  };

  const service = new AgentConversationReaderService(
    messageRepository as never,
    fileUrlService as never,
  );

  return { service, messageRepository, fileUrlService };
};

const buildFileMessage = ({
  turnId,
  senderUserWorkspaceId,
}: {
  turnId: string;
  senderUserWorkspaceId: string;
}) => ({
  id: `${turnId}-user`,
  turnId,
  role: 'user',
  senderUserWorkspaceId,
  senderApplicationId: APPLICATION_ID,
  parts: [
    { type: 'text', textContent: 'What does this deck say?' },
    {
      type: 'file',
      fileId: 'file-1',
      fileFilename: 'deck.pdf',
      file: { mimeType: 'application/pdf' },
    },
  ],
});

const getPartTypes = (message: { parts: { type: string }[] }) =>
  message.parts.map((part) => part.type);

describe('AgentConversationReaderService', () => {
  it('keeps every part when no actor is given', async () => {
    const { service } = buildService([
      ...buildTurn({
        turnId: 'turn-1',
        senderUserWorkspaceId: MEMBER_A,
        question: 'Who is our biggest customer?',
        answer: 'Private Co',
      }),
    ]);

    const messages = await service.loadMessages({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
    });

    expect(getPartTypes(messages[1])).toEqual(['tool-find_companies', 'text']);
  });

  it('reduces turns sent by someone else to their text', async () => {
    const { service } = buildService([
      ...buildTurn({
        turnId: 'turn-1',
        senderUserWorkspaceId: MEMBER_A,
        question: 'Who is our biggest customer?',
        answer: 'Private Co',
      }),
      ...buildTurn({
        turnId: 'turn-2',
        senderUserWorkspaceId: MEMBER_B,
        question: 'And the second one?',
        answer: 'Other Co',
      }),
    ]);

    const messages = await service.loadMessages({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      actor: { type: 'user', userWorkspaceId: MEMBER_B },
    });

    expect(messages.map(getPartTypes)).toEqual([
      ['text'],
      ['text'],
      ['text'],
      ['tool-find_companies', 'text'],
    ]);
  });

  it('treats a member and the application acting alone as different actors', async () => {
    const { service } = buildService([
      ...buildTurn({
        turnId: 'turn-1',
        senderUserWorkspaceId: MEMBER_A,
        question: 'Who is our biggest customer?',
        answer: 'Private Co',
      }),
      ...buildTurn({
        turnId: 'turn-2',
        senderUserWorkspaceId: null,
        question: 'Summarize this thread',
        answer: 'Done',
      }),
    ]);

    const messages = await service.loadMessages({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      actor: { type: 'application', applicationId: APPLICATION_ID },
    });

    expect(messages.map(getPartTypes)).toEqual([
      ['text'],
      ['text'],
      ['text'],
      ['tool-find_companies', 'text'],
    ]);
  });

  it('loads files with their type and signs them for the actor', async () => {
    const { service, messageRepository, fileUrlService } = buildService([
      buildFileMessage({ turnId: 'turn-1', senderUserWorkspaceId: MEMBER_A }),
    ]);

    const messages = await service.loadMessages({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      actor: { type: 'user', userWorkspaceId: MEMBER_A },
    });

    expect(messageRepository.find).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ relations: ['parts', 'parts.file'] }),
    );
    expect(fileUrlService.signFileByIdUrl).toHaveBeenCalledWith({
      fileId: 'file-1',
      workspaceId: WORKSPACE_ID,
      fileFolder: FileFolder.AgentChat,
    });
    expect(messages[0].parts[1]).toEqual({
      type: 'file',
      fileId: 'file-1',
      filename: 'deck.pdf',
      mediaType: 'application/pdf',
      url: 'https://files/file-1',
    });
  });

  it('drops the files of turns sent by someone else without signing them', async () => {
    const { service, fileUrlService } = buildService([
      buildFileMessage({ turnId: 'turn-1', senderUserWorkspaceId: MEMBER_A }),
    ]);

    const messages = await service.loadMessages({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      actor: { type: 'user', userWorkspaceId: MEMBER_B },
    });

    expect(getPartTypes(messages[0])).toEqual(['text']);
    expect(fileUrlService.signFileByIdUrl).not.toHaveBeenCalled();
  });
});
