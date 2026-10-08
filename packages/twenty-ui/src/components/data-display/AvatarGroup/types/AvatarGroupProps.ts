import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type AvatarShape } from '@ui/primitives/data-display/Avatar/types/AvatarShape';

export type AvatarGroupProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  avatars: ReactNode[];
  maxVisible?: number;
  total?: number;
  renderOverflow?: (hiddenCount: number) => ReactNode;
  overflowShape?: AvatarShape;
  overlap?: 'left' | 'right';
  overlapOffset?: string;
};
