import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { styled } from '@linaria/react';

const HeadingWrap = styled.div`
  max-width: var(--editorial-heading-max-width, 617px);
  min-width: 0;
  width: 100%;
`;

type EditorialHeadingProps = {
  segments: HeadingType | HeadingType[];
};

export function Heading({ segments }: EditorialHeadingProps) {
  return (
    <HeadingWrap>
      <BaseHeading as="h2" segments={segments} size="lg" weight="light" />
    </HeadingWrap>
  );
}
