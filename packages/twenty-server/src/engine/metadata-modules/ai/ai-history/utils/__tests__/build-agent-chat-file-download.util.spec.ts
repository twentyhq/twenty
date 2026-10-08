import { generateText, type ModelMessage } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';

import { buildAgentChatFileDownload } from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-chat-file-download.util';

const FILE_ID = '1b4e28ba-2fa1-41d2-883f-0016d3cca427';
const SERVER_URL = 'http://192.168.1.20:3000';
const PNG_BYTES = Buffer.from([137, 80, 78, 71]);

const buildMessagesWithFile = (url: string): ModelMessage[] => [
  {
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this image?' },
      { type: 'file', data: new URL(url), mediaType: 'image/png' },
    ],
  },
];

const buildModel = (supportedUrls: Record<string, RegExp[]> = {}) =>
  new MockLanguageModelV4({
    supportedUrls,
    doGenerate: {
      content: [{ type: 'text', text: 'A logo' }],
      finishReason: { unified: 'stop', raw: 'stop' },
      usage: {
        inputTokens: {
          total: 1,
          noCache: 1,
          cacheRead: undefined,
          cacheWrite: undefined,
        },
        outputTokens: { total: 1, text: 1, reasoning: undefined },
      },
      warnings: [],
    },
  });

const getSentFileData = (model: MockLanguageModelV4) => {
  const [userMessage] = model.doGenerateCalls[0].prompt;

  if (userMessage.role !== 'user') {
    throw new Error('Expected the prompt to start with the user message');
  }

  const filePart = userMessage.content.find((part) => part.type === 'file');

  return filePart?.data;
};

describe('buildAgentChatFileDownload', () => {
  const readAgentChatFile = async (fileId: string) =>
    fileId === FILE_ID ? { buffer: PNG_BYTES, mimeType: 'image/png' } : null;

  const download = buildAgentChatFileDownload({
    serverUrl: SERVER_URL,
    readAgentChatFile,
  });

  it('should let the SDK reject a private server URL without the download function', async () => {
    const model = buildModel();

    await expect(
      generateText({
        model,
        messages: buildMessagesWithFile(
          `${SERVER_URL}/file/agent-chat/${FILE_ID}?token=token`,
        ),
      }),
    ).rejects.toThrow('URL with IP address 192.168.1.20 is not allowed');
  });

  it('should send the stored file bytes when the model cannot fetch the URL', async () => {
    const model = buildModel();

    const result = await generateText({
      model,
      messages: buildMessagesWithFile(
        `${SERVER_URL}/file/agent-chat/${FILE_ID}?token=token`,
      ),
      experimental_download: download,
    });

    expect(result.text).toBe('A logo');
    expect(getSentFileData(model)).toEqual({
      type: 'data',
      data: new Uint8Array(PNG_BYTES),
    });
  });

  it('should keep passing the URL to models that fetch it themselves', async () => {
    const model = buildModel({ 'image/*': [/^http:\/\/192\.168\.1\.20/] });

    await generateText({
      model,
      messages: buildMessagesWithFile(
        `${SERVER_URL}/file/agent-chat/${FILE_ID}?token=token`,
      ),
      experimental_download: download,
    });

    expect(getSentFileData(model)).toEqual({
      type: 'url',
      url: new URL(`${SERVER_URL}/file/agent-chat/${FILE_ID}?token=token`),
    });
  });

  it('should fail when the agent chat file no longer exists', async () => {
    const model = buildModel();

    await expect(
      generateText({
        model,
        messages: buildMessagesWithFile(
          `${SERVER_URL}/file/agent-chat/2c5f39cb-3fb2-42e3-994f-1127e4ddb538?token=token`,
        ),
        experimental_download: download,
      }),
    ).rejects.toThrow('not found');
  });

  it('should keep the SDK download safeguards for other URLs', async () => {
    const model = buildModel();

    await expect(
      generateText({
        model,
        messages: buildMessagesWithFile('http://10.0.0.5/secret.png'),
        experimental_download: download,
      }),
    ).rejects.toThrow('URL with IP address 10.0.0.5 is not allowed');
  });
});
