import { type JsonNodeHighlighting } from '@ui/primitives/json-visualizer/types/JsonNodeHighlighting';

export type GetJsonNodeHighlighting = (
  keyPath: string,
) => JsonNodeHighlighting | undefined;
