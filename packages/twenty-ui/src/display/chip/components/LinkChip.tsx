import {
  Chip,
  ChipAccent,
  ChipProps,
  ChipSize,
  ChipVariant,
} from '@ui/display/chip/components/Chip';
import { UndecoratedLink } from '@ui/navigation';
import { isDefined } from 'twenty-shared';

type LinkChipProps = Omit<ChipProps, 'onClick'> & {
  to: string;
  onClick?: () => void;
};

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
    <UndecoratedLink
      to={to}
      onClick={(e) => {
        if (isDefined(onClick)) {
          // Or preventDefault ?
          e.stopPropagation();
          onClick();
        }
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
    </UndecoratedLink>
  );
};
