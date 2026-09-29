import { type CSSProperties } from 'react';

import { type PopoverPopupProps } from '@ui/primitives/surfaces/Popover/types/PopoverPopupProps';

export type DropdownContentProps = Omit<PopoverPopupProps, 'arrow'> & {
  width?: CSSProperties['width'];
};
