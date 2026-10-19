import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { makeEventRef } from '@/front-component-build/internal/jsx-runtime/utils/make-event-ref';
import { splitEventProps } from '@/front-component-build/internal/jsx-runtime/utils/split-event-props';

export const withJsxEventRef = (props: ElementProps | null | undefined) => {
  const { cleanProps, events } = splitEventProps(props);
  return Object.assign(cleanProps, {
    ref: makeEventRef(events, cleanProps.ref, 'jsx'),
  });
};
