import { type EventRefProperties } from '@/front-component-build/internal/jsx-runtime/types/EventRefProperties';
import { type RefCallback } from '@/front-component-build/internal/jsx-runtime/types/RefCallback';

type RefObject = {
  current: unknown;
};

export type UserRef =
  | ((RefCallback | RefObject) & Partial<EventRefProperties>)
  | null
  | undefined;
