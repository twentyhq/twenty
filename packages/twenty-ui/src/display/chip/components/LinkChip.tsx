import styled from '@emotion/styled';
import {
  Chip,
  ChipAccent,
  ChipProps,
  ChipSize,
  ChipVariant,
} from '@ui/display/chip/components/Chip';
import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

export type LinkChipProps = Omit<
  ChipProps,
  'onClick' | 'disabled' | 'clickable'
> & {
  to: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

// Ideally we would use the UndecoratedLink component from @ui/navigation
// but it led to a bug probably linked to circular dependencies, which was hard to solve
const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const LinkChip = ({
  to,
  size = ChipSize.Small,
  label,
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
