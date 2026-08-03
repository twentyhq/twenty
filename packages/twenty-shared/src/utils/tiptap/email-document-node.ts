// Block nodes are recursive (sections nest, columns and list items hold
// blocks), so the tree type is declared structurally rather than inferred.
export type EmailDocumentNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: unknown[];
  content?: EmailDocumentNode[];
};
