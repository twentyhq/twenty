import { Chip } from '@ui/display/chip/components/Chip';
import {
  AvatarChipsCommonProps,
  userGetAvatarChipsBuilder,
} from '@ui/display/chip/hooks/getAvatarChipBuilder';
import { MouseEvent } from 'react';

export type AvatarChipProps = AvatarChipsCommonProps & {
  onClick: (event: MouseEvent) => void;
};

export const AvatarChip = ({ onClick, ...commonProps }: AvatarChipProps) => {
  const { getLeftComponent, variant } = userGetAvatarChipsBuilder(commonProps);

  const { size, clickable, className, maxWidth, name } = commonProps;
  return (
    <Chip
      label={name}
      variant={variant}
      size={size}
      leftComponent={getLeftComponent}
      clickable={clickable}
      onClick={onClick}
      className={className}
      maxWidth={maxWidth}
    />
  );
};
