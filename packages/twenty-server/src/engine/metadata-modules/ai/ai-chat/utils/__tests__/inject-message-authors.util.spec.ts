import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { injectMessageAuthors } from 'src/engine/metadata-modules/ai/ai-chat/utils/inject-message-authors.util';

const PARTICIPANTS = [
  { userWorkspaceId: 'tim', displayName: 'Tim Apple' },
  { userWorkspaceId: 'jony', displayName: 'Jony Ive' },
];

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
      PARTICIPANTS,
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

  it('leaves messages untouched when the thread has a single participant', () => {
    const messages = [buildUserMessage('tim', 'hello')];

    expect(injectMessageAuthors(messages, [PARTICIPANTS[0]])).toBe(messages);
  });

  it('skips assistant messages and messages without a known author', () => {
    const assistantMessage: ExtendedUIMessage = {
      id: 'assistant',
      role: 'assistant',
      parts: [{ type: 'text', text: 'sure' }],
    };

    const result = injectMessageAuthors(
      [assistantMessage, buildUserMessage(null, 'legacy')],
      PARTICIPANTS,
    );

    expect(result[0]).toBe(assistantMessage);
    expect(result[1].parts).toEqual([{ type: 'text', text: 'legacy' }]);
  });
});
