import { type BuildSystemPromptArguments } from 'src/engine/metadata-modules/ai/ai-chat/types/build-system-prompt-arguments.type';
import { buildSystemPromptSections } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-system-prompt-sections.util';

export const buildFullSystemPrompt = (
  args: BuildSystemPromptArguments,
): string =>
  buildSystemPromptSections(args)
    .map((section) => section.content)
    .join('\n');
