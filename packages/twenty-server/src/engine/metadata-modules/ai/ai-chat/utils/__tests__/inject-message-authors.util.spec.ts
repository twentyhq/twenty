import { type ExtendedUIMessage } from 'twenty-shared/ai';

import {
  collectMessageAuthorUserWorkspaceIds,
  injectMessageAuthors,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/inject-message-authors.util';

const DISPLAY_NAMES = new Map([
  ['tim', 'Tim Apple'],
  ['jony', 'Jony Ive'],
]);

const buildUserMessage = (
  authorUserWorkspaceId: string | null,
  text: string,
): ExtendedUIMessage => ({
  id: text,
  role: 'user',
  parts: [{ type: 'text', text }],
  metadata: { createdAt: '2026-09-17T00:00:00.000Z', authorUserWorkspaceId },
});

describe('injectMessageAuthors', () => {
  it('prefixes user messages with their author in a shared thread', () => {
    const [timMessage, jonyMessage] = injectMessageAuthors(
      [buildUserMessage('tim', 'hello'), buildUserMessage('jony', 'hi')],
      { isShared: true, displayNameByUserWorkspaceId: DISPLAY_NAMES },
    );

    expect(timMessage.parts[0]).toEqual({
      type: 'text',
      text: '<message_author>From: Tim Apple</message_author>',
    });
    expect(jonyMessage.parts[0]).toEqual({
      type: 'text',
      text: '<message_author>From: Jony Ive</message_author>',
    });
    expect(timMessage.parts[1]).toEqual({ type: 'text', text: 'hello' });
  });

  it('leaves messages untouched when the thread is private', () => {
    const messages = [buildUserMessage('tim', 'hello')];

    expect(
      injectMessageAuthors(messages, {
        isShared: false,
        displayNameByUserWorkspaceId: DISPLAY_NAMES,
      }),
    ).toBe(messages);
  });

  it('skips assistant messages and messages without a known author', () => {
    const assistantMessage: ExtendedUIMessage = {
      id: 'assistant',
      role: 'assistant',
      parts: [{ type: 'text', text: 'sure' }],
    };

    const result = injectMessageAuthors(
      [assistantMessage, buildUserMessage(null, 'legacy')],
      { isShared: true, displayNameByUserWorkspaceId: DISPLAY_NAMES },
    );

    expect(result[0]).toBe(assistantMessage);
    expect(result[1].parts).toEqual([{ type: 'text', text: 'legacy' }]);
  });
});

describe('collectMessageAuthorUserWorkspaceIds', () => {
  it('returns the distinct authors of user messages', () => {
    expect(
      collectMessageAuthorUserWorkspaceIds([
        buildUserMessage('tim', 'a'),
        buildUserMessage('jony', 'b'),
        buildUserMessage('tim', 'c'),
        buildUserMessage(null, 'd'),
        { id: 'x', role: 'assistant', parts: [] },
      ]),
    ).toEqual(['tim', 'jony']);
  });
});
