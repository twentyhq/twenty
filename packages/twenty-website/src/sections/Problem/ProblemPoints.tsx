import { Body } from '@/design-system/components/Body';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import React from 'react';

import type { ProblemPointType } from './problem-point-type';

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

type PointsProps = {
  points: ProblemPointType[];
};

export function Points({ points }: PointsProps) {
  const i18n = getServerI18n();
  return (
    <StyledPoints>
      {points.map((point, index) => (
        <React.Fragment key={index}>
          <StyledDivider />
          <StyledPoint>
            {point.heading}
            <Body size="sm">{i18n._(point.body)}</Body>
          </StyledPoint>
        </React.Fragment>
      ))}
    </StyledPoints>
  );
}
