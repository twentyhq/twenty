import { isFunction } from '@sniptt/guards';
import { type SyntheticEvent } from 'react';

const EVENT_HANDLER_PROP_PATTERN = /^on[A-Z]/;

export const getContainedPopupProps = <TProps extends object>(
  props: TProps,
): TProps =>
  Object.fromEntries(
    Object.entries(props).map(([name, value]) => {
      if (!EVENT_HANDLER_PROP_PATTERN.test(name) || !isFunction(value)) {
        return [name, value];
      }

      return [
        name,
        (event: SyntheticEvent<HTMLElement>) => {
          if (event.currentTarget.contains(event.target as Node)) {
            value(event);
          }
        },
      ];
    }),
  ) as TProps;
