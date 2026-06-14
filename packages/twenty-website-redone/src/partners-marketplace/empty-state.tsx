'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  semanticColor,
  spacing,
} from '@/tokens';
import { Button } from '@/ui';

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${spacing(12)} ${spacing(4)};
  text-align: center;
`;

const Title = styled.h2`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: ${fontSize(6)};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: ${fontSize(5.5)};
  margin: ${spacing(2)} 0 0;
`;

const ClearRow = styled.div`
  margin-top: ${spacing(4)};
`;

export function MarketplaceEmptyState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  const { i18n } = useLingui();

  return (
    <Wrapper>
      <Title>{i18n._(msg`No partners match your filters`)}</Title>
      <Subtitle>
        {i18n._(msg`Try removing some filters or browse all partners.`)}
      </Subtitle>
      <ClearRow>
        <Button
          label={i18n._(msg`Clear filters`)}
          onClick={onClearFilters}
          size="small"
          variant="outlined"
        />
      </ClearRow>
    </Wrapper>
  );
}
