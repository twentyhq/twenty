'use client';

import { Trans } from '@lingui/react/macro';
import { styled } from '@linaria/react';

import { theme } from '@/theme';

import { ClearFiltersButton } from './ClearFiltersButton';

type EmptyStateProps = {
  onClearFilters: () => void;
};

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  padding: ${theme.spacing(12)} ${theme.spacing(4)};
  text-align: center;
`;

const Heading = styled.h2`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0;
  line-height: ${theme.lineHeight(6)};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: ${theme.lineHeight(5.5)};
  margin: 0;
`;

const EmptyStateClearButton = styled(ClearFiltersButton)`
  margin-top: ${theme.spacing(4)};
`;

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <Wrapper>
      <Heading>
        <Trans>No partners match your filters</Trans>
      </Heading>
      <Subtitle>
        <Trans>Try removing some filters or browse all partners.</Trans>
      </Subtitle>
      <EmptyStateClearButton onClick={onClearFilters}>
        <Trans>Clear filters</Trans>
      </EmptyStateClearButton>
    </Wrapper>
  );
}
