import { TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../utils/createRule';
import { typedTokenHelpers } from '../utils/typedTokenHelpers';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-rest-api-methods-should-be-guarded"
export const RULE_NAME = 'rest-api-methods-should-be-guarded';

export const restApiMethodsShouldBeGuarded = (node: TSESTree.MethodDefinition) => {
  const hasRestApiMethodDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
    node,
    ['Get', 'Post', 'Put', 'Delete', 'Patch', 'Options', 'Head', 'All']
  );

  const hasAuthGuards = typedTokenHelpers.nodeHasAuthGuards(node);

  function findClassDeclaration(
    node: TSESTree.Node
  ): TSESTree.ClassDeclaration | null {
    if (node.type === TSESTree.AST_NODE_TYPES.ClassDeclaration) {
      return node;
    }
    if (node.parent) {
      return findClassDeclaration(node.parent);
    }
    return null;
  }

  const classNode = findClassDeclaration(node);

  const hasAuthGuardsOnController = classNode
    ? typedTokenHelpers.nodeHasAuthGuards(classNode)
    : false;

  return (
    hasRestApiMethodDecorator &&
    !hasAuthGuards &&
    !hasAuthGuardsOnController
  );
};

export const rule = createRule<[], 'restApiMethodsShouldBeGuarded'>({
  name: RULE_NAME,
  meta: {
    docs: {
      description:
        'REST API endpoints should have authentication guards (UserAuthGuard or WorkspaceAuthGuard) or be explicitly marked as public (PublicEndpointGuard) to maintain our security model.',
    },
    messages: {
      restApiMethodsShouldBeGuarded:
        'All REST API controller endpoints should have @UseGuards(UserAuthGuard), @UseGuards(WorkspaceAuthGuard), or @UseGuards(PublicEndpointGuard) decorators, or one decorating the root of the Controller.',
    },
    schema: [],
    hasSuggestions: false,
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      MethodDefinition(node: TSESTree.MethodDefinition): void {
        if (restApiMethodsShouldBeGuarded(node)) {
          context.report({
            node: node,
            messageId: 'restApiMethodsShouldBeGuarded',
          });
        }
      },
    };
  },
}); 