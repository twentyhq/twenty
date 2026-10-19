import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';

export const doesCloneSetOrClearEventProp = (
  cloneConfig: ElementProps,
  eventPropName: string,
) => {
  const isEventPropInCloneConfig = eventPropName in cloneConfig;
  if (!isEventPropInCloneConfig) {
    return false;
  }

  const cloneEventPropValue = cloneConfig[eventPropName];
  const setsEventHandler = typeof cloneEventPropValue === 'function';
  const clearsEventHandler =
    cloneEventPropValue === null || cloneEventPropValue === undefined;
  return setsEventHandler || clearsEventHandler;
};
