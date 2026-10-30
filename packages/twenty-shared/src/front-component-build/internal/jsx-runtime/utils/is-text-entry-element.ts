import { CUSTOM_ELEMENT_TAG_BY_HTML_TAG } from '@/front-component-build/internal/jsx-runtime/constants/custom-element-tag-by-html-tag';

const INPUT_TYPES_WITHOUT_TEXT_ENTRY = new Set(['checkbox', 'radio', 'file']);

export const isTextEntryElement = (element: EventTarget) => {
  if (!('tagName' in element) || typeof element.tagName !== 'string') {
    return false;
  }

  const lowerCaseTagName = element.tagName.toLowerCase();

  if (lowerCaseTagName === CUSTOM_ELEMENT_TAG_BY_HTML_TAG.textarea) {
    return true;
  }

  if (lowerCaseTagName !== CUSTOM_ELEMENT_TAG_BY_HTML_TAG.input) {
    return false;
  }

  const inputType =
    'type' in element && typeof element.type === 'string'
      ? element.type.toLowerCase()
      : '';

  return !INPUT_TYPES_WITHOUT_TEXT_ENTRY.has(inputType);
};
