'use client';

import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconChevronDown,
  IconCreativeCommonsSa,
  IconCurrencyDollar,
  IconLayoutKanban,
  IconPlus,
  IconRobot,
  IconUser,
} from '@tabler/icons-react';
import {
  type ComponentType,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { Chip } from '@/app-preview/primitives/Chip';
import { FaviconLogo } from '@/app-preview/primitives/FaviconLogo';
import { PersonAvatar } from '@/app-preview/primitives/PersonAvatar';
import { PreviewAvatar } from '@/app-preview/primitives/PreviewAvatar';
import { PreviewTag } from '@/app-preview/primitives/PreviewTag';
import { type CellSelectColor } from '@/app-preview/types';
import { clampToRange } from '@/platform/motion';
import { EASING } from '@/tokens';

import {
  movePipelineCard,
  type PipelineCardId,
  type PipelineLaneIndex,
  type PipelineLanes,
} from './pipeline-move-card';

const CARD_DROP_MS = 300;

type DealPerson = {
  avatarUrl: string;
  name: string;
};

type DealCompany = {
  domain: string;
  name: string;
};

// The record's creator, mirroring twenty's createdBy actor: a teammate shows a
// rounded avatar, while non-human sources (API, system) show their source icon.
type DealActor = {
  avatarUrl?: string;
  name: string;
  source: 'member' | 'system';
};

type DealData = {
  amount: string;
  avatarTone: string;
  company: DealCompany;
  contact: DealPerson;
  createdBy: DealActor;
  date: string;
  id: PipelineCardId;
  title: string;
};

const PEOPLE = sharedAssetUrls.peopleAvatars;

const CARDS: Record<PipelineCardId, DealData> = {
  github: {
    amount: '$75k',
    avatarTone: 'blue',
    company: { domain: 'github.com', name: 'Github' },
    contact: { avatarUrl: PEOPLE.chrisWanstrath, name: 'Chris Wanstrath' },
    createdBy: { name: 'System', source: 'system' },
    date: 'Jan 25, 2026 9:26 PM',
    id: 'github',
    title: 'API Integration Deal',
  },
  figma: {
    amount: '$30k',
    avatarTone: 'orange',
    company: { domain: 'figma.com', name: 'Figma' },
    contact: { avatarUrl: PEOPLE.dylanField, name: 'Dylan Field' },
    createdBy: { name: 'System', source: 'system' },
    date: 'Jan 15, 2026 9:27 PM',
    id: 'figma',
    title: 'Design Partnership',
  },
  airbnb: {
    amount: '$50k',
    avatarTone: 'green',
    company: { domain: 'airbnb.com', name: 'Airbnb' },
    contact: { avatarUrl: PEOPLE.brianChesky, name: 'Brian Chesky' },
    createdBy: {
      avatarUrl: PEOPLE.eddyCue,
      name: 'Eddy Cue',
      source: 'member',
    },
    date: 'Mar 10, 2026 9:26 PM',
    id: 'airbnb',
    title: 'Enterprise Plan Upgrade',
  },
  notion: {
    amount: '$45k',
    avatarTone: 'purple',
    company: { domain: 'notion.com', name: 'Notion' },
    contact: { avatarUrl: PEOPLE.ivanZhao, name: 'Ivan Zhao' },
    createdBy: {
      avatarUrl: PEOPLE.anonymousFelix,
      name: 'Félix Malfait',
      source: 'member',
    },
    date: 'Feb 18, 2026 3:14 PM',
    id: 'notion',
    title: 'Workspace Rollout',
  },
  stripe: {
    amount: '$60k',
    avatarTone: 'pink',
    company: { domain: 'stripe.com', name: 'Stripe' },
    contact: { avatarUrl: PEOPLE.patrickCollison, name: 'Patrick Collison' },
    createdBy: { name: 'System', source: 'system' },
    date: 'Feb 2, 2026 11:02 AM',
    id: 'stripe',
    title: 'Billing Expansion',
  },
};

const INITIAL_LANES: PipelineLanes = [
  ['github', 'notion'],
  ['airbnb'],
  ['figma', 'stripe'],
];

const LANES_META: { color: CellSelectColor; label: string }[] = [
  { color: 'pink', label: 'New' },
  { color: 'purple', label: 'Meeting' },
  { color: 'blue', label: 'Customer' },
];

const Root = styled.div`
  background: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BoardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
`;

const BoardTitle = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
`;

// Mirrors twenty-front's StyledDropdownLabelAdornments: the record count and
// the dropdown chevron both read gray8, distinct from the secondary view name.
const BoardAdornments = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.color.gray8};
  display: flex;
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  gap: 4px;
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
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;

  &:hover {
    border-color: ${THEME_LIGHT.border.color.strong};
  }

  &:hover .deal-card-checkbox {
    max-width: 24px;
    opacity: 1;
    pointer-events: auto;
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

// The record identifier (avatar + name), mirroring twenty-front's
// StyledRecordChipContainer: flexes to fill so the name ellipsizes and the
// selection checkbox sits at the right edge.
const CardIdentifier = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
`;

const CardTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  flex: 1 1 auto;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// twenty-front's checkbox-container: hidden until the card is hovered, then
// the DealCard :hover rule eases it open (max-width 0 → 24px). The 5px padding
// matches the hoverable checkbox's tap target.
const CardCheckbox = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin-left: auto;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  padding: 5px;
  pointer-events: none;
  transition: all ease-in-out 160ms;
`;

// The Secondary checkbox, unchecked: a square outlined in secondaryInverted.
const CheckboxBox = styled.div`
  border: 1px solid ${THEME_LIGHT.border.color.secondaryInverted};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  flex-shrink: 0;
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

// twenty-front's inline-cell hover (StyledRecordInlineCellNormalModeOuterContainer):
// editable values fill with a transparent.light background and a pointer cursor;
// readonly fields (data-readonly, e.g. Created by) instead show a medium outline
// with the default cursor. Hugs its content so the highlight wraps the value.
const HoverableValue = styled.div`
  align-items: center;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  cursor: pointer;
  display: inline-flex;
  max-width: 100%;
  min-width: 0;
  outline: 1px solid transparent;
  /* The value sits inside overflow:hidden wrappers, so an outset outline would
     clip; inset it by 1px so the readonly border renders in full. */
  outline-offset: -1px;
  overflow: hidden;
  padding: 2px 4px;

  &:hover {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }

  &[data-readonly] {
    cursor: default;
  }

  &[data-readonly]:hover {
    background-color: transparent;
    outline-color: ${THEME_LIGHT.border.color.medium};
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

function renderCreatedByLeftComponent(actor: DealActor): ReactNode {
  if (actor.source === 'member') {
    return (
      <PersonAvatar
        person={{
          avatarUrl: actor.avatarUrl,
          kind: 'person',
          name: actor.name,
        }}
      />
    );
  }
  return <IconRobot size={16} stroke={1.6} />;
}

function CreatedByChip({ actor }: { actor: DealActor }) {
  return (
    <Chip
      clickable={false}
      label={actor.name}
      leftComponent={renderCreatedByLeftComponent(actor)}
      variant="transparent"
    />
  );
}

function OpportunityCard({ data }: { data: DealData }) {
  return (
    <>
      <CardHeader>
        <CardIdentifier>
          <PreviewAvatar size={16} tone={data.avatarTone}>
            {data.title.charAt(0)}
          </PreviewAvatar>
          <CardTitle>{data.title}</CardTitle>
        </CardIdentifier>
        <CardCheckbox className="deal-card-checkbox">
          <CheckboxBox />
        </CardCheckbox>
      </CardHeader>
      <CardFields>
        <FieldRow icon={IconCurrencyDollar}>
          <HoverableValue>
            <FieldText>{data.amount}</FieldText>
          </HoverableValue>
        </FieldRow>
        <FieldRow icon={IconCreativeCommonsSa}>
          <HoverableValue data-readonly="">
            <CreatedByChip actor={data.createdBy} />
          </HoverableValue>
        </FieldRow>
        <FieldRow icon={IconCalendarEvent}>
          <HoverableValue>
            <FieldText>{data.date}</FieldText>
          </HoverableValue>
        </FieldRow>
        <FieldRow icon={IconBuildingSkyscraper}>
          <CompanyChip company={data.company} />
        </FieldRow>
        <FieldRow icon={IconUser}>
          <DealPersonChip person={data.contact} />
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
        <BoardTitle>By Stage</BoardTitle>
        <BoardAdornments>
          · 5
          <IconChevronDown size={14} stroke={1.6} />
        </BoardAdornments>
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
              <IconPlus size={16} stroke={1.6} />
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
