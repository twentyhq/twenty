import { type JsonNodeHighlighting } from '@ui/components/JsonTree/types/JsonNodeHighlighting';

export type GetJsonNodeHighlighting = (
  keyPath: string,
) => JsonNodeHighlighting | undefined;
