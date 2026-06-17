'use client';

import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconId,
  IconLayoutKanban,
  IconPlus,
  IconStar,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import {
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { Chip } from '@/app-preview/primitives/chip';
import { FaviconLogo } from '@/app-preview/primitives/favicon-logo';
import { PersonAvatar } from '@/app-preview/primitives/person-avatar';
import { PreviewTag } from '@/app-preview/primitives/preview-tag';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { type CellSelectColor } from '@/app-preview/types';
import { RatingStar } from '@/icons';
import { clampToRange } from '@/platform/motion';
import { EASING } from '@/tokens';

import {
  movePipelineCard,
  type PipelineCardId,
  type PipelineLaneIndex,
  type PipelineLanes,
} from './pipeline-move-card';

const CARD_DROP_MS = 300;

const STAR_POSITIONS = [1, 2, 3, 4, 5];

type DealPerson = {
  avatarUrl: string;
  name: string;
};

type DealCompany = {
  domain: string;
  name: string;
};

type DealData = {
  amount: string;
  company: DealCompany;
  contact: DealPerson;
  date: string;
  id: PipelineCardId;
  owner: DealPerson;
  rating: number;
  recordId: string;
  title: string;
};

const PEOPLE = sharedAssetUrls.peopleAvatars;

const CARDS: Record<PipelineCardId, DealData> = {
  github: {
    amount: '$6,562.04',
    company: { domain: 'github.com', name: 'Github' },
    contact: { avatarUrl: PEOPLE.chrisWanstrath, name: 'Chris Wanstrath' },
    date: 'Jun 16, 2023',
    id: 'github',
    owner: { avatarUrl: PEOPLE.eddyCue, name: 'Eddy Cue' },
    rating: 2,
    recordId: 'OPP-1',
    title: 'Platform Expansion',
  },
  figma: {
    amount: '$8,250.00',
    company: { domain: 'figma.com', name: 'Figma' },
    contact: { avatarUrl: PEOPLE.dylanField, name: 'Dylan Field' },
    date: 'Jun 21, 2023',
    id: 'figma',
    owner: { avatarUrl: PEOPLE.jeffWilliams, name: 'Jeff Williams' },
    rating: 2,
    recordId: 'OPP-2',
    title: 'Design Tooling',
  },
  airbnb: {
    amount: '$2,433.89',
    company: { domain: 'airbnb.com', name: 'Airbnb' },
    contact: { avatarUrl: PEOPLE.brianChesky, name: 'Brian Chesky' },
    date: 'Jun 6, 2023',
    id: 'airbnb',
    owner: { avatarUrl: PEOPLE.katherineAdams, name: 'Katherine Adams' },
    rating: 3,
    recordId: 'OPP-8',
    title: 'Travel Partnership',
  },
  notion: {
    amount: '$2,650',
    company: { domain: 'notion.com', name: 'Notion' },
    contact: { avatarUrl: PEOPLE.ivanZhao, name: 'Ivan Zhao' },
    date: 'Jun 28, 2023',
    id: 'notion',
    owner: { avatarUrl: PEOPLE.sundarPichai, name: 'Sundar Pichai' },
    rating: 2,
    recordId: 'OPP-6',
    title: 'Workspace Rollout',
  },
};

const INITIAL_LANES: PipelineLanes = [
  ['github', 'figma'],
  ['airbnb'],
  ['notion'],
];

const LANES_META: { color: CellSelectColor; label: string }[] = [
  { color: 'pink', label: 'Identified' },
  { color: 'purple', label: 'Qualified' },
  { color: 'blue', label: 'Proposal' },
];

const Root = styled.div`
  background: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: ${THEME_LIGHT.font.family};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BoardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
`;

const BoardTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
`;

const BoardCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const ColumnsHeaderGrid = styled.div`
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: repeat(3, 1fr);
`;

const LaneHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  padding: 8px 12px;
`;

const LaneCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const ColumnsGrid = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: repeat(3, 1fr);
  min-height: 0;
  overflow: hidden;
`;

const LaneBody = styled.div`
  border-right: 1px solid ${THEME_LIGHT.border.color.light};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 40px;
  min-width: 0;
  overflow-y: auto;
  padding: 8px;

  &:last-child {
    border-right: none;
  }
`;

const DealCard = styled.div`
  background: ${THEME_LIGHT.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
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
  gap: 8px;
  justify-content: space-between;
  padding: 8px 8px 4px;
`;

const CardTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div`
  border: 1px solid ${THEME_LIGHT.border.color.strong};
  border-radius: 3px;
  height: 14px;
  width: 14px;
`;

const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px 4px 10px;
`;

const FieldRowShell = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 24px;
  width: 100%;
`;

const FieldIconBox = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  flex: 0 0 16px;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const FieldValueWrap = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

const FieldText = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StarsRow = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 2px;
  padding: 0 4px;
`;

const StarGlyph = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.background.quaternary};
  display: inline-flex;
  height: 12px;
  justify-content: center;
  width: 12px;

  &[data-filled] {
    color: ${THEME_LIGHT.font.color.secondary};
  }
`;

const AddCardRow = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  gap: 4px;
  padding: 4px 8px;
`;

const InteractionLayer = styled.div`
  inset: 0;
  position: absolute;
  z-index: 50;
`;

const FloatingCardShell = styled.div`
  box-shadow: ${THEME_LIGHT.boxShadow.strong};
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform-origin: center center;
  width: calc(100% / 3 - 16px);
  z-index: 100;
`;

type FieldIconComponent = ComponentType<{
  'aria-hidden'?: boolean;
  size?: number;
  stroke?: number;
}>;

function FieldRow({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon: FieldIconComponent;
}) {
  return (
    <FieldRowShell>
      <FieldIconBox>
        <Icon aria-hidden size={16} stroke={1.6} />
      </FieldIconBox>
      <FieldValueWrap>{children}</FieldValueWrap>
    </FieldRowShell>
  );
}

function CompanyChip({ company }: { company: DealCompany }) {
  return (
    <Chip
      clickable={false}
      label={company.name}
      leftComponent={
        <FaviconLogo domain={company.domain} label={company.name} />
      }
      maxWidth={152}
      variant="highlighted"
    />
  );
}

function DealPersonChip({ person }: { person: DealPerson }) {
  return (
    <Chip
      clickable={false}
      label={person.name}
      leftComponent={
        <PersonAvatar
          person={{ avatarUrl: person.avatarUrl, name: person.name }}
        />
      }
      maxWidth={152}
      variant="highlighted"
    />
  );
}

function OpportunityCard({ data }: { data: DealData }) {
  return (
    <>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CheckboxContainer>
          <CheckboxBox />
        </CheckboxContainer>
      </CardHeader>
      <CardFields>
        <FieldRow icon={IconCurrencyDollar}>
          <FieldText>{data.amount}</FieldText>
        </FieldRow>
        <FieldRow icon={IconBuildingSkyscraper}>
          <CompanyChip company={data.company} />
        </FieldRow>
        <FieldRow icon={IconUserCircle}>
          <DealPersonChip person={data.owner} />
        </FieldRow>
        <FieldRow icon={IconStar}>
          <StarsRow>
            {STAR_POSITIONS.map((position) => (
              <StarGlyph
                data-filled={position <= data.rating ? '' : undefined}
                key={position}
              >
                <RatingStar fillColor="currentColor" />
              </StarGlyph>
            ))}
          </StarsRow>
        </FieldRow>
        <FieldRow icon={IconCalendarEvent}>
          <FieldText>{data.date}</FieldText>
        </FieldRow>
        <FieldRow icon={IconUser}>
          <DealPersonChip person={data.contact} />
        </FieldRow>
        <FieldRow icon={IconId}>
          <FieldText>{data.recordId}</FieldText>
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

    if (matchedLane < 0 || matchedLane > 2) {
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
        <IconLayoutKanban size={14} stroke={1.6} />
        <BoardTitle>All opportunities</BoardTitle>
        <BoardCount>· 4</BoardCount>
      </BoardHeader>

      <ColumnsHeaderGrid>
        {laneHeaders.map(({ laneNumber, meta }) => (
          <LaneHeader key={meta.label}>
            <PreviewTag color={meta.color} label={meta.label} />
            <LaneCount>{lanes[laneNumber].length}</LaneCount>
          </LaneHeader>
        ))}
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
              <DealCard
                data-dragging={draggedCardId === cardId ? '' : undefined}
                key={cardId}
                onPointerDown={(event) => handlePointerDown(event, cardId)}
                ref={(element) => {
                  cardRefs.current[cardId] = element;
                }}
              >
                <OpportunityCard data={CARDS[cardId]} />
              </DealCard>
            ))}
            <AddCardRow>
              <IconPlus size={12} stroke={1.6} />
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
            <DealCard>
              <OpportunityCard data={CARDS[draggedCardId]} />
            </DealCard>
          </FloatingCardShell>
        ) : null}
      </InteractionLayer>
    </Root>
  );
}
