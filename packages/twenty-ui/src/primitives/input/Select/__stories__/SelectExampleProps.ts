import { type SelectPortalProps } from '../types/SelectPortalProps';
import { type SelectPositionerProps } from '../types/SelectPositionerProps';
import { type SelectRootProps } from '../types/SelectRootProps';
import { type SelectTriggerProps } from '../types/SelectTriggerProps';

export type SelectExampleProps = SelectRootProps<string, boolean> &
  Pick<SelectTriggerProps, 'size'> &
  Pick<SelectPortalProps, 'container'> &
  Pick<
    SelectPositionerProps,
    'side' | 'sideOffset' | 'align' | 'alignItemWithTrigger'
  >;
