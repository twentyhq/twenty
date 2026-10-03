import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const buildTurnContextMessage = ({
  turnId,
  context,
}: {
  turnId: string;
  context: string;
}): ExtendedUIMessage => ({
  id: `turn-context-${turnId}`,
  role: 'user',
  parts: [
    {
      type: 'text',
      text: `<context note="Given to you to open this part of the conversation. The user did not write it and does not see it.">\n${context}\n</context>`,
    },
  ],
});
