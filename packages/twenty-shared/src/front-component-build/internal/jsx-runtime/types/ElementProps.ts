import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';

export type ElementProps = {
  [propName: string]: unknown;
  ref?: UserRef;
  children?: unknown;
  dangerouslySetInnerHTML?: { __html?: string };
};
