export type TextTruncationProps =
  | { truncate?: boolean; lineClamp?: never }
  | { truncate?: never; lineClamp?: number };
