import { TSESTree } from '@typescript-eslint/utils';

export const typedTokenHelpers = {
  nodeHasDecoratorsNamed(
    node: TSESTree.MethodDefinition | TSESTree.ClassDeclaration,
    decoratorNames: string[]
  ): boolean {
    if (!node.decorators) {
      return false;
    }

    return node.decorators.some((decorator) => {
      if (decorator.expression.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return decoratorNames.includes(decorator.expression.name);
      }
      
      if (decorator.expression.type === TSESTree.AST_NODE_TYPES.CallExpression) {
        const callee = decorator.expression.callee;
        if (callee.type === TSESTree.AST_NODE_TYPES.Identifier) {
          return decoratorNames.includes(callee.name);
        }
      }

      return false;
    });
  },

  nodeHasAuthGuards(
    node: TSESTree.MethodDefinition | TSESTree.ClassDeclaration
  ): boolean {
    if (!node.decorators) {
      return false;
    }

    return node.decorators.some((decorator) => {
      // Check for @UseGuards() call expression
      if (
        decorator.expression.type === TSESTree.AST_NODE_TYPES.CallExpression &&
        decorator.expression.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
        decorator.expression.callee.name === 'UseGuards'
      ) {
        // Check the arguments for UserAuthGuard, WorkspaceAuthGuard, or PublicEndpoint
        return decorator.expression.arguments.some((arg) => {
          if (arg.type === TSESTree.AST_NODE_TYPES.Identifier) {
            return arg.name === 'UserAuthGuard' || 
                   arg.name === 'WorkspaceAuthGuard' || 
                   arg.name === 'PublicEndpointGuard' ||
                   arg.name === 'ApiKeyGuard';
          }
          return false;
        });
      }

      return false;
    });
  },
}; 