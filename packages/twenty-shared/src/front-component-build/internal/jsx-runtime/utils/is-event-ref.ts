import { type EventRef } from '@/front-component-build/internal/jsx-runtime/types/EventRef';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';

export const isEventRef = (ref: UserRef): ref is EventRef =>
  typeof ref === 'function' && ref._eventSource !== undefined;
