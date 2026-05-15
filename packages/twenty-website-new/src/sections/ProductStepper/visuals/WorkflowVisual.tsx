'use client';

import { styled } from '@linaria/react';
import { useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import { AppPreviewShell, ShellCanvas, ShellSvgLayer } from './AppPreviewShell';
import {
  COLOR_GRAY,
  COLOR_GRAY_BG,
  COLOR_GREEN,
  COLOR_TEAL_BG,
  EDGES,
  NODE_HEIGHT,
  NODE_WIDTH,
  NODES,
} from './data/workflow.data';
import { DrawEdge } from './DrawEdge';
import { CheckIcon, NodeIcon } from './icons/WorkflowIcons';
import {
  STEPPER_BORDER_STRONG,
  STEPPER_CARD_BG,
  STEPPER_TEXT,
  STEPPER_TEXT_MUTED,
  STEPPER_TEXT_TERTIARY,
  STEPPER_TINT,
} from './stepper-visual-tokens';
import { useWorkflowAnimation } from './use-workflow-animation';

const NodeCard = styled.div`
  align-items: center;
  background: ${STEPPER_CARD_BG};
  border: 1px solid ${STEPPER_BORDER_STRONG};
  border-radius: 8px;
  box-shadow:
    0 0 2px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 8px;
  min-width: ${NODE_WIDTH}px;
  padding: 8px;
  position: absolute;
  z-index: 2;
`;

const NodeIconBox = styled.div`
  align-items: center;
  background: ${STEPPER_TINT};
  border-radius: 4px;
  color: ${STEPPER_TEXT_MUTED};
  display: flex;
  flex-shrink: 0;
  height: 30px;
  justify-content: center;
  width: 30px;
`;

const NodeRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const NodeLabelRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 13px;
`;

const NodeLabel = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 600;
`;

const NodeCheck = styled.span<{ $bg: string; $visible: boolean }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border-radius: 2px;
  display: flex;
  height: 12px;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s;
  width: 12px;
`;

const NodeName = styled.div<{ $dimmed?: boolean }>`
  color: ${({ $dimmed }) => ($dimmed ? STEPPER_TEXT_TERTIARY : STEPPER_TEXT)};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IterationLabel = styled.span`
  background: ${STEPPER_CARD_BG};
  border: 1px solid ${STEPPER_BORDER_STRONG};
  border-radius: 4px;
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 9px;
  font-weight: 600;
  padding: 2px 4px;
  position: absolute;
  white-space: nowrap;
  z-index: 3;
`;

function getNodeCenter(pos: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: pos.x + NODE_WIDTH / 2, y: pos.y + NODE_HEIGHT / 2 };
}

export function WorkflowVisual({ active }: StepperVisualProps) {
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() =>
    Object.fromEntries(
      NODES.map((node) => [node.id, { x: node.x, y: node.y }]),
    ),
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const dragStartRef = useRef<{
    nodeId: string;
    posX: number;
    posY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const activeNodes = useWorkflowAnimation(active);

  const handlePointerDown = (nodeId: string, event: React.PointerEvent) => {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const pos = positions[nodeId];
    dragStartRef.current = {
      nodeId,
      startX: event.clientX,
      startY: event.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    setDragging(nodeId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const { nodeId, startX, startY, posX, posY } = dragStartRef.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    setPositions((prev) => ({
      ...prev,
      [nodeId]: { x: posX + dx, y: posY + dy },
    }));
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
    setDragging(null);
  };

  return (
    <AppPreviewShell active={active} title="Workflow Runs">
      <ShellCanvas
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <ShellSvgLayer>
          {EDGES.map((edge) => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;
            return (
              <DrawEdge
                key={`${edge.from}-${edge.to}`}
                circleR={2.5}
                from={getNodeCenter(fromPos)}
                highlighted={
                  activeNodes.has(edge.from) && activeNodes.has(edge.to)
                }
                to={getNodeCenter(toPos)}
              />
            );
          })}

          {(() => {
            const iterPos = positions['iterator'];
            const emailPos = positions['email'];
            if (!iterPos || !emailPos) return null;

            const startX = iterPos.x + NODE_WIDTH;
            const startY = iterPos.y + NODE_HEIGHT / 2;
            const horizEnd = startX + 117;
            const r = 8;
            const vertEnd = emailPos.y;
            const emailCenterX = emailPos.x + NODE_WIDTH / 2;
            const midY = vertEnd - 28;
            const loopColor = STEPPER_BORDER_STRONG;
            const ah = 3;

            return (
              <g>
                <circle cx={startX} cy={startY} fill={loopColor} r={2.5} />
                <path
                  d={[
                    `M${startX},${startY}`,
                    `H${horizEnd - r}`,
                    `Q${horizEnd},${startY} ${horizEnd},${startY + r}`,
                    `V${midY - r}`,
                    `Q${horizEnd},${midY} ${horizEnd - r},${midY}`,
                    `H${emailCenterX + r}`,
                    `Q${emailCenterX},${midY} ${emailCenterX},${midY + r}`,
                    `V${vertEnd}`,
                  ].join(' ')}
                  fill="none"
                  stroke={loopColor}
                  strokeWidth={0.75}
                />
                <path
                  d={`M${emailCenterX - ah},${vertEnd - ah} L${emailCenterX},${vertEnd} L${emailCenterX + ah},${vertEnd - ah}`}
                  fill="none"
                  stroke={loopColor}
                  strokeWidth={0.75}
                />
                <circle
                  cx={emailCenterX}
                  cy={vertEnd}
                  fill={loopColor}
                  r={2.5}
                />
              </g>
            );
          })()}
        </ShellSvgLayer>

        {NODES.map((node) => {
          const pos = positions[node.id];
          const isActive = activeNodes.has(node.id);
          const checkBg = node.dimmed ? COLOR_GRAY_BG : COLOR_TEAL_BG;
          const checkColor = node.dimmed ? COLOR_GRAY : COLOR_GREEN;
          return (
            <NodeCard
              key={node.id}
              onPointerDown={(event) => handlePointerDown(node.id, event)}
              style={{
                cursor: dragging === node.id ? 'grabbing' : 'grab',
                left: pos.x,
                top: pos.y,
                transition: dragging === node.id ? 'none' : 'box-shadow 0.15s',
              }}
            >
              <NodeIconBox>
                <NodeIcon name={node.icon} />
              </NodeIconBox>
              <NodeRight>
                <NodeLabelRow>
                  <NodeLabel $color={node.labelColor}>{node.type}</NodeLabel>
                  {node.badge && (
                    <NodeLabel $color={node.labelColor}>{node.badge}</NodeLabel>
                  )}
                  {node.badge && (
                    <NodeCheck $bg={checkBg} $visible={isActive}>
                      <CheckIcon color={checkColor} />
                    </NodeCheck>
                  )}
                </NodeLabelRow>
                <NodeName $dimmed={node.dimmed}>{node.label}</NodeName>
              </NodeRight>
            </NodeCard>
          );
        })}

        <IterationLabel
          style={{
            left: positions['iterator'].x + NODE_WIDTH + 10,
            top: positions['iterator'].y + NODE_HEIGHT / 2 - 9,
          }}
        >
          iteration 2/3
        </IterationLabel>
      </ShellCanvas>
    </AppPreviewShell>
  );
}
