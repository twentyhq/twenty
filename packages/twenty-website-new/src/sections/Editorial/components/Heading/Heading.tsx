import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { styled } from '@linaria/react';

const HeadingWrap = styled.div`
  max-width: 617px;
  min-width: 0;
  width: 100%;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateX(8px);
  }
`;

type EditorialHeadingProps = {
  segments: HeadingType | HeadingType[];
};

export function Heading({ segments }: EditorialHeadingProps) {
  return (
    <HeadingWrap>
      <BaseHeading as="h2" segments={segments} size="xl" weight="light" />
    </HeadingWrap>
  );
}
