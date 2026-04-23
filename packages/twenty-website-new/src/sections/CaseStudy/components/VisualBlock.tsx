import type { CaseStudyVisualBlock } from '@/lib/customers';
import { Container } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Image from 'next/image';

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)<{ $isLast: boolean }>`
  padding-bottom: ${({ $isLast }) =>
    $isLast ? theme.spacing(20) : theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${({ $isLast }) =>
      $isLast ? theme.spacing(32) : theme.spacing(4)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const Visual = styled.div`
  background-color: ${theme.colors.secondary.background[100]};
  border-radius: ${theme.radius(2)};
  height: 300px;
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 599px;
    width: 776px;
  }
`;

type VisualBlockProps = {
  block: CaseStudyVisualBlock;
  isLast?: boolean;
};

export function VisualBlock({ block, isLast = false }: VisualBlockProps) {
  return (
    <Section>
      <StyledContainer $isLast={isLast}>
        <Visual>
          <Image
            alt={block.alt}
            fill
            sizes="(max-width: 920px) 100vw, 776px"
            src={block.src}
            style={{ objectFit: 'cover' }}
          />
        </Visual>
      </StyledContainer>
    </Section>
  );
}
