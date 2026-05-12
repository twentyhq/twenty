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

const StyledLinkContainer = styled.span`
  display: inline-flex;
  min-width: 0;
  vertical-align: middle;

  & > a {
    text-decoration: none;
    // Propagate the parent's width constraint down so the inner Chip's
    // max-width: 100% (and its text's text-overflow: ellipsis) clip at the
    // visible boundary instead of growing to content. Without this, the
    // text element reports scrollWidth === clientWidth even when an
    // ancestor with overflow: hidden is clipping it, which breaks
    // OverflowingTextWithTooltip's overflow detection (e.g. on kanban cards).
    max-width: 100%;
    min-width: 0;
  }
`;

export const LinkChip = ({
  to,
  size = ChipSize.Small,
  label,
  isLabelHidden = false,
  isBold = false,
  variant = ChipVariant.Regular,
  leftComponent = null,
  rightComponent = null,
  rightComponentDivider = false,
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
    <StyledLinkContainer>
      <Link
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
          isBold={isBold}
          clickable={true}
          variant={variant}
          leftComponent={leftComponent}
          rightComponent={rightComponent}
          rightComponentDivider={rightComponentDivider}
          accent={accent}
          className={className}
          maxWidth={maxWidth}
          emptyLabel={emptyLabel}
        />
      </Link>
    </StyledLinkContainer>
  );
};
