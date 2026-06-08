import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

export type GetJsonNodeHighlighting = (
  keyPath: string,
) => JsonNodeHighlighting | undefined;
