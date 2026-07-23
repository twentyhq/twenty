import { type StepResult, type ToolSet } from 'ai';

import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';

export const REPEATED_TOOL_CALL_CONSECUTIVE_LIMIT = 3;
export const REPEATED_TOOL_CALL_WINDOW_OCCURRENCE_LIMIT = 5;
export const REPEATED_TOOL_CALL_WINDOW_STEPS = 10;

export type ToolCallHistoryEntry = {
  stepIndex: number;
  toolName: string;
  signature: string;
};

export type RepeatedToolCallGuardStatus = 'ok' | 'warned' | 'stopped';

export type RepeatedToolCallGuardState = {
  status: RepeatedToolCallGuardStatus;
  repeatedToolName: string | null;
  repeatedSignature: string | null;
  callCountAtWarning: number;
};

export const createRepeatedToolCallGuardState =
  (): RepeatedToolCallGuardState => ({
    status: 'ok',
    repeatedToolName: null,
    repeatedSignature: null,
    callCountAtWarning: 0,
  });

const canonicalizeJsonValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJsonValue);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([leftKey], [rightKey]) =>
          leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0,
        )
        .map(([key, entryValue]) => [key, canonicalizeJsonValue(entryValue)]),
    );
  }

  return value;
};

export const buildToolCallSignature = (
  toolName: string,
  input: unknown,
): string =>
  input === undefined
    ? `${toolName}:undefined`
    : `${toolName}:${JSON.stringify(canonicalizeJsonValue(input))}`;

export const buildToolCallHistoryFromSteps = (
  steps: ReadonlyArray<StepResult<ToolSet>>,
): ToolCallHistoryEntry[] =>
  steps.flatMap((step, stepIndex) =>
    step.toolCalls.map((toolCall) => ({
      stepIndex,
      toolName: resolveToolName({
        toolName: toolCall.toolName,
        input: toolCall.input,
      }),
      signature: buildToolCallSignature(toolCall.toolName, toolCall.input),
    })),
  );

type RepeatedToolCallDetection = {
  signature: string;
  toolName: string;
};

const detectConsecutiveRepeat = (
  toolCallHistory: ToolCallHistoryEntry[],
): RepeatedToolCallDetection | null => {
  let detection: RepeatedToolCallDetection | null = null;
  let runLength = 1;

  for (let index = 1; index < toolCallHistory.length; index++) {
    runLength =
      toolCallHistory[index].signature === toolCallHistory[index - 1].signature
        ? runLength + 1
        : 1;

    if (runLength >= REPEATED_TOOL_CALL_CONSECUTIVE_LIMIT) {
      detection = {
        signature: toolCallHistory[index].signature,
        toolName: toolCallHistory[index].toolName,
      };
    }
  }

  return detection;
};

const detectWindowRepeat = (
  toolCallHistory: ToolCallHistoryEntry[],
): RepeatedToolCallDetection | null => {
  if (toolCallHistory.length === 0) {
    return null;
  }

  const lastStepIndex = toolCallHistory[toolCallHistory.length - 1].stepIndex;
  const windowStartStepIndex =
    lastStepIndex - REPEATED_TOOL_CALL_WINDOW_STEPS + 1;

  const occurrencesBySignature = new Map<
    string,
    { count: number; toolName: string }
  >();

  for (const entry of toolCallHistory) {
    if (entry.stepIndex < windowStartStepIndex) {
      continue;
    }

    const occurrence = occurrencesBySignature.get(entry.signature);

    occurrencesBySignature.set(entry.signature, {
      count: (occurrence?.count ?? 0) + 1,
      toolName: entry.toolName,
    });
  }

  for (const [signature, occurrence] of occurrencesBySignature) {
    if (occurrence.count > REPEATED_TOOL_CALL_WINDOW_OCCURRENCE_LIMIT) {
      return { signature, toolName: occurrence.toolName };
    }
  }

  return null;
};

export const evaluateRepeatedToolCallGuard = ({
  toolCallHistory,
  previousState,
}: {
  toolCallHistory: ToolCallHistoryEntry[];
  previousState: RepeatedToolCallGuardState;
}): RepeatedToolCallGuardState => {
  if (previousState.status === 'stopped') {
    return previousState;
  }

  if (previousState.status === 'warned') {
    const callsSinceWarning = toolCallHistory.slice(
      previousState.callCountAtWarning,
    );

    const hasRepeatedAfterWarning = callsSinceWarning.some(
      (entry) => entry.signature === previousState.repeatedSignature,
    );

    if (hasRepeatedAfterWarning) {
      return { ...previousState, status: 'stopped' };
    }

    // A different call can start looping after the first warning; only the
    // post-warning tail is scanned so the already-warned run cannot re-trip.
    const newDetection =
      detectConsecutiveRepeat(callsSinceWarning) ??
      detectWindowRepeat(callsSinceWarning);

    if (newDetection === null) {
      return previousState;
    }

    return {
      status: 'warned',
      repeatedToolName: newDetection.toolName,
      repeatedSignature: newDetection.signature,
      callCountAtWarning: toolCallHistory.length,
    };
  }

  const detection =
    detectConsecutiveRepeat(toolCallHistory) ??
    detectWindowRepeat(toolCallHistory);

  if (detection === null) {
    return previousState;
  }

  return {
    status: 'warned',
    repeatedToolName: detection.toolName,
    repeatedSignature: detection.signature,
    callCountAtWarning: toolCallHistory.length,
  };
};
