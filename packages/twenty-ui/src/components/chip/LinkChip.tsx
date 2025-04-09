import { styled } from '@linaria/react';
import {
  Chip,
  ChipAccent,
  ChipProps,
  ChipSize,
  ChipVariant,
} from '@ui/components/chip/Chip';
import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

export type LinkChipProps = Omit<
  ChipProps,
  'onClick' | 'disabled' | 'clickable'
> & {
  to: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const LinkChip = ({
  to,
  size = ChipSize.Small,
  label,
  isLabelHidden = false,
  variant = ChipVariant.Regular,
  leftComponent = null,
  rightComponent = null,
  accent = ChipAccent.TextPrimary,
  className,
  maxWidth,
  onClick,
}: LinkChipProps) => {
  return (
    <StyledLink to={to} onClick={onClick}>
      <Chip
        size={size}
        label={label}
        isLabelHidden={isLabelHidden}
        clickable={true}
        variant={variant}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
        accent={accent}
        className={className}
        maxWidth={maxWidth}
      />
    </StyledLink>
  );
};
