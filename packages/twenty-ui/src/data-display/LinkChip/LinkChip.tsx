import { type ComponentPropsWithRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { Chip } from '@ui/data-display/Chip/Chip';
import { type ChipProps } from '@ui/data-display/Chip/types/ChipProps';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from '@ui/data-display/Chip/constants/LinkChipClickOutsideId';
import { type TriggerEventType, useMouseDownNavigation } from '@ui/utilities';

import styles from './LinkChip.module.scss';

export type LinkChipProps = Omit<
  ChipProps,
  'render' | 'ref' | 'onClick' | 'onMouseDown' | 'disabled' | 'nativeButton'
> &
  Pick<ComponentPropsWithRef<typeof Link>, 'target' | 'ref'> & {
    to: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onMouseDown?: (event: MouseEvent<HTMLElement>) => void;
    triggerEvent?: TriggerEventType;
  };

export const LinkChip = ({
  to,
  target,
  onClick,
  onMouseDown,
  triggerEvent,
  ref,
  ...props
}: LinkChipProps) => {
  const { onClick: onClickHandler, onMouseDown: onMouseDownHandler } =
    useMouseDownNavigation({ to, onClick, triggerEvent });

  return (
    <span className={styles.linkContainer}>
      <Link
        to={to}
        ref={ref}
        onClick={(event) => {
          event.stopPropagation();
          onClickHandler(event);
        }}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          if (!event.defaultPrevented) onMouseDownHandler(event);
        }}
        data-click-outside-id={LINK_CHIP_CLICK_OUTSIDE_ID}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        <Chip {...props} />
      </Link>
    </span>
  );
};
