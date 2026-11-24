import { isNonEmptyString } from '@sniptt/guards';
import { type ToolRecordReference } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_SEARCH_ANSWER_MAX_ANSWER_CHARACTERS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-answer-characters.constant';
import { type AiSearchAnswerModelOutput } from 'src/engine/metadata-modules/ai/ai-search-answer/schemas/ai-search-answer-model-output.schema';
import { type AiSearchAnswerResponse } from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-response.type';
import { truncateAiSearchAnswerText } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/truncate-ai-search-answer-text.util';

const normalizeReference = (reference: string) =>
  reference
    .trim()
    .replace(/^\[|\]$/g, '')
    .toUpperCase();

// An answer that cites none of the records the model was given is not grounded, so it becomes a handoff
export const resolveAiSearchAnswerResponse = ({
  output,
  sourcesByReference,
}: {
  output: AiSearchAnswerModelOutput;
  sourcesByReference: Map<string, ToolRecordReference>;
}): AiSearchAnswerResponse => {
  const text = output.answer.trim();

  if (output.status === 'handoff' || !isNonEmptyString(text)) {
    return { kind: 'handoff' };
  }

  const sources = [...new Set(output.sourceReferences.map(normalizeReference))]
    .map((reference) => sourcesByReference.get(reference))
    .filter(isDefined);

  if (sources.length === 0) {
    return { kind: 'handoff' };
  }

  return {
    kind: 'answer',
    text: truncateAiSearchAnswerText(
      text,
      AI_SEARCH_ANSWER_MAX_ANSWER_CHARACTERS,
    ),
    sources,
  };
};
