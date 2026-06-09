'use client';

import {
  SHARED_COMPANY_LOGO_URLS,
  SHARED_PEOPLE_AVATAR_URLS,
} from '@/content/site/asset-paths';
import { RatingStarIcon } from '@/icons';
import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheck,
  IconCurrencyDollar,
  IconId,
  IconStar,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  BG_DARK,
  CARD_ACCENT,
  CARD_BG,
  CARD_BORDER,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
} from './visual-tokens';

const LANE_STYLES: Record<string, { bg: string; pill: string; text: string }> =
  {
    pink: {
      bg: 'rgba(236,72,153,0.06)',
      pill: 'rgba(236,72,153,0.12)',
      text: '#f472b6',
    },
    purple: {
      bg: 'rgba(168,85,247,0.06)',
      pill: 'rgba(168,85,247,0.12)',
      text: '#c084fc',
    },
    blue: {
      bg: 'rgba(59,130,246,0.06)',
      pill: 'rgba(59,130,246,0.12)',
      text: '#93c5fd',
    },
  };

const CARD_DROP_MS = 300;
const CARD_DROP_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

type CardId = 'airbnb' | 'figma' | 'github' | 'notion';
type LaneIndex = number;
type LaneCards = CardId[][];

type PersonData = {
  avatarUrl?: string;
  initials: string;
  name: string;
  tone: string;
};
type CompanyData = {
  initials: string;
  logoSrc?: string;
  name: string;
  tone: string;
};
type DealData = {
  amount: string;
  company: CompanyData;
  contact: PersonData;
  date: string;
  id: CardId;
  owner: PersonData;
  rating: number;
  recordId: string;
  title: string;
};

const CARDS: Record<CardId, DealData> = {
  github: {
    id: 'github',
    title: 'Platform Expansion',
    amount: '$6,562.04',
    company: {
      initials: 'G',
      logoSrc: SHARED_COMPANY_LOGO_URLS.github,
      name: 'Github',
      tone: 'gray',
    },
    owner: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.eddyCue,
      initials: 'E',
      name: 'Eddy Cue',
      tone: 'amber',
    },
    rating: 2,
    date: 'Jun 16, 2023',
    contact: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.chrisWanstrath,
      initials: 'C',
      name: 'Chris Wanstrath',
      tone: 'gray',
    },
    recordId: 'OPP-1',
  },
  figma: {
    id: 'figma',
    title: 'Design Tooling',
    amount: '$8,250.00',
    company: {
      initials: 'F',
      logoSrc: SHARED_COMPANY_LOGO_URLS.figma,
      name: 'Figma',
      tone: 'purple',
    },
    owner: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.jeffWilliams,
      initials: 'J',
      name: 'Jeff Williams',
      tone: 'blue',
    },
    rating: 2,
    date: 'Jun 21, 2023',
    contact: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.dylanField,
      initials: 'D',
      name: 'Dylan Field',
      tone: 'pink',
    },
    recordId: 'OPP-2',
  },
  airbnb: {
    id: 'airbnb',
    title: 'Travel Partnership',
    amount: '$2,433.89',
    company: {
      initials: 'A',
      logoSrc: SHARED_COMPANY_LOGO_URLS.airbnb,
      name: 'Airbnb',
      tone: 'pink',
    },
    owner: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.katherineAdams,
      initials: 'K',
      name: 'Katherine Adams',
      tone: 'red',
    },
    rating: 3,
    date: 'Jun 6, 2023',
    contact: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.brianChesky,
      initials: 'B',
      name: 'Brian Chesky',
      tone: 'gray',
    },
    recordId: 'OPP-8',
  },
  notion: {
    id: 'notion',
    title: 'Workspace Rollout',
    amount: '$2,650',
    company: {
      initials: 'N',
      logoSrc: SHARED_COMPANY_LOGO_URLS.notion,
      name: 'Notion',
      tone: 'gray',
    },
    owner: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.craigFederighi,
      initials: 'C',
      name: 'Craig Federighi',
      tone: 'yellow',
    },
    rating: 2,
    date: 'Jun 6, 2023',
    contact: {
      avatarUrl: SHARED_PEOPLE_AVATAR_URLS.ivanZhao,
      initials: 'I',
      name: 'Ivan Zhao',
      tone: 'gray',
    },
    recordId: 'OPP-6',
  },
};

const INITIAL_LANES: LaneCards = [['github', 'figma'], ['airbnb'], ['notion']];
const LANES_META = [
  { key: 'pink', label: 'Identified' },
  { key: 'purple', label: 'Qualified' },
  { key: 'blue', label: 'Proposal' },
];

const Root = styled.div`
  background: ${BG_DARK};
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BoardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${CARD_BORDER};
  display: flex;
  gap: 4px;
  height: 34px;
  padding: 0 14px;
`;

const BoardTitle = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 500;
`;

const BoardCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 13px;
`;

const ColumnsHeaderGrid = styled.div`
  border-bottom: 1px solid ${CARD_BORDER};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`;

const LaneHeaderEl = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  padding: 8px 12px;
`;

const LanePill = styled.span<{ $bg: string; $color: string }>`
  background: ${({ $bg }) => $bg};
  border-radius: 4px;
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 500;
  height: 22px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
`;

const LaneCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 12px;
`;

const ColumnsGrid = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr 1fr;
  min-height: 0;
  overflow: hidden;
`;

const LaneBody = styled.div`
  border-right: 1px solid ${CARD_BORDER};
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

const CardEl = styled.div<{ $dragging?: boolean; $selected?: boolean }>`
  background: ${({ $selected }) =>
    $selected ? 'rgba(62, 99, 221, 0.12)' : CARD_BG};
  border: 1px solid
    ${({ $selected }) => ($selected ? CARD_ACCENT : CARD_BORDER)};
  border-radius: 4px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  opacity: ${({ $dragging }) => ($dragging ? 0 : 1)};
  overflow: hidden;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &:hover .card-checkbox {
    max-width: 14px;
    opacity: 1;
  }
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding: 8px 8px 4px;
`;

const CardTitle = styled.span`
  color: ${CARD_TEXT};
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardCheckbox = styled.span`
  align-items: center;
  border: 1px solid ${CARD_TEXT_TERTIARY};
  border-radius: 3px;
  box-sizing: border-box;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 14px;
  justify-content: center;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition: all ease-in-out 160ms;
  width: 14px;

  svg {
    height: 10px;
    width: 10px;
  }

  &[data-checked='true'] {
    background: ${CARD_ACCENT};
    border-color: ${CARD_ACCENT};
    max-width: 14px;
    opacity: 1;
  }
`;

const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px 4px 10px;
`;

const FieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 22px;
`;

const FieldIcon = styled.div`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: flex;
  flex: 0 0 14px;
  height: 14px;
  justify-content: center;
  width: 14px;

  svg {
    height: 14px;
    width: 14px;
  }
`;

const FieldValue = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
`;

const ValueText = styled.span`
  color: ${CARD_TEXT};
  font-size: 11.5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TokenChip = styled.span<{ $soft?: boolean }>`
  align-items: center;
  background: ${({ $soft }) =>
    $soft ? 'rgba(255,255,255,0.04)' : 'transparent'};
  border-radius: 4px;
  display: inline-flex;
  gap: 4px;
  height: 18px;
  max-width: 100%;
  overflow: hidden;
  padding: ${({ $soft }) => ($soft ? '2px 4px' : '2px 4px 2px 0')};
`;

const TokenMark = styled.span<{
  $bg: string;
  $color: string;
  $round?: boolean;
}>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border-radius: ${({ $round }) => ($round ? '999px' : '3px')};
  color: ${({ $color }) => $color};
  display: inline-flex;
  flex: 0 0 14px;
  font-size: 8px;
  font-weight: 600;
  height: 14px;
  justify-content: center;
  overflow: hidden;
  width: 14px;
`;

const TokenImg = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const TokenLabel = styled.span`
  color: ${CARD_TEXT};
  font-size: 11.5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RatingRow = styled.div`
  display: inline-flex;
  gap: 1px;
`;

const AddCardRow = styled.div`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
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

const FloatingCardShell = styled.div<{ $dragging: boolean }>`
  box-shadow: ${({ $dragging }) =>
    $dragging ? '0 12px 40px rgba(0,0,0,0.5)' : 'none'};
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform-origin: center center;
  transition: box-shadow 0.15s ease;
  width: calc(33.333% - 16px);
  z-index: 100;
`;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function moveCard(
  lanes: LaneCards,
  cardId: CardId,
  targetLane: LaneIndex,
  targetIndex: number,
): LaneCards {
  const next = lanes.map((l) => l.filter((c) => c !== cardId));
  const bounded = clamp(targetIndex, 0, next[targetLane].length);
  next[targetLane] = [
    ...next[targetLane].slice(0, bounded),
    cardId,
    ...next[targetLane].slice(bounded),
  ];
  return next;
}

function CompanyMark({ data }: { data: CompanyData }) {
  const [failed, setFailed] = useState(false);

  if (data.logoSrc && !failed) {
    return (
      <TokenMark $bg="rgba(255, 255, 255, 0.08)" $color={CARD_TEXT_SECONDARY}>
        <TokenImg alt="" src={data.logoSrc} onError={() => setFailed(true)} />
      </TokenMark>
    );
  }
  return (
    <TokenMark $bg="rgba(255, 255, 255, 0.08)" $color={CARD_TEXT_SECONDARY}>
      {data.initials}
    </TokenMark>
  );
}

function PersonMark({ data }: { data: PersonData }) {
  const [failed, setFailed] = useState(false);

  if (data.avatarUrl && !failed) {
    return (
      <TokenMark
        $bg="rgba(255, 255, 255, 0.08)"
        $color={CARD_TEXT_SECONDARY}
        $round
      >
        <TokenImg alt="" src={data.avatarUrl} onError={() => setFailed(true)} />
      </TokenMark>
    );
  }
  return (
    <TokenMark
      $bg="rgba(255, 255, 255, 0.08)"
      $color={CARD_TEXT_SECONDARY}
      $round
    >
      {data.initials}
    </TokenMark>
  );
}

function OpportunityCard({
  data,
  checked,
  onToggle,
}: {
  data: DealData;
  checked: boolean;
  onToggle?: () => void;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CardCheckbox
          className="card-checkbox"
          data-checked={checked}
          onClick={
            onToggle
              ? (event) => {
                  event.stopPropagation();
                  onToggle();
                }
              : undefined
          }
          onPointerDown={
            onToggle ? (event) => event.stopPropagation() : undefined
          }
        >
          {checked ? <IconCheck /> : null}
        </CardCheckbox>
      </CardHeader>
      <CardFields>
        <FieldRow>
          <FieldIcon>
            <IconCurrencyDollar />
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.amount}</ValueText>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconBuildingSkyscraper />
          </FieldIcon>
          <FieldValue>
            <TokenChip $soft>
              <CompanyMark data={data.company} />
              <TokenLabel>{data.company.name}</TokenLabel>
            </TokenChip>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconUserCircle />
          </FieldIcon>
          <FieldValue>
            <TokenChip $soft>
              <PersonMark data={data.owner} />
              <TokenLabel>{data.owner.name}</TokenLabel>
            </TokenChip>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconStar />
          </FieldIcon>
          <FieldValue>
            <RatingRow>
              {Array.from({ length: 5 }, (_, i) => (
                <RatingStarIcon
                  key={i}
                  fillColor={
                    i < data.rating
                      ? CARD_TEXT_SECONDARY
                      : 'rgba(255, 255, 255, 0.2)'
                  }
                  size={11}
                />
              ))}
            </RatingRow>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconCalendarEvent />
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.date}</ValueText>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconUser />
          </FieldIcon>
          <FieldValue>
            <TokenChip $soft>
              <PersonMark data={data.contact} />
              <TokenLabel>{data.contact.name}</TokenLabel>
            </TokenChip>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconId />
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.recordId}</ValueText>
          </FieldValue>
        </FieldRow>
      </CardFields>
    </>
  );
}

type PipelineVisualProps = { active: boolean };

export function PipelineVisual({ active: _active }: PipelineVisualProps) {
  const [lanes, setLanes] = useState<LaneCards>(INITIAL_LANES);
  const [draggedCardId, setDraggedCardId] = useState<CardId | null>(null);
  const [checkedCards, setCheckedCards] = useState<
    Partial<Record<CardId, boolean>>
  >({});
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const interactionRef = useRef<HTMLDivElement>(null);
  const laneBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<Partial<Record<CardId, HTMLDivElement | null>>>({});
  const pendingRectsRef = useRef<Partial<Record<CardId, DOMRect>>>({});
  const animationsRef = useRef<Partial<Record<CardId, Animation>>>({});
  const activePointerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    cardId: CardId;
    lastX: number;
    lastY: number;
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    originX: number;
    originY: number;
    pointerX: number;
    pointerY: number;
  } | null>(null);

  useLayoutEffect(() => {
    const prev = pendingRectsRef.current;
    const ids = Object.keys(prev) as CardId[];
    if (ids.length === 0) return;
    pendingRectsRef.current = {};

    for (const id of ids) {
      const prevRect = prev[id];
      const el = cardRefs.current[id];
      const nextRect = el?.getBoundingClientRect();
      if (!prevRect || !el || !nextRect) continue;
      const dx = prevRect.left - nextRect.left;
      const dy = prevRect.top - nextRect.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

      animationsRef.current[id]?.cancel();
      animationsRef.current[id] = el.animate(
        [
          { transform: `translate3d(${dx}px, ${dy}px, 0)` },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        { duration: CARD_DROP_MS, easing: CARD_DROP_EASING },
      );
    }
  }, [lanes]);

  const captureRects = () => {
    const rects: Partial<Record<CardId, DOMRect>> = {};
    for (const lane of lanes) {
      for (const id of lane) {
        const el = cardRefs.current[id];
        if (el) rects[id] = el.getBoundingClientRect();
      }
    }
    pendingRectsRef.current = rects;
  };

  const getDropTarget = (
    clientX: number,
    clientY: number,
    cardId: CardId,
  ): { cardIndex: number; laneIndex: LaneIndex } | null => {
    const matchedLane = laneBodyRefs.current.findIndex((el) => {
      const rect = el?.getBoundingClientRect();
      return (
        rect &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    });
    if (matchedLane === -1) return null;
    const laneIndex = matchedLane;
    const laneCardIds = lanes[laneIndex].filter((c) => c !== cardId);
    let cardIndex = laneCardIds.length;
    for (const [i, cid] of laneCardIds.entries()) {
      const rect = cardRefs.current[cid]?.getBoundingClientRect();
      if (rect && clientY < rect.top + rect.height / 2) {
        cardIndex = i;
        break;
      }
    }
    return { cardIndex, laneIndex };
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    cardId: CardId,
  ) => {
    event.preventDefault();
    const layerRect = interactionRef.current?.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();
    if (!layerRect || dragStateRef.current) return;

    const originX = cardRect.left - layerRect.left;
    const originY = cardRect.top - layerRect.top;
    dragStateRef.current = {
      cardId,
      lastX: event.clientX,
      lastY: event.clientY,
      maxX: layerRect.width - cardRect.width,
      maxY: layerRect.height - cardRect.height,
      minX: 0,
      minY: 0,
      originX,
      originY,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    setDraggedCardId(cardId);
    setDragOffset({ x: originX, y: originY });
    setIsDragging(true);
    activePointerRef.current = event.pointerId;
    interactionRef.current?.setPointerCapture(event.pointerId);
  };

  const finishDrag = (clientX: number, clientY: number) => {
    const state = dragStateRef.current;
    if (!state) return;
    const dropTarget = getDropTarget(clientX, clientY, state.cardId);
    if (dropTarget) {
      captureRects();
      setLanes((prev) =>
        moveCard(
          prev,
          state.cardId,
          dropTarget.laneIndex,
          dropTarget.cardIndex,
        ),
      );
    }
    dragStateRef.current = null;
    setDraggedCardId(null);
    setIsDragging(false);
    activePointerRef.current = null;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) return;
    event.preventDefault();
    const state = dragStateRef.current;
    if (!state) return;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    setDragOffset({
      x: clamp(
        state.originX + event.clientX - state.pointerX,
        state.minX,
        state.maxX,
      ),
      y: clamp(
        state.originY + event.clientY - state.pointerY,
        state.minY,
        state.maxY,
      ),
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) return;
    event.preventDefault();
    finishDrag(event.clientX, event.clientY);
    if (interactionRef.current?.hasPointerCapture(event.pointerId)) {
      interactionRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) return;
    const state = dragStateRef.current;
    finishDrag(state?.lastX ?? event.clientX, state?.lastY ?? event.clientY);
    if (interactionRef.current?.hasPointerCapture(event.pointerId)) {
      interactionRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handleLostCapture = () => {
    const state = dragStateRef.current;
    if (state) finishDrag(state.lastX, state.lastY);
    activePointerRef.current = null;
  };

  useEffect(() => {
    const layer = interactionRef.current;
    return () => {
      if (activePointerRef.current !== null && layer) {
        try {
          layer.releasePointerCapture(activePointerRef.current);
        } catch {}
      }
    };
  }, []);

  return (
    <Root>
      <BoardHeader>
        <svg
          fill="none"
          height="14"
          stroke={CARD_TEXT_TERTIARY}
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
        {LANES_META.map((meta) => {
          const style = LANE_STYLES[meta.key];
          return (
            <LaneHeaderEl key={meta.key}>
              <LanePill $bg={style.pill} $color={style.text}>
                {meta.label}
              </LanePill>
              <LaneCount>{lanes[LANES_META.indexOf(meta)].length}</LaneCount>
            </LaneHeaderEl>
          );
        })}
      </ColumnsHeaderGrid>

      <ColumnsGrid>
        {lanes.map((laneCardIds, laneIndex) => (
          <LaneBody
            key={laneIndex}
            ref={(el) => {
              laneBodyRefs.current[laneIndex] = el;
            }}
          >
            {laneCardIds.map((cardId) => (
              <CardEl
                key={cardId}
                $dragging={draggedCardId === cardId}
                $selected={Boolean(checkedCards[cardId])}
                ref={(el) => {
                  cardRefs.current[cardId] = el;
                }}
                onPointerDown={(e) => handlePointerDown(e, cardId)}
              >
                <OpportunityCard
                  checked={Boolean(checkedCards[cardId])}
                  data={CARDS[cardId]}
                  onToggle={() =>
                    setCheckedCards((prev) => ({
                      ...prev,
                      [cardId]: !prev[cardId],
                    }))
                  }
                />
              </CardEl>
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
        ref={interactionRef}
        style={{ pointerEvents: isDragging ? 'auto' : 'none' }}
        onLostPointerCapture={handleLostCapture}
        onPointerCancel={handlePointerCancel}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {draggedCardId && (
          <FloatingCardShell
            $dragging={isDragging}
            style={{
              transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
            }}
          >
            <CardEl $selected={Boolean(checkedCards[draggedCardId])}>
              <OpportunityCard
                checked={Boolean(checkedCards[draggedCardId])}
                data={CARDS[draggedCardId]}
              />
            </CardEl>
          </FloatingCardShell>
        )}
      </InteractionLayer>
    </Root>
  );
}
