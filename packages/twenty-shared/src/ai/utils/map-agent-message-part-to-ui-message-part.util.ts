import { type ReasoningUIPart } from 'ai';

import { type ExtendedFileUIPart } from '@/ai/types/DataMessagePart';
import { type ExtendedUIMessagePart } from '@/ai/types/ExtendedUIMessagePart';
import { isDefined } from '@/utils/validation/isDefined';

export type AgentMessagePartRow = {
  type: string;
  orderIndex: number;
  textContent?: string | null;
  reasoningContent?: string | null;
  toolName?: string | null;
  toolCallId?: string | null;
  toolInput?: unknown;
  toolOutput?: unknown;
  state?: string | null;
  providerExecuted?: boolean | null;
  errorMessage?: string | null;
  sourceUrlSourceId?: string | null;
  sourceUrlUrl?: string | null;
  sourceUrlTitle?: string | null;
  sourceDocumentSourceId?: string | null;
  sourceDocumentMediaType?: string | null;
  sourceDocumentTitle?: string | null;
  sourceDocumentFilename?: string | null;
  fileMediaType?: string | null;
  fileFilename?: string | null;
  fileUrl?: string | null;
  fileId?: string | null;
  providerMetadata?: Record<string, unknown> | null;
};

export const mapAgentMessagePartToUIMessagePart = (
  part: AgentMessagePartRow,
): ExtendedUIMessagePart | null => {
  const providerMetadata = (part.providerMetadata ??
    undefined) as ReasoningUIPart['providerMetadata'];

  switch (part.type) {
    case 'text':
      return { type: 'text', text: part.textContent ?? '' };
    case 'reasoning':
      return {
        type: 'reasoning',
        text: part.reasoningContent ?? '',
        state: (part.state ?? 'done') as ReasoningUIPart['state'],
        providerMetadata,
      };
    case 'file':
      return {
        type: 'file',
        mediaType: part.fileMediaType ?? 'application/octet-stream',
        filename: part.fileFilename ?? '',
        url: part.fileUrl ?? '',
        fileId: part.fileId ?? '',
      } as ExtendedFileUIPart;
    case 'source-url':
      return {
        type: 'source-url',
        sourceId: part.sourceUrlSourceId ?? '',
        url: part.sourceUrlUrl ?? '',
        title: part.sourceUrlTitle ?? '',
        providerMetadata,
      };
    case 'source-document':
      return {
        type: 'source-document',
        sourceId: part.sourceDocumentSourceId ?? '',
        mediaType: part.sourceDocumentMediaType ?? '',
        title: part.sourceDocumentTitle ?? '',
        filename: part.sourceDocumentFilename ?? '',
        providerMetadata,
      };
    case 'step-start':
      return { type: 'step-start' };
    default: {
      const isStaticToolPart = part.type.startsWith('tool-');
      const isDynamicToolPart = part.type === 'dynamic-tool';

      // a tool part without its call id cannot be replayed to the model
      if (
        (!isStaticToolPart && !isDynamicToolPart) ||
        !isDefined(part.toolCallId)
      ) {
        return null;
      }

      return {
        type: part.type as `tool-${string}` | 'dynamic-tool',
        ...(isDynamicToolPart && { toolName: part.toolName ?? '' }),
        toolCallId: part.toolCallId,
        input: part.toolInput ?? {},
        output: part.toolOutput,
        errorText: part.errorMessage ?? '',
        state: part.state,
        ...(isDefined(part.providerExecuted) && {
          providerExecuted: part.providerExecuted,
        }),
        ...(isDefined(part.providerMetadata) && {
          callProviderMetadata: part.providerMetadata,
        }),
      } as ExtendedUIMessagePart;
    }
  }
};
