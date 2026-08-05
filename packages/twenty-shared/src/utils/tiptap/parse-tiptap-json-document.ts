import { type TipTapDocument } from './tiptap-document';
import { type TipTapMark } from './tiptap-mark-types';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTipTapMark = (value: unknown): value is TipTapMark => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.type === 'string' &&
    (value.attrs === undefined || isRecord(value.attrs))
  );
};

export const isTipTapNode = (value: unknown): value is TipTapNode => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.type === 'string' &&
    (value.attrs === undefined || isRecord(value.attrs)) &&
    (value.text === undefined || typeof value.text === 'string') &&
    (value.content === undefined ||
      (Array.isArray(value.content) && value.content.every(isTipTapNode))) &&
    (value.marks === undefined ||
      (Array.isArray(value.marks) && value.marks.every(isTipTapMark)))
  );
};

const isTipTapDocument = (value: unknown): value is TipTapDocument =>
  isTipTapNode(value) && value.type === TIPTAP_NODE_TYPES.DOCUMENT;

export const parseTipTapJsonDocument = (
  serializedDocument: string,
): TipTapDocument | undefined => {
  try {
    const parsedDocument: unknown = JSON.parse(serializedDocument);

    return isTipTapDocument(parsedDocument) ? parsedDocument : undefined;
  } catch {
    return undefined;
  }
};
