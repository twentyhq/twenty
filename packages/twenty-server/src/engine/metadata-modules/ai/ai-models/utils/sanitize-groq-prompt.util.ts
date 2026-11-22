import {
  type LanguageModelV4Message,
  type LanguageModelV4Prompt,
} from '@ai-sdk/provider';

type LanguageModelV4AssistantMessage = Extract<
  LanguageModelV4Message,
  { role: 'assistant' }
>;

// Groq rejects historical assistant reasoning_content with HTTP 400 (#30436).
// Omitting reasoning parts prevents OpenAI-compatible serialization from including reasoning_content.
const sanitizeAssistantMessage = (
  message: LanguageModelV4AssistantMessage,
): LanguageModelV4AssistantMessage => {
  const contentWithoutReasoning = message.content.filter(
    (part) => part.type !== 'reasoning',
  );

  if (contentWithoutReasoning.length === 0) {
    return {
      ...message,
      content: [{ type: 'text', text: '' }],
    };
  }

  return {
    ...message,
    content: contentWithoutReasoning,
  };
};

export const sanitizeGroqPrompt = (
  prompt: LanguageModelV4Prompt,
): LanguageModelV4Prompt =>
  prompt.map((message) =>
    message.role === 'assistant' ? sanitizeAssistantMessage(message) : message,
  );
