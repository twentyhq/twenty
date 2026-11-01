import { type CSSProperties } from 'react';

import { type PopoverPopupProps } from '@ui/primitives/surfaces/Popover/types/PopoverPopupProps';
import { type PopoverPortalProps } from '@ui/primitives/surfaces/Popover/types/PopoverPortalProps';
import { type PopoverPositionerProps } from '@ui/primitives/surfaces/Popover/types/PopoverPositionerProps';

export type DropdownContentProps = PopoverPopupProps &
  Pick<PopoverPortalProps, 'container' | 'keepMounted'> &
  Pick<
    PopoverPositionerProps,
    | 'side'
    | 'align'
    | 'sideOffset'
    | 'alignOffset'
    | 'anchor'
    | 'collisionPadding'
  > & {
    width?: CSSProperties['width'];
  };
