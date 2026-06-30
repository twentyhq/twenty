import { type UIMessage } from 'ai';

import { replaceUnsupportedFileParts } from 'src/engine/metadata-modules/ai/ai-chat/utils/replace-unsupported-file-parts.util';

const buildFilePart = (mediaType: string, filename = 'file.bin') => ({
  type: 'file' as const,
  mediaType,
  filename,
  url: 'https://example.com/file',
  fileId: 'file-id',
});

const buildUserMessage = (parts: UIMessage['parts']): UIMessage => ({
  id: 'message-id',
  role: 'user',
  parts,
});

describe('replaceUnsupportedFileParts', () => {
  it('keeps file parts whose MIME type is in the native set', () => {
    const messages = [buildUserMessage([buildFilePart('image/png')])];

    const result = replaceUnsupportedFileParts(messages, ['image'], false);

    expect(result[0].parts[0]).toEqual(buildFilePart('image/png'));
  });

  it('keeps code-interpreter file parts when the interpreter is enabled', () => {
    const messages = [buildUserMessage([buildFilePart('text/csv')])];

    const result = replaceUnsupportedFileParts(messages, [], true);

    expect(result[0].parts[0]).toMatchObject({ type: 'file' });
  });

  it('downgrades code-interpreter file parts when the interpreter is disabled', () => {
    const messages = [
      buildUserMessage([buildFilePart('text/csv', 'data.csv')]),
    ];

    const result = replaceUnsupportedFileParts(messages, [], false);

    expect(result[0].parts[0]).toMatchObject({ type: 'text' });
  });

  it('replaces unsupported file parts with a text note', () => {
    const messages = [
      buildUserMessage([buildFilePart('video/mp4', 'clip.mp4')]),
    ];

    const result = replaceUnsupportedFileParts(messages, [], true);

    expect(result[0].parts[0]).toEqual({
      type: 'text',
      text: '[Attached file: clip.mp4 (type: video/mp4) — file type is not supported for direct analysis]',
    });
  });

  it('downgrades native-only files when the model declares no modalities', () => {
    const messages = [buildUserMessage([buildFilePart('image/png')])];

    const result = replaceUnsupportedFileParts(messages, [], true);

    expect(result[0].parts[0]).toMatchObject({ type: 'text' });
  });

  it('does not touch non-user messages', () => {
    const assistantMessage: UIMessage = {
      id: 'assistant-id',
      role: 'assistant',
      parts: [{ type: 'text', text: 'hello' }],
    };

    const result = replaceUnsupportedFileParts([assistantMessage], [], true);

    expect(result[0]).toBe(assistantMessage);
  });
});
