'use client';

import { styled } from '@linaria/react';

import { usePointerDragPositions } from '@/platform/motion';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { WORKFLOW_GRAPH } from '../data/workflow-data';
import { useWorkflowAnimation } from '../utils/use-workflow-animation';
import { STEPPER_SHELL_CHROME } from './ProductStepperShell';
import { WORKFLOW_GLYPHS } from './WorkflowIcons';

const shell = PRODUCT_STEPPER_SCENE.shell;
const workflow = PRODUCT_STEPPER_SCENE.workflow;

const { Canvas, Shell, StageFit, SvgLayer } = STEPPER_SHELL_CHROME;

const NODE_WIDTH = WORKFLOW_GRAPH.nodeWidthPx;
const NODE_HEIGHT = WORKFLOW_GRAPH.nodeHeightPx;

const ARROW_GAP = 5;

const ARROW_MARKER_PATH =
  'M1.7915 1.38672H8.18311C8.57541 1.38705 8.81458 1.81852 8.60693 2.15137L5.41064 7.26465C5.21481 7.57798 4.75882 7.57798 4.56299 7.26465L1.3667 2.15137C1.15906 1.81841 1.39896 1.38672 1.7915 1.38672Z';

const NodeCard = styled.div<{ $accent: string; $active: boolean }>`
  align-items: center;
  background: ${shell.cardBackground};
  border: 1px solid
    ${({ $accent, $active }) => ($active ? $accent : shell.borderStrong)};
  border-radius: 8px;
  box-shadow: ${PRODUCT_STEPPER_SCENE.nodeShadow};
  display: flex;
  gap: 8px;
  padding: 8px;
  position: absolute;
  width: ${NODE_WIDTH}px;
  z-index: 2;
`;

const NodeIconBox = styled.div<{ $ink: string }>`
  align-items: center;
  background: ${shell.tint};
  border-radius: 4px;
  color: ${({ $ink }) => $ink};
  display: flex;
  flex-shrink: 0;
  height: 30px;
  justify-content: center;
  width: 30px;
`;

const NodeRight = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const NodeLabel = styled.span`
  color: ${shell.textTertiary};
  font-size: 10px;
  font-weight: 500;
`;

const NodeName = styled.div`
  color: ${shell.text};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function getEdgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const sourceX = from.x + NODE_WIDTH / 2;
  const sourceY = from.y + NODE_HEIGHT;
  const targetX = to.x + NODE_WIDTH / 2;
  const targetY = to.y - ARROW_GAP;
  const midY = (sourceY + targetY) / 2;
  return `M${sourceX},${sourceY} C${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}`;
}

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

  const sourceNodeIds = [
    ...new Set(WORKFLOW_GRAPH.edges.map((edge) => edge.from)),
  ];

  return (
    <Shell active={active}>
      <Canvas {...canvasHandlers}>
        <StageFit baseScale={1.05} designHeight={560} designWidth={540}>
          <SvgLayer>
            <defs>
              <marker
                id="workflowArrow"
                markerHeight={8}
                markerWidth={10}
                refX={5}
                refY={4}
              >
                <path
                  d={ARROW_MARKER_PATH}
                  fill={shell.cardBackground}
                  stroke={shell.borderStrong}
                />
              </marker>
            </defs>

            {WORKFLOW_GRAPH.edges.map((edge) => {
              const from = positions[edge.from];
              const to = positions[edge.to];

              if (!from || !to) {
                return null;
              }
              const isActive =
                activeNodes.has(edge.from) && activeNodes.has(edge.to);

              return (
                <path
                  d={getEdgePath(from, to)}
                  fill="none"
                  key={`${edge.from}-${edge.to}`}
                  markerEnd="url(#workflowArrow)"
                  stroke={isActive ? shell.borderStrong : shell.borderMedium}
                  strokeWidth={1}
                  style={{ transition: 'stroke 0.3s' }}
                />
              );
            })}
          </SvgLayer>

          {WORKFLOW_GRAPH.nodes.map((node) => {
            const position = positions[node.id];
            const Icon = WORKFLOW_GLYPHS.nodes[node.icon];
            const accent = workflow.accents[node.accent];

            return (
              <NodeCard
                $accent={accent}
                $active={activeNodes.has(node.id)}
                key={node.id}
                onPointerDown={(event) => handlePointerDown(node.id, event)}
                style={{
                  cursor: dragging === node.id ? 'grabbing' : 'grab',
                  left: position.x,
                  top: position.y,
                  transition:
                    dragging === node.id ? 'none' : 'border-color 0.3s ease',
                }}
              >
                <NodeIconBox $ink={accent}>
                  <Icon size={16} stroke={1.8} />
                </NodeIconBox>
                <NodeRight>
                  <NodeLabel>{node.type}</NodeLabel>
                  <NodeName>{node.label}</NodeName>
                </NodeRight>
              </NodeCard>
            );
          })}

          <SvgLayer style={{ zIndex: 3 }}>
            {sourceNodeIds.map((id) => {
              const position = positions[id];

              if (!position) {
                return null;
              }
              return (
                <circle
                  cx={position.x + NODE_WIDTH / 2}
                  cy={position.y + NODE_HEIGHT}
                  fill={shell.cardBackground}
                  key={`handle-${id}`}
                  r={3.5}
                  stroke={shell.borderStrong}
                  strokeWidth={1}
                />
              );
            })}
          </SvgLayer>
        </StageFit>
      </Canvas>
    </Shell>
  );
}
