import { type ExpressionComparisonNode } from '@/expression/types/ExpressionComparisonNode';
import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { type ExpressionFunctionCallNode } from '@/expression/types/ExpressionFunctionCallNode';
import { type ExpressionGroupNode } from '@/expression/types/ExpressionGroupNode';
import { type ExpressionLiteralNode } from '@/expression/types/ExpressionLiteralNode';
import { type ExpressionNotNode } from '@/expression/types/ExpressionNotNode';
import { type ExpressionVariableNode } from '@/expression/types/ExpressionVariableNode';

export type ConditionalEvaluationNode =
  | ExpressionLiteralNode
  | ExpressionVariableNode
  | ExpressionFieldNode
  | ExpressionComparisonNode<ConditionalEvaluationNode>
  | ExpressionGroupNode<ConditionalEvaluationNode>
  | ExpressionNotNode<ConditionalEvaluationNode>
  | ExpressionFunctionCallNode<ConditionalEvaluationNode>;
