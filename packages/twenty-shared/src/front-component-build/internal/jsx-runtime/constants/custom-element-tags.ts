import { CUSTOM_ELEMENT_TAG_BY_HTML_TAG } from '@/front-component-build/internal/jsx-runtime/constants/custom-element-tag-by-html-tag';

export const CUSTOM_ELEMENT_TAGS: Record<string, boolean> = Object.fromEntries(
  Object.values(CUSTOM_ELEMENT_TAG_BY_HTML_TAG).map((customElementTag) => [
    customElementTag,
    true,
  ]),
);
