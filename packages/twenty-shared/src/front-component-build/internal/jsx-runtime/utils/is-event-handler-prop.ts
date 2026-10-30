import { type EventHandler } from '@/front-component-build/internal/jsx-runtime/types/EventHandler';

const EVENT_PROP_NAME_PATTERN = /^on[A-Z]/;

export const isEventHandlerProp = (
  propName: string,
  propValue: unknown,
): propValue is EventHandler =>
  EVENT_PROP_NAME_PATTERN.test(propName) && typeof propValue === 'function';
