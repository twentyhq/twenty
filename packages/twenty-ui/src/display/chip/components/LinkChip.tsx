import styled from '@emotion/styled';
import {
  Chip,
  ChipAccent,
  ChipProps,
  ChipSize,
  ChipVariant,
} from '@ui/display/chip/components/Chip';
import { Link } from 'react-router-dom';

type LinkChipProps = Omit<ChipProps, 'onClick'> & {
  to: string;
  onClick?: () => void;
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
  disabled = false,
  clickable = true,
  variant = ChipVariant.Regular,
  leftComponent = null,
  rightComponent = null,
  accent = ChipAccent.TextPrimary,
  className,
  maxWidth,
  onClick,
}: LinkChipProps) => {
  return (
    <StyledLink
      to={to}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <Chip
        size={size}
        label={label}
        disabled={disabled}
        clickable={clickable}
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
