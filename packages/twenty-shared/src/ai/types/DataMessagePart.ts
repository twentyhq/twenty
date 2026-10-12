import { isDefined } from '@/utils/validation/isDefined';

export type CodeExecutionFile = {
  fileId: string;
  filename: string;
  url: string;
  mimeType: string;
};

export type ExtendedFileUIPart = {
  type: 'file';
  mediaType: string;
  filename?: string;
  url: string;
  fileId: string;
};

export const isExtendedFileUIPart = (
  part: Record<string, unknown>,
): part is ExtendedFileUIPart => {
  return (
    part.type === 'file' &&
    isDefined(part.fileId) &&
    isDefined(part.url) &&
    isDefined(part.mediaType)
  );
};

export type CodeExecutionState = 'pending' | 'running' | 'completed' | 'error';

export type CodeExecutionData = {
  executionId: string;
  state: CodeExecutionState;
  code: string;
  language: 'python';
  stdout: string;
  stderr: string;
  exitCode?: number;
  executionTimeMs?: number;
  files: CodeExecutionFile[];
  error?: string;
};

export type DataMessagePart = {
  'code-execution': CodeExecutionData;
  'thread-title': { title: string };
  compaction: Record<string, never>;
};
