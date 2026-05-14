'use client';

import { styled } from '@linaria/react';
import { type ReactNode, useCallback, useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import { STEPPER_BG, STEPPER_FONT } from './stepper-visual-tokens';

const COLOR_INDIGO_BG = '#d9e2fc';
const COLOR_INDIGO_BORDER = '#c6d4f9';
const COLOR_PURPLE_BG = '#eddbf9';
const COLOR_PURPLE_BORDER = '#e3ccf4';
const COLOR_RED_BG = '#fdd8d8';
const COLOR_RED_BORDER = '#f9c6c6';
const COLOR_GREEN_BG = '#d4f4e2';
const COLOR_GREEN_BORDER = '#b4e7cf';

const BADGE_STANDARD_BG = '#f0f4ff';
const BADGE_STANDARD_BORDER = '#e6edfe';
const BADGE_STANDARD_TEXT = '#3e63dd';
const BADGE_CUSTOM_BG = '#fff1e7';
const BADGE_CUSTOM_BORDER = '#ffe8d7';
const BADGE_CUSTOM_TEXT = '#f76808';

const ICON_PROPS = {
  fill: 'none',
  height: 12,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.5,
  viewBox: '0 0 24 24',
  width: 12,
};

const ICON_SM_PROPS = {
  ...ICON_PROPS,
  height: 9,
  strokeWidth: 2,
  width: 9,
};

const IconBuilding = () => (
  <svg {...ICON_PROPS}>
    <path d="M3 21l18 0" />
    <path d="M5 21v-14l8 -4v18" />
    <path d="M19 21v-10l-6 -4" />
    <path d="M9 9l0 .01" />
    <path d="M9 12l0 .01" />
    <path d="M9 15l0 .01" />
    <path d="M9 18l0 .01" />
  </svg>
);

const IconUser = () => (
  <svg {...ICON_PROPS}>
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const IconApps = () => (
  <svg {...ICON_PROPS}>
    <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
  </svg>
);

const IconTag = () => (
  <svg {...ICON_PROPS}>
    <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
  </svg>
);

const IconTarget = () => (
  <svg {...ICON_PROPS}>
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 7a5 5 0 1 0 5 5" />
    <path d="M13 3.055a9 9 0 1 0 7.941 7.945" />
    <path d="M15 6v3h3l3 -3h-3v-3z" />
    <path d="M15 9l-3 3" />
  </svg>
);

const IconChevronDown = () => (
  <svg {...ICON_PROPS}>
    <path d="M6 9l6 -6" />
    <path d="M6 9l-6 -6" />
  </svg>
);

const IconBuildingSm = () => (
  <svg {...ICON_SM_PROPS}>
    <path d="M3 21l18 0" />
    <path d="M5 21v-14l8 -4v18" />
    <path d="M19 21v-10l-6 -4" />
    <path d="M9 9l0 .01" />
    <path d="M9 12l0 .01" />
    <path d="M9 15l0 .01" />
    <path d="M9 18l0 .01" />
  </svg>
);

const IconUsersSm = () => (
  <svg {...ICON_SM_PROPS} strokeWidth={1.8}>
    <path d="M9 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

const IconTargetSm = () => (
  <svg {...ICON_SM_PROPS}>
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 7a5 5 0 1 0 5 5" />
    <path d="M13 3.055a9 9 0 1 0 7.941 7.945" />
    <path d="M15 6v3h3l3 -3h-3v-3z" />
    <path d="M15 9l-3 3" />
  </svg>
);

const IconUserScreenSm = () => (
  <svg {...ICON_SM_PROPS} strokeWidth={1.8}>
    <path d="M19.03 17.818a3 3 0 0 0 1.97 -2.818v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8c0 1.317 .85 2.436 2.03 2.84" />
    <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M8 21a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2" />
  </svg>
);

const IconUserSm = () => (
  <svg {...ICON_SM_PROPS}>
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

type EntityDef = {
  expandCount: number;
  fields: { icon: ReactNode; label: string }[];
  headerIcon: ReactNode;
  iconBg: string;
  iconBorder: string;
  id: string;
  isCustom: boolean;
  label: string;
  meta: string;
  x: number;
  y: number;
};

type ConnectionDef = {
  from: string;
  to: string;
};

const ENTITIES: EntityDef[] = [
  {
    id: 'workspaces',
    label: 'Workspaces',
    meta: '22',
    isCustom: true,
    headerIcon: <IconUserScreenSm />,
    iconBg: COLOR_GREEN_BG,
    iconBorder: COLOR_GREEN_BORDER,
    fields: [
      { icon: <IconBuilding />, label: 'Company' },
      { icon: <IconUser />, label: 'Users' },
    ],
    expandCount: 21,
    x: 40,
    y: 40,
  },
  {
    id: 'companies',
    label: 'Companies',
    meta: '39',
    isCustom: false,
    headerIcon: <IconBuildingSm />,
    iconBg: COLOR_INDIGO_BG,
    iconBorder: COLOR_INDIGO_BORDER,
    fields: [
      { icon: <IconApps />, label: 'Workspace' },
      { icon: <IconTag />, label: '31 fields' },
    ],
    expandCount: 8,
    x: 290,
    y: 20,
  },
  {
    id: 'users',
    label: 'Users',
    meta: '497',
    isCustom: true,
    headerIcon: <IconUsersSm />,
    iconBg: COLOR_PURPLE_BG,
    iconBorder: COLOR_PURPLE_BORDER,
    fields: [
      { icon: <IconUser />, label: 'People' },
      { icon: <IconApps />, label: 'Workspace' },
    ],
    expandCount: 32,
    x: 40,
    y: 310,
  },
  {
    id: 'people',
    label: 'People',
    meta: '648',
    isCustom: false,
    headerIcon: <IconUserSm />,
    iconBg: COLOR_INDIGO_BG,
    iconBorder: COLOR_INDIGO_BORDER,
    fields: [
      { icon: <IconBuilding />, label: 'Company' },
      { icon: <IconUser />, label: 'Users' },
      { icon: <IconTarget />, label: 'Opportunity' },
    ],
    expandCount: 4,
    x: 280,
    y: 400,
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    meta: '42',
    isCustom: false,
    headerIcon: <IconTargetSm />,
    iconBg: COLOR_RED_BG,
    iconBorder: COLOR_RED_BORDER,
    fields: [
      { icon: <IconBuilding />, label: 'Company' },
      { icon: <IconTag />, label: '12 fields' },
    ],
    expandCount: 23,
    x: 380,
    y: 190,
  },
];

const CONNECTIONS: ConnectionDef[] = [
  { from: 'workspaces', to: 'companies' },
  { from: 'workspaces', to: 'users' },
  { from: 'users', to: 'people' },
  { from: 'companies', to: 'people' },
  { from: 'companies', to: 'opportunities' },
  { from: 'people', to: 'opportunities' },
];

const Wrapper = styled.div`
  background: ${STEPPER_BG};
  border-radius: 2px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  font-family: ${STEPPER_FONT};
  height: 92%;
  margin-left: auto;
  margin-top: auto;
  overflow: hidden;
  width: 88%;
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
`;

const HeaderLogo = styled.span`
  align-items: center;
  background: ${COLOR_INDIGO_BG};
  border: 1px solid ${COLOR_INDIGO_BORDER};
  border-radius: 3px;
  color: #333;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const HeaderTitle = styled.span`
  color: #333;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  padding: 0 2px;
`;

const HeaderActions = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const HeaderBtn = styled.span`
  align-items: center;
  border: 1px solid #ebebeb;
  border-radius: 4px;
  color: #666;
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const HeaderCmdBtn = styled.span`
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  color: #b3b3b3;
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  height: 22px;
  padding: 0 6px;
`;

const Canvas = styled.div`
  background: white;
  border: 1px solid #ebebeb;
  border-radius: 8px;
  flex: 1;
  margin: 0 10px 10px;
  min-height: 0;
  overflow: hidden;
  position: relative;
  user-select: none;
`;

const SvgLayer = styled.svg`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

const EntityCard = styled.div<{ $hovered: boolean }>`
  backdrop-filter: blur(14px);
  background: #fcfcfc;
  border: 1px solid ${({ $hovered }) => ($hovered ? '#d6d6d6' : '#ebebeb')};
  border-radius: 8px;
  box-shadow:
    0 0 2px rgba(0, 0, 0, 0.08),
    0 2px 2px rgba(0, 0, 0, 0.04);
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 130px;
  padding: 6px;
  position: absolute;
  touch-action: none;
  transition: border-color 0.15s ease;
  z-index: 2;

  &:active {
    cursor: grabbing;
    z-index: 10;
  }
`;

const EntityHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
`;

const InnerCard = styled.div`
  background: white;
  border: 1px solid #f1f1f1;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  padding: 4px 0;
`;

const EntityIcon = styled.span<{ $bg: string; $border: string }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
  border-radius: 3px;
  color: #333;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const EntityLabel = styled.span`
  color: #333;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
`;

const EntityMeta = styled.span`
  color: #b3b3b3;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
`;

const MetaBadge = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  margin-left: auto;
`;

const MetaBadgeIcon = styled.span<{ $bg: string; $border: string; $color: string }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
  border-radius: 2px;
  color: ${({ $color }) => $color};
  display: flex;
  font-size: 8px;
  font-weight: 500;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const MetaBadgeText = styled.span`
  color: #666;
  font-size: 9px;
  font-weight: 400;
`;

const FieldRow = styled.div`
  align-items: center;
  color: #333;
  display: flex;
  font-size: 12px;
  font-weight: 400;
  gap: 4px;
  height: 22px;
  line-height: 1.4;
  padding: 0 6px;
`;

const FieldIcon = styled.span`
  align-items: center;
  color: #666;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const ExpandHint = styled.div`
  align-items: center;
  color: #999;
  display: flex;
  font-size: 12px;
  font-weight: 400;
  gap: 4px;
  height: 22px;
  line-height: 1.4;
  padding: 0 6px;
`;

const CARD_WIDTH = 140;
const CARD_HEIGHT_ESTIMATE = 110;

function getCardCenter(
  positions: Record<string, { x: number; y: number }>,
  entityId: string,
): { x: number; y: number } {
  const pos = positions[entityId];
  if (!pos) return { x: 0, y: 0 };
  return { x: pos.x + CARD_WIDTH / 2, y: pos.y + CARD_HEIGHT_ESTIMATE / 2 };
}

export function DataModelVisual({ active }: StepperVisualProps) {
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() =>
    Object.fromEntries(
      ENTITIES.map((entity) => [entity.id, { x: entity.x, y: entity.y }]),
    ),
  );
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragStartRef = useRef<{
    entityId: string;
    posX: number;
    posY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (entityId: string, event: React.PointerEvent) => {
      event.preventDefault();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      const pos = positions[entityId];
      dragStartRef.current = {
        entityId,
        startX: event.clientX,
        startY: event.clientY,
        posX: pos.x,
        posY: pos.y,
      };
      setDragging(entityId);
    },
    [positions],
  );

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const { entityId, startX, startY, posX, posY } = dragStartRef.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    setPositions((prev) => ({
      ...prev,
      [entityId]: { x: posX + dx, y: posY + dy },
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragStartRef.current = null;
    setDragging(null);
  }, []);

  const isConnectionHighlighted = (connection: ConnectionDef) =>
    hoveredEntity === connection.from || hoveredEntity === connection.to;

  return (
    <Wrapper style={{ opacity: active ? 1 : 0.7, transition: 'opacity 0.3s' }}>
      <Header>
        <HeaderLogo>
          <svg
            fill="none"
            height="9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="9"
          >
            <path d="M10 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M19.5 13a2 2 0 1 0 0 4a2 2 0 0 0 0 -4" />
            <path d="M4.5 13a2 2 0 1 0 0 4a2 2 0 0 0 0 -4" />
            <path d="M12 7v4" />
            <path d="M6.5 13l5.5 -2l5.5 2" />
          </svg>
        </HeaderLogo>
        <HeaderTitle>Data model</HeaderTitle>
        <HeaderActions>
          <HeaderBtn>
            <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="14">
              <path d="M6 15l6 -6l6 6" />
            </svg>
          </HeaderBtn>
          <HeaderBtn>
            <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="14">
              <path d="M6 9l6 6l6 -6" />
            </svg>
          </HeaderBtn>
          <HeaderCmdBtn>
            <svg fill="none" height="12" stroke="#666" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="12">
              <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            </svg>
            ⌘K
          </HeaderCmdBtn>
        </HeaderActions>
      </Header>

      <Canvas onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
        <SvgLayer>
          {CONNECTIONS.map((conn) => {
            const from = getCardCenter(positions, conn.from);
            const to = getCardCenter(positions, conn.to);
            const highlighted = isConnectionHighlighted(conn);
            const color = highlighted ? '#d6d6d6' : '#ebebeb';

            const dx = Math.abs(to.x - from.x);
            const dy = Math.abs(to.y - from.y);

            let pathD: string;
            let startX = from.x;
            let startY = from.y;
            let endX = to.x;
            let endY = to.y;

            if (dx < 30) {
              const avgX = (from.x + to.x) / 2;
              startX = avgX;
              endX = avgX;
              pathD = `M${avgX},${from.y} L${avgX},${to.y}`;
            } else if (dy < 30) {
              const avgY = (from.y + to.y) / 2;
              startY = avgY;
              endY = avgY;
              pathD = `M${from.x},${avgY} L${to.x},${avgY}`;
            } else {
              pathD = `M${from.x},${from.y} L${to.x},${from.y} L${to.x},${to.y}`;
            }

            return (
              <g key={`${conn.from}-${conn.to}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.75}
                  style={{ transition: 'stroke 0.15s' }}
                />
                <circle cx={startX} cy={startY} fill={color} r={1.5} />
                <circle cx={endX} cy={endY} fill={color} r={1.5} />
              </g>
            );
          })}
        </SvgLayer>

        {ENTITIES.map((entity) => {
          const pos = positions[entity.id];
          const isHovered = hoveredEntity === entity.id;
          return (
            <EntityCard
              key={entity.id}
              $hovered={isHovered || dragging === entity.id}
              onPointerDown={(event) => handlePointerDown(entity.id, event)}
              onPointerEnter={() => setHoveredEntity(entity.id)}
              onPointerLeave={() => setHoveredEntity(null)}
              style={{
                left: pos.x,
                top: pos.y,
                transition:
                  dragging === entity.id ? 'none' : 'border-color 0.15s',
              }}
            >
              <EntityHeader>
                <EntityIcon $bg={entity.iconBg} $border={entity.iconBorder}>
                  {entity.headerIcon}
                </EntityIcon>
                <EntityLabel>{entity.label}</EntityLabel>
                <EntityMeta>· {entity.meta}</EntityMeta>
                <MetaBadge>
                  <MetaBadgeIcon
                    $bg={entity.isCustom ? BADGE_CUSTOM_BG : BADGE_STANDARD_BG}
                    $border={
                      entity.isCustom
                        ? BADGE_CUSTOM_BORDER
                        : BADGE_STANDARD_BORDER
                    }
                    $color={
                      entity.isCustom ? BADGE_CUSTOM_TEXT : BADGE_STANDARD_TEXT
                    }
                  >
                    L
                  </MetaBadgeIcon>
                  <MetaBadgeText>
                    {entity.isCustom ? 'Custom' : 'Standard'}
                  </MetaBadgeText>
                </MetaBadge>
              </EntityHeader>
              <InnerCard>
                {entity.fields.map((field) => (
                  <FieldRow key={field.label}>
                    <FieldIcon>{field.icon}</FieldIcon>
                    {field.label}
                  </FieldRow>
                ))}
                <ExpandHint>
                  <IconChevronDown /> {entity.expandCount} fields
                </ExpandHint>
              </InnerCard>
            </EntityCard>
          );
        })}
      </Canvas>
    </Wrapper>
  );
}
