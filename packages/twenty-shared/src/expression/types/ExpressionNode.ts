import { type ExpressionArithmeticNode } from '@/expression/types/ExpressionArithmeticNode';
import { type ExpressionComparisonNode } from '@/expression/types/ExpressionComparisonNode';
import { type ExpressionConcatenationNode } from '@/expression/types/ExpressionConcatenationNode';
import { type ExpressionFunctionCallNode } from '@/expression/types/ExpressionFunctionCallNode';
import { type ExpressionGroupNode } from '@/expression/types/ExpressionGroupNode';
import { type ExpressionInNode } from '@/expression/types/ExpressionInNode';
import { type ExpressionListNode } from '@/expression/types/ExpressionListNode';
import { type ExpressionMemberNode } from '@/expression/types/ExpressionMemberNode';
import { type ExpressionLiteralNode } from '@/expression/types/ExpressionLiteralNode';
import { type ExpressionNotNode } from '@/expression/types/ExpressionNotNode';
import { type ExpressionUnaryNode } from '@/expression/types/ExpressionUnaryNode';
import { type ExpressionVariableNode } from '@/expression/types/ExpressionVariableNode';

// The node kinds are generic interfaces so a narrower tree, like ConditionalEvaluationNode, can reuse them: a recursive type alias cannot
export type ExpressionNode =
  | ExpressionLiteralNode
  | ExpressionVariableNode
  | ExpressionComparisonNode<ExpressionNode>
  | ExpressionGroupNode<ExpressionNode>
  | ExpressionNotNode<ExpressionNode>
  | ExpressionFunctionCallNode<ExpressionNode>
  | ExpressionArithmeticNode<ExpressionNode>
  | ExpressionConcatenationNode<ExpressionNode>
  | ExpressionUnaryNode<ExpressionNode>
  | ExpressionListNode<ExpressionNode>
  | ExpressionInNode<ExpressionNode>
  | ExpressionMemberNode<ExpressionNode>;
