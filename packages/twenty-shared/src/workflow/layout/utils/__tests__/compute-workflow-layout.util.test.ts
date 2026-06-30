import { WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS } from '@/workflow/layout/constants/WorkflowDiagramDefaultNodeDimensions';
import {
  computeWorkflowLayout,
  type WorkflowLayoutEdge,
  type WorkflowLayoutNode,
} from '@/workflow/layout/utils/compute-workflow-layout.util';

const buildNode = (id: string): WorkflowLayoutNode => ({
  id,
  ...WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS,
});

const doNodesOverlap = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): boolean => {
  const { width, height } = WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS;

  return Math.abs(a.x - b.x) < width && Math.abs(a.y - b.y) < height;
};

describe('computeWorkflowLayout', () => {
  it('should return a position for every node', () => {
    const nodes = [buildNode('trigger'), buildNode('a'), buildNode('b')];
    const edges: WorkflowLayoutEdge[] = [
      { source: 'trigger', target: 'a' },
      { source: 'a', target: 'b' },
    ];

    const positions = computeWorkflowLayout({ nodes, edges });

    expect(positions).toHaveLength(3);
    expect(positions.map((position) => position.id).sort()).toEqual([
      'a',
      'b',
      'trigger',
    ]);
  });

  it('should stack a linear chain vertically without overlap (rankdir TB)', () => {
    const nodes = [buildNode('trigger'), buildNode('a'), buildNode('b')];
    const edges: WorkflowLayoutEdge[] = [
      { source: 'trigger', target: 'a' },
      { source: 'a', target: 'b' },
    ];

    const positionById = new Map(
      computeWorkflowLayout({ nodes, edges }).map((position) => [
        position.id,
        position.position,
      ]),
    );

    const trigger = positionById.get('trigger')!;
    const stepA = positionById.get('a')!;
    const stepB = positionById.get('b')!;

    expect(stepA.y).toBeGreaterThan(trigger.y);
    expect(stepB.y).toBeGreaterThan(stepA.y);
  });

  it('should spread if-else branches horizontally without overlap', () => {
    const nodes = [
      buildNode('trigger'),
      buildNode('ifElse'),
      buildNode('branchA'),
      buildNode('branchB'),
    ];
    const edges: WorkflowLayoutEdge[] = [
      { source: 'trigger', target: 'ifElse' },
      { source: 'ifElse', target: 'branchA' },
      { source: 'ifElse', target: 'branchB' },
    ];

    const positionById = new Map(
      computeWorkflowLayout({ nodes, edges }).map((position) => [
        position.id,
        position.position,
      ]),
    );

    const branchA = positionById.get('branchA')!;
    const branchB = positionById.get('branchB')!;

    expect(branchA.x).not.toEqual(branchB.x);
    expect(doNodesOverlap(branchA, branchB)).toBe(false);
  });

  it('should ignore edges pointing to unknown nodes', () => {
    const nodes = [buildNode('trigger'), buildNode('a')];
    const edges: WorkflowLayoutEdge[] = [
      { source: 'trigger', target: 'a' },
      { source: 'a', target: 'does-not-exist' },
    ];

    expect(() => computeWorkflowLayout({ nodes, edges })).not.toThrow();
    expect(computeWorkflowLayout({ nodes, edges })).toHaveLength(2);
  });
});
