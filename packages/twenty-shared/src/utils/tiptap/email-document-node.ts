export type EmailDocumentNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: unknown[];
  content?: EmailDocumentNode[];
};
