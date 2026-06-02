import type { WorkflowNodeDefinition } from './workflow-page-data';
import { getWorkflowNodeById } from './get-workflow-node-by-id';
import { getWorkflowEdgePath } from './workflow-page-geometry';
import { IconPlug } from '@tabler/icons-react';

const nodes: WorkflowNodeDefinition[] = [
  {
    Icon: IconPlug,
    iconColor: '#000000',
    id: 'first',
    label: 'Trigger',
    title: 'First',
    width: 100,
    x: 10,
    y: 20,
  },
  {
    Icon: IconPlug,
    iconColor: '#000000',
    id: 'second',
    label: 'Action',
    title: 'Second',
    width: 80,
    x: 120,
    y: 140,
  },
];

describe('workflow-page-geometry', () => {
  it('returns workflow nodes by id', () => {
    expect(getWorkflowNodeById(nodes, 'first')).toBe(nodes[0]);
  });

  it('throws for unknown workflow nodes', () => {
    expect(() => getWorkflowNodeById(nodes, 'missing')).toThrow(
      'Unknown workflow node: missing',
    );
  });

  it('creates vertical edge paths from bottom-center to top-center', () => {
    expect(
      getWorkflowEdgePath({
        edge: { from: 'first', to: 'second', type: 'vertical' },
        nodes,
      }),
    ).toBe('M60 69 L160 140');
  });

  it('creates curved edge paths for non-vertical edges', () => {
    expect(
      getWorkflowEdgePath({
        edge: { from: 'first', to: 'second', type: 'curve' },
        nodes,
      }),
    ).toBe('M60 69 C60 97 160 112 160 140');
  });
});
