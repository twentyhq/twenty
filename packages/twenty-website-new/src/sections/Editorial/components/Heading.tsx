import { Heading as BaseHeading } from '@/design-system/components';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const HeadingWrap = styled.div`
  max-width: var(--editorial-heading-max-width, 617px);
  min-width: 0;
  width: 100%;
`;

type EditorialHeadingProps = {
  children: ReactNode;
};

export function Heading({ children }: EditorialHeadingProps) {
  return (
    <HeadingWrap>
      <BaseHeading as="h2" size="lg" weight="light">
        {children}
      </BaseHeading>
    </HeadingWrap>
  );
}
