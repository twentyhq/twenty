import { type UserModelMessage } from 'ai';

// Reminders use the user role because several providers (e.g. Bedrock,
// Mistral) reject system messages placed mid-conversation.
const buildReminderMessage = (text: string): UserModelMessage => ({
  role: 'user',
  content: [
    {
      type: 'text',
      text: `<system_reminder>\n${text}\n</system_reminder>`,
    },
  ],
});

export const buildStepCheckpointReminderMessage = (
  checkpointSteps: number,
): UserModelMessage =>
  buildReminderMessage(
    `You have reached the step checkpoint of ${checkpointSteps} tool-calling steps for this request. Stop calling tools now. Reply with text only: summarize the progress made so far, list what remains to be done, and ask the user whether you should continue.`,
  );

export const buildRepeatedToolCallWarningMessage = (
  toolName: string,
): UserModelMessage =>
  buildReminderMessage(
    `You have called the tool "${toolName}" repeatedly with identical input. Do not repeat this exact call. Change your approach, or stop and ask the user how to proceed. If you make the same call again, this run will be stopped.`,
  );

export const buildRepeatedToolCallStopReminderMessage = (
  toolName: string,
): UserModelMessage =>
  buildReminderMessage(
    `You repeated the tool call "${toolName}" with identical input after being warned. Stop calling tools now. Reply with text only: summarize the progress made so far, explain what is blocking you, and ask the user how to proceed.`,
  );
