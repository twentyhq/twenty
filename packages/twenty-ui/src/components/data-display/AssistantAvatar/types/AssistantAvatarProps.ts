import { type ComponentPropsWithRef } from 'react';

import { type AssistantAvatarColor } from './AssistantAvatarColor';
import { type AssistantAvatarFace } from './AssistantAvatarFace';
import { type AssistantAvatarShape } from './AssistantAvatarShape';
import { type AssistantAvatarSize } from './AssistantAvatarSize';

export type AssistantAvatarProps = Omit<
  ComponentPropsWithRef<'span'>,
  'children' | 'color' | 'role'
> & {
  shape?: AssistantAvatarShape;
  color?: AssistantAvatarColor;
  face?: AssistantAvatarFace;
  size?: AssistantAvatarSize;
  isAnimated?: boolean;
};
