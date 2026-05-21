import type { WorkflowNodeDefinition } from './workflow-page-data';

export function getWorkflowNodeById(
  nodes: ReadonlyArray<WorkflowNodeDefinition>,
  nodeId: string,
) {
  const node = nodes.find((workflowNode) => workflowNode.id === nodeId);

  if (!node) {
    throw new Error(`Unknown workflow node: ${nodeId}`);
  }

  return node;
}
