import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useId } from 'react';

import { Text } from '@ui/primitives/typography/Text/Text';
import { Heading } from '@ui/primitives/typography/Heading/Heading';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type SectionHeaderProps } from '../types/SectionHeaderProps';

import styles from '../SectionHeader.module.scss';

export const SectionHeader = ({
  title,
  description,
  actions,
  level = 2,
  size = 'md',
  color = 'primary',
  descriptionLineClamp = 5,
  descriptionFocusable = false,
  render,
  ref,
  className,
  ...props
}: SectionHeaderProps) => {
  const descriptionId = useId();
  const hasDescription = isString(description)
    ? isNonEmptyString(description)
    : isDefined(description) && description !== false;

  const shouldTruncateDescription =
    isString(description) && descriptionLineClamp !== false;
  const descriptionContent = isString(description) ? (
    <Text style={{ whiteSpace: 'pre-wrap' }}>{description}</Text>
  ) : (
    description
  );

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
            {isDefined(actions) && (
              <div className={styles.actions}>{actions}</div>
            )}
          </div>
          {hasDescription && (
            <div id={descriptionId} className={styles.description}>
              {shouldTruncateDescription ? (
                <OverflowingTextWithTooltip
                  text={description}
                  lineClamp={descriptionLineClamp}
                  isTooltipMultiline
                  isFocusable={descriptionFocusable}
                />
              ) : (
                descriptionContent
              )}
            </div>
          )}
        </>
      ),
    },
  });
};
