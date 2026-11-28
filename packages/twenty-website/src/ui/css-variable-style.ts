import { type CSSProperties } from 'react';

type CssVariableStyle = CSSProperties &
  Partial<Record<`--${string}`, string | number>>;

// React's style type has no custom properties; this types them without a cast.
export const cssVariableStyle = (style: CssVariableStyle): CssVariableStyle =>
  style;
