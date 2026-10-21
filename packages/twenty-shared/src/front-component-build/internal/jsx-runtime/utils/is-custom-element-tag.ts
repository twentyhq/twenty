import { CUSTOM_ELEMENT_TAGS } from '@/front-component-build/internal/jsx-runtime/constants/custom-element-tags';

export const isCustomElementTag = (type: unknown) =>
  typeof type === 'string' && CUSTOM_ELEMENT_TAGS[type] === true;
