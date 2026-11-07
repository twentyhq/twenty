import { Button } from '@ui/primitives/input/Button/Button';

import { type BannerActionProps } from '../types/BannerActionProps';

export const BannerAction = (props: BannerActionProps) => (
  <Button
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    size="sm"
    variant="outline"
    color="inherit"
  />
);
