import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useId } from 'react';

import { Heading } from '@ui/primitives/typography/Heading/Heading';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/internal/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type SectionHeaderProps } from '../types/SectionHeaderProps';

import styles from '../SectionHeader.module.scss';

export const SectionHeader = ({
  title,
  description,
  adornment,
  level = 2,
  size = 'md',
  color = 'primary',
  descriptionLineClamp = 5,
  render,
  ref,
  className,
  ...props
}: SectionHeaderProps) => {
  const descriptionId = useId();
  const hasDescription = isString(description)
    ? isNonEmptyString(description)
    : isDefined(description) && description !== false;

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.header, className),
      children: (
        <>
          <div className={styles.titleRow}>
            <Heading
              level={level}
              size={size}
              color={color}
              className={styles.title}
              aria-describedby={hasDescription ? descriptionId : undefined}
            >
              {title}
            </Heading>
            {isDefined(adornment) && (
              <div className={styles.adornment}>{adornment}</div>
            )}
          </div>
          {hasDescription && (
            <div id={descriptionId} className={styles.description}>
              {isString(description) ? (
                <OverflowingTextWithTooltip
                  text={description}
                  displayedMaxRows={descriptionLineClamp}
                  isTooltipMultiline
                  isFocusable
                />
              ) : (
                description
              )}
            </div>
          )}
        </>
      ),
    },
  });
};
