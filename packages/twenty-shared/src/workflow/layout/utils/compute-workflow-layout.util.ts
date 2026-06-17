import Dagre from '@dagrejs/dagre';

import { WORKFLOW_LAYOUT_DEFAULT_OPTIONS } from '@/workflow/layout/constants/WorkflowLayoutDefaultOptions';

export type WorkflowLayoutNode = {
  id: string;
  width: number;
  height: number;
};

export type WorkflowLayoutEdge = {
  source: string;
  target: string;
};

export type WorkflowLayoutPosition = {
  id: string;
  position: { x: number; y: number };
};

export type WorkflowLayoutOptions = {
  ranksep: number;
  nodesep: number;
  rankdir: string;
};

// Pure Dagre auto-layout shared by the frontend "tidy up" and server-side
// auto-layout. Node sizes are provided by the caller (measured sizes on the
// frontend, estimated constants on the server).
export const computeWorkflowLayout = ({
  nodes,
  edges,
  options = WORKFLOW_LAYOUT_DEFAULT_OPTIONS,
}: {
  nodes: WorkflowLayoutNode[];
  edges: WorkflowLayoutEdge[];
  options?: WorkflowLayoutOptions;
}): WorkflowLayoutPosition[] => {
  const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  graph.setGraph({
    ranksep: options.ranksep,
    nodesep: options.nodesep,
    rankdir: options.rankdir,
  });

  const nodeIds = new Set(nodes.map((node) => node.id));

  nodes.forEach((node) =>
    graph.setNode(node.id, {
      width: node.width,
      height: node.height,
    }),
  );

  edges.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  Dagre.layout(graph);

  return nodes.map((node) => {
    const layoutedNode = graph.node(node.id);

    // Shift the Dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    const x = layoutedNode.x - layoutedNode.width / 2;
    const y = layoutedNode.y - layoutedNode.height / 2;

    return { id: node.id, position: { x, y } };
  });
};
