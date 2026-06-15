import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import { color, mediaUp, spacing } from '@/tokens';

import { CASE_STUDY_CATALOG } from './case-study-catalog';
import { CaseStudyCard } from './case-study-card';
import { getCaseStudyAccent } from './case-study-palette';

const CORNER_SIZE_PX = 14;
const CORNER_OFFSET = `${-CORNER_SIZE_PX / 2}px`;

const FramedGrid = styled.div`
  position: relative;

  ${mediaUp('md')} {
    padding-bottom: ${spacing(12)};
    padding-left: ${spacing(12)};
    padding-right: ${spacing(12)};
  }

  ${mediaUp('lg')} {
    padding-bottom: ${spacing(20)};
    padding-left: ${spacing(20)};
    padding-right: ${spacing(20)};
  }
`;

const FrameRail = styled.span`
  background-color: ${color('black-10')};
  bottom: 0;
  display: none;
  position: absolute;
  top: 0;
  width: 1px;

  ${mediaUp('md')} {
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
  background-color: ${color('black-10')};
  bottom: 0;
  display: none;
  height: 1px;
  left: 0;
  position: absolute;
  right: 0;

  ${mediaUp('md')} {
    display: block;
  }
`;

const FrameCorner = styled.span`
  align-items: center;
  color: ${color('blue')};
  display: none;
  height: ${CORNER_SIZE_PX}px;
  justify-content: center;
  line-height: 0;
  pointer-events: none;
  position: absolute;
  width: ${CORNER_SIZE_PX}px;

  ${mediaUp('md')} {
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
  gap: ${spacing(8)};
  grid-template-columns: 1fr;

  ${mediaUp('md')} {
    gap: ${spacing(10)};
    grid-template-columns: repeat(2, 1fr);
  }
`;

export function CaseStudyCatalogGrid() {
  const lastIndex = CASE_STUDY_CATALOG.length - 1;

  return (
    <FramedGrid>
      <FrameRailLeft aria-hidden />
      <FrameRailRight aria-hidden />
      <FrameRailBottom aria-hidden />
      <FrameCornerTopLeft aria-hidden>
        <PlusMark sizePx={CORNER_SIZE_PX} />
      </FrameCornerTopLeft>
      <FrameCornerTopRight aria-hidden>
        <PlusMark sizePx={CORNER_SIZE_PX} />
      </FrameCornerTopRight>
      <FrameCornerBottomLeft aria-hidden>
        <PlusMark sizePx={CORNER_SIZE_PX} />
      </FrameCornerBottomLeft>
      <FrameCornerBottomRight aria-hidden>
        <PlusMark sizePx={CORNER_SIZE_PX} />
      </FrameCornerBottomRight>
      <CardGrid>
        {CASE_STUDY_CATALOG.map((entry, index) => (
          <CaseStudyCard
            accent={getCaseStudyAccent(index)}
            entry={entry}
            key={entry.slug}
            variant={index === 0 || index === lastIndex ? 'large' : 'default'}
          />
        ))}
      </CardGrid>
    </FramedGrid>
  );
}
