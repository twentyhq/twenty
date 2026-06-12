'use client';

import { styled } from '@linaria/react';
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { clampToRange } from '@/platform/motion';
import { EASING } from '@/tokens';
import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

import {
  movePipelineCard,
  type PipelineCardId,
  type PipelineLaneIndex,
  type PipelineLanes,
} from './pipeline-move-card';

const card = PRODUCT_FEATURE_SCENE.card;
const pipelineScene = PRODUCT_FEATURE_SCENE.pipeline;

const CARD_DROP_MS = 300;

type PipelineTone = keyof typeof pipelineScene.tones;
type PipelineLaneKey = keyof typeof pipelineScene.laneStyles;

type PersonData = {
  avatarUrl?: string;
  initials: string;
  name: string;
  tone: PipelineTone;
};

type CompanyData = {
  initials: string;
  logoSrc?: string;
  name: string;
  tone: PipelineTone;
};

type DealData = {
  amount: string;
  company: CompanyData;
  contact: PersonData;
  date: string;
  header: CompanyData;
  id: PipelineCardId;
  owner: PersonData;
  rating: number;
  recordId: string;
};

const PEOPLE_AVATARS = sharedAssetUrls.peopleAvatars;

const companyLogo = (domain: string): string => {
  const logoUrl = sharedAssetUrls.companyLogoForDomain(domain);

  if (logoUrl === undefined) {
    throw new Error(`Missing shared company logo for ${domain}`);
  }

  return logoUrl;
};

// Mock fiction deal cards (product-screenshot copy, English).
const CARDS: Record<PipelineCardId, DealData> = {
  github: {
    id: 'github',
    header: {
      initials: 'G',
      logoSrc: companyLogo('github.com'),
      name: 'Github',
      tone: 'gray',
    },
    amount: '$6,562.04',
    company: {
      initials: 'G',
      logoSrc: companyLogo('github.com'),
      name: 'Github',
      tone: 'gray',
    },
    owner: {
      avatarUrl: PEOPLE_AVATARS.eddyCue,
      initials: 'E',
      name: 'Eddy Cue',
      tone: 'amber',
    },
    rating: 2,
    date: 'Jun 16, 2023',
    contact: {
      avatarUrl: PEOPLE_AVATARS.chrisWanstrath,
      initials: 'C',
      name: 'Chris Wanstrath',
      tone: 'gray',
    },
    recordId: 'OPP-1',
  },
  figma: {
    id: 'figma',
    header: {
      initials: 'F',
      logoSrc: companyLogo('figma.com'),
      name: 'Figma',
      tone: 'purple',
    },
    amount: '$6,562.04',
    company: {
      initials: 'F',
      logoSrc: companyLogo('figma.com'),
      name: 'Figma',
      tone: 'purple',
    },
    owner: {
      avatarUrl: PEOPLE_AVATARS.jeffWilliams,
      initials: 'J',
      name: 'Jeff Williams',
      tone: 'blue',
    },
    rating: 2,
    date: 'Jun 21, 2023',
    contact: {
      avatarUrl: PEOPLE_AVATARS.dylanField,
      initials: 'D',
      name: 'Dylan Field',
      tone: 'pink',
    },
    recordId: 'OPP-2',
  },
  airbnb: {
    id: 'airbnb',
    header: {
      initials: 'A',
      logoSrc: companyLogo('airbnb.com'),
      name: 'Airbnb',
      tone: 'pink',
    },
    amount: '$2,433.89',
    company: {
      initials: 'A',
      logoSrc: companyLogo('airbnb.com'),
      name: 'Airbnb',
      tone: 'pink',
    },
    owner: {
      avatarUrl: PEOPLE_AVATARS.katherineAdams,
      initials: 'K',
      name: 'Katherine Adams',
      tone: 'red',
    },
    rating: 3,
    date: 'Jun 6, 2023',
    contact: { initials: 'I', name: 'Ivan Zhao', tone: 'gray' },
    recordId: 'OPP-8',
  },
  notion: {
    id: 'notion',
    header: {
      initials: 'N',
      logoSrc: companyLogo('notion.com'),
      name: 'Notion',
      tone: 'gray',
    },
    amount: '$2,650',
    company: {
      initials: 'N',
      logoSrc: companyLogo('notion.com'),
      name: 'Notion',
      tone: 'gray',
    },
    owner: { initials: 'A', name: 'Airbnb', tone: 'yellow' },
    rating: 2,
    date: 'Jun 6, 2023',
    contact: { initials: 'I', name: 'Ivan Zhao', tone: 'gray' },
    recordId: 'OPP-6',
  },
};

const INITIAL_LANES: PipelineLanes = [
  ['github', 'figma'],
  ['airbnb', 'notion'],
];

const LANES_META: { key: PipelineLaneKey; label: string }[] = [
  { key: 'pink', label: 'Identified' },
  { key: 'purple', label: 'Qualified' },
];

const STAR_COUNT = 5;

const STAR_NUMBERS = Array.from(
  { length: STAR_COUNT },
  (_, starNumber) => starNumber,
);

const Root = styled.div`
  background: ${card.background};
  display: flex;
  flex-direction: column;
  font-family: ${card.font};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BoardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${card.border};
  display: flex;
  gap: 4px;
  height: 34px;
  padding: 0 14px;
`;

const BoardTitle = styled.span`
  color: ${card.text};
  font-size: 13px;
  font-weight: 500;
`;

const BoardCount = styled.span`
  color: ${card.textTertiary};
  font-size: 13px;
`;

const ColumnsHeaderGrid = styled.div`
  border-bottom: 1px solid ${card.border};
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const LaneHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  padding: 8px 12px;
`;

const LanePill = styled.span<{ $ink: string; $wash: string }>`
  align-items: center;
  background: ${({ $wash }) => $wash};
  border-radius: 4px;
  color: ${({ $ink }) => $ink};
  display: inline-flex;
  font-size: 12px;
  font-weight: 500;
  height: 22px;
  padding: 0 8px;
`;

const LaneCount = styled.span`
  color: ${card.textTertiary};
  font-size: 12px;
`;

const ColumnsGrid = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
  overflow: hidden;
`;

const LaneBody = styled.div`
  border-right: 1px solid ${card.border};
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 40px;
  overflow-y: auto;
  padding: 8px;

  &:last-child {
    border-right: none;
  }
`;

const DealCardShell = styled.div`
  background: ${pipelineScene.cardBackground};
  border: 1px solid ${pipelineScene.cardBorder};
  border-radius: 8px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &[data-dragging] {
    opacity: 0;
  }
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  padding: 8px 8px 4px;
`;

const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px 8px;
`;

const FieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  min-height: 22px;
`;

const FieldIcon = styled.div`
  align-items: center;
  color: ${card.textTertiary};
  display: flex;
  flex: 0 0 14px;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const FieldValue = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
`;

const ValueText = styled.span`
  color: ${card.text};
  font-size: 11.5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TokenChip = styled.span`
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  gap: 4px;
  height: 18px;
  max-width: 100%;
  overflow: hidden;
  padding: 2px 4px 2px 0;

  &[data-soft] {
    background: ${pipelineScene.softChipWash};
    padding: 2px 4px;
  }
`;

const TokenMark = styled.span<{ $ink: string; $wash: string }>`
  align-items: center;
  background: ${({ $wash }) => $wash};
  border-radius: 3px;
  color: ${({ $ink }) => $ink};
  display: inline-flex;
  flex: 0 0 14px;
  font-size: 8px;
  font-weight: 600;
  height: 14px;
  justify-content: center;
  overflow: hidden;
  width: 14px;

  &[data-round] {
    border-radius: 999px;
  }
`;

const TokenImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const TokenLabel = styled.span`
  color: ${card.text};
  font-size: 11.5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderTokenChip = styled.span`
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  gap: 4px;
  height: 22px;
  max-width: 100%;
  overflow: hidden;
  padding: 4px;
`;

const HeaderTokenLabel = styled(TokenLabel)`
  font-weight: 500;
`;

const RatingRow = styled.div`
  display: inline-flex;
  gap: 1px;
`;

const AddCardRow = styled.div`
  align-items: center;
  color: ${card.textTertiary};
  display: flex;
  font-size: 11px;
  gap: 4px;
  padding: 4px 8px;
`;

const InteractionLayer = styled.div`
  inset: 0;
  position: absolute;
  z-index: 50;
`;

const FloatingCardShell = styled.div`
  box-shadow: ${pipelineScene.floatingShadow};
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform-origin: center center;
  width: calc(50% - 20px);
  z-index: 100;
`;

function CompanyMark({ data }: { data: CompanyData }) {
  const [failed, setFailed] = useState(false);
  const tone = pipelineScene.tones[data.tone];

  return (
    <TokenMark $ink={tone.color} $wash={tone.background}>
      {data.logoSrc && !failed ? (
        <TokenImage alt="" src={data.logoSrc} onError={() => setFailed(true)} />
      ) : (
        data.initials
      )}
    </TokenMark>
  );
}

function PersonMark({ data }: { data: PersonData }) {
  const [failed, setFailed] = useState(false);
  const tone = pipelineScene.tones[data.tone];

  return (
    <TokenMark $ink={tone.color} $wash={tone.background} data-round="">
      {data.avatarUrl && !failed ? (
        <TokenImage
          alt=""
          src={data.avatarUrl}
          onError={() => setFailed(true)}
        />
      ) : (
        data.initials
      )}
    </TokenMark>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      fill={filled ? pipelineScene.starFilled : 'none'}
      height="11"
      stroke={filled ? pipelineScene.starFilled : pipelineScene.starEmpty}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="11"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}

// The deal card's body, shared by lane cards and the drag ghost. The
// field glyphs are authored scene artwork, verbatim.
function OpportunityCard({ data }: { data: DealData }) {
  return (
    <>
      <CardHeader>
        <HeaderTokenChip>
          <CompanyMark data={data.header} />
          <HeaderTokenLabel>{data.header.name}</HeaderTokenLabel>
        </HeaderTokenChip>
      </CardHeader>
      <CardFields>
        <FieldRow>
          <FieldIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.amount}</ValueText>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
            </svg>
          </FieldIcon>
          <FieldValue>
            <TokenChip data-soft="">
              <CompanyMark data={data.company} />
              <TokenLabel>{data.company.name}</TokenLabel>
            </TokenChip>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="14"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="10" r="3" />
              <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
            </svg>
          </FieldIcon>
          <FieldValue>
            <TokenChip>
              <PersonMark data={data.owner} />
              <TokenLabel>{data.owner.name}</TokenLabel>
            </TokenChip>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M3 12h2l2-4 3 8 2-4h2" />
            </svg>
          </FieldIcon>
          <FieldValue>
            <RatingRow>
              {STAR_NUMBERS.map((starNumber) => (
                <StarIcon filled={starNumber < data.rating} key={starNumber} />
              ))}
            </RatingRow>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="14"
            >
              <rect height="16" rx="2" width="18" x="3" y="5" />
              <path d="M16 3v4M8 3v4M3 9h18" />
            </svg>
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.date}</ValueText>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
          </FieldIcon>
          <FieldValue>
            <TokenChip data-soft="">
              <PersonMark data={data.contact} />
              <TokenLabel>{data.contact.name}</TokenLabel>
            </TokenChip>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
              width="14"
            >
              <rect height="14" rx="3" width="18" x="3" y="5" />
              <path d="M7 9h10M7 13h6" />
            </svg>
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.recordId}</ValueText>
          </FieldValue>
        </FieldRow>
      </CardFields>
    </>
  );
}

type DragState = {
  cardId: PipelineCardId;
  lastX: number;
  lastY: number;
  maxX: number;
  maxY: number;
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
};

// A picked-up card hides in its lane while a floating ghost follows the
// pointer; dropping splices it where the pointer sits and every displaced
// card FLIPs into place via WAAPI. The ghost transform writes straight to
// the element per frame; React renders only on pick-up, drop and reorder.
export function PipelineVisual({ active: _active }: { active: boolean }) {
  const [lanes, setLanes] = useState<PipelineLanes>(INITIAL_LANES);
  const [draggedCardId, setDraggedCardId] = useState<PipelineCardId | null>(
    null,
  );

  const interactionRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const laneBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<
    Partial<Record<PipelineCardId, HTMLDivElement | null>>
  >({});
  const pendingRectsRef = useRef<Partial<Record<PipelineCardId, DOMRect>>>({});
  const animationsRef = useRef<Partial<Record<PipelineCardId, Animation>>>({});
  const activePointerRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  useLayoutEffect(() => {
    const previousRects = pendingRectsRef.current;
    const cardIds = Object.keys(previousRects) as PipelineCardId[];

    if (cardIds.length === 0) {
      return;
    }
    pendingRectsRef.current = {};

    for (const cardId of cardIds) {
      const previousRect = previousRects[cardId];
      const element = cardRefs.current[cardId];
      const nextRect = element?.getBoundingClientRect();

      if (!previousRect || !element || !nextRect) {
        continue;
      }
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        continue;
      }

      animationsRef.current[cardId]?.cancel();
      animationsRef.current[cardId] = element.animate(
        [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        { duration: CARD_DROP_MS, easing: EASING.standard },
      );
    }
  }, [lanes]);

  const captureRects = () => {
    const rects: Partial<Record<PipelineCardId, DOMRect>> = {};

    for (const lane of lanes) {
      for (const cardId of lane) {
        const element = cardRefs.current[cardId];

        if (element) {
          rects[cardId] = element.getBoundingClientRect();
        }
      }
    }
    pendingRectsRef.current = rects;
  };

  const getDropTarget = (
    clientX: number,
    clientY: number,
    cardId: PipelineCardId,
  ): { cardIndex: number; laneIndex: PipelineLaneIndex } | null => {
    const matchedLane = laneBodyRefs.current.findIndex((element) => {
      const rect = element?.getBoundingClientRect();
      return (
        rect &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    });

    if (matchedLane !== 0 && matchedLane !== 1) {
      return null;
    }
    const laneIndex = matchedLane as PipelineLaneIndex;
    const laneCardIds = lanes[laneIndex].filter(
      (laneCardId) => laneCardId !== cardId,
    );
    let cardIndex = laneCardIds.length;

    for (const [index, laneCardId] of laneCardIds.entries()) {
      const rect = cardRefs.current[laneCardId]?.getBoundingClientRect();

      if (rect && clientY < rect.top + rect.height / 2) {
        cardIndex = index;
        break;
      }
    }

    return { cardIndex, laneIndex };
  };

  const moveGhost = (x: number, y: number) => {
    ghostRef.current?.style.setProperty(
      'transform',
      `translate3d(${x}px, ${y}px, 0)`,
    );
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    cardId: PipelineCardId,
  ) => {
    event.preventDefault();
    const layerRect = interactionRef.current?.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();

    if (!layerRect || dragStateRef.current) {
      return;
    }

    dragStateRef.current = {
      cardId,
      lastX: event.clientX,
      lastY: event.clientY,
      maxX: layerRect.width - cardRect.width,
      maxY: layerRect.height - cardRect.height,
      originX: cardRect.left - layerRect.left,
      originY: cardRect.top - layerRect.top,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    setDraggedCardId(cardId);
    activePointerRef.current = event.pointerId;
    interactionRef.current?.setPointerCapture(event.pointerId);
  };

  const finishDrag = (clientX: number, clientY: number) => {
    const state = dragStateRef.current;

    if (!state) {
      return;
    }
    const dropTarget = getDropTarget(clientX, clientY, state.cardId);

    if (dropTarget) {
      captureRects();
      setLanes((previous) =>
        movePipelineCard(
          previous,
          state.cardId,
          dropTarget.laneIndex,
          dropTarget.cardIndex,
        ),
      );
    }
    dragStateRef.current = null;
    setDraggedCardId(null);
    activePointerRef.current = null;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    event.preventDefault();
    const state = dragStateRef.current;

    if (!state) {
      return;
    }
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    moveGhost(
      clampToRange(
        state.originX + event.clientX - state.pointerX,
        0,
        state.maxX,
      ),
      clampToRange(
        state.originY + event.clientY - state.pointerY,
        0,
        state.maxY,
      ),
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    event.preventDefault();
    finishDrag(event.clientX, event.clientY);

    if (interactionRef.current?.hasPointerCapture(event.pointerId)) {
      interactionRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    const state = dragStateRef.current;
    finishDrag(state?.lastX ?? event.clientX, state?.lastY ?? event.clientY);

    if (interactionRef.current?.hasPointerCapture(event.pointerId)) {
      interactionRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handleLostCapture = () => {
    const state = dragStateRef.current;

    if (state) {
      finishDrag(state.lastX, state.lastY);
    }
    activePointerRef.current = null;
  };

  useEffect(() => {
    const layer = interactionRef.current;
    return () => {
      if (activePointerRef.current !== null && layer) {
        try {
          layer.releasePointerCapture(activePointerRef.current);
        } catch {
          // The pointer was already released by the browser.
        }
      }
    };
  }, []);

  const laneHeaders = LANES_META.map((meta, laneNumber) => ({
    laneNumber,
    meta,
  }));
  const laneBodies = lanes.map((laneCardIds, laneNumber) => ({
    laneCardIds,
    laneNumber,
  }));
  const dragOrigin = dragStateRef.current;

  return (
    <Root>
      <BoardHeader>
        <svg
          fill="none"
          height="14"
          stroke={card.textTertiary}
          strokeLinecap="round"
          strokeWidth="1.6"
          viewBox="0 0 24 24"
          width="14"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <BoardTitle>All opportunities</BoardTitle>
        <BoardCount>· 4</BoardCount>
      </BoardHeader>

      <ColumnsHeaderGrid>
        {laneHeaders.map(({ laneNumber, meta }) => {
          const style = pipelineScene.laneStyles[meta.key];

          return (
            <LaneHeader key={meta.key}>
              <LanePill $ink={style.text} $wash={style.pill}>
                {meta.label}
              </LanePill>
              <LaneCount>{lanes[laneNumber].length}</LaneCount>
            </LaneHeader>
          );
        })}
      </ColumnsHeaderGrid>

      <ColumnsGrid>
        {laneBodies.map(({ laneCardIds, laneNumber }) => (
          <LaneBody
            key={laneNumber}
            ref={(element) => {
              laneBodyRefs.current[laneNumber] = element;
            }}
          >
            {laneCardIds.map((cardId) => (
              <DealCardShell
                data-dragging={draggedCardId === cardId ? '' : undefined}
                key={cardId}
                onPointerDown={(event) => handlePointerDown(event, cardId)}
                ref={(element) => {
                  cardRefs.current[cardId] = element;
                }}
              >
                <OpportunityCard data={CARDS[cardId]} />
              </DealCardShell>
            ))}
            <AddCardRow>
              <svg
                fill="none"
                height="12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.6"
                viewBox="0 0 16 16"
                width="12"
              >
                <path d="M8 3v10M3 8h10" />
              </svg>
              New
            </AddCardRow>
          </LaneBody>
        ))}
      </ColumnsGrid>

      <InteractionLayer
        onLostPointerCapture={handleLostCapture}
        onPointerCancel={handlePointerCancel}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={interactionRef}
        style={{ pointerEvents: draggedCardId ? 'auto' : 'none' }}
      >
        {draggedCardId && dragOrigin ? (
          <FloatingCardShell
            ref={ghostRef}
            style={{
              transform: `translate3d(${dragOrigin.originX}px, ${dragOrigin.originY}px, 0)`,
            }}
          >
            <DealCardShell>
              <OpportunityCard data={CARDS[draggedCardId]} />
            </DealCardShell>
          </FloatingCardShell>
        ) : null}
      </InteractionLayer>
    </Root>
  );
}
