import { TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../utils/createRule';
import { typedTokenHelpers } from '../utils/typedTokenHelpers';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-graphql-resolvers-should-be-guarded"
export const RULE_NAME = 'graphql-resolvers-should-be-guarded';

export const graphqlResolversShouldBeGuarded = (node: TSESTree.MethodDefinition) => {
  const hasGraphQLResolverDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
    node,
    ['Query', 'Mutation', 'Subscription']
  );

  const isMutation = typedTokenHelpers.nodeHasDecoratorsNamed(node, ['Mutation']);

  const hasAuthGuards = typedTokenHelpers.nodeHasAuthGuards(node);
  const hasPermissionsGuard = typedTokenHelpers.nodeHasPermissionsGuard(node);

  const findClassDeclaration = (
    node: TSESTree.Node
  ): TSESTree.ClassDeclaration | null => {
    if (node.type === TSESTree.AST_NODE_TYPES.ClassDeclaration) {
      return node;
    }
    if (node.parent) {
      return findClassDeclaration(node.parent);
    }
    return null;
  }

  const classNode = findClassDeclaration(node);

  const hasAuthGuardsOnResolver = classNode
    ? typedTokenHelpers.nodeHasAuthGuards(classNode)
    : false;

  const hasPermissionsGuardOnResolver = classNode
    ? typedTokenHelpers.nodeHasPermissionsGuard(classNode)
    : false;

  // Basic requirement: all resolvers need auth guards
  const missingAuthGuard = hasGraphQLResolverDecorator &&
                           !hasAuthGuards &&
                           !hasAuthGuardsOnResolver;

  // Additional requirement: mutations need permission guards
  const missingPermissionGuard = isMutation &&
                                  !hasPermissionsGuard &&
                                  !hasPermissionsGuardOnResolver;

  return missingAuthGuard || missingPermissionGuard;
};

export const rule = createRule<[], 'graphqlResolversShouldBeGuarded'>({
  name: RULE_NAME,
  meta: {
    docs: {
      description:
        'GraphQL root resolvers (Query, Mutation, Subscription) should have authentication guards (UserAuthGuard or WorkspaceAuthGuard) or be explicitly marked as public (PublicEndpointGuard) to maintain our security model. Mutations also require permission guards (SettingsPermissionsGuard or CustomPermissionGuard).',
    },
    messages: {
      graphqlResolversShouldBeGuarded:
        'All GraphQL resolvers must have authentication guards (@UseGuards(UserAuthGuard/WorkspaceAuthGuard)). Mutations also require permission guards (@UseGuards(..., SettingsPermissionsGuard(PermissionFlagType.XXX)), CustomPermissionGuard for custom logic, or NoPermissionGuard for special cases like onboarding).',
    },
    schema: [],
    hasSuggestions: false,
    type: 'suggestion',
  },
  defaultOptions: [],
  create: (context) => {
    return {
      MethodDefinition: (node: TSESTree.MethodDefinition): void => {
        if (graphqlResolversShouldBeGuarded(node)) {
          context.report({
            node: node,
            messageId: 'graphqlResolversShouldBeGuarded',
          });
        }
      },
    };
  },
});
