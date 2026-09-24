import { type JsonNodeHighlighting } from '@ui/components/data-display/JsonTree/types/JsonNodeHighlighting';

export type GetJsonNodeHighlighting = (
  keyPath: string,
) => JsonNodeHighlighting | undefined;
