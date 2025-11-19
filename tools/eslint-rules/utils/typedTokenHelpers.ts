import { TSESTree } from '@typescript-eslint/utils';

export const typedTokenHelpers = {
  nodeHasDecoratorsNamed: (
    node: TSESTree.MethodDefinition | TSESTree.ClassDeclaration,
    decoratorNames: string[],
  ): boolean => {
    if (!node.decorators) {
      return false;
    }

    return node.decorators.some((decorator) => {
      if (decorator.expression.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return decoratorNames.includes(decorator.expression.name);
      }

      if (
        decorator.expression.type === TSESTree.AST_NODE_TYPES.CallExpression
      ) {
        const callee = decorator.expression.callee;
        if (callee.type === TSESTree.AST_NODE_TYPES.Identifier) {
          return decoratorNames.includes(callee.name);
        }
      }

      return false;
    });
  },

  nodeHasAuthGuards: (
    node: TSESTree.MethodDefinition | TSESTree.ClassDeclaration,
  ): boolean => {
    if (!node.decorators) {
      return false;
    }

    return node.decorators.some((decorator) => {
      // Check for @UseGuards() call expression
      if (
        decorator.expression.type === TSESTree.AST_NODE_TYPES.CallExpression &&
        decorator.expression.callee.type ===
          TSESTree.AST_NODE_TYPES.Identifier &&
        decorator.expression.callee.name === 'UseGuards'
      ) {
        // Check the arguments for UserAuthGuard, WorkspaceAuthGuard, PublicEndpoint, or FilePathGuard
        return decorator.expression.arguments.some((arg) => {
          if (arg.type === TSESTree.AST_NODE_TYPES.Identifier) {
            return (
              arg.name === 'UserAuthGuard' ||
              arg.name === 'WorkspaceAuthGuard' ||
              arg.name === 'PublicEndpointGuard' ||
              arg.name === 'FilePathGuard'
            );
          }
          return false;
        });
      }

      return false;
    });
  },

  nodeHasPermissionsGuard: (
    node: TSESTree.MethodDefinition | TSESTree.ClassDeclaration,
  ): boolean => {
    if (!node.decorators) {
      return false;
    }

    return node.decorators.some((decorator) => {
      if (
        decorator.expression.type === TSESTree.AST_NODE_TYPES.CallExpression &&
        decorator.expression.callee.type ===
          TSESTree.AST_NODE_TYPES.Identifier &&
        decorator.expression.callee.name === 'UseGuards'
      ) {
        // Check if any argument ends with PermissionGuard
        return decorator.expression.arguments.some((arg) => {
          // Factory-style guards: SettingsPermissionGuard(PermissionFlagType.XXX)
          if (arg.type === TSESTree.AST_NODE_TYPES.CallExpression) {
            const callee = arg.callee;
            if (callee.type === TSESTree.AST_NODE_TYPES.Identifier) {
              return callee.name.endsWith('PermissionGuard');
            }
          }
          // Identifier guards: CustomPermissionGuard, NoPermissionGuard, etc.
          if (arg.type === TSESTree.AST_NODE_TYPES.Identifier) {
            return arg.name.endsWith('PermissionGuard');
          }
          return false;
        });
      }
      return false;
    });
  },
};
