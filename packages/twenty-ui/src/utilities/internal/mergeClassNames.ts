import { isFunction } from '@sniptt/guards';
import { clsx } from 'clsx';

export const mergeClassNames =
  <TState>(
    baseClassName: string,
    consumerClassName:
      | string
      | ((state: TState) => string | undefined)
      | undefined,
  ) =>
  (state: TState) =>
    clsx(
      baseClassName,
      isFunction(consumerClassName)
        ? consumerClassName(state)
        : consumerClassName,
    );
