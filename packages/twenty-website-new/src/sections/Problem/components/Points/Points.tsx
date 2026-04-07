import { Body } from '@/design-system/components/Body/Body';
import { Heading } from '@/design-system/components/Heading/Heading';
import type { ProblemPointType } from '@/sections/Problem/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import React from 'react';

const StyledPoints = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 454px;
  }
`;

const StyledDivider = styled.div`
  height: 0;
  border-top: 0.75px dashed ${theme.colors.primary.border[80]};
  width: 100%;
  opacity: 50%;
`;

const StyledPoint = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(2)};

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 380px;
    width: 100%;
  }
`;

const StyledBody = styled(Body)`
  color: ${theme.colors.primary.text[80]};
`;

export type PointsProps = { points: ProblemPointType[] };

export function Points({ points }: PointsProps) {
  return (
    <StyledPoints>
      {points.map((point, index) => (
        <React.Fragment key={index}>
          <StyledDivider />
          <StyledPoint>
            <Heading segments={point.heading} weight="medium" size="xs" />
            <StyledBody body={point.body} size="sm" />
          </StyledPoint>
        </React.Fragment>
      ))}
    </StyledPoints>
  );
}
