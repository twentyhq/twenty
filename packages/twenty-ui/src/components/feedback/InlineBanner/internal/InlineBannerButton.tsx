import { type BannerColor } from '@ui/primitives/feedback/Banner/Banner';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { Button } from '@ui/primitives/input/Button/Button';
import { type InlineBannerButtonProps } from '../types/InlineBannerButtonProps';

export const InlineBannerButton = ({
  color,
  title,
  Icon,
  hidden,
  ...buttonProps
}: InlineBannerButtonProps & { color: BannerColor }) => {
  if (hidden) {
    return null;
  }

  return (
    <Button
      {...buttonProps}
      size="sm"
      startIcon={isDefined(Icon) ? <Icon /> : undefined}
      variant="outline"
      color={color === 'danger' ? 'danger' : 'accent'}
    >
      {title}
    </Button>
  );
};
