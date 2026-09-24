import { type ReactNode } from 'react';

export type SegmentedControlOption<TValue extends string = string> = {
  disabled?: boolean;
  value: TValue;
} & (
  | {
      label: NonNullable<ReactNode>;
      startIcon?: ReactNode;
      'aria-label'?: string;
    }
  | {
      label?: never;
      startIcon: NonNullable<ReactNode>;
      'aria-label': string;
    }
);
