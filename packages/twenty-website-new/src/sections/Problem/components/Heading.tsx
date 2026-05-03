import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import type { ReactNode } from 'react';

const problemHeadingClassName = css`
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(10)});

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: calc(${theme.spacing(2)} - ${theme.spacing(16)});
  }
`;

export function Heading({
  as = 'h2',
  children,
  className,
  segments,
  size = 'md',
  weight = 'light',
}: Omit<HeadingProps<MessageHeadingSegment['text']>, 'renderText'> & {
  children?: ReactNode;
}) {
  return (
    <BaseHeading
      as={as}
      className={[problemHeadingClassName, className].filter(Boolean).join(' ')}
      renderText={renderMessageDescriptor}
      segments={segments}
      size={size}
      weight={weight}
    >
      {segments === undefined ? children : undefined}
    </BaseHeading>
  );
}
