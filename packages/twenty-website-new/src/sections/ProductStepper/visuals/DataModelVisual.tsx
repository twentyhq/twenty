'use client';

import { styled } from '@linaria/react';
import { useCallback, useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import {
  BADGE_CUSTOM_BG,
  BADGE_CUSTOM_BORDER,
  BADGE_CUSTOM_TEXT,
  BADGE_STANDARD_BG,
  BADGE_STANDARD_BORDER,
  BADGE_STANDARD_TEXT,
  CONNECTIONS,
  type ConnectionDef,
  ENTITIES,
} from './data/data-model.data';
import { IconChevronDown } from './icons/data-model-icons';
import {
  STEPPER_BG,
  STEPPER_BORDER_LIGHT,
  STEPPER_BORDER_MEDIUM,
  STEPPER_BORDER_STRONG,
  STEPPER_BORDER_SUBTLE,
  STEPPER_CARD_BG,
  STEPPER_FONT,
  STEPPER_HEADER_BG,
  STEPPER_HEADER_BORDER,
  STEPPER_SHADOW_SM,
  STEPPER_TEXT,
  STEPPER_TEXT_MUTED,
  STEPPER_TEXT_TERTIARY,
} from './stepper-visual-tokens';

const Wrapper = styled.div`
  background: ${STEPPER_BG};
  border-radius: 2px;
  box-shadow: ${STEPPER_SHADOW_SM};
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
  background: ${STEPPER_HEADER_BG};
  border: 1px solid ${STEPPER_HEADER_BORDER};
  border-radius: 3px;
  color: ${STEPPER_TEXT};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const HeaderTitle = styled.span`
  color: ${STEPPER_TEXT};
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
  border: 1px solid ${STEPPER_BORDER_MEDIUM};
  border-radius: 4px;
  color: ${STEPPER_TEXT_MUTED};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const HeaderCmdBtn = styled.span`
  align-items: center;
  border: 1px solid ${STEPPER_BORDER_SUBTLE};
  border-radius: 4px;
  color: ${STEPPER_TEXT_TERTIARY};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  height: 22px;
  padding: 0 6px;
`;

const Canvas = styled.div`
  background: white;
  border: 1px solid ${STEPPER_BORDER_MEDIUM};
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
  background: ${STEPPER_CARD_BG};
  border: 1px solid ${({ $hovered }) => ($hovered ? STEPPER_BORDER_STRONG : STEPPER_BORDER_MEDIUM)};
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
  overflow: hidden;
  white-space: nowrap;
`;

const InnerCard = styled.div`
  background: white;
  border: 1px solid ${STEPPER_BORDER_LIGHT};
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
  color: ${STEPPER_TEXT};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const EntityLabel = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EntityMeta = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  flex-shrink: 0;
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

const MetaBadgeIcon = styled.span<{
  $bg: string;
  $border: string;
  $color: string;
}>`
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
  color: ${STEPPER_TEXT_MUTED};
  font-size: 9px;
  font-weight: 400;
`;

const FieldRow = styled.div`
  align-items: center;
  color: ${STEPPER_TEXT};
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
  color: ${STEPPER_TEXT_MUTED};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const ExpandHint = styled.div`
  align-items: center;
  color: ${STEPPER_TEXT_TERTIARY};
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
            const color = highlighted ? STEPPER_BORDER_STRONG : STEPPER_BORDER_MEDIUM;

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
