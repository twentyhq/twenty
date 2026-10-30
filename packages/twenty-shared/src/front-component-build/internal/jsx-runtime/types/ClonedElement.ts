import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';

export type ClonedElement = {
  type: unknown;
  props: ElementProps;
  ref?: UserRef;
};
