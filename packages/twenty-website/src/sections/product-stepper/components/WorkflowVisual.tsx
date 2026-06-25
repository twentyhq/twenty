'use client';

import { styled } from '@linaria/react';

import { usePointerDragPositions } from '@/platform/motion';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { WORKFLOW_GRAPH } from '../data/workflow-data';
import { useWorkflowAnimation } from '../utils/use-workflow-animation';
import { DrawEdge } from './DrawEdge';
import { STEPPER_SHELL_CHROME } from './ProductStepperShell';
import { WORKFLOW_GLYPHS } from './WorkflowIcons';

const shell = PRODUCT_STEPPER_SCENE.shell;
const workflow = PRODUCT_STEPPER_SCENE.workflow;

const { Canvas, Shell, StageFit, SvgLayer } = STEPPER_SHELL_CHROME;

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

function getNodeCenter(position: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: position.x + NODE_WIDTH / 2, y: position.y + NODE_HEIGHT / 2 };
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

  return (
    <Shell active={active}>
      <Canvas {...canvasHandlers}>
        <StageFit baseScale={1.05} designHeight={445} designWidth={540}>
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
                  transition:
                    dragging === node.id ? 'none' : 'box-shadow 0.15s',
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
                          data-visible={
                            activeNodes.has(node.id) ? '' : undefined
                          }
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
        </StageFit>
      </Canvas>
    </Shell>
  );
}
