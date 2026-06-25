'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { usePointerDragPositions } from '@/platform/motion';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import {
  DATA_MODEL_GRAPH,
  type EntityConnection,
} from '../data/data-model-data';
import { DATA_MODEL_ICONS } from './DataModelIcons';
import { DrawEdge } from './DrawEdge';
import { STEPPER_SHELL_CHROME } from './ProductStepperShell';

const shell = PRODUCT_STEPPER_SCENE.shell;
const entityTones = PRODUCT_STEPPER_SCENE.entityTones;

const { Canvas, Shell, StageFit, SvgLayer } = STEPPER_SHELL_CHROME;

const EntityCard = styled.div`
  backdrop-filter: blur(14px);
  background: ${shell.cardBackground};
  border: 1px solid ${shell.borderMedium};
  border-radius: 8px;
  box-shadow: ${PRODUCT_STEPPER_SCENE.cardShadow};
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
  position: absolute;
  touch-action: none;
  transition: border-color 0.15s ease;
  width: 180px;
  z-index: 2;

  &[data-hovered] {
    border-color: ${shell.borderStrong};
  }

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
  border: 1px solid ${shell.borderLight};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  padding: 4px 0;
`;

const EntityIcon = styled.span<{ $tint: string; $line: string }>`
  align-items: center;
  background: ${({ $tint }) => $tint};
  border: 1px solid ${({ $line }) => $line};
  border-radius: 3px;
  color: ${shell.text};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const EntityLabel = styled.span`
  color: ${shell.text};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EntityMeta = styled.span`
  color: ${shell.textTertiary};
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
`;

const FieldRow = styled.div`
  align-items: center;
  color: ${shell.text};
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
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const ExpandHint = styled.div`
  align-items: center;
  color: ${shell.textTertiary};
  display: flex;
  font-size: 12px;
  font-weight: 400;
  gap: 4px;
  height: 22px;
  line-height: 1.4;
  padding: 0 6px;
`;

const CARD_WIDTH = 180;
const CARD_HEIGHT_ESTIMATE = 110;

type EntityPositions = Record<string, { x: number; y: number }>;

function getCardCenter(
  positions: EntityPositions,
  entityId: string,
): { x: number; y: number } {
  const position = positions[entityId];

  if (!position) {
    return { x: 0, y: 0 };
  }
  return {
    x: position.x + CARD_WIDTH / 2,
    y: position.y + CARD_HEIGHT_ESTIMATE / 2,
  };
}

export function DataModelVisual({ active }: { active: boolean }) {
  const {
    canvasHandlers,
    draggingId: dragging,
    handlePointerDown,
    positions,
  } = usePointerDragPositions(() =>
    Object.fromEntries(
      DATA_MODEL_GRAPH.entities.map((entity) => [
        entity.id,
        { x: entity.x, y: entity.y },
      ]),
    ),
  );
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  const isConnectionHighlighted = (connection: EntityConnection) =>
    hoveredEntity === connection.from || hoveredEntity === connection.to;

  return (
    <Shell active={active}>
      <Canvas {...canvasHandlers}>
        <StageFit designHeight={530} designWidth={560}>
          <SvgLayer>
            {DATA_MODEL_GRAPH.connections.map((connection) => (
              <DrawEdge
                circleRadius={1.5}
                elbow="horizontal-first"
                from={getCardCenter(positions, connection.from)}
                highlighted={isConnectionHighlighted(connection)}
                key={`${connection.from}-${connection.to}`}
                to={getCardCenter(positions, connection.to)}
              />
            ))}
          </SvgLayer>

          {DATA_MODEL_GRAPH.entities.map((entity) => {
            const position = positions[entity.id];
            const HeaderIcon = DATA_MODEL_ICONS.headers[entity.headerIcon];
            const tone = entityTones[entity.tone];

            return (
              <EntityCard
                data-hovered={
                  hoveredEntity === entity.id || dragging === entity.id
                    ? ''
                    : undefined
                }
                key={entity.id}
                onPointerDown={(event) => handlePointerDown(entity.id, event)}
                onPointerEnter={() => setHoveredEntity(entity.id)}
                onPointerLeave={() => setHoveredEntity(null)}
                style={{
                  left: position.x,
                  top: position.y,
                  transition:
                    dragging === entity.id ? 'none' : 'border-color 0.15s',
                }}
              >
                <EntityHeader>
                  <EntityIcon $line={tone.border} $tint={tone.background}>
                    <HeaderIcon />
                  </EntityIcon>
                  <EntityLabel>{entity.label}</EntityLabel>
                  <EntityMeta>· {entity.meta}</EntityMeta>
                </EntityHeader>
                <InnerCard>
                  {entity.fields.map((field) => {
                    const Icon = DATA_MODEL_ICONS.fields[field.icon];
                    return (
                      <FieldRow key={field.label}>
                        <FieldIcon>
                          <Icon />
                        </FieldIcon>
                        {field.label}
                      </FieldRow>
                    );
                  })}
                  <ExpandHint>
                    <FieldIcon>
                      <DATA_MODEL_ICONS.ChevronExpand />
                    </FieldIcon>
                    {entity.expandCount} fields
                  </ExpandHint>
                </InnerCard>
              </EntityCard>
            );
          })}
        </StageFit>
      </Canvas>
    </Shell>
  );
}
