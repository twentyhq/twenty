import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { extractCssText } from '@/front-component-build/internal/jsx-runtime/utils/extract-css-text';

export const getStyleElementCssText = (
  props: ElementProps | null | undefined,
) =>
  props && props.dangerouslySetInnerHTML
    ? props.dangerouslySetInnerHTML.__html || ''
    : extractCssText(props && props.children);
