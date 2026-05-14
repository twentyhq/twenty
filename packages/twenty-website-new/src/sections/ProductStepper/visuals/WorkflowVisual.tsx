'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import {
  STEPPER_BG,
  STEPPER_BORDER,
  STEPPER_FONT,
  STEPPER_RADIUS,
  STEPPER_SHADOW,
  STEPPER_TEXT,
  STEPPER_TEXT_TERTIARY,
  STEPPER_ACCENT_GREEN,
  STEPPER_ACCENT_AMBER,
  STEPPER_ACCENT_RED,
  STEPPER_ACCENT_TEAL,
} from './stepper-visual-tokens';

type NodeDef = {
  badge?: string;
  color: string;
  icon: string;
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
};

type EdgeDef = {
  from: string;
  label?: string;
  to: string;
};

const NODES: NodeDef[] = [
  {
    id: 'trigger',
    type: 'Trigger',
    label: 'Person is Created',
    icon: '≡⊕',
    color: STEPPER_ACCENT_GREEN,
    x: 100,
    y: 20,
    badge: '1',
  },
  {
    id: 'search',
    type: 'Action',
    label: 'Search Records',
    icon: '🔍',
    color: STEPPER_ACCENT_AMBER,
    x: 100,
    y: 120,
    badge: '1',
  },
  {
    id: 'iterator',
    type: 'Action',
    label: 'Iterator',
    icon: '⟳',
    color: STEPPER_ACCENT_TEAL,
    x: 80,
    y: 220,
  },
  {
    id: 'email',
    type: 'Action',
    label: 'Send Email',
    icon: '✉',
    color: STEPPER_ACCENT_RED,
    x: 220,
    y: 280,
  },
  {
    id: 'update',
    type: 'Action',
    label: 'Update Person',
    icon: '↻',
    color: STEPPER_ACCENT_TEAL,
    x: 40,
    y: 340,
    badge: '3',
  },
  {
    id: 'assign',
    type: 'Action',
    label: 'Assign to Company',
    icon: '↻',
    color: STEPPER_ACCENT_TEAL,
    x: 220,
    y: 400,
    badge: '1',
  },
];

const EDGES: EdgeDef[] = [
  { from: 'trigger', to: 'search' },
  { from: 'search', to: 'iterator' },
  { from: 'iterator', to: 'email', label: 'iteration 2/3' },
  { from: 'iterator', to: 'update' },
  { from: 'email', to: 'assign' },
];

const ANIMATION_SEQUENCE = [
  'trigger',
  'search',
  'iterator',
  'email',
  'update',
  'assign',
];
const STEP_INTERVAL_MS = 800;

const Canvas = styled.div`
  font-family: ${STEPPER_FONT};
  height: 100%;
  overflow: hidden;
  padding: 12px;
  position: relative;
  width: 100%;
`;

const Header = styled.div`
  align-items: center;
  border-bottom: 1px solid ${STEPPER_BORDER};
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
`;

const HeaderIcon = styled.span`
  font-size: 14px;
`;

const HeaderTitle = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 13px;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  margin-left: auto;
`;

const HeaderBtn = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  cursor: pointer;
  font-size: 12px;
`;

const SvgLayer = styled.svg`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

const NodeCard = styled.div<{ $active: boolean; $color: string }>`
  background: ${STEPPER_BG};
  border: 1px solid
    ${({ $active, $color }) => ($active ? $color : STEPPER_BORDER)};
  border-radius: ${STEPPER_RADIUS};
  box-shadow: ${({ $active }) =>
    $active ? '0 2px 8px rgba(0,0,0,0.08)' : STEPPER_SHADOW};
  cursor: pointer;
  min-width: 120px;
  padding: 8px 12px;
  position: absolute;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  z-index: 2;
`;

const NodeType = styled.div<{ $color: string }>`
  align-items: center;
  color: ${({ $color }) => $color};
  display: flex;
  font-size: 9px;
  font-weight: 600;
  gap: 4px;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const NodeBadge = styled.span<{ $active: boolean; $color: string }>`
  align-items: center;
  background: ${({ $active, $color }) => ($active ? $color : STEPPER_BORDER)};
  border-radius: 50%;
  color: ${({ $active }) => ($active ? '#fff' : STEPPER_TEXT_TERTIARY)};
  display: flex;
  font-size: 8px;
  font-weight: 600;
  height: 14px;
  justify-content: center;
  transition:
    background 0.3s ease,
    color 0.3s ease;
  width: 14px;
`;

const NodeCheckmark = styled.span<{ $visible: boolean }>`
  color: ${STEPPER_ACCENT_GREEN};
  font-size: 10px;
  margin-left: auto;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const NodeLabel = styled.div`
  color: ${STEPPER_TEXT};
  font-size: 11px;
  font-weight: 500;
`;

const NodeIcon = styled.span`
  font-size: 12px;
  margin-right: 4px;
`;

const IterationLabel = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  left: 100%;
  margin-left: 8px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
`;

const EdgeLabel = styled.text`
  fill: ${STEPPER_TEXT_TERTIARY};
  font-family: ${STEPPER_FONT};
  font-size: 8px;
`;

function getNodeCenter(node: NodeDef): { x: number; y: number } {
  return { x: node.x + 70, y: node.y + 28 };
}

export function WorkflowVisual({ active }: StepperVisualProps) {
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setActiveNodes(new Set());
      stepRef.current = 0;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      stepRef.current += 1;
      if (stepRef.current > ANIMATION_SEQUENCE.length) {
        stepRef.current = 0;
        setActiveNodes(new Set());
      } else {
        setActiveNodes(new Set(ANIMATION_SEQUENCE.slice(0, stepRef.current)));
      }
    }, STEP_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [active]);

  const handleNodeClick = (nodeId: string) => {
    setActiveNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  return (
    <Canvas>
      <Header>
        <HeaderIcon>⊙</HeaderIcon>
        <HeaderTitle>Workflow Runs</HeaderTitle>
        <HeaderActions>
          <HeaderBtn>∧</HeaderBtn>
          <HeaderBtn>∨</HeaderBtn>
          <HeaderBtn>⋮</HeaderBtn>
          <HeaderBtn>⌘K</HeaderBtn>
        </HeaderActions>
      </Header>

      <SvgLayer>
        {EDGES.map((edge) => {
          const fromNode = NODES.find((n) => n.id === edge.from);
          const toNode = NODES.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          const from = getNodeCenter(fromNode);
          const to = getNodeCenter(toNode);
          const midY = (from.y + to.y) / 2;
          const isHighlighted =
            activeNodes.has(edge.from) && activeNodes.has(edge.to);
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path
                d={`M ${from.x} ${from.y + 16} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 16}`}
                fill="none"
                stroke={isHighlighted ? STEPPER_ACCENT_GREEN : '#d1d5db'}
                strokeWidth={isHighlighted ? 1.5 : 1}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
              {edge.label && (
                <EdgeLabel x={(from.x + to.x) / 2 + 10} y={midY}>
                  {edge.label}
                </EdgeLabel>
              )}
            </g>
          );
        })}
      </SvgLayer>

      {NODES.map((node) => {
        const isActive = activeNodes.has(node.id);
        return (
          <NodeCard
            key={node.id}
            $active={isActive}
            $color={node.color}
            onClick={() => handleNodeClick(node.id)}
            style={{ left: node.x, top: node.y + 40 }}
          >
            <NodeType $color={node.color}>
              <NodeIcon>{node.icon}</NodeIcon>
              {node.type}
              {node.badge && (
                <NodeBadge $active={isActive} $color={node.color}>
                  {node.badge}
                </NodeBadge>
              )}
              <NodeCheckmark $visible={isActive}>✓</NodeCheckmark>
            </NodeType>
            <NodeLabel>{node.label}</NodeLabel>
            {node.id === 'iterator' && (
              <IterationLabel>iteration 2/3</IterationLabel>
            )}
          </NodeCard>
        );
      })}
    </Canvas>
  );
}
