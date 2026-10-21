import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';

export const isCloneEventRef = (ref: UserRef): ref is EventRef =>
  ref != null && ref._eventSource === 'clone';
