import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import { type Page, Pages } from '@/lib/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const HeadingContainer = styled.div`
  max-width: 360px;
  width: 100%;
  word-wrap: break-word;

  &[data-page=${Pages.WhyTwenty}] {
    color: ${theme.colors.secondary.text[100]};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

export type HeroHeadingProps = Omit<
  HeadingProps<MessageHeadingSegment['text']>,
  'renderText'
> & { page: Page };

export function Heading({
  as,
  className,
  page,
  segments,
  size = 'lg',
  weight = 'light',
}: HeroHeadingProps) {
  return (
    <HeadingContainer data-page={page}>
      <BaseHeading
        as={as}
        className={className}
        renderText={renderMessageDescriptor}
        segments={segments}
        size={size}
        weight={weight}
      />
    </HeadingContainer>
  );
}
