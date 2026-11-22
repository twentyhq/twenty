'use client';

import { styled } from '@linaria/react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

const Counts = styled.span`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  flex-wrap: wrap;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  gap: ${spacing(3)};

  & > span {
    align-items: center;
    display: inline-flex;
    gap: ${spacing(1)};
  }

  & i {
    border-radius: ${radius(100)};
    display: inline-block;
    height: ${spacing(2)};
    width: ${spacing(2)};
  }

  & i[data-severity='error'] {
    background: ${color('error')};
  }

  & i[data-severity='warning'] {
    background: ${color('yellow')};
  }

  & i[data-severity='clean'] {
    background: ${color('green')};
  }
`;

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

// Errors and warnings the generator read in the code (info left out).
export function ProblemCount({
  problems,
}: {
  problems: { error: number; warning: number };
}) {
  if (problems.error === 0 && problems.warning === 0)
    return (
      <Counts>
        <span>
          <i data-severity="clean" />
          No errors or warnings
        </span>
      </Counts>
    );
  return (
    <Counts>
      {problems.error ? (
        <span>
          <i data-severity="error" />
          {plural(problems.error, 'error')}
        </span>
      ) : null}
      {problems.warning ? (
        <span>
          <i data-severity="warning" />
          {plural(problems.warning, 'warning')}
        </span>
      ) : null}
    </Counts>
  );
}
