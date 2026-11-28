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

import { Button } from './Button';

// What a FilterBar's list shows when no item matches: the partners
// directory's production empty state, worded by the page.

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${spacing(12)} ${spacing(4)};
  text-align: center;
`;

const Title = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: ${fontSize(6)};
`;

const Subtitle = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: ${fontSize(5.5)};
  margin: ${spacing(2)} 0 ${spacing(4)};
`;

type FilterEmptyStateProps = {
  onClearAll: () => void;
  // "No partners match your filters".
  title: string;
};

export function FilterEmptyState({ onClearAll, title }: FilterEmptyStateProps) {
  const { i18n } = useLingui();

  return (
    <Wrapper>
      <Title>{title}</Title>
      <Subtitle>{i18n._(msg`Try removing a filter.`)}</Subtitle>
      <Button
        label={i18n._(msg`Clear all`)}
        onClick={onClearAll}
        size="small"
        variant="outlined"
      />
    </Wrapper>
  );
}
