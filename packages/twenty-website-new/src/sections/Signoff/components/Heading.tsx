import { styled } from '@linaria/react';

import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';

const HeadingWrap = styled.div`
  margin-bottom: ${theme.spacing(2)};
  margin-left: auto;
  margin-right: auto;
  max-width: 921px;
  min-width: 0;
  width: 100%;
`;

type HeadingProps = {
  segments: HeadingType[];
};

export function Heading({ segments }: HeadingProps) {
  return (
    <HeadingWrap>
      <BaseHeading as="h2" segments={segments} size="xl" weight="light" />
    </HeadingWrap>
  );
}
