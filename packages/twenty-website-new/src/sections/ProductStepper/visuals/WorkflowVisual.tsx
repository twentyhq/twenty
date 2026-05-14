'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import { STEPPER_BG, STEPPER_FONT } from './stepper-visual-tokens';

const COLOR_GREEN = '#30a46c';
const COLOR_AMBER = '#946800';
const COLOR_GRAY = '#999';
const COLOR_TEAL_BG = '#e7f9f5';
const COLOR_GRAY_BG = '#f9f9f9';

type NodeDef = {
  badge?: string;
  dimmed?: boolean;
  hasPill?: boolean;
  icon: 'playlist-add' | 'search' | 'repeat' | 'send' | 'reload' | 'plus';
  id: string;
  label: string;
  labelColor: string;
  type: string;
  x: number;
  y: number;
};

type EdgeDef = {
  from: string;
  to: string;
};

const TRUNK_X = 55;
const RIGHT_X = 200;
const LEFT_X = 5;

const NODES: NodeDef[] = [
  {
    id: 'trigger',
    type: 'Trigger',
    label: 'Record is Created',
    icon: 'playlist-add',
    labelColor: COLOR_GREEN,
    x: TRUNK_X,
    y: 16,
    badge: '1',
  },
  {
    id: 'search',
    type: 'Action',
    label: 'Search Records',
    icon: 'search',
    labelColor: COLOR_GREEN,
    x: TRUNK_X,
    y: 92,
    badge: '1',
  },
  {
    id: 'iterator',
    type: 'Flow',
    label: 'Iterator',
    icon: 'repeat',
    labelColor: COLOR_AMBER,
    x: TRUNK_X,
    y: 168,
    hasPill: true,
  },
  {
    id: 'email',
    type: 'Action',
    label: 'Send Email',
    icon: 'send',
    labelColor: COLOR_AMBER,
    x: RIGHT_X,
    y: 280,
    hasPill: true,
  },
  {
    id: 'update',
    type: 'Action',
    label: 'Update Record',
    icon: 'reload',
    labelColor: COLOR_GRAY,
    x: LEFT_X,
    y: 340,
    badge: '3',
    dimmed: true,
  },
  {
    id: 'create',
    type: 'Action',
    label: 'Create Record',
    icon: 'plus',
    labelColor: COLOR_GREEN,
    x: RIGHT_X - 5,
    y: 400,
    badge: '1',
  },
];

const EDGES: EdgeDef[] = [
  { from: 'trigger', to: 'search' },
  { from: 'search', to: 'iterator' },
  { from: 'iterator', to: 'update' },
  { from: 'email', to: 'create' },
];

const ANIMATION_SEQUENCE = [
  'trigger',
  'search',
  'iterator',
  'email',
  'update',
  'create',
];
const STEP_INTERVAL_MS = 800;

const NODE_WIDTH = 170;
const NODE_HEIGHT = 48;

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
  background: #d9e2fc;
  border: 1px solid #c6d4f9;
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

const NodeCard = styled.div`
  align-items: center;
  background: #fcfcfc;
  border: 1px solid #d6d6d6;
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
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  color: #666;
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

const NodeType = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 600;
`;

const NodeBadge = styled.span<{ $color: string }>`
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

const NodePill = styled.span`
  border: 1px solid ${COLOR_AMBER};
  border-radius: 12px;
  height: 10px;
  overflow: hidden;
  position: relative;
  width: 20px;
`;

const PillFill = styled.span`
  background: ${COLOR_AMBER};
  border-radius: 100px;
  height: 6px;
  left: -7px;
  position: absolute;
  top: 1px;
  width: 6px;
`;

const NodeName = styled.div<{ $dimmed?: boolean }>`
  color: ${({ $dimmed }) => ($dimmed ? '#b3b3b3' : '#333')};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IterationLabel = styled.span`
  background: #fcfcfc;
  border: 1px solid #d6d6d6;
  border-radius: 4px;
  color: #999;
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

function NodeIcon({ name }: { name: NodeDef['icon'] }) {
  const props = {
    fill: 'none',
    height: 16,
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.5,
    viewBox: '0 0 24 24',
    width: 16,
  };

  switch (name) {
    case 'playlist-add':
      return (
        <svg {...props}>
          <path d="M19 8h-14" />
          <path d="M5 12h9" />
          <path d="M11 16h-6" />
          <path d="M15 16h6" />
          <path d="M18 13v6" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props}>
          <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
          <path d="M21 21l-6 -6" />
        </svg>
      );
    case 'repeat':
      return (
        <svg {...props}>
          <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
          <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
        </svg>
      );
    case 'send':
      return (
        <svg {...props} stroke={COLOR_AMBER}>
          <path d="M10 14l11 -11" />
          <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
        </svg>
      );
    case 'reload':
      return (
        <svg {...props}>
          <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1.002 7.935 1.007 9.425 4.747" />
          <path d="M20 4v5h-5" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
  }
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      fill="none"
      height="8"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="8"
    >
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
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

  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  const handlePointerDown = useCallback(
    (nodeId: string, event: React.PointerEvent) => {
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
    },
    [positions],
  );

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const { nodeId, startX, startY, posX, posY } = dragStartRef.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    setPositions((prev) => ({
      ...prev,
      [nodeId]: { x: posX + dx, y: posY + dy },
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragStartRef.current = null;
    setDragging(null);
  }, []);

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
        <HeaderTitle>Workflow Runs</HeaderTitle>
        <HeaderActions>
          <HeaderBtn>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M6 15l6 -6l6 6" />
            </svg>
          </HeaderBtn>
          <HeaderBtn>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M6 9l6 6l6 -6" />
            </svg>
          </HeaderBtn>
          <HeaderCmdBtn>
            <svg
              fill="none"
              height="12"
              stroke="#666"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="12"
            >
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
          {EDGES.map((edge) => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;
            const from = getNodeCenter(fromPos);
            const to = getNodeCenter(toPos);
            const isHighlighted =
              activeNodes.has(edge.from) && activeNodes.has(edge.to);
            const color = isHighlighted ? '#d6d6d6' : '#ebebeb';

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
              pathD = `M${from.x},${from.y} L${from.x},${to.y} L${to.x},${to.y}`;
            }

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.75}
                  style={{ transition: 'stroke 0.3s' }}
                />
                <circle cx={startX} cy={startY} fill={color} r={2.5} />
                <circle cx={endX} cy={endY} fill={color} r={2.5} />
              </g>
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
            const loopColor = '#d6d6d6';
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
        </SvgLayer>

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
                  <NodeType $color={node.labelColor}>{node.type}</NodeType>
                  {node.badge && (
                    <NodeBadge $color={node.labelColor}>{node.badge}</NodeBadge>
                  )}
                  {node.hasPill && (
                    <NodePill>
                      <PillFill />
                    </NodePill>
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
      </Canvas>
    </Wrapper>
  );
}
