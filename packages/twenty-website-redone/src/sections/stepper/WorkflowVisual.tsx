'use client';

import { styled } from '@linaria/react';

import { usePointerDragPositions } from '@/platform/motion';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { DrawEdge } from './DrawEdge';
import { STEPPER_SHELL_CHROME } from './ProductStepperShell';
import { useWorkflowAnimation } from './use-workflow-animation';
import { WORKFLOW_GRAPH } from './workflow-data';
import { WORKFLOW_GLYPHS } from './WorkflowIcons';

const shell = PRODUCT_STEPPER_SCENE.shell;
const workflow = PRODUCT_STEPPER_SCENE.workflow;

const { Canvas, Shell, SvgLayer } = STEPPER_SHELL_CHROME;

const NODE_WIDTH = WORKFLOW_GRAPH.nodeWidthPx;
const NODE_HEIGHT = WORKFLOW_GRAPH.nodeHeightPx;

const LABEL_TONES = {
  amber: workflow.amber,
  gray: workflow.gray,
  green: workflow.green,
};

const NodeCard = styled.div`
  align-items: center;
  background: ${shell.cardBackground};
  border: 1px solid ${shell.borderStrong};
  border-radius: 8px;
  box-shadow: ${PRODUCT_STEPPER_SCENE.nodeShadow};
  display: flex;
  gap: 8px;
  min-width: ${NODE_WIDTH}px;
  padding: 8px;
  position: absolute;
  z-index: 2;
`;

const NodeIconBox = styled.div`
  align-items: center;
  background: ${shell.tint};
  border-radius: 4px;
  color: ${shell.textMuted};
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

const NodeLabel = styled.span<{ $ink: string }>`
  color: ${({ $ink }) => $ink};
  font-size: 10px;
  font-weight: 600;
`;

const NodeCheck = styled.span<{ $tint: string }>`
  align-items: center;
  background: ${({ $tint }) => $tint};
  border-radius: 2px;
  display: flex;
  height: 12px;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  width: 12px;

  &[data-visible] {
    opacity: 1;
  }
`;

const NodeName = styled.div`
  color: ${shell.text};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-dimmed] {
    color: ${shell.textTertiary};
  }
`;

const IterationLabel = styled.span`
  background: ${shell.cardBackground};
  border: 1px solid ${shell.borderStrong};
  border-radius: 4px;
  color: ${shell.textTertiary};
  font-size: 9px;
  font-weight: 600;
  padding: 2px 4px;
  position: absolute;
  white-space: nowrap;
  z-index: 3;
`;

type NodePositions = Record<string, { x: number; y: number }>;

function getNodeCenter(position: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: position.x + NODE_WIDTH / 2, y: position.y + NODE_HEIGHT / 2 };
}

// The authored loop-back connector from the iterator out to the email
// node, redrawn from live node positions (verbatim path math).
function IteratorLoopPath({ positions }: { positions: NodePositions }) {
  const iteratorPosition = positions.iterator;
  const emailPosition = positions.email;

  if (!iteratorPosition || !emailPosition) {
    return null;
  }

  const startX = iteratorPosition.x + NODE_WIDTH;
  const startY = iteratorPosition.y + NODE_HEIGHT / 2;
  const horizontalEnd = startX + 117;
  const cornerRadius = 8;
  const verticalEnd = emailPosition.y;
  const emailCenterX = emailPosition.x + NODE_WIDTH / 2;
  const midY = verticalEnd - 28;
  const loopColor = shell.borderStrong;
  const arrowHalf = 3;

  return (
    <g>
      <circle cx={startX} cy={startY} fill={loopColor} r={2.5} />
      <path
        d={[
          `M${startX},${startY}`,
          `H${horizontalEnd - cornerRadius}`,
          `Q${horizontalEnd},${startY} ${horizontalEnd},${startY + cornerRadius}`,
          `V${midY - cornerRadius}`,
          `Q${horizontalEnd},${midY} ${horizontalEnd - cornerRadius},${midY}`,
          `H${emailCenterX + cornerRadius}`,
          `Q${emailCenterX},${midY} ${emailCenterX},${midY + cornerRadius}`,
          `V${verticalEnd}`,
        ].join(' ')}
        fill="none"
        stroke={loopColor}
        strokeWidth={0.75}
      />
      <path
        d={`M${emailCenterX - arrowHalf},${verticalEnd - arrowHalf} L${emailCenterX},${verticalEnd} L${emailCenterX + arrowHalf},${verticalEnd - arrowHalf}`}
        fill="none"
        stroke={loopColor}
        strokeWidth={0.75}
      />
      <circle cx={emailCenterX} cy={verticalEnd} fill={loopColor} r={2.5} />
    </g>
  );
}

// The draggable workflow run: nodes reposition under the pointer, edges
// and the iteration label track them, and the active step beat ticks
// check badges down the sequence while the slide is active.
export function WorkflowVisual({ active }: { active: boolean }) {
  const {
    canvasHandlers,
    draggingId: dragging,
    handlePointerDown,
    positions,
  } = usePointerDragPositions(() =>
    Object.fromEntries(
      WORKFLOW_GRAPH.nodes.map((node) => [node.id, { x: node.x, y: node.y }]),
    ),
  );

  const activeNodes = useWorkflowAnimation(active);

  return (
    <Shell active={active} title="Workflow Runs">
      <Canvas {...canvasHandlers}>
        <SvgLayer>
          {WORKFLOW_GRAPH.edges.map((edge) => {
            const fromPosition = positions[edge.from];
            const toPosition = positions[edge.to];

            if (!fromPosition || !toPosition) {
              return null;
            }
            return (
              <DrawEdge
                circleRadius={2.5}
                from={getNodeCenter(fromPosition)}
                highlighted={
                  activeNodes.has(edge.from) && activeNodes.has(edge.to)
                }
                key={`${edge.from}-${edge.to}`}
                to={getNodeCenter(toPosition)}
              />
            );
          })}
          <IteratorLoopPath positions={positions} />
        </SvgLayer>

        {WORKFLOW_GRAPH.nodes.map((node) => {
          const position = positions[node.id];
          const Icon = WORKFLOW_GLYPHS.nodes[node.icon];
          const checkTint = node.dimmed
            ? workflow.grayBackground
            : workflow.tealBackground;
          const checkInk = node.dimmed ? workflow.gray : workflow.green;

          return (
            <NodeCard
              key={node.id}
              onPointerDown={(event) => handlePointerDown(node.id, event)}
              style={{
                cursor: dragging === node.id ? 'grabbing' : 'grab',
                left: position.x,
                top: position.y,
                transition: dragging === node.id ? 'none' : 'box-shadow 0.15s',
              }}
            >
              <NodeIconBox>
                <Icon />
              </NodeIconBox>
              <NodeRight>
                <NodeLabelRow>
                  <NodeLabel $ink={LABEL_TONES[node.labelTone]}>
                    {node.type}
                  </NodeLabel>
                  {node.badge ? (
                    <>
                      <NodeLabel $ink={LABEL_TONES[node.labelTone]}>
                        {node.badge}
                      </NodeLabel>
                      <NodeCheck
                        $tint={checkTint}
                        data-visible={activeNodes.has(node.id) ? '' : undefined}
                      >
                        <WORKFLOW_GLYPHS.Check color={checkInk} />
                      </NodeCheck>
                    </>
                  ) : null}
                </NodeLabelRow>
                <NodeName data-dimmed={node.dimmed ? '' : undefined}>
                  {node.label}
                </NodeName>
              </NodeRight>
            </NodeCard>
          );
        })}

        <IterationLabel
          style={{
            left: positions.iterator.x + NODE_WIDTH + 10,
            top: positions.iterator.y + NODE_HEIGHT / 2 - 9,
          }}
        >
          iteration 2/3
        </IterationLabel>
      </Canvas>
    </Shell>
  );
}
