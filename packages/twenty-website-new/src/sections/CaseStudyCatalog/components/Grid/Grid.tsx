import type { CaseStudyCatalogEntry } from '@/app/case-studies/_constants/types';
import { Container } from '@/design-system/components';
import { Card } from '@/sections/CaseStudyCatalog/components/Card/Card';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  padding-bottom: ${theme.spacing(20)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(16)};
  }
`;

const CardGrid = styled.div`
  display: grid;
  gap: ${theme.spacing(6)};
  grid-template-columns: 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

type GridProps = {
  entries: readonly CaseStudyCatalogEntry[];
};

export function Grid({ entries }: GridProps) {
  return (
    <Section>
      <StyledContainer>
        <CardGrid>
          {entries.map((entry) => (
            <Card key={entry.href} entry={entry} />
          ))}
        </CardGrid>
      </StyledContainer>
    </Section>
  );
}
