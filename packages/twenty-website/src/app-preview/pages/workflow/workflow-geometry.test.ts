import {
  getWorkflowEdgePath,
  type PositionedWorkflowNode,
} from './workflow-geometry';

const nodes: PositionedWorkflowNode[] = [
  { id: 'first', width: 100, x: 10, y: 20 },
  { id: 'second', width: 80, x: 120, y: 140 },
];

describe('workflow-geometry', () => {
  it('should throw for unknown workflow nodes', () => {
    expect(() =>
      getWorkflowEdgePath({
        edge: { from: 'first', to: 'missing', type: 'vertical' },
        nodes,
      }),
    ).toThrow('Unknown workflow node: missing');
  });

  it('should create vertical edge paths from bottom-center to top-center', () => {
    expect(
      getWorkflowEdgePath({
        edge: { from: 'first', to: 'second', type: 'vertical' },
        nodes,
      }),
    ).toBe('M60 69 L160 140');
  });

  it('should create curved edge paths for non-vertical edges', () => {
    expect(
      getWorkflowEdgePath({
        edge: { from: 'first', to: 'second', type: 'curve' },
        nodes,
      }),
    ).toBe('M60 69 C60 97 160 112 160 140');
  });
});
