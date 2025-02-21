// import { styled } from '@linaria/react';
import {
  AvatarChip,
  AvatarChipProps,
} from '@ui/display/chip/components/AvatarChip';
import { UndecoratedLink } from '@ui/navigation';
// import { Link } from 'react-router-dom';

export type LinkAvatarChipProps = AvatarChipProps & { to: string };

// const StyledLink = styled(Link)`
//   text-decoration: none;
// `;

export const LinkAvatarChip = ({
  to,
  onClick,
  name,
  LeftIcon,
  LeftIconColor,
  avatarType,
  avatarUrl,
  className,
  clickable,
  isIconInverted,
  maxWidth,
  placeholderColorSeed,
  size,
  variant,
}: LinkAvatarChipProps) => {
  return (
    <UndecoratedLink to={to} onClick={onClick}>
      <AvatarChip
        name={name}
        LeftIcon={LeftIcon}
        LeftIconColor={LeftIconColor}
        avatarType={avatarType}
        avatarUrl={avatarUrl}
        className={className}
        clickable={clickable}
        isIconInverted={isIconInverted}
        maxWidth={maxWidth}
        placeholderColorSeed={placeholderColorSeed}
        size={size}
        variant={variant}
      />
    </UndecoratedLink>
  );
};
