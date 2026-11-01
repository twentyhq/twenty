import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyArray } from '@sniptt/guards';
import { clsx } from 'clsx';
import { Children, type CSSProperties, isValidElement } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type AvatarGroupProps } from './types/AvatarGroupProps';

import styles from './AvatarGroup.module.scss';

const DEFAULT_MAX_VISIBLE_AVATARS = 4;

export const AvatarGroup = ({
  avatars,
  className,
  maxVisible = DEFAULT_MAX_VISIBLE_AVATARS,
  total,
  renderOverflow,
  overflowShape = 'square',
  overlap = 'right',
  overlapOffset = '3px',
  render,
  ref,
  ...props
}: AvatarGroupProps) => {
  const suppliedAvatars = Children.toArray(avatars);
  const visibleLimit = Number.isNaN(maxVisible)
    ? 0
    : Math.max(0, Math.floor(maxVisible));
  const visibleAvatars = suppliedAvatars.slice(0, visibleLimit);
  const suppliedTotal = total ?? suppliedAvatars.length;
  const avatarTotal = Number.isFinite(suppliedTotal)
    ? Math.max(suppliedAvatars.length, Math.floor(suppliedTotal))
    : suppliedAvatars.length;
  const hiddenCount = avatarTotal - visibleAvatars.length;
  const hasCustomOverflow = isDefined(renderOverflow);
  const overflowContent =
    hiddenCount > 0 &&
    (hasCustomOverflow ? (
      renderOverflow(hiddenCount)
    ) : (
      <span className={styles.overflowCount} data-shape={overflowShape}>
        +{hiddenCount}
      </span>
    ));
  const hasOverflow = isNonEmptyArray(Children.toArray(overflowContent));
  const itemStyle = {
    '--avatar-group-overlap-offset': overlapOffset,
  } as CSSProperties;

  const element = useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.container, className),
      children: (
        <>
          {Children.map(visibleAvatars, (avatar) => (
            <span
              className={styles.itemContainer}
              key={isValidElement(avatar) ? avatar.key : undefined}
              data-overlap={overlap}
              style={itemStyle}
            >
              {avatar}
            </span>
          ))}
          {hasOverflow && (
            <span
              className={clsx(
                styles.itemContainer,
                !hasCustomOverflow && styles.overflowCountContainer,
              )}
              data-overlap={overlap}
              style={itemStyle}
            >
              {overflowContent}
            </span>
          )}
        </>
      ),
    },
  });

  return isNonEmptyArray(visibleAvatars) || hasOverflow ? element : null;
};
