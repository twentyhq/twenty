import { isFunction } from '@sniptt/guards';
import { clsx } from 'clsx';

export const mergeFieldPartClassName =
  <TState>(
    partClassName: string,
    className: string | ((state: TState) => string | undefined) | undefined,
  ) =>
  (state: TState) =>
    clsx(partClassName, isFunction(className) ? className(state) : className);
