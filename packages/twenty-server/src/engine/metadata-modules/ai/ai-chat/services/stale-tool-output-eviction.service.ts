import { Injectable, Logger } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';
import { estimateToolOutputTokens } from 'src/engine/core-modules/tool-provider/utils/estimate-tool-output-tokens.util';
import { isToolOutputSuccessful } from 'src/engine/core-modules/tool-provider/utils/is-tool-output-successful.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  EVICTED_SPILLED_TOOL_OUTPUT_MESSAGE,
  EVICTED_TOOL_OUTPUT_MESSAGE,
  EVICTION_MIN_RECLAIMABLE_TOKENS,
  EVICTION_PROTECTED_TOOL_OUTPUT_TOKENS,
  EVICTION_SKIPPED_TRAILING_USER_TURNS,
} from 'src/engine/metadata-modules/ai/ai-chat/constants/stale-tool-output-eviction.const';

export type StaleToolOutputEvictionResult = {
  messages: ExtendedUIMessage[];
  evictedToolOutputCount: number;
  reclaimedTokens: number;
};

type SpillOutputRef = {
  fileId: string;
  filename?: string;
};

type ToolOutputPartPosition = {
  messageIndex: number;
  partIndex: number;
  estimatedTokens: number;
};

type EvictableToolOutputPart = ExtendedUIMessagePart & {
  state: 'output-available';
  output: unknown;
};

const extractSpillOutputRef = (output: unknown): SpillOutputRef | undefined => {
  if (!isObject(output)) {
    return undefined;
  }

  const envelopeCandidates = [
    (output as { result?: unknown }).result,
    output,
  ];

  for (const candidate of envelopeCandidates) {
    if (!isObject(candidate)) {
      continue;
    }

    const envelope = candidate as { spilled?: unknown; outputRef?: unknown };

    if (envelope.spilled !== true || !isObject(envelope.outputRef)) {
      continue;
    }

    const outputRef = envelope.outputRef as {
      fileId?: unknown;
      filename?: unknown;
    };

    if (typeof outputRef.fileId !== 'string') {
      continue;
    }

    return {
      fileId: outputRef.fileId,
      filename:
        typeof outputRef.filename === 'string' ? outputRef.filename : undefined,
    };
  }

  return undefined;
};

const isAlreadyEvictedOutput = (output: unknown): boolean =>
  isObject(output) && (output as { evicted?: unknown }).evicted === true;

// Only outputs the server executed itself are safe to rewrite: provider-executed
// results (native web search, ...) replay with provider-validated schemas.
const isEvictableToolOutputPart = (
  part: ExtendedUIMessagePart,
): part is EvictableToolOutputPart => {
  if (!isToolUIPart(part) || part.state !== 'output-available') {
    return false;
  }

  if (part.providerExecuted === true) {
    return false;
  }

  if (getToolName(part) === ASK_QUESTIONS_TOOL_NAME) {
    return false;
  }

  if (!isDefined(part.output) || isAlreadyEvictedOutput(part.output)) {
    return false;
  }

  return true;
};

const buildEvictedOutputStub = (output: unknown): object => {
  const success = isToolOutputSuccessful(output);
  const spillOutputRef = extractSpillOutputRef(output);

  if (!isDefined(spillOutputRef)) {
    return {
      evicted: true,
      success,
      message: EVICTED_TOOL_OUTPUT_MESSAGE,
    };
  }

  return {
    evicted: true,
    success,
    message: EVICTED_SPILLED_TOOL_OUTPUT_MESSAGE,
    result: {
      spilled: true,
      outputRef: spillOutputRef,
      hint: `Re-read the full output with ${OUTPUT_NAVIGATION_TOOL_NAMES.join(' or ')} using fileId "${spillOutputRef.fileId}" if needed.`,
    },
  };
};

const evictToolOutputPart = (
  part: ExtendedUIMessagePart,
): ExtendedUIMessagePart => {
  if (!isToolUIPart(part) || part.state !== 'output-available') {
    return part;
  }

  return {
    ...part,
    output: buildEvictedOutputStub(part.output),
  } as ExtendedUIMessagePart;
};

// Drops stale tool outputs from the copy of the conversation sent to the model.
// Runs at request-build time only — persisted message parts are never modified.
// Clearing is all-or-nothing per pass (min-reclaimable gate) because every edit
// invalidates the provider prompt-cache prefix from the edit point onward.
@Injectable()
export class StaleToolOutputEvictionService {
  private readonly logger = new Logger(StaleToolOutputEvictionService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  evictStaleToolOutputs(
    messages: ExtendedUIMessage[],
  ): StaleToolOutputEvictionResult {
    const unchangedResult: StaleToolOutputEvictionResult = {
      messages,
      evictedToolOutputCount: 0,
      reclaimedTokens: 0,
    };

    if (
      !this.twentyConfigService.get('AI_CHAT_STALE_TOOL_OUTPUT_EVICTION_ENABLED')
    ) {
      return unchangedResult;
    }

    const protectedTurnsStartIndex =
      this.findProtectedTurnsStartIndex(messages);

    if (protectedTurnsStartIndex <= 0) {
      return unchangedResult;
    }

    const evictablePositions = this.collectEvictablePositions(
      messages,
      protectedTurnsStartIndex,
    );

    const reclaimableTokens = evictablePositions.reduce(
      (sum, position) => sum + position.estimatedTokens,
      0,
    );

    if (reclaimableTokens < EVICTION_MIN_RECLAIMABLE_TOKENS) {
      return unchangedResult;
    }

    const evictablePartIndexesByMessage = new Map<number, Set<number>>();

    for (const position of evictablePositions) {
      const partIndexes =
        evictablePartIndexesByMessage.get(position.messageIndex) ??
        new Set<number>();

      partIndexes.add(position.partIndex);
      evictablePartIndexesByMessage.set(position.messageIndex, partIndexes);
    }

    const evictedMessages = messages.map((message, messageIndex) => {
      const partIndexes = evictablePartIndexesByMessage.get(messageIndex);

      if (!isDefined(partIndexes)) {
        return message;
      }

      return {
        ...message,
        parts: message.parts.map((part, partIndex) =>
          partIndexes.has(partIndex) ? evictToolOutputPart(part) : part,
        ),
      };
    });

    this.logger.log(
      `Evicted ${evictablePositions.length} stale tool outputs (~${reclaimableTokens} tokens reclaimed) from the in-flight context of ${messages.length} messages`,
    );

    return {
      messages: evictedMessages,
      evictedToolOutputCount: evictablePositions.length,
      reclaimedTokens: reclaimableTokens,
    };
  }

  // Everything from the Nth-to-last user message onward stays untouched.
  private findProtectedTurnsStartIndex(messages: ExtendedUIMessage[]): number {
    let trailingUserTurnsSeen = 0;

    for (let index = messages.length - 1; index >= 0; index--) {
      if (messages[index].role !== 'user') {
        continue;
      }

      trailingUserTurnsSeen++;

      if (trailingUserTurnsSeen === EVICTION_SKIPPED_TRAILING_USER_TURNS) {
        return index;
      }
    }

    return 0;
  }

  // Walk newest to oldest, accumulating estimated tool-output tokens; outputs
  // past the protected window become eviction candidates (accumulate-then-compare,
  // matching the OpenCode prune pass).
  private collectEvictablePositions(
    messages: ExtendedUIMessage[],
    protectedTurnsStartIndex: number,
  ): ToolOutputPartPosition[] {
    const evictablePositions: ToolOutputPartPosition[] = [];
    let accumulatedTokens = 0;

    for (
      let messageIndex = protectedTurnsStartIndex - 1;
      messageIndex >= 0;
      messageIndex--
    ) {
      const parts = messages[messageIndex].parts;

      for (let partIndex = parts.length - 1; partIndex >= 0; partIndex--) {
        const part = parts[partIndex];

        if (!isEvictableToolOutputPart(part)) {
          continue;
        }

        const estimatedTokens = estimateToolOutputTokens(part.output);

        accumulatedTokens += estimatedTokens;

        if (accumulatedTokens > EVICTION_PROTECTED_TOOL_OUTPUT_TOKENS) {
          evictablePositions.push({ messageIndex, partIndex, estimatedTokens });
        }
      }
    }

    return evictablePositions;
  }
}
