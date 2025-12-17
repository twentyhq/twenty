import { styled } from '@linaria/react';
import {
  Chip,
  ChipAccent,
  type ChipProps,
  ChipSize,
  ChipVariant,
} from '@ui/components/chip/Chip';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from '@ui/components/chip/constants/LinkChipClickOutsideId';
import { type TriggerEventType, useMouseDownNavigation } from '@ui/utilities';
import { type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

export type LinkChipProps = Omit<
  ChipProps,
  'onClick' | 'disabled' | 'clickable'
> & {
  to: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onMouseDown?: (event: MouseEvent<HTMLElement>) => void;
  triggerEvent?: TriggerEventType;
  target?: '_blank' | '_self';
};

const StyledLink = styled(Link)`
  display: inline-flex;
  text-decoration: none;
  min-width: 0;
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
  triggerEvent,
  target,
  emptyLabel,
}: LinkChipProps) => {
  const { onClick: onClickHandler, onMouseDown: onMouseDownHandler } =
    useMouseDownNavigation({
      to: to,
      onClick: onClick,
      triggerEvent,
    });

  return (
    <StyledLink
      to={to}
      onClick={(event) => {
        event.stopPropagation();
        onClickHandler(event);
      }}
      onMouseDown={onMouseDownHandler}
      data-click-outside-id={LINK_CHIP_CLICK_OUTSIDE_ID}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
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
        emptyLabel={emptyLabel}
      />
    </StyledLink>
  );
};
