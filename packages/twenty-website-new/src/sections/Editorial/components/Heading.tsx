import { Heading as BaseHeading } from '@/design-system/components';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import { styled } from '@linaria/react';

const HeadingWrap = styled.div`
  max-width: var(--editorial-heading-max-width, 617px);
  min-width: 0;
  width: 100%;
`;

type EditorialHeadingProps = {
  segments: MessageHeadingSegment | MessageHeadingSegment[];
};

export function Heading({ segments }: EditorialHeadingProps) {
  return (
    <HeadingWrap>
      <BaseHeading
        as="h2"
        renderText={renderMessageDescriptor}
        segments={segments}
        size="lg"
        weight="light"
      />
    </HeadingWrap>
  );
}
