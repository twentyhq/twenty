import { Container } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  color: ${theme.colors.primary.text[100]};
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: center;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(16)};
  }
`;

const ContentWrap = styled.div`
  max-width: 556px;
  width: 100%;
`;

const Card = styled.div<{ count: number }>`
  border-bottom: 1px solid ${theme.colors.primary.border[20]};
  border-top: 1px solid ${theme.colors.primary.border[20]};
  display: grid;
  grid-template-columns: repeat(
    ${({ count }) => (count > 2 ? 2 : count)},
    minmax(0, 1fr)
  );
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: ${({ count }) => `repeat(${count}, minmax(0, 1fr))`};
  }
`;

const Cell = styled.div<{ index: number; count: number }>`
  align-items: flex-start;
  border-left: 1px solid ${theme.colors.primary.border[10]};
  border-top: ${({ index, count }) =>
    count > 2 && index >= 2
      ? `1px solid ${theme.colors.primary.border[10]}`
      : 'none'};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  justify-content: center;
  min-width: 0;
  padding: ${theme.spacing(5)} ${theme.spacing(4)};

  &:nth-child(odd) {
    border-left: none;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    border-left: 1px solid ${theme.colors.primary.border[10]};
    border-top: none;
    padding: ${theme.spacing(6)} ${theme.spacing(4)};

    &:first-child {
      border-left: none;
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }

    &:nth-child(odd) {
      border-left: 1px solid ${theme.colors.primary.border[10]};
    }

    &:first-child {
      border-left: none;
    }
  }
`;

const Value = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.015em;
  line-height: 1.1;
  min-width: 0;
  overflow-wrap: break-word;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(7)};
  }
`;

const Label = styled.span`
  color: ${theme.colors.primary.text[40]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(3.5)};
  text-transform: uppercase;
`;

type HighlightsProps = {
  industry?: MessageDescriptor;
  kpis?: { value: MessageDescriptor; label: MessageDescriptor }[];
};

export function Highlights({ industry, kpis }: HighlightsProps) {
  const i18n = getServerI18n();
  const cells: { value: MessageDescriptor; label: MessageDescriptor }[] = [];
  if (industry) {
    cells.push({ value: industry, label: msg`Industry` });
  }
  if (kpis) {
    for (const kpi of kpis) {
      cells.push(kpi);
    }
  }

  if (cells.length === 0) {
    return null;
  }

  return (
    <Section>
      <StyledContainer>
        <ContentWrap>
          <Card count={cells.length}>
            {cells.map((cell, index) => (
              <Cell count={cells.length} index={index} key={index}>
                <Value>{i18n._(cell.value)}</Value>
                <Label>{i18n._(cell.label)}</Label>
              </Cell>
            ))}
          </Card>
        </ContentWrap>
      </StyledContainer>
    </Section>
  );
}
