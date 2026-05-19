'use client';

import { styled } from '@linaria/react';
import { useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import { AppPreviewShell, ShellCanvas, ShellSvgLayer } from './AppPreviewShell';
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
} from './data/DataModel.data';
import { DrawEdge } from './DrawEdge';
import { IconChevronDown } from './icons/DataModelIcons';
import {
  STEPPER_BORDER_LIGHT,
  STEPPER_BORDER_MEDIUM,
  STEPPER_BORDER_STRONG,
  STEPPER_CARD_BG,
  STEPPER_TEXT,
  STEPPER_TEXT_MUTED,
  STEPPER_TEXT_TERTIARY,
} from './stepper-visual-tokens';

const EntityCard = styled.div<{ $hovered: boolean }>`
  backdrop-filter: blur(14px);
  background: ${STEPPER_CARD_BG};
  border: 1px solid
    ${({ $hovered }) =>
      $hovered ? STEPPER_BORDER_STRONG : STEPPER_BORDER_MEDIUM};
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

  const handlePointerDown = (entityId: string, event: React.PointerEvent) => {
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
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const { entityId, startX, startY, posX, posY } = dragStartRef.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    setPositions((prev) => ({
      ...prev,
      [entityId]: { x: posX + dx, y: posY + dy },
    }));
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
    setDragging(null);
  };

  const isConnectionHighlighted = (connection: ConnectionDef) =>
    hoveredEntity === connection.from || hoveredEntity === connection.to;

  return (
    <AppPreviewShell active={active} title="Data model">
      <ShellCanvas
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <ShellSvgLayer>
          {CONNECTIONS.map((conn) => (
            <DrawEdge
              key={`${conn.from}-${conn.to}`}
              circleR={1.5}
              elbow="horizontal-first"
              from={getCardCenter(positions, conn.from)}
              highlighted={isConnectionHighlighted(conn)}
              to={getCardCenter(positions, conn.to)}
            />
          ))}
        </ShellSvgLayer>

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
      </ShellCanvas>
    </AppPreviewShell>
  );
}
