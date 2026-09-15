import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { parseApplicationLogLines } from 'src/engine/core-modules/event-logs/producers/application-log/parse-application-log-lines';
import {
  type LogicFunctionExecuteError,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

const MAX_ENTRIES = 500;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_STACK_TRACE_LENGTH = 8_000;

const truncate = (value: string, max: number): string =>
  value.length > max ? `${value.slice(0, max)}…[truncated]` : value;

type StepLogEntry = WorkflowRunStepLog['entries'][number];

type LogLevel = StepLogEntry['level'];

const LEVEL_BY_INPUT: Record<string, LogLevel> = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const normalizeLevel = (rawLevel: string): LogLevel =>
  LEVEL_BY_INPUT[rawLevel.toUpperCase()] ?? 'info';

const flattenStackTrace = (
  stackTrace: LogicFunctionExecuteError['stackTrace'],
): string =>
  Array.isArray(stackTrace) ? stackTrace.join('\n') : (stackTrace ?? '');

export const buildCodeStepLog = (
  result: LogicFunctionExecuteResult,
): WorkflowRunStepLog => {
  const parsedLines = parseApplicationLogLines(result.logs ?? '');
  const droppedEntries = Math.max(0, parsedLines.length - MAX_ENTRIES);

  const entries: StepLogEntry[] = parsedLines
    .slice(0, MAX_ENTRIES)
    .map((line) => ({
      timestamp: line.timestamp.toISOString(),
      level: normalizeLevel(line.level),
      message: truncate(line.message, MAX_MESSAGE_LENGTH),
    }));

  const error = result.error
    ? {
        type: result.error.errorType,
        message: truncate(result.error.errorMessage, MAX_MESSAGE_LENGTH),
        stackTrace: truncate(
          flattenStackTrace(result.error.stackTrace),
          MAX_STACK_TRACE_LENGTH,
        ),
      }
    : null;

  return {
    details: {
      type: 'CODE',
      durationMs: result.duration,
      status: result.error ? 'ERROR' : 'SUCCESS',
      error,
    },
    entries,
    truncated:
      droppedEntries > 0 ? { droppedEntries, droppedBytes: 0 } : undefined,
    sizeBytes: 0,
  };
};
