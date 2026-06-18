import { styled } from '@linaria/react';

import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

import { type CaseStudyKpi } from './case-study-types';

// minmax(min-content, …) lets a cell grow to hold its longest word so a value
// like "Management Consulting" wraps at the space, never mid-word.
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(min-content, 1fr));
  width: 100%;

  &[data-frame='band'] {
    border-bottom: 1px solid ${color('black-20')};
    border-top: 1px solid ${color('black-20')};
  }

  &[data-frame='card'] {
    border-top: 1px solid ${color('black-10')};
  }

  &[data-count='1'] {
    grid-template-columns: minmax(min-content, 1fr);
  }

  &[data-count='3'] > *:nth-child(n + 3),
  &[data-count='4'] > *:nth-child(n + 3) {
    border-top: 1px solid ${color('black-10')};
  }

  ${mediaUp('md')} {
    &[data-count='3'] {
      grid-template-columns: repeat(3, minmax(min-content, 1fr));
    }

    &[data-count='4'] {
      grid-template-columns: repeat(4, minmax(min-content, 1fr));
    }

    &[data-count='3'] > *:nth-child(n + 3),
    &[data-count='4'] > *:nth-child(n + 3) {
      border-top: none;
    }
  }
`;

const Cell = styled.div`
  border-left: 1px solid ${color('black-10')};
  display: flex;
  flex-direction: column;
  padding: ${spacing(5)} ${spacing(4)};

  & > * + * {
    margin-top: ${spacing(1.5)};
  }

  &:nth-child(odd) {
    border-left: none;
    padding-left: 0;
  }

  ${mediaUp('md')} {
    padding: ${spacing(6)} ${spacing(4)};

    &:nth-child(odd) {
      border-left: 1px solid ${color('black-10')};
      padding-left: ${spacing(4)};
    }

    &:first-child {
      border-left: none;
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }
  }
`;

const Value = styled.span`
  ${typeRampDeclarations('headingXs')}
  color: ${color('black')};
  font-family: ${fontFamily('serif')};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.015em;
`;

const Label = styled.span`
  color: ${color('black-40')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export type CaseStudyStatGridProps = {
  cells: readonly CaseStudyKpi[];
  frame: 'band' | 'card';
};

export function CaseStudyStatGrid({ cells, frame }: CaseStudyStatGridProps) {
  const i18n = getServerI18n();

  return (
    <Grid data-count={cells.length} data-frame={frame}>
      {cells.map((cell) => (
        <Cell key={getMessageDescriptorSource(cell.value)}>
          <Value>{i18n._(cell.value)}</Value>
          <Label>{i18n._(cell.label)}</Label>
        </Cell>
      ))}
    </Grid>
  );
}
