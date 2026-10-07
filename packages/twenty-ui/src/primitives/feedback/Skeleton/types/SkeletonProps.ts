import { type useRender } from '@base-ui/react/use-render';
import { type CSSProperties } from 'react';

export type SkeletonProps = Omit<
  useRender.ComponentProps<'span'>,
  'children'
> & {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  borderRadius?: CSSProperties['borderRadius'];
  baseColor?: CSSProperties['backgroundColor'];
  highlightColor?: CSSProperties['backgroundColor'];
  animated?: boolean;
};
