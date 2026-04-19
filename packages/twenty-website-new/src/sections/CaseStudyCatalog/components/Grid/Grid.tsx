import { CASE_STUDY_HALFTONE_PALETTE } from '@/app/customers/_constants';
import type { CaseStudyCatalogEntry } from '@/app/customers/_constants/types';
import { Container } from '@/design-system/components';
import { PlusIcon } from '@/icons';
import { Card } from '@/sections/CaseStudyCatalog/components/Card/Card';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties, ReactNode } from 'react';

const Section = styled.section`
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)<{ compactTop: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  padding-bottom: ${theme.spacing(36)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${({ compactTop }) =>
    compactTop ? theme.spacing(20) : theme.spacing(24)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(14)};
    padding-bottom: ${theme.spacing(44)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${({ compactTop }) =>
      compactTop ? theme.spacing(24) : theme.spacing(32)};
  }
`;

const CORNER_OFFSET = '-6px';

const FramedGrid = styled.div`
  position: relative;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(12)};
    padding-left: ${theme.spacing(12)};
    padding-right: ${theme.spacing(12)};
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    padding-bottom: ${theme.spacing(20)};
    padding-left: ${theme.spacing(20)};
    padding-right: ${theme.spacing(20)};
  }
`;

const FrameRail = styled.span<{ extendTop: boolean }>`
  background-color: ${theme.colors.primary.border[10]};
  bottom: 0;
  display: none;
  position: absolute;
  top: ${({ extendTop }) =>
    extendTop ? `calc(6px - ${theme.spacing(24)})` : '0'};
  width: 1px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const FrameRailLeft = styled(FrameRail)`
  left: 0;
`;

const FrameRailRight = styled(FrameRail)`
  right: 0;
`;

const FrameRailBottom = styled.span`
  background-color: ${theme.colors.primary.border[10]};
  bottom: 0;
  display: none;
  height: 1px;
  left: 0;
  position: absolute;
  right: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const FrameCorner = styled.span`
  align-items: center;
  display: none;
  height: 12px;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  width: 12px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
  }
`;

const FrameCornerTopLeft = styled(FrameCorner)`
  left: ${CORNER_OFFSET};
  top: ${CORNER_OFFSET};
`;

const FrameCornerTopRight = styled(FrameCorner)`
  right: ${CORNER_OFFSET};
  top: ${CORNER_OFFSET};
`;

const FrameCornerBottomLeft = styled(FrameCorner)`
  bottom: ${CORNER_OFFSET};
  left: ${CORNER_OFFSET};
`;

const FrameCornerBottomRight = styled(FrameCorner)`
  bottom: ${CORNER_OFFSET};
  right: ${CORNER_OFFSET};
`;

const CardGrid = styled.div`
  display: grid;
  gap: ${theme.spacing(8)};
  grid-template-columns: 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(10)};
    grid-template-columns: repeat(2, 1fr);
  }
`;

type GridProps = {
  backgroundColor?: string;
  compactTop?: boolean;
  entries: readonly CaseStudyCatalogEntry[];
  intro?: ReactNode;
};

export function Grid({
  backgroundColor = '#f4f4f4',
  compactTop = false,
  entries,
  intro,
}: GridProps) {
  const lastIndex = entries.length - 1;

  return (
    <Section style={{ backgroundColor } as CSSProperties}>
      <StyledContainer compactTop={compactTop}>
        {intro}
        <FramedGrid>
          <FrameRailLeft aria-hidden extendTop={compactTop} />
          <FrameRailRight aria-hidden extendTop={compactTop} />
          <FrameRailBottom aria-hidden />
          {!compactTop && (
            <>
              <FrameCornerTopLeft aria-hidden>
                <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
              </FrameCornerTopLeft>
              <FrameCornerTopRight aria-hidden>
                <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
              </FrameCornerTopRight>
            </>
          )}
          <FrameCornerBottomLeft aria-hidden>
            <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
          </FrameCornerBottomLeft>
          <FrameCornerBottomRight aria-hidden>
            <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
          </FrameCornerBottomRight>
          <CardGrid>
            {entries.map((entry, index) => {
              const isLarge = index === 0 || index === lastIndex;
              const palette =
                CASE_STUDY_HALFTONE_PALETTE[
                  index % CASE_STUDY_HALFTONE_PALETTE.length
                ];
              return (
                <Card
                  dashColor={palette.dashColor}
                  entry={entry}
                  hoverDashColor={palette.hoverDashColor}
                  index={index}
                  key={entry.href}
                  variant={isLarge ? 'large' : 'default'}
                />
              );
            })}
          </CardGrid>
        </FramedGrid>
      </StyledContainer>
    </Section>
  );
}
